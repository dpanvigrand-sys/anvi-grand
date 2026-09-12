# Public URL (Cloudflare quick tunnel)

The guest site and staff ops share one public base URL via `cloudflared` → `http://127.0.0.1:3947`.

**Current base (verified HTTP 200):**

https://supposed-gardening-industry-thus.trycloudflare.com

> Quick tunnels recycle when `cloudflared` restarts. If the hostname dies, restart the tunnel in tmux session `anvi-public-tunnel`, then update this file and `internal/public-url.txt` in the agent store.

## Guest site

- Home: https://supposed-gardening-industry-thus.trycloudflare.com/

## Ops screens on laptop

Open these **four URLs in separate browser windows** on your laptop (File → New Window, or Cmd/Ctrl+N). Do **not** use tabs in one window if you want the 2×2 layout from the reference screenshot.

Password for the ops gate: `anviops2026`  
(or append `?unlock=anviops2026` once per origin so localStorage unlocks that host)

| Screen | Public URL |
|--------|------------|
| Hub | https://supposed-gardening-industry-thus.trycloudflare.com/ops |
| Admin | https://supposed-gardening-industry-thus.trycloudflare.com/ops/admin |
| Reception | https://supposed-gardening-industry-thus.trycloudflare.com/ops/reception |
| KT Kitchen | https://supposed-gardening-industry-thus.trycloudflare.com/ops/kitchen |

### Suggested 2×2 arrangement on your laptop

```
┌─────────────────┬─────────────────┐
│ Hub  /ops       │ Admin /ops/admin│
├─────────────────┼─────────────────┤
│ Reception       │ Kitchen         │
└─────────────────┴─────────────────┘
```

### One-shot unlock links (optional)

If the password form appears, use these once (same origin, unlocks for the session):

- https://supposed-gardening-industry-thus.trycloudflare.com/ops?unlock=anviops2026
- https://supposed-gardening-industry-thus.trycloudflare.com/ops/admin?unlock=anviops2026
- https://supposed-gardening-industry-thus.trycloudflare.com/ops/reception?unlock=anviops2026
- https://supposed-gardening-industry-thus.trycloudflare.com/ops/kitchen?unlock=anviops2026

After unlock, you can drop the query string; the gate stays open for that browser origin until you click **Lock ops**.

## Keep the tunnel healthy (agents / VM)

```bash
# App must listen on 3947
curl -s -o /dev/null -w "%{http_code}\n" http://127.0.0.1:3947/

# Tunnel (tmux: anvi-public-tunnel)
cloudflared tunnel --url http://127.0.0.1:3947 --no-autoupdate
```

Cloud Try Live Chrome can open the same public URLs for proof; it cannot control the user’s laptop browser.
