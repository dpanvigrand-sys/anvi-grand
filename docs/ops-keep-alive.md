# Keep-alive — survive idle / Cloudflare 1033

Quick tunnels die when `cloudflared` exits (idle VM, agent stop, crash). Hostname **rotates** on restart — that is normal. Keep-alive auto-heals without the user asking.

## Commands

```bash
# One-shot: ensure Next :3947 + healthy public tunnel; rewrite public-url docs
npm run ops:keep-alive

# Forever loop (default every 30s) — leave running on Try Live VM
npm run ops:keep-alive:loop
# or: bash scripts/ops-keep-alive.sh loop
```

`npm run live:refresh` calls keep-alive **once** before opening Chrome.

## What it does

1. Curl local `http://127.0.0.1:3947/` — if not 200, restart Next (`next start` if built, else `npm run dev`)
2. Curl current public base from `docs/public-url.md` / store `internal/public-url.txt`
3. If public dead/missing → restart `cloudflared tunnel --url http://127.0.0.1:3947`
4. Parse new `*.trycloudflare.com` URL → write:
   - store `internal/public-url.txt`
   - store `docs/public-url.md`
   - repo `docs/public-url.md`
   - `.anvi-public-url`

## Notes

- Tunnel hostname changes after restart — open the **updated** URL from `docs/public-url.md`
- Prefer longer-lived `ops:keep-alive:loop` over manual restarts
- Still run `npm run live:refresh` after UI changes so Chrome auto-opens unlocked `/ops`
