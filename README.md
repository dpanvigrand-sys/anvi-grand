# ANVI GRAND

Full-stack hotel website for **ANVI GRAND** (Vijayawada) with **CHIGURU** dining and password-gated staff ops.

## Brand

- Hotel: ANVI GRAND  
- Restaurant: CHIGURU  
- Address: Anvi Grand, near Benz Circle, Eluru Road, Vijayawada  
- Phone: [7569494949](tel:7569494949)  
- Theme: red / chocolate brown / maroon / white  
- Logos: `public/logos/anvi-grand.svg`, `public/logos/chiguru.svg`

## Run locally

```bash
npm install
npm run dev
```

App: [http://127.0.0.1:3947](http://127.0.0.1:3947)

```bash
npm run build && npm start
```

## Staff ops password (demo)

All ops systems open from **one hub** at `/ops` after unlock:

| Field | Value |
|-------|--------|
| URL | http://127.0.0.1:3947/ops |
| Password | `anviops2026` |

Systems on that desk: Reception · Server · KT Kitchen · Admin · Accounts · Inward · Outward  
Auth is session-only mock storage (no real accounts).

## Desktop shortcut

Linux shortcut file in the repo:

```bash
# From the repo root (after the app is running):
cp shortcuts/anvi-grand.desktop ~/Desktop/
chmod +x ~/Desktop/anvi-grand.desktop
# Optional icon: point Icon= to an absolute path of public/logos/anvi-grand.svg
```

Path: [`shortcuts/anvi-grand.desktop`](shortcuts/anvi-grand.desktop)  
Opens `http://127.0.0.1:3947/`. A web app manifest is also at `public/manifest.webmanifest` for “Install” / Add to Home Screen.

## Guest site

- `/` brand-first hero + rates teaser + map  
- `/rooms`, `/rooms/[id]`, `/book`, `/bookings/[id]` — room booking with ₹ rates  
- `/banquet`, `/party-hall` — venue booking  
- `/food` — CHIGURU online order with ₹ menu prices  
- `/buffet` — buffet booking  
- `/facilities`, `/contact`

## Persistence

| File | Purpose |
|------|---------|
| `data/catalog.json` | Rooms, venues, menu, buffets, facilities |
| `data/ops.json` | Bookings, orders, kitchen tickets, ledger, stock, tables |

No database credentials required.
