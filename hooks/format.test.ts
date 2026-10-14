import { expect, test } from 'claude-code/testing'

import { bar, costText, countdown, levelOf, meters } from './format'

const NOW = Date.parse('2026-10-14T10:00:00Z')

test('bar fills proportionally and clamps', () => {
  expect(bar(0)).toBe('░░░░░░░░░░')
  expect(bar(23.5)).toBe('██░░░░░░░░')
  expect(bar(150)).toBe('██████████')
})

test('level thresholds', () => {
  expect(levelOf(69.9)).toBe('success')
  expect(levelOf(70)).toBe('warning')
  expect(levelOf(90)).toBe('error')
})

test('countdown picks the right unit', () => {
  expect(countdown('2026-10-14T12:14:00Z', NOW)).toBe('2时14分后重置')
  expect(countdown('2026-10-17T14:00:00Z', NOW)).toBe('3天4时后重置')
  expect(countdown('2026-10-14T10:05:30Z', NOW)).toBe('5分后重置')
  expect(countdown('2026-10-14T09:00:00Z', NOW)).toBe('即将重置')
  expect(countdown(undefined, NOW)).toBe('')
  expect(countdown('garbage', NOW)).toBe('')
})

test('meters maps known windows', () => {
  const [m] = meters({ rateLimits: [{ kind: 'five_hour', percentUsed: 92.4, resetsAt: '2026-10-14T11:00:00Z' }] }, NOW)
  expect(m).toEqual({ label: '5h', bar: '█████████░', percent: '92%', reset: '1时0分后重置', level: 'error' })
})

test('cost text', () => {
  expect(costText({ rateLimits: [], costUsd: 1.234 })).toBe('$1.23')
  expect(costText({ rateLimits: [] })).toBe('')
})
