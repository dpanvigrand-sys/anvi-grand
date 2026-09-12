# ANVI GRAND shortcuts

| File | Opens |
|------|--------|
| `anvi-live-refresh.desktop` | **One-click live:** ensure prod server + open/refresh Chrome → http://127.0.0.1:3947/ |
| `anvi-grand-local.desktop` / `.url` | Local site only: http://127.0.0.1:3947/ |
| `anvi-grand-agent.desktop` / `.url` | Cloud agent: https://cursor.com/agents/bc-baa28d27-c756-590c-992b-4ea67ca256e9 |

## Always-on live (fast)

Production mode (not slow `next dev`):

```bash
npm run live          # ensure server + open/refresh Chrome
npm run live:ensure   # server only
npm run live:restart  # restart prod server + refresh browser
```

Script: `scripts/live-open.sh` — binds `0.0.0.0:3947`, uses `next start` (built `.next`), hard-refreshes Chrome.

**Linux:** double-click `.desktop` (may need “Allow Launching” once).  
**Windows:** double-click `.url`.
