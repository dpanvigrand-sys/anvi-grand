# After we update — you Refresh (F5)

**User rule:** When agents change the website or ops content, open your usual three tabs and press **Refresh (F5 / Ctrl+R)**. New content appears. You do **not** need to press Continue, reopen tabs, or ask the agent to open screens again.

## The three default screens (bookmark these)

Password: `anviops2026`  
Current public base: see [`public-url.md`](./public-url.md) (also `internal/public-url.txt`).

1. **Website** — `{base}/`
2. **Ops hub** — `{base}/ops?unlock=anviops2026`
3. **Admin.1** — `{base}/ops/admin?unlock=anviops2026`

Use the **public** `*.trycloudflare.com` links on your laptop (not `localhost` — that only works on Try Live).

## What Refresh picks up

| Change type | What you do | How it works |
|-------------|-------------|--------------|
| CMS / JSON / photos / menu (`data/*`, uploads) | **F5** | Pages are `force-dynamic` + `noStore`; HTML sent with `Cache-Control: no-store` |
| Code / UI layout | Wait for agent `live:refresh` (rebuild+restart), then **F5** | Agent runs rebuild when source is newer than `.next` |

## Agent side (automatic)

- Durable stack: `npm run ops:persist` (tmux keep-alive; does **not** rotate a healthy public tunnel)
- After UI work: `npm run live:refresh` → opens the three screens on Try Live
- Open three anytime: `npm run ops:open-three`

## Limits (honest)

- Quick tunnel dies if the **cloud VM** is recycled → Error 1033. Then use the **updated** base from `public-url.md`.
- `localhost` on your laptop will fail (Error -102). Always use the public URLs.
