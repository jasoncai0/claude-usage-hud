export type Usage = {
  rateLimits: { kind: string; percentUsed: number; resetsAt?: string }[]
}

declare module 'claude-code' {
  interface PluginState {
    'usage-hud': { usage: Usage | null }
  }
}
