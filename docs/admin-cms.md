# Admin CMS (rooms & photos)

Staff password: **`anviops2026`**

## Rooms & ₹ prices

- **Admin UI:** `/ops/admin/rooms` (also linked from `/ops/admin` and ops nav **Rooms**)
- **Public:** `/rooms` and `/rooms/[id]` — prices update as soon as you save
- **Storage:** `data/catalog.json` → `rooms[].pricePerNight`
- **API:** `POST /api/ops/catalog` with `{ "section": "rooms", "action": "upsert"|"delete", ... }`

Inline **Save ₹** edits the nightly rate; **Edit** opens the full room form (name, tagline, description, capacity, amenities, image, availability). **+ Add room** / **Delete** write the same JSON file.

## Photos

- **Admin UI:** `/ops/admin/photos`
- **Storage:** `data/media.json`
- **Sync:** `POST /api/ops/media/sync` (or the **Sync from website** button) seeds hero, rooms, venues, food, and facilities into the library so Admin Photos is not limited to the entrance shot.

## Related

- Public laptop ops URLs: `docs/public-url.md`
