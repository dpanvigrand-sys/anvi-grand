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
Public base: see `docs/public-url.md` (Cloudflare tunnel hostname may rotate).

## Actions on each screen

| Screen | Add | Edit | Delete |
|--------|-----|------|--------|
| Photos | Upload or URL + website place | Label, place, URL | Removes library row (+ clears place) |
| Menu | + Add menu item / buffet | Edit item (full fields) or Save ₹ | Delete |
| Rooms | + Add room | Edit / Save ₹ | Delete |
| Venues | + Add venue | Edit / Save ₹ + capacity | Delete |

Banquet and mini hall share **one** Venues screen — use the row anchors or type column (**Banquet hall** vs **Mini / party hall**).

## Storage

- Photos → `data/media.json` (+ write-through to `data/catalog.json` image fields)
- Menu / rooms / venues → `data/catalog.json`
