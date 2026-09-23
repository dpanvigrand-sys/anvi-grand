# Public URL (Cloudflare quick tunnel)

Guest site + staff ops share one public base via Cloudflare quick tunnel → Next on `:3947`.

**Current base (auto-healed 2026-09-23T18:16Z):**

https://card-other-respective-testimonials.trycloudflare.com

> **Hard limit:** Quick tunnels die when this cloud VM is recycled or the agent is archived. Keep-alive in **tmux** (`npm run ops:persist`) survives agent *turn end* on the same VM — not VM death. Hostname rotates whenever `cloudflared` truly restarts. Open these URLs on **your laptop browser** while a warm agent is RUNNING.

> Keep-alive only restarts when the tunnel **process** is dead — not on transient DNS/curl failures.

## Language

Ops web UI is **English only** (no Telugu labels).

## Local (Try Live desktop — only visible if you open Try Live)

- http://localhost:3947/
- http://localhost:3947/ops?unlock=anviops2026
- http://localhost:3947/ops/admin?unlock=anviops2026

## Public — open on YOUR laptop (primary)

Password: `anviops2026`

| Screen | URL |
|--------|-----|
| 1. Website (guest) | https://card-other-respective-testimonials.trycloudflare.com/ |
| 2. Ops hub | https://card-other-respective-testimonials.trycloudflare.com/ops?unlock=anviops2026 |
| 3. Admin.1 | https://card-other-respective-testimonials.trycloudflare.com/ops/admin?unlock=anviops2026 |
| Reception | https://card-other-respective-testimonials.trycloudflare.com/ops/reception?unlock=anviops2026 |
| Photos — Add / Edit | https://card-other-respective-testimonials.trycloudflare.com/ops/admin/photos?unlock=anviops2026 |
| Menu (Food) — Add / Edit | https://card-other-respective-testimonials.trycloudflare.com/ops/admin/food?unlock=anviops2026 |
| Bookings reports | https://card-other-respective-testimonials.trycloudflare.com/ops/admin/bookings?unlock=anviops2026 |
| Venue bookings | https://card-other-respective-testimonials.trycloudflare.com/ops/admin/venue-bookings?unlock=anviops2026 |

## Unlock note

`?unlock=anviops2026` writes `localStorage` on **that hostname only**. A new `*.trycloudflare.com` name is a new origin — paste the unlock query again after hostname rotation.

## Auto browser refresh

After every UI update: `npm run live:refresh` — opens unlocked `/ops` + guest `/` on Try Live. See `docs/auto-open-rule.md`.

## Keep-alive (durable on this VM)

```bash
npm run ops:persist          # tmux-backed; survives turn end
# or: bash scripts/ops-persist.sh ensure
bash scripts/ops-keep-alive.sh loop   # foreground loop (dies with shell)
```

See `docs/open-failure-deep-check.md` for root causes.
