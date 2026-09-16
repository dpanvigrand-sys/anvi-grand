# Admin CMS (rooms, food, venues, photos, contacts & booking reports)

Staff password: **`anviops2026`**

## Booking reports (rooms + food)

- **Admin UI:** `/ops/admin/bookings` (ops nav **Bookings**, Admin hub, Ops hub card)
- **Fields:** person name, address, phone, advance, balance (+ link to room booking / food order)
- **Views:** Daily · Monthly · Date range (filter Rooms / Food / both)
- **Exports:**
  1. **Download Excel** — UTF-8 CSV Excel opens cleanly
  2. **Print A4** — print stylesheet (`@page A4`)
  3. **Export JPG** — captures the report table (`html-to-image`)
- **Storage:** `data/ops.json` → `roomBookings[]` / `foodOrders[]` with `address`, `advance`, `balance`
- **API:** `PATCH /api/ops/bookings/[id]` `{ guestName, address, phone, advance, balance }`
- **UI:** `src/components/ops/bookings-admin.tsx` · page `src/app/ops/admin/bookings/page.tsx`
- **Guest forms:** room book + CHIGURU order collect address + advance (balance = total − advance)

Inline **Edit / Save** on any row updates ops.json live.

## Inward & outward stock reports

- **Entry points:** `/ops/inward`, `/ops/outward`, and combined `/ops/admin/stock-reports`
- **Fields:** item, supplier/party (`vendorOrDept`), qty + unit, amount ₹, advance, balance, date, notes
- **Views:** Daily · Monthly · Date range (Inward / Outward / both on combined page)
- **Exports:** Download Excel (CSV) · Print A4 · Export JPG
- **Create / edit:** Forms on inward & outward pages; inline Edit on report tables
- **Storage:** `data/ops.json` → `inward[]` / `outward[]`
- **API:** `POST|PATCH /api/ops/stock`
- **UI:** `src/components/ops/stock-reports-admin.tsx`, `stock-form.tsx`

## Contacts (three booking lines)

- **Admin UI:** `/ops/admin/contacts` (ops nav **Contacts**, Admin hub)
- **Roles:** Rooms booking · Food booking · Reception
- **Storage:** `data/catalog.json` → `hotel.roomsPhone`, `hotel.foodPhone`, `hotel.receptionPhone`
- **Fallback:** Legacy `hotel.phone` (default `7569494949`) when a role line is empty
- **API:** `POST /api/ops/catalog` `{ "section": "hotel", "item": { "roomsPhone"|"foodPhone"|"receptionPhone": "..." } }`
- **UI:** `src/components/ops/contacts-admin.tsx` · page `src/app/ops/admin/contacts/page.tsx`

| Role | Guest pages |
|------|-------------|
| Rooms booking | `/rooms`, `/rooms/[id]`, `/book` |
| Food booking | `/food`, `/buffet`, home CHIGURU order |
| Reception | Header mobile call, footer, hero, `/contact` |

**Add / Save / Delete (clear)** per role. Saving Reception also updates `hotel.phone` so the main desk stays in sync. Cleared roles fall back to `hotel.phone` — existing `7569494949` is kept unless Reception is replaced in CMS.

## Rooms & ₹ prices

- **Admin UI:** `/ops/admin/rooms` (ops nav **Rooms**, Admin hub)
- **Public:** `/rooms` and `/rooms/[id]`
- **Storage:** `data/catalog.json` → `rooms[].pricePerNight`
- **API:** `POST /api/ops/catalog` `{ "section": "rooms", "action": "upsert"|"delete", ... }`

Inline **Save ₹**, full **Edit**, **+ Add room**, **Delete**.


## Banquet / Venues (price & capacity)

- **Admin UI:** `/ops/admin/venues` (ops nav **Venues**, Admin hub card)
- **Royal Grand Ballroom:** open `/ops/admin/venues` (row id `#venue-royal-grand-ballroom`) — edit ₹/day (`priceFrom`) and guest **capacity**
- **Public:** `/banquet` (banquet type) and `/party-hall` (party-hall type)
- **Storage:** `data/catalog.json` → `venues[].priceFrom`, `venues[].capacity`
- **API:** `POST /api/ops/catalog` `{ "section": "venues", "action": "upsert"|"delete", ... }`
- **UI:** `src/components/ops/venues-admin.tsx` · page `src/app/ops/admin/venues/page.tsx`

Inline **Save ₹ + capacity**, full **Edit** (name, type, tagline, description, **image URL or `/uploads/…`**, amenities), **+ Add venue**, **Delete**.

**Home banquet cards** (`/`): first two banquet/party-hall venues. Images come from `venues[].image`. If empty or a missing `/uploads/` file, stock defaults are used (`src/lib/default-images.ts`) so cards never show broken images.

**Photo place mapping:** Admin Photos → website place `venue:royal-grand-ballroom` / `venue:imperial-ruby-mini` write-through updates the same field (and home cards) live.

## Food (CHIGURU menu & buffets) — full item edit

- **Label everywhere:** **Menu (Food) — Add / Edit**
- **Admin UI:** `/ops/admin/food` — hub **Quick edit**, Admin.1 first cards, Restaurant Manager.1, deep link `?unlock=anviops2026`
- **Public:** `/food` (menu dishes) and `/buffet` (buffets)
- **Storage:** `data/catalog.json` → `menu[]` and `buffets[]`
- **API:** `POST /api/ops/catalog` `{ "section": "menu"|"buffets", "action": "upsert"|"delete", item|id }`
- **UI:** `src/components/ops/food-admin.tsx` · page `src/app/ops/admin/food/page.tsx`

### What staff can change

| Action | Menu dish | Buffet |
|--------|-----------|--------|
| **Edit item** (full upsert) | name, description, category, veg/non-veg, price ₹, image URL | name, description, meal, price/person ₹, image URL |
| **Save ₹** (inline) | price only | price/person only |
| **Add** | new dish | new package |
| **Delete** | removes from `/food` | removes from `/buffet` |

**Edit item** opens a highlighted full form (not price-only). **Save full item** writes the whole object into `catalog.json`. Public `/food` and `/buffet` are `force-dynamic` and pick up changes immediately after save.

## Photos — every website place

- **Label everywhere:** **Photos — Add / Edit / Delete**
- **Admin UI:** `/ops/admin/photos` — hub **Quick edit** (red-bordered primary card), Admin.1 first card, deep link `?unlock=anviops2026`
- **Password:** `anviops2026`
- **Staff map:** `docs/cms-where.md`
- **Storage:** `data/media.json` (library) + write-through to `data/catalog.json` image fields
- **Sync:** `POST /api/ops/media/sync` (or **Sync from website**) pulls every public placement into the library
- **UI:** `src/components/ops/photo-manager.tsx` · page `src/app/ops/admin/photos/page.tsx`

### Website places covered

| Place | Catalog / media key | Guest page |
|-------|---------------------|------------|
| Home hero | `hotel:hero` → `hotel.heroImage` | `/` |
| Room card / detail | `room:{id}` → `rooms[].image` | `/rooms`, `/rooms/[id]` |
| CHIGURU dish | `menu:{id}` → `menu[].image` | `/food` |
| Buffet package | `buffet:{id}` → `buffets[].image` | `/buffet` |
| Banquet / party hall | `venue:{id}` → `venues[].image` | `/banquet`, `/party-hall` |
| Facility | `facility:{id}` → `facilities[].image` | `/facilities` |
| Extra gallery shots | library-only uploads | `/gallery` |

### Staff actions

| Action | Behavior |
|--------|----------|
| **Sync from website** | Lists every current site image with category + “Shows on” page mapping |
| **Add / replace** | **Choose from computer** (JPG/PNG/WebP/GIF ≤6MB → `public/uploads/`) **or** paste image URL; **website place required** for guest pages (defaults to Home hero). Category alone does **not** update `/` / rooms / food |
| **Edit** | Change label, category, image URL, **replace from computer**, **and website place** — place write-through updates `catalog.json` so guest pages update live |
| **Delete** | Removes library row; catalog placements clear that page’s image until replaced |

### Live guest visibility checklist

1. Pick **Website place** (e.g. Home hero `/`, a room, a CHIGURU dish) — not only category “Website”.
2. Click **Choose from computer** → pick a local image (or paste a URL) → saved under `public/uploads/` and served at `/uploads/…`.
3. Hard-refresh `/`, `/gallery`, `/rooms`, `/food` — no server restart needed (`force-dynamic` + `noStore` on catalog/media).
4. Unplaced library rows show **“Not on guest pages yet — assign a website place”** until you assign a place on Edit.

Hero reads `hotel.heroImage` (not a hardcoded file). Gallery uses the same hero field. `/uploads/` is rewritten to a dynamic API handler so files added after `next start` appear without restart; guest `next/image` uses `unoptimized` for those paths.

## Related

- Public laptop ops URLs: `docs/public-url.md`
