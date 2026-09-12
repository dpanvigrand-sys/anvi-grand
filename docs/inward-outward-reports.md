# Inward & outward stock reports

Staff password: **`anviops2026`**

## Entry points

| Page | Purpose |
|------|---------|
| `/ops/inward` | Create inward moves + inward-only report |
| `/ops/outward` | Create outward issues + outward-only report |
| `/ops/admin/stock-reports` | Combined inward + outward register |

## Columns

Date · Direction · Item · Supplier/party · Qty · Amount · Advance · Balance · Notes

## Views & exports

- Daily / Monthly / Date range filters
- **Download Excel** (CSV), **Print A4**, **Export JPG**

## Data

`data/ops.json` → `inward[]` / `outward[]` with `amount`, `advance`, `balance`, `date`.
