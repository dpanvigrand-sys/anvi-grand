# Public URL (Cloudflare quick tunnel)

**Current base:** https://ana-vendor-cards-theta.trycloudflare.com

> Tunnel hostname rotates only when `cloudflared` process restarts. Keep-alive does **not** thrash on DNS lag.

## Local (Try Live — use this)

- http://localhost:3947/
- http://localhost:3947/ops?unlock=anviops2026

## Public — guest website

| Screen | URL |
|--------|-----|
| Guest home | https://ana-vendor-cards-theta.trycloudflare.com/ |
| Rooms | https://ana-vendor-cards-theta.trycloudflare.com/rooms |
| Dining (CHIGURU) | https://ana-vendor-cards-theta.trycloudflare.com/food |
| Banquet | https://ana-vendor-cards-theta.trycloudflare.com/banquet |
| Party hall | https://ana-vendor-cards-theta.trycloudflare.com/party-hall |
| Gallery | https://ana-vendor-cards-theta.trycloudflare.com/gallery |
| Contact / map | https://ana-vendor-cards-theta.trycloudflare.com/contact |
| Buffet | https://ana-vendor-cards-theta.trycloudflare.com/buffet |
| Book room | https://ana-vendor-cards-theta.trycloudflare.com/book |

## Ops (secondary)

Password: `anviops2026`

| Screen | URL |
|--------|-----|
| Ops hub | https://ana-vendor-cards-theta.trycloudflare.com/ops?unlock=anviops2026 |

## Auto browser

`npm run live:refresh` opens Chrome **guest `/` first**, then unlocked ops. Shot: store `media/shot.jpg` (guest home).

Keep-alive: `npm run ops:keep-alive:loop`
