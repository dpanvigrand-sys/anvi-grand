# Public URL (Cloudflare quick tunnel)

Guest site + staff ops share one public base via Cloudflare quick tunnel → Next on `:3947`.

**Current base (verified HTTP 200 at 2026-09-13T17:23Z):**

https://sustainability-celebrate-ultimate-discovery.trycloudflare.com

> Quick tunnels recycle when `cloudflared` restarts. Keep-alive (`scripts/ops-keep-alive.sh`) restarts tunnel + Next if dead and rewrites this file. Hostname may change; open the URL in this doc.

## Language

Ops web UI is **English only** (no Telugu labels).

## Local

- http://localhost:3947/
- http://localhost:3947/ops?unlock=anviops2026

## Public ops + guest

Password: `anviops2026`

| Screen | URL |
|--------|-----|
| Guest home | https://sustainability-celebrate-ultimate-discovery.trycloudflare.com/ |
| Ops hub (Quick edit: Photos + Menu) | https://sustainability-celebrate-ultimate-discovery.trycloudflare.com/ops?unlock=anviops2026 |
| **Photos — Add / Edit** | https://sustainability-celebrate-ultimate-discovery.trycloudflare.com/ops/admin/photos?unlock=anviops2026 |
| **Menu (Food) — Add / Edit** | https://sustainability-celebrate-ultimate-discovery.trycloudflare.com/ops/admin/food?unlock=anviops2026 |
| Accounts.1 | https://sustainability-celebrate-ultimate-discovery.trycloudflare.com/ops/accounts?unlock=anviops2026 |
| Bookings reports | https://sustainability-celebrate-ultimate-discovery.trycloudflare.com/ops/admin/bookings?unlock=anviops2026 |
| Venue bookings | https://sustainability-celebrate-ultimate-discovery.trycloudflare.com/ops/admin/venue-bookings?unlock=anviops2026 |
| Inward | https://sustainability-celebrate-ultimate-discovery.trycloudflare.com/ops/inward?unlock=anviops2026 |
| Outward | https://sustainability-celebrate-ultimate-discovery.trycloudflare.com/ops/outward?unlock=anviops2026 |
| Admin.1 | https://sustainability-celebrate-ultimate-discovery.trycloudflare.com/ops/admin?unlock=anviops2026 |
| Settings | https://sustainability-celebrate-ultimate-discovery.trycloudflare.com/ops/admin/settings?unlock=anviops2026 |

## Auto browser refresh

After every UI update: `npm run live:refresh` — Chrome `--new-window` unlocked `/ops` + guest `/`. See `docs/auto-open-rule.md`.

## Keep-alive

```bash
npm run ops:keep-alive:loop
```
