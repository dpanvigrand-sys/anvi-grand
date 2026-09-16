# Counter booking OK popups

Calm bottom-left toasts when a **customer** books or orders — so the ops counter person can note it and press **OK**.

## Size choice

Target desk size ≈ **16 cm wide × 8 cm tall** → about **600 × 300 CSS px** at 96 dpi (quiet hub strip slightly narrower ~520 px). Soft shadow, no full-screen modal. Staff can keep using the page while the toast sits bottom-left.

## Where it appears

| Screen | Path | Watches |
|--------|------|---------|
| Reception.1 | `/ops/reception` | Room bookings |
| Banquet.1 | `/ops/banquet` | Banquet hall + mini (party) hall |
| Kitchen.1 | `/ops/kitchen` | Food orders |
| Server.1 | `/ops/server` | Food orders |
| Ops hub | `/ops` | All kinds (quiet strip) |
| Admin.1 / Manager.1 | `/ops/admin`, `/ops/manager` | Quiet strip (rooms/venues/food as applicable) |

Unlock: `/ops/reception?unlock=anviops2026` (shared password `anviops2026`).

## Behavior

1. Client polls `GET /api/ops/counter-bookings?station=<id>&since=<ISO>&seen=<ids>` every ~8s.
2. Toast shows **type**, **guest name**, **time**, brief **detail**, and **count** of new items.
3. **OK** dismisses the current batch: stores `since` + `seenIds` in `localStorage` key `anvi-ops-counter-booking-ack:<station>`.
4. When newer bookings/orders arrive after ack → toast appears again.
5. First visit (no ack): only items from the last **36 hours** (demo seeds use “now”).
6. Does **not** block the UI (not a modal). English-only copy.

## vs old OpsAlerts

`OpsAlerts` alert **bar** remains. The loud **modal popup** is muted (`popup={false}`) on hub + stations so it does not compete with this booking toast. CMS Quick edit is unchanged.

## Code

- `src/components/ops/counter-booking-toast.tsx` — UI
- `src/lib/counter-bookings.ts` — kind filter + item shaping
- `src/app/api/ops/counter-bookings/route.ts` — pending feed API
- Wired in `StationHome` + ops hub page

## Demo seeds

`data/ops.json` includes `cb-demo-room-now`, `cb-demo-banquet-now`, `cb-demo-mini-now`, `cb-demo-food-now` with fresh `createdAt` so a first open shows the toast without clearing storage.
