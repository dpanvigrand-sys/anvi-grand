# Ops regression checklist (do not drop features)

Run after **every** ops/UI change before finishing. Failure to keep these reachable = incomplete.

Unlock: `?unlock=anviops2026` (password **anviops2026**). Ops UI = **English only**.

## Hub (`/ops`)

| Check | Expected |
|-------|----------|
| Quick edit — **Photos — Add / Edit** | Link → `/ops/admin/photos` (red-bordered card) |
| Quick edit — **Menu (Food) — Add / Edit** | Link → `/ops/admin/food` (red-bordered card) |
| Footer Photos / Menu | Same two links |
| Footer Accounts.1 | `/ops/accounts` |
| Footer Bookings reports | `/ops/admin/bookings` |
| Footer Venue bookings | `/ops/admin/venue-bookings` |
| Footer Inward / Outward | `/ops/inward`, `/ops/outward` |
| English only | No Telugu labels on cards, nav, alerts |

## 9 stations (all cards on hub + nav)

| # | Station | Path |
|---|---------|------|
| 1 | Reception.1 | `/ops/reception` |
| 2 | Server.1 | `/ops/server` |
| 3 | Kitchen.1 | `/ops/kitchen` |
| 4 | Restaurant Manager.1 | `/ops/manager` |
| 5 | Store.1 | `/ops/store` |
| 6 | Accounts.1 | `/ops/accounts` |
| 7 | Admin.1 | `/ops/admin` |
| 8 | Housekeeping.1 | `/ops/housekeeping` |
| 9 | Banquet.1 | `/ops/banquet` |

## Deep links that must stay reachable

| Feature | Path | Also linked from |
|---------|------|------------------|
| Photos CMS | `/ops/admin/photos` | Hub Quick edit · Admin.1 |
| Menu / Food CMS | `/ops/admin/food` | Hub Quick edit · Admin.1 · Manager.1 |
| Accounts books | `/ops/accounts`, `…/day-book`, `ledger`, `muster`, `salaries`, `purchases` | Accounts.1 |
| Bookings reports | `/ops/admin/bookings` | Admin.1 · hub footer |
| Venue bookings | `/ops/admin/venue-bookings` | Admin.1 · Banquet.1 · hub footer |
| Inward / Outward | `/ops/inward`, `/ops/outward` | Store.1 · hub footer |
| Stock reports | `/ops/admin/stock-reports` | Admin.1 · Store.1 |
| Settings | `/ops/admin/settings` | Hub · Admin.1 |

## Agent rule

1. Do **not** remove hub Quick edit, station cards, or footer deep links when adding features.
2. Curl or open each path above after changes (HTTP 200 + English hub copy).
3. End with `npm run live:refresh` (Chrome `--new-window` unlocked `/ops` + guest `/`).
4. Update `media/shot.jpg` showing ops hub.

See also: `docs/ops-stations.md`, `docs/auto-open-rule.md`.
