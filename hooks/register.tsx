import { atom, read, update } from 'claude-code'
import type { EngineInterface, Register } from 'claude-code'

import type { Usage } from '../types'
import { costText, meters } from './format'

const usage = atom({ plugin: 'usage-hud', key: 'usage' } as const, null)

async function refresh($: EngineInterface) {
  const u = await $.session.usage()
  const next: Usage = { rateLimits: u.rateLimits, costUsd: u.cost?.usd }
  await update($, usage, () => next)
}

export const register: Register = on => {
  on('session.start', async ($, e, next) => {
    const result = await next(e)
    await refresh($)
    return result
  })

  on('session.measure', async ($, e, next) => {
    await refresh($)
    return next(e)
  })

  // ponytail: countdown refreshes only when the band redraws (each turn / measure); add a $.clock.every tick if a live clock matters
  on('ui.render', { component: 'AbovePrompt' }, async ($, e, next) => {
    const u = await read($, usage)
    if (e.props.hasSurvey || !u) return next(e)

    const rows = meters(u, await $.clock.now())
    const cost = costText(u)
    if (rows.length === 0 && !cost) return next(e)

    const { Box, Text } = $.ui.resolve(e)
    return (
      <Box gap={3}>
        {rows.map(m => (
          <Box key={m.label} gap={1}>
            <Text bold>{m.label}</Text>
            <Text color={m.level}>{m.bar}</Text>
            <Text color={m.level} bold>{m.percent}</Text>
            {m.reset ? <Text dimColor>{m.reset}</Text> : null}
          </Box>
        ))}
        {cost ? <Text dimColor>{cost}</Text> : null}
      </Box>
    )
  })
}
