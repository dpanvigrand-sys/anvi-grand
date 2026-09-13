# Public URL (Cloudflare quick tunnel)

**Current base:** https://validation-cookbook-existed-scholarships.trycloudflare.com

> Tunnel hostname rotates only when `cloudflared` process restarts. Keep-alive does **not** thrash on DNS lag.

## Local (Try Live — use this)

- http://localhost:3947/
- http://localhost:3947/ops?unlock=anviops2026

## Public

Password: `anviops2026`

| Screen | URL |
|--------|-----|
| Guest home | https://validation-cookbook-existed-scholarships.trycloudflare.com/ |
| Ops hub | https://validation-cookbook-existed-scholarships.trycloudflare.com/ops?unlock=anviops2026 |

Keep-alive: `npm run ops:keep-alive:loop`
