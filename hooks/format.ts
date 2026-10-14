import type { Usage } from '../types'

export type Level = 'success' | 'warning' | 'error'
export type Meter = { label: string; bar: string; percent: string; reset: string; level: Level }

const LABELS: Record<string, string> = { five_hour: '5h', seven_day: '7d', spend_limit: '额度' }
const BAR_CELLS = 10
const WARN_AT = 70
const DANGER_AT = 90
const MINUTE = 60_000
const HOUR = 60 * MINUTE
const DAY = 24 * HOUR

export const levelOf = (pct: number): Level => (pct >= DANGER_AT ? 'error' : pct >= WARN_AT ? 'warning' : 'success')

export const bar = (pct: number): string => {
  const filled = Math.min(BAR_CELLS, Math.max(0, Math.round((pct / 100) * BAR_CELLS)))
  return '█'.repeat(filled) + '░'.repeat(BAR_CELLS - filled)
}

export const countdown = (resetsAt: string | undefined, now: number): string => {
  if (!resetsAt) return ''
  const ms = Date.parse(resetsAt) - now
  if (Number.isNaN(ms)) return ''
  if (ms >= DAY) return `${Math.floor(ms / DAY)}天${Math.floor((ms % DAY) / HOUR)}时后重置`
  if (ms >= HOUR) return `${Math.floor(ms / HOUR)}时${Math.floor((ms % HOUR) / MINUTE)}分后重置`
  return `${Math.max(1, Math.floor(ms / MINUTE))}分后重置`
}

// A window whose reset time has passed is a stale reading (session idle since then): drop it.
export const isFresh = (resetsAt: string | undefined, now: number): boolean => {
  if (!resetsAt) return true
  const t = Date.parse(resetsAt)
  return Number.isNaN(t) || t > now
}

export const meters = (u: Usage, now: number): Meter[] =>
  u.rateLimits.filter(r => isFresh(r.resetsAt, now)).map(r => ({
    label: LABELS[r.kind] ?? r.kind,
    bar: bar(r.percentUsed),
    percent: `${Math.round(r.percentUsed)}%`,
    reset: countdown(r.resetsAt, now),
    level: levelOf(r.percentUsed),
  }))

export const costText = (u: Usage): string => (u.costUsd === undefined ? '' : `$${u.costUsd.toFixed(2)}`)
