# ANVI GRAND

Full-stack hotel website for **ANVI GRAND** (Vijayawada) with **CHIGURU** dining and staff ops dashboards.

## Brand

- Hotel: ANVI GRAND  
- Food: CHIGURU  
- Address: Anvi Grand, near Benz Circle, Eluru Road, Vijayawada  
- Phone: [7569494949](tel:7569494949)  
- Theme: red / chocolate brown / maroon / white

## Stack

- Next.js (App Router) + TypeScript + Tailwind CSS + shadcn/ui  
- Persistence: JSON files in `data/` (no database or auth credentials)

| File | Purpose |
|------|---------|
| `data/catalog.json` | Rooms, venues, menu, buffets, facilities |
| `data/ops.json` | Bookings, orders, kitchen tickets, ledger, stock, tables |

## Run locally

```bash
npm install
npm run dev
```

App: [http://127.0.0.1:3947](http://127.0.0.1:3947)

```bash
npm run build
npm start
```

## Guest site

- `/` — brand hero + highlights + map  
- `/rooms`, `/rooms/[id]`, `/book`, `/bookings/[id]` — room booking  
- `/banquet`, `/party-hall` — venue booking  
- `/food` — CHIGURU online order  
- `/buffet` — buffet booking  
- `/facilities`, `/contact`

## Staff ops (`/ops`)

Shared store with the guest site:

1. Reception — room bookings / check-in  
2. Server — table floor  
3. KT Kitchen — ticket queue  
4. Admin — overview  
5. Accounts — ledger  
6. Inward — stock in  
7. Outward — stock out  

## API (selection)

- `POST /api/bookings/rooms` · `POST /api/bookings/venues`  
- `POST /api/orders` · `POST /api/buffet` · `POST /api/contact`  
- `GET /api/ops` · `PATCH /api/ops/bookings/[id]` · `PATCH /api/ops/kitchen/[id]` · `PATCH /api/ops/tables/[id]`  
- `POST /api/ops/ledger` · `POST /api/ops/stock`
