import { atom, update } from 'claude-code'
import type { EngineInterface, Register } from 'claude-code'

import type { Usage } from '../types'
import { statusLine } from './format'

const usage = atom({ plugin: 'usage-hud', key: 'usage' } as const, null)

// Pinned status line under the prompt: sits beside the engine's own notices, replaces none of them.
async function refresh($: EngineInterface) {
  const u = await $.session.usage()
  const next: Usage = { rateLimits: u.rateLimits }
  await update($, usage, () => next)
  $.ui.status(statusLine(next, await $.clock.now()))
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
}
