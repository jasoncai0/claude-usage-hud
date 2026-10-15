import { atom, read, update } from 'claude-code'
import type { EngineInterface, Register } from 'claude-code'

import type { Usage } from '../types'
import { meters } from './format'

const usage = atom({ plugin: 'usage-hud', key: 'usage' } as const, null)

async function refresh($: EngineInterface) {
  const u = await $.session.usage()
  const next: Usage = { rateLimits: u.rateLimits }
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

  // The band above the prompt is one site shared by every plugin: draw our row on top of whatever the
  // plugins beneath drew (next), never instead of it, and step aside entirely while a survey holds it.
  on('ui.render', { component: 'AbovePrompt' }, async ($, e, next) => {
    const u = await read($, usage)
    const rows = e.props.hasSurvey || !u ? [] : meters(u, await $.clock.now())
    if (rows.length === 0) return next(e)

    const below = await next(e)
    const { Box, Text } = $.ui.resolve(e)
    return (
      <Box flexDirection="column">
        <Box gap={3}>
          {rows.map(m => (
            <Box key={m.label} gap={1}>
              <Text bold>{m.label}</Text>
              <Text color={m.level}>{m.bar}</Text>
              <Text color={m.level} bold>{m.percent}</Text>
              {m.reset ? <Text dimColor>{m.reset}</Text> : null}
            </Box>
          ))}
        </Box>
        {below}
      </Box>
    )
  })
}
