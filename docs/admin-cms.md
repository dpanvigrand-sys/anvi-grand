# Admin CMS (rooms, food & photos)

Staff password: **`anviops2026`**

## Rooms & ₹ prices

- **Admin UI:** `/ops/admin/rooms` (ops nav **Rooms**, Admin hub)
- **Public:** `/rooms` and `/rooms/[id]`
- **Storage:** `data/catalog.json` → `rooms[].pricePerNight`
- **API:** `POST /api/ops/catalog` `{ "section": "rooms", "action": "upsert"|"delete", ... }`

Inline **Save ₹**, full **Edit**, **+ Add room**, **Delete**.

## Food (CHIGURU menu & buffets) — full item edit

- **Admin UI:** `/ops/admin/food` (ops nav **Food**, Admin hub card)
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

## Photos

- **Admin UI:** `/ops/admin/photos`
- **Storage:** `data/media.json`
- **Sync:** `POST /api/ops/media/sync` (or **Sync from website**) seeds hero, rooms, venues, food, and facilities.

## Related

- Public laptop ops URLs: `docs/public-url.md`
