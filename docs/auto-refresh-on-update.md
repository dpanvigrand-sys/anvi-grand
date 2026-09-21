# Screens locked + automatic live updates

**Locked default four** (bookmark — agents keep these current):

Password: `anviops2026`  
Live base: see [`public-url.md`](./public-url.md)

1. **Website** — `{base}/`
2. **Ops hub** — `{base}/ops?unlock=anviops2026`
3. **Admin.1** — `{base}/ops/admin?unlock=anviops2026`
4. **Photos** — `{base}/ops/admin/photos?unlock=anviops2026`

## Automatic updates (no Continue needed)

| What changed | What open tabs do |
|--------------|-------------------|
| CMS / photos / menu / JSON / uploads | Poll `/api/live-stamp` every ~8s → **auto soft-refresh** when stamp changes |
| Tab focus / come back to screen | Soft-refresh immediately |
| Agent code/UI change | Agent runs `npm run live:refresh` (rebuild + hard reload all four) |

You can still press **F5** anytime. Public `*.trycloudflare.com` only on Redmi/Realme/laptop — not `localhost`.

## Agent

```bash
npm run ops:persist
npm run live:refresh    # after every UI update — opens/refreshes all live screens
```
