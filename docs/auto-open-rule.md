# Standing rule — auto browser update (no manual refresh)

**HARD RULE:** After **any** UI/ops/code change, the agent MUST run `npm run live:refresh` before finishing. Failure = **incomplete**.

Try Live Chrome must auto-show **BOTH** (user presses nothing — no continue/next/refresh):

1. **Ops hub** — unlocked `/ops?unlock=anviops2026` in a **real Chrome `--new-window`**, frontmost + maximized
2. **Frontend (guest) home** — `/` in a second Chrome `--new-window`

Proof: write store `media/shot.jpg` showing the ops hub.

## Agent checklist (every UI update)

1. Heal stack: `npm run ops:keep-alive` (or `live:refresh` does this first)
2. Run **`npm run live:refresh`** (`scripts/live-refresh.sh`)
3. Chrome on Try Live opens **`--new-window`** unlocked ops + guest (public URL preferred when healthy; else `http://localhost:3947`)
4. Ops unlocked with `?unlock=anviops2026`; guest at `/`
5. Update store **`media/shot.jpg`** (ops hub preferred)

## Why `localhost` (not only `127.0.0.1`)

Next.js 16 blocks cross-origin dev/HMR between `127.0.0.1` and `localhost`, which freezes OpsGate on **“Checking staff access…”**. `live:refresh` prefers **`localhost:3947`** for local fallback; public tunnel hostname is fine.

## Command

```bash
npm run live:refresh
```

| Piece | Role |
|-------|------|
| `scripts/live-refresh.sh` | keep-alive heal → ensure Next → Chrome `--new-window` ops + guest → hard reload → `media/shot.jpg` |
| `scripts/ops-keep-alive.sh` | Restart Next + cloudflared if dead; rewrite `docs/public-url.md` |
| `npm run live` | Same as `live:refresh` |
| `npm run ops:keep-alive:loop` | Background watchdog (idle / Error 1033 survival) |

Password: `anviops2026`  
Public base: see `docs/public-url.md` / store `internal/public-url.txt`

## Finish without “continue”

Agents must complete the full feature request without pausing for continue/next. After the feature ships, always run `npm run live:refresh` so **ops + guest** are both visible immediately on Try Live.
