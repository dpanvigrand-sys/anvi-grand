# Where to edit CMS (Add / Edit / Delete)

Unlock password: **`anviops2026`**

Append `?unlock=anviops2026` to any ops URL (or unlock once on `/ops` — unlock is shared via localStorage).

## From the ops hub (where to click)

1. Open **`/ops?unlock=anviops2026`**
2. Under **Quick edit** (red-bordered cards at the top), click one of:
   - **Photos — Add / Edit / Delete**
   - **Menu — Add / Edit / Delete**
   - **Rooms prices — Add / Edit / Delete**
   - **Venues / halls prices**
3. Or open **Admin.1** → same four cards first.

Hub footer also links Photos, Menu, Rooms prices, Venues / halls prices.

## Exact paths

| What | Path (with unlock) | Guest pages updated |
|------|--------------------|---------------------|
| **Gallery photos** (+ hero / placed images) | `/ops/admin/photos?unlock=anviops2026` | `/gallery`, `/`, rooms, food, banquet |
| **Menu / food items** (prices + fields) | `/ops/admin/food?unlock=anviops2026` | `/food`, `/buffet` |
| **Room prices** | `/ops/admin/rooms?unlock=anviops2026` | `/rooms`, `/rooms/[id]` |
| **Banquet hall price** (Royal Grand) | `/ops/admin/venues?unlock=anviops2026#venue-royal-grand-ballroom` | `/banquet` |
| **Mini / party hall price** (Imperial Ruby) | `/ops/admin/venues?unlock=anviops2026#venue-imperial-ruby-mini` | `/party-hall` |

Local base: `http://localhost:3947`  
Public base (current): see `docs/public-url.md` (hostname may rotate).

## Photos — upload from your computer

1. Open **`/ops/admin/photos?unlock=anviops2026`**
2. Under **Add photo**, click **Choose from computer**
3. Pick a **JPG / PNG / WebP / GIF** from disk (max 6MB)
4. Set **Website place** (Home hero, room, dish, …) so the guest page updates
5. Click **Upload / replace photo** — file is stored under `public/uploads/` and served at `/uploads/…`
6. Optional: paste an **online image URL** instead of (or in addition to) a local file
7. **Edit** can also **Replace from computer**; **Delete** removes library + clears the place

## Actions on each screen

| Screen | Add | Edit | Delete |
|--------|-----|------|--------|
| Photos | **Choose from computer** or URL + website place | Label, place, URL, or replace file | Removes library row (+ clears place) |
| Menu | + Add menu item / buffet | Edit item (full fields) or Save ₹ | Delete |
| Rooms | + Add room | Edit / Save ₹ | Delete |
| Venues | + Add venue | Edit / Save ₹ + capacity | Delete |

Banquet and mini hall share **one** Venues screen — use the row anchors or type column (**Banquet hall** vs **Mini / party hall**).

## Storage

- Photos → `data/media.json` + files in `public/uploads/` (+ write-through to `data/catalog.json` image fields)
- Menu / rooms / venues → `data/catalog.json`
