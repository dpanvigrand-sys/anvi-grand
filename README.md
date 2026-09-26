# ANVI GRAND

Full-stack hotel website for **ANVI GRAND** (Vijayawada) with **IRAA Dine** dining and password-gated staff ops.

## Brand

- Hotel: ANVI GRAND  
- Restaurant: IRAA  
- Address: Anvi Grand, near Benz Circle, Eluru Road, Vijayawada  
- Phone: [7569494949](tel:7569494949)  
- Theme: red / chocolate brown / maroon / white  
- Logos: `public/logos/anvi-grand.svg`, `public/logos/iraa.svg`

## Run locally

```bash
npm install
npm run dev
```

App: [http://127.0.0.1:3947](http://127.0.0.1:3947)

```bash
npm run build && npm start
```

### Photos (add / edit images) — localhost first

1. Open [http://127.0.0.1:3947/ops/admin/photos?unlock=anviops2026](http://127.0.0.1:3947/ops/admin/photos?unlock=anviops2026) (password `anviops2026`)
2. **Choose from computer** → pick website place (Home hero / room / gallery) → upload  
   Local disk is writable — **no GitHub PAT needed** for localhost.
3. Confirm on guest `/`, `/gallery`, `/rooms`.

Optional env template: `.env.example` (copy to `.env.local` only if you need tokens later).  
When ready for **www**, set `ANVI_GITHUB_TOKEN` and run `bash scripts/push-github-main.sh` (then revoke the PAT).
## Standing rule — auto-open after every update

**HARD RULE:** After any update, agent MUST run `npm run live:refresh` before finishing. Failure = incomplete. User presses nothing.

1. Keep the app serving on port **3947** (`npm run dev` or `npm start`)
2. Optionally leave `npm run ops:keep-alive:loop` running (survives idle / Cloudflare 1033)
3. Run **`npm run live:refresh`** — Chrome `--new-window` unlocked `/ops` + guest `/`, write `media/shot.jpg`
4. Prefer **`localhost:3947`** for local (Next 16 breaks OpsGate unlock if only `127.0.0.1` is used in some setups)

| Script | What it does |
|--------|----------------|
| `npm run live` / **`live:refresh`** | Heal via keep-alive, open Chrome `--new-window` ops + guest, write `media/shot.jpg` |
| `npm run ops:keep-alive` | One-shot restart Next + cloudflared if dead; rewrite public URL docs |
| `npm run ops:keep-alive:loop` | Watchdog every 30s |
| `npm run live:ops-windows` | Multi-station public ops Chrome windows |

Public URL: see `docs/public-url.md`. Regression checklist: `docs/ops-regression.md`.

## Staff ops password (demo)

All ops systems open from **one hub** at `/ops` after unlock:

| Field | Value |
|-------|--------|
| URL | http://127.0.0.1:3947/ops |
| Password | `anviops2026` |

Systems on that desk: Reception · Server · KT Kitchen · Admin · Accounts · Inward · Outward  
Auth is session-only mock storage (no real accounts).

## Desktop shortcut

Linux shortcut file in the repo:

```bash
# From the repo root (after the app is running):
cp shortcuts/anvi-grand.desktop ~/Desktop/
chmod +x ~/Desktop/anvi-grand.desktop
# Optional icon: point Icon= to an absolute path of public/logos/anvi-grand.svg
```

Path: [`shortcuts/anvi-grand.desktop`](shortcuts/anvi-grand.desktop)  
Opens `http://127.0.0.1:3947/`. A web app manifest is also at `public/manifest.webmanifest` for “Install” / Add to Home Screen.

## Guest site

- `/` brand-first hero + rates teaser + map  
- `/rooms`, `/rooms/[id]`, `/book`, `/bookings/[id]` — room booking with ₹ rates  
- `/banquet`, `/party-hall` — venue booking  
- `/food` — IRAA online order with cart + Pay Now checkout
- `/gallery` — photo gallery of rooms, halls, and facilities  
- `/buffet` — buffet booking  
- `/facilities`, `/contact`

## Persistence

| File | Purpose |
|------|---------|
| `data/catalog.json` | Rooms, venues, menu, buffets, facilities |
| `data/ops.json` | Bookings, orders, kitchen tickets, ledger, stock, tables |

No database credentials required.
