# ANVI GRAND

Hotel website and staff ops for **ANVI GRAND** with restaurant brand **CHIGURU**.

**Address:** Anvi Grand, near Benz Circle, Eluru Road, Vijayawada  
**Phone:** 7569494949

## Stack

- Next.js (App Router) + TypeScript + Tailwind + shadcn/ui
- JSON persistence in `data/catalog.json` (rooms, venues, menu, buffets, facilities) and `data/ops.json` (bookings, orders, KT, ledger, stock)

## Run

```bash
npm install
npm run dev      # http://localhost:3947
npm run build && npm run start   # production on 3947
```

## Guest routes

| Path | Purpose |
|------|---------|
| `/` | Brand hero + rooms / venues / CHIGURU / map |
| `/rooms`, `/rooms/[id]` | Room catalogue & detail |
| `/book` | Room booking form |
| `/bookings/[id]` | Booking confirmation |
| `/banquet`, `/party-hall` | Venue booking |
| `/food` | CHIGURU online order |
| `/buffet` | Buffet booking |
| `/facilities` | Hotel facilities |
| `/contact` | Contact + map |

## Staff ops (`/ops`)

Role picker plus working desks: reception, server, kitchen (KT), admin, accounts, inward, outward. Mutations hit `/api/ops/*` and write to `data/ops.json`.

## Key APIs

- `POST /api/bookings/rooms` → `createRoomBooking`
- `POST /api/bookings/venues` → `createVenueBooking`
- `POST /api/orders` → `createFoodOrder`
- `POST /api/buffet` → `createBuffetBooking`
- `POST /api/contact` → `createContactMessage`
- `GET /api/ops` → `getOps`
- `PATCH /api/ops/bookings/[id]`, `/tables/[id]`, `/kitchen/[id]`
- `POST /api/ops/ledger`, `/api/ops/inventory`, `/api/ops/stock`
