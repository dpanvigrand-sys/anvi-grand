# Public URL (Cloudflare quick tunnel)

Guest site + staff ops share one public base via Cloudflare quick tunnel → Next on `:3947`.

**Current base (auto-healed 2026-09-16T05:27Z):**

https://minolta-scratch-boundaries-principles.trycloudflare.com

> Quick tunnels recycle when `cloudflared` restarts. Keep-alive (`scripts/ops-keep-alive.sh`) only restarts when the tunnel **process** is dead — not on transient DNS/curl failures. Hostname may rotate after a real restart. DNS can lag inside the VM; Try Live local always works.

## Language

Ops web UI is **English only** (no Telugu labels).

## Local (Try Live — always works)

- http://localhost:3947/
- http://localhost:3947/ops?unlock=anviops2026
- http://localhost:3947/ops/reception?unlock=anviops2026
- http://localhost:3947/ops/banquet?unlock=anviops2026
- http://localhost:3947/ops/kitchen?unlock=anviops2026
- http://localhost:3947/ops/server?unlock=anviops2026
- http://localhost:3947/ops/admin?unlock=anviops2026

## Public ops + guest

Password: `anviops2026`

| Screen | URL |
|--------|-----|
| Guest home | https://minolta-scratch-boundaries-principles.trycloudflare.com/ |
| Ops hub (Quick edit: Photos + Menu) | https://minolta-scratch-boundaries-principles.trycloudflare.com/ops?unlock=anviops2026 |
| Reception (counter toast) | https://minolta-scratch-boundaries-principles.trycloudflare.com/ops/reception?unlock=anviops2026 |
| Banquet | https://minolta-scratch-boundaries-principles.trycloudflare.com/ops/banquet?unlock=anviops2026 |
| Kitchen | https://minolta-scratch-boundaries-principles.trycloudflare.com/ops/kitchen?unlock=anviops2026 |
| Server | https://minolta-scratch-boundaries-principles.trycloudflare.com/ops/server?unlock=anviops2026 |
| Admin.1 | https://minolta-scratch-boundaries-principles.trycloudflare.com/ops/admin?unlock=anviops2026 |
| Photos — Add / Edit | https://minolta-scratch-boundaries-principles.trycloudflare.com/ops/admin/photos?unlock=anviops2026 |
| Menu (Food) — Add / Edit | https://minolta-scratch-boundaries-principles.trycloudflare.com/ops/admin/food?unlock=anviops2026 |
| Bookings reports | https://minolta-scratch-boundaries-principles.trycloudflare.com/ops/admin/bookings?unlock=anviops2026 |
| Venue bookings | https://minolta-scratch-boundaries-principles.trycloudflare.com/ops/admin/venue-bookings?unlock=anviops2026 |

## Counter booking toast

Calm bottom-left OK toast on reception / banquet / kitchen / server — see `docs/counter-booking-popups.md`.

## Auto browser refresh

After every UI update: `npm run live:refresh` — opens unlocked `/ops` + guest `/`. See `docs/auto-open-rule.md`.

## Keep-alive

```bash
bash scripts/ops-keep-alive.sh loop
```
