# Public URL (Cloudflare quick tunnel)

Guest site + staff ops share one public base via Cloudflare quick tunnel → Next on `:3947`.

**Current base (auto-healed 2026-09-16T01:33Z):**

https://matched-submissions-bios-two.trycloudflare.com

> Quick tunnels recycle when `cloudflared` restarts. Keep-alive (`scripts/ops-keep-alive.sh`) only restarts when the tunnel **process** is dead — not on transient DNS/curl failures. Hostname may rotate after a real restart.

## Language

Ops web UI is **English only** (no Telugu labels).

## Local (Try Live — always works)

- http://localhost:3947/
- http://localhost:3947/ops?unlock=anviops2026
- http://localhost:3947/ops/admin?unlock=anviops2026

## Public ops + guest

Password: `anviops2026`

| Screen | URL |
|--------|-----|
| Guest home | https://matched-submissions-bios-two.trycloudflare.com/ |
| Ops hub (Quick edit: Photos + Menu) | https://matched-submissions-bios-two.trycloudflare.com/ops?unlock=anviops2026 |
| Admin.1 | https://matched-submissions-bios-two.trycloudflare.com/ops/admin?unlock=anviops2026 |
| Photos — Add / Edit | https://matched-submissions-bios-two.trycloudflare.com/ops/admin/photos?unlock=anviops2026 |
| Menu (Food) — Add / Edit | https://matched-submissions-bios-two.trycloudflare.com/ops/admin/food?unlock=anviops2026 |
| Accounts.1 | https://matched-submissions-bios-two.trycloudflare.com/ops/accounts?unlock=anviops2026 |
| Bookings reports | https://matched-submissions-bios-two.trycloudflare.com/ops/admin/bookings?unlock=anviops2026 |
| Venue bookings | https://matched-submissions-bios-two.trycloudflare.com/ops/admin/venue-bookings?unlock=anviops2026 |
| Inward | https://matched-submissions-bios-two.trycloudflare.com/ops/inward?unlock=anviops2026 |
| Outward | https://matched-submissions-bios-two.trycloudflare.com/ops/outward?unlock=anviops2026 |

## Auto browser refresh

After every UI update: `npm run live:refresh` — opens unlocked `/ops` + guest `/`. See `docs/auto-open-rule.md`.

## Keep-alive

```bash
bash scripts/ops-keep-alive.sh loop
```
