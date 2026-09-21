# Screens locked + Refresh = auto update

**Locked default four** (bookmark these — do not keep asking agents to reopen):

Password: `anviops2026`  
Live base: see [`public-url.md`](./public-url.md) / `internal/public-url.txt`.

1. **Website** — `{base}/`
2. **Ops hub** — `{base}/ops?unlock=anviops2026`
3. **Admin.1** — `{base}/ops/admin?unlock=anviops2026`
4. **Photos** — `{base}/ops/admin/photos?unlock=anviops2026`

Use **public** `*.trycloudflare.com` on Redmi tab / laptop Chrome. `localhost` only works on Try Live.

## Ops update → screen update

| You do | What happens |
|--------|----------------|
| **Refresh (F5 / pull-to-refresh)** after photos/menu/rooms/CMS change | Page is `force-dynamic` + `no-store` — **new content loads automatically** |
| Leave tab open | Soft auto-refresh ~every 45s + when you come back to the tab |
| Agent changes UI code | Agent runs `live:refresh` (rebuild); then you **F5** once |

You do **not** need Continue / reopen tabs / ask “open cheyandi” after every CMS edit.

## Staff lock (LOCK OPS)

Top-right **LOCK OPS** clears unlock on that browser. To open again, paste a `?unlock=anviops2026` link from the four above.

## Agent side

```bash
npm run ops:persist     # keep Next + tunnel; do not rotate while HTTP 200
npm run live:refresh    # after code/UI change — Try Live hard reload
```
