# Admin CMS (rooms, food & photos)

Staff password: **`anviops2026`**

## Rooms & ₹ prices

- **Admin UI:** `/ops/admin/rooms` (ops nav **Rooms**, Admin hub)
- **Public:** `/rooms` and `/rooms/[id]`
- **Storage:** `data/catalog.json` → `rooms[].pricePerNight`
- **API:** `POST /api/ops/catalog` `{ "section": "rooms", "action": "upsert"|"delete", ... }`

Inline **Save ₹**, full **Edit**, **+ Add room**, **Delete**.

## Food (CHIGURU menu & buffets)

- **Admin UI:** `/ops/admin/food` (ops nav **Food**, Admin hub card)
- **Public:** `/food` (menu dishes) and `/buffet` (buffets)
- **Storage:** `data/catalog.json` → `menu[].price`, `buffets[].pricePerPerson`
- **API:** `POST /api/ops/catalog` `{ "section": "menu"|"buffets", "action": "upsert"|"delete", ... }`
- **UI:** `src/components/ops/food-admin.tsx` · page `src/app/ops/admin/food/page.tsx`

Inline **Save ₹** for dishes and buffet per-person rates; full edit / add / delete for both sections.

## Photos

- **Admin UI:** `/ops/admin/photos`
- **Storage:** `data/media.json`
- **Sync:** `POST /api/ops/media/sync` (or **Sync from website**) seeds hero, rooms, venues, food, and facilities.

## Related

- Public laptop ops URLs: `docs/public-url.md`
