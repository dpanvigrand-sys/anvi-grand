# Public URL (Cloudflare quick tunnel)

Guest site + staff ops share one public base via Cloudflare quick tunnel → Next on `:3947`.

**Current base (see store `docs/public-url.md` / `internal/public-url.txt` for live value):**

Prefer the URL in the agent store. Local fallback: `http://127.0.0.1:3947`.

> Quick tunnels recycle when `cloudflared` restarts. If you see Cloudflare Error 1033/530, restart the tunnel and update the store public-url docs.

## Local

- http://127.0.0.1:3947/
- http://127.0.0.1:3947/ops?unlock=anviops2026

## Auto browser refresh

After every UI update: `npm run live:refresh` — opens **both** unlocked `/ops` and guest `/` (public preferred), writes `media/shot.jpg`.
