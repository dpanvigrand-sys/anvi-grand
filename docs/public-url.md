# Public URL (Cloudflare quick tunnel)

Guest site + staff ops share one public base via Cloudflare quick tunnel → Next on `:3947`.

**Current base (auto-healed 2026-09-15T17:12Z):**

https://instructions-assumes-instrumentation-melissa.trycloudflare.com

> Quick tunnels recycle when `cloudflared` restarts. Keep-alive (`scripts/ops-keep-alive.sh`) only restarts when the tunnel **process** is dead — not on transient DNS/curl failures. Hostname may rotate after a real restart.

## Language

Ops web UI is **English only** (no Telugu labels).

## Local (Try Live — always works)

- http://localhost:3947/
- http://localhost:3947/ops?unlock=anviops2026

## Public ops + guest

Password: `anviops2026`

| Screen | URL |
|--------|-----|
| Guest home | https://instructions-assumes-instrumentation-melissa.trycloudflare.com/ |
| Ops hub (Quick edit: Photos + Menu) | https://instructions-assumes-instrumentation-melissa.trycloudflare.com/ops?unlock=anviops2026 |
| Photos — Add / Edit | https://instructions-assumes-instrumentation-melissa.trycloudflare.com/ops/admin/photos?unlock=anviops2026 |
| Menu (Food) — Add / Edit | https://instructions-assumes-instrumentation-melissa.trycloudflare.com/ops/admin/food?unlock=anviops2026 |
| Accounts.1 | https://instructions-assumes-instrumentation-melissa.trycloudflare.com/ops/accounts?unlock=anviops2026 |
| Bookings reports | https://instructions-assumes-instrumentation-melissa.trycloudflare.com/ops/admin/bookings?unlock=anviops2026 |
| Venue bookings | https://instructions-assumes-instrumentation-melissa.trycloudflare.com/ops/admin/venue-bookings?unlock=anviops2026 |
| Inward | https://instructions-assumes-instrumentation-melissa.trycloudflare.com/ops/inward?unlock=anviops2026 |
| Outward | https://instructions-assumes-instrumentation-melissa.trycloudflare.com/ops/outward?unlock=anviops2026 |

## Auto browser refresh

After every UI update: `npm run live:refresh` — opens unlocked `/ops` + guest `/`. See `docs/auto-open-rule.md`.

## Keep-alive

```bash
bash scripts/ops-keep-alive.sh loop
```
