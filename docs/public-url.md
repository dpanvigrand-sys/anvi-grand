# Public URL (Cloudflare quick tunnel)

Guest site + staff ops share one public base via Cloudflare quick tunnel → Next on `:3947`.

**Current base (verified HTTP 200 at 2026-09-13T10:11Z):**

https://facing-demanding-golf-marked.trycloudflare.com

> Quick tunnels recycle when `cloudflared` restarts. If you see Cloudflare Error 1033/530, restart the tunnel and update the store public-url docs.

## Local

- http://127.0.0.1:3947/
- http://127.0.0.1:3947/ops?unlock=anviops2026

## Language

Ops web UI is **English only**.

## Auto browser refresh

After every UI update: `npm run live:refresh` — opens **both** unlocked `/ops` and guest `/` (public preferred), writes `media/shot.jpg`.
