# Havenmere

Lakeside boutique hotel website — marketing pages plus a working reservation flow. Built with **Next.js**, **TypeScript**, **Tailwind CSS**, and **shadcn/ui**.

## Features

- Brand-first landing page with full-bleed hero
- Rooms listing and room detail pages
- End-to-end booking flow (`/book` → API → confirmation)
- Contact form with persistence
- Empty, loading, and error states
- Desktop and mobile layouts

## Persistence (no database)

JSON files under `data/`:

| File | Purpose |
|------|---------|
| `data/rooms.json` | Room catalog |
| `data/bookings.json` | Saved reservations (written by `POST /api/bookings`) |
| `data/messages.json` | Contact messages (written by `POST /api/contact`) |

No auth or external credentials required.

## Run locally

```bash
npm install
npm run dev
```

App URL: [http://127.0.0.1:3847](http://127.0.0.1:3847)

`npm run dev` uses Webpack (more reliable in this environment than Turbopack). For a production-style local run:

```bash
npm run build
npm start
```

## API

- `GET /api/rooms` — list rooms
- `GET /api/bookings` — list bookings
- `POST /api/bookings` — create a reservation
- `POST /api/contact` — submit a contact message

## Stack

- Next.js App Router + Route Handlers
- Tailwind CSS v4 + shadcn/ui
- Fraunces + Outfit fonts
