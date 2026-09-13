# Public URL (Cloudflare quick tunnel)

Guest site + staff ops share one public base via Cloudflare quick tunnel → Next on `:3947`.

**Current base (auto-healed 2026-09-13T17:28Z):**

https://frames-activists-argue-encourages.trycloudflare.com

> Quick tunnels recycle when `cloudflared` restarts. Keep-alive (`scripts/ops-keep-alive.sh`) restarts tunnel + Next if dead and rewrites this file.

## Language

Ops web UI is **English only** (no Telugu labels).

## Local

- http://127.0.0.1:3947/
- http://127.0.0.1:3947/ops?unlock=anviops2026

## Public ops + guest

Password: `anviops2026`

| Screen | URL |
|--------|-----|
| Guest home | https://frames-activists-argue-encourages.trycloudflare.com/ |
| Ops hub (Quick edit: Photos + Menu) | https://frames-activists-argue-encourages.trycloudflare.com/ops?unlock=anviops2026 |
| Photos — Add / Edit | https://frames-activists-argue-encourages.trycloudflare.com/ops/admin/photos?unlock=anviops2026 |
| Menu (Food) — Add / Edit | https://frames-activists-argue-encourages.trycloudflare.com/ops/admin/food?unlock=anviops2026 |
| Accounts.1 | https://frames-activists-argue-encourages.trycloudflare.com/ops/accounts?unlock=anviops2026 |
| Bookings reports | https://frames-activists-argue-encourages.trycloudflare.com/ops/admin/bookings?unlock=anviops2026 |
| Venue bookings | https://frames-activists-argue-encourages.trycloudflare.com/ops/admin/venue-bookings?unlock=anviops2026 |
| Inward | https://frames-activists-argue-encourages.trycloudflare.com/ops/inward?unlock=anviops2026 |
| Outward | https://frames-activists-argue-encourages.trycloudflare.com/ops/outward?unlock=anviops2026 |

## Auto browser refresh

After every UI update: `npm run live:refresh` — opens unlocked `/ops` + guest `/`. See `docs/auto-open-rule.md`.

## Keep-alive

```bash
bash scripts/ops-keep-alive.sh loop
```
