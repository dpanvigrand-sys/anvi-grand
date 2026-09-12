# Booking reports (rooms & food)

Staff password: **`anviops2026`**

## Where

- **Ops UI:** [/ops/admin/bookings](/ops/admin/bookings)
- Unlock `/ops` with password, then open **Bookings** (nav + Admin hub + Ops hub)

## Fields

| Field | Source |
|-------|--------|
| Person name | `guestName` |
| Address | `address` |
| Phone | `phone` |
| Advance | `advance` (₹ paid) |
| Balance | `balance` (usually total − advance) |
| Link | Room → `/bookings/[id]` · Food → `/food` |

## Views & exports

- **Daily / Monthly / Date range** filters, optional Rooms-only or Food-only
- **Download Excel** → CSV (Excel-compatible, BOM)
- **Print A4** → browser print with A4 stylesheet
- **Export JPG** → JPEG of the on-screen report

## Data

Persisted in `data/ops.json`. Guest room booking and CHIGURU order forms also capture address + advance.
