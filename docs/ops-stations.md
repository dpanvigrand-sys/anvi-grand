# ANVI OPS — 9 client stations

Password (demo): **`anviops2026`**

Unlock: `/ops?unlock=anviops2026` (shared across Chrome windows via localStorage).

## Language

**Ops web UI is English only.** No Telugu labels or subtitles on hub cards, station pages, alerts, accounts, or settings.

## Decision

Keep the original 7 client desks and **add 2** for real hotel + restaurant + banquet ops → **9 stations total**.

## Stations (final)

| # | Client | English | Path | Primary job |
|---|--------|---------|------|-------------|
| 1 | Reception.1 | Reception | `/ops/reception` | Room check-in/out, bookings ledger, guest desk, walk-ins, phone contacts |
| 2 | Server.1 | Server | `/ops/server` | Floor order take/serve, table status, send to kitchen |
| 3 | Kitchen.1 | KT Kitchen | `/ops/kitchen` | Incoming food tickets, prep status, mark ready |
| 4 | Restaurant Manager.1 | Restaurant Manager | `/ops/manager` | IRAA oversight — menu ₹, food bookings, KT/server pulse, food alerts |
| 5 | Store.1 | Store | `/ops/store` | Inward/outward, stock reports, grocery/ingredients/HK purchase links |
| 6 | Accounts.1 | Accounts | `/ops/accounts` | Day book, ledger, muster, salaries, purchases |
| 7 | Admin.1 | Admin | `/ops/admin` | CMS: rooms, food, venues, photos, contacts, bookings reports, settings |
| 8 | Housekeeping.1 | Housekeeping | `/ops/housekeeping` | Room dirty/clean/ready, linen/clothes/dhobi queue, supplies alerts |
| 9 | Banquet.1 | Banquet | `/ops/banquet` | Venue bookings enter/list, today’s events, advance/balance, venue rates |

## Hub

- **`/ops`** — Advanced multi-client station picker: 9 large cards with English role + job subtitle, live counts, alert strip + dismissible popup.
- **Quick edit (top of hub, red-bordered primary cards):**
  - **Photos — Add / Edit / Delete** → `/ops/admin/photos`
  - **Menu — Add / Edit / Delete** → `/ops/admin/food`
  - **Rooms prices — Add / Edit / Delete** → `/ops/admin/rooms`
  - **Venues / halls prices** → `/ops/admin/venues` (banquet + mini hall)
- Same four links appear in the hub footer strip and as the **first four cards** on Admin.1 (`/ops/admin`). Restaurant Manager.1 also has **Menu — Add / Edit / Delete**.

## Deep links (existing tools — not rebuilt)

| Need | Path | Where visible |
|------|------|---------------|
| **Photos — Add / Edit / Delete** | `/ops/admin/photos` | Hub Quick edit · Admin.1 · hub footer |
| **Menu — Add / Edit / Delete** | `/ops/admin/food` | Hub Quick edit · Admin.1 · Manager.1 · hub footer |
| **Rooms prices** | `/ops/admin/rooms` | Hub Quick edit · Admin.1 · hub footer |
| **Venues / halls prices** (banquet + mini) | `/ops/admin/venues` | Hub Quick edit · Admin.1 · Banquet.1 · hub footer |
| Rooms & food booking reports | `/ops/admin/bookings` | Admin.1 |
| Venue bookings ledger | `/ops/admin/venue-bookings` | Admin.1 · Banquet.1 |
| Contacts | `/ops/admin/contacts` | Admin.1 · Reception.1 |
| Inward / outward | `/ops/inward`, `/ops/outward` | Store.1 · hub footer |
| Stock reports | `/ops/admin/stock-reports` | Admin.1 · Store.1 |
| Accounts books | `/ops/accounts/day-book`, `ledger`, `muster`, `salaries`, `purchases` | Accounts.1 |
| Ops settings | `/ops/admin/settings` | Hub · Admin.1 |

Unlock deep links: append `?unlock=anviops2026` (e.g. `/ops/admin/photos?unlock=anviops2026`).

See also store/repo `docs/cms-where.md` for the staff “where to click” map.

## Alerts (OpsAlerts)

Shared component + `GET /api/ops/alerts` (reads `data/ops.json`).

| Kind | Triggers | Shown on |
|------|----------|----------|
| **rooms** | Checkout today, occupied/active summary, unpaid room balance | Reception, Admin, Accounts, HK |
| **food** | Pending KT tickets / unserved orders | Kitchen, Server, Manager, Admin |
| **grocery** | Low stock (≤ threshold) or no recent inward | Store, Manager, Admin, HK |
| **banquet** | Events today/tomorrow, balance due | Banquet, Admin, Accounts, Manager |
| **salary** (optional tip) | Unpaid salaries this month | Accounts, Admin |
| **housekeeping** | Dirty/cleaning rooms, linen/dhobi queue | HK, Reception, Admin |

UI: persistent alert **bar** only on stations (loud modal muted). Session dismiss per station.

## Counter booking toast (primary new-order cue)

Calm bottom-left OK toast for **new customer** room / banquet / mini-hall / food bookings — see `docs/counter-booking-popups.md`.

- Component: `CounterBookingToast` · API: `GET /api/ops/counter-bookings`
- Reception · Banquet · Kitchen · Server (hub/admin quiet strip)
- OK → `localStorage` ack; does not block UI

## Settings

**`/ops/admin/settings`** (also linked from hub / Admin.1)

Persisted in `ops.json` → `settings`:

- Hotel name line, IRAA food brand line
- Ops password note (demo unlock remains `anviops2026` unless changed in code)
- Low stock qty threshold
- Banquet reminder hours
- Optional station label overrides (English name + subtitle only)

## APIs added

- `GET /api/ops/alerts`
- `GET|PATCH /api/ops/settings`
- `POST|PATCH /api/ops/housekeeping`
- `PATCH /api/ops/venue-bookings/[id]`
- Venue create accepts address / functionDetails / withFood / advance / balance

## How to open on client PCs

1. Open `/ops?unlock=anviops2026`
2. Click the station card for that PC (e.g. Reception.1)
3. Or use `scripts/ops-windows.sh` for multi-window layout
