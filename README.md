# ANVI GRAND

Hotel guest site and staff ops for **ANVI GRAND** (Eluru Road, near Benz Circle, Vijayawada) with in-house dining brand **CHIGURU**.

## Run locally

```bash
npm install
npm run dev
```

Open [http://localhost:3947](http://localhost:3947).

Production-style start (after `npm run build`):

```bash
npm start
```

Also serves on port **3947**.

## Data persistence

JSON files under `data/` (no external database):

| File | Purpose |
|------|---------|
| `data/catalog.json` | Hotel info, rooms, venues, CHIGURU menu, buffets, facilities |
| `data/ops.json` | Bookings, orders, tables, kitchen tickets, ledger, stock, messages |

Guest and ops mutations write back to `ops.json`.

## Guest routes

- `/` — home (hero, rooms, banquet/party, CHIGURU, facilities, map)
- `/rooms`, `/rooms/[id]` — room catalogue
- `/book` — room reservation → `/bookings/[id]`
- `/banquet`, `/party-hall` — venue booking
- `/food` — CHIGURU menu + cart
- `/buffet` — buffet booking
- `/facilities`, `/contact`

## Staff ops (`/ops`)

Role switcher (no auth in this demo):

| Path | Desk |
|------|------|
| `/ops/reception` | Room bookings, check-in / check-out |
| `/ops/server` | Tables + place order |
| `/ops/kitchen` | Kitchen tickets (cook / ready / bump) |
| `/ops/admin` | Counts + recent activity |
| `/ops/accounts` | Ledger income / expense |
| `/ops/inward` | Stock received |
| `/ops/outward` | Stock issued |

## API overview

- `GET /api/rooms` · `GET /api/menu`
- `POST /api/bookings/rooms` · `POST /api/bookings/venues`
- `GET|POST /api/orders` · `POST /api/buffet` · `POST /api/contact`
- `GET /api/ops`
- `PATCH /api/ops/bookings/[id]` · `PATCH /api/ops/tables/[id]` · `PATCH /api/ops/kitchen/[id]`
- `POST /api/ops/ledger` · `POST /api/ops/stock`

## Contact

Anvi Grand, near Benz Circle, Eluru Road, Vijayawada · **7569494949**
