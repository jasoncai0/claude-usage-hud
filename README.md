# usage-hud

A Claude Code mod that shows your subscription usage above the prompt — in the **Claude Desktop Code tab** as well as the terminal (statusLine-based HUDs don't render in Desktop).

```
5h ██░░░░░░░░ 23% 2时14分后重置   7d █░░░░░░░░░ 7% 3天4时后重置   $1.23
```

- 10-cell bar per rate-limit window (`5h`, `7d`, gateway spend limit)
- Green < 70%, yellow 70–90%, red ≥ 90%
- Countdown to reset, session cost (dimmed)
- Pushed by the `session.measure` event — no polling, no extra tokens

## Install

Run in a terminal Claude Code session (Claude Code ≥ 2.1.29x, mods API):

```
/plugin install usage-hud --marketplace jasoncai0/claude-usage-hud
```

Answer `y` to add the marketplace, choose **user** scope. Desktop sessions started afterwards load it too.

Or from the shell:

```bash
claude plugin marketplace add jasoncai0/claude-usage-hud
claude plugin install usage-hud@claude-usage-hud
```

## Develop

```bash
claude plugin validate .
claude plugin test .
```

## License

MIT
