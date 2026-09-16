#!/usr/bin/env bash
# Open three screens on Try Live desktop: guest / | ops hub | Admin.1
# Prefer public URLs so laptop users can copy the same links.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
PORT="${ANVI_PORT:-3947}"
PASS="${ANVI_OPS_PASSWORD:-anviops2026}"
STORE="/cursor/stores/bc-13006a34-b590-4fbf-bb2f-cf84b243b163"
PUBLIC_URL_FILE="$STORE/internal/public-url.txt"
SHOT="$STORE/media/shot.jpg"
export DISPLAY="${DISPLAY:-:1}"

cd "$ROOT"
bash "$ROOT/scripts/ops-persist.sh" ensure >>/tmp/anvi-open-three.log 2>&1 || true

BASE=""
if [[ -f "$PUBLIC_URL_FILE" ]]; then
  BASE="$(grep -m1 -E '^https://' "$PUBLIC_URL_FILE" | tr -d '[:space:]' || true)"
fi
if [[ -z "$BASE" ]]; then
  BASE="http://localhost:${PORT}"
fi
BASE="${BASE%/}"

U1="${BASE}/"
U2="${BASE}/ops?unlock=${PASS}"
U3="${BASE}/ops/admin?unlock=${PASS}"

echo "[open-three] 1 $U1"
echo "[open-three] 2 $U2"
echo "[open-three] 3 $U3"

# Verify HTTP from this host (public may need -4)
for u in "$U1" "$U2" "$U3"; do
  code=$(curl -4 -s -o /dev/null -w "%{http_code}" --max-time 15 "$u" 2>/dev/null || echo 000)
  echo "[open-three] HTTP $code  $u"
done

CHROME_BIN=""
for c in google-chrome-stable google-chrome chromium; do
  if command -v "$c" >/dev/null 2>&1; then
    CHROME_BIN="$(command -v "$c")"
    break
  fi
done
[[ -n "$CHROME_BIN" ]] || { echo "no chrome"; exit 1; }

COMMON=(
  --no-sandbox --test-type --disable-dev-shm-usage
  --use-gl=angle --use-angle=swiftshader-webgl
  --password-store=basic --no-first-run --no-default-browser-check
  --disable-session-crashed-bubble
  --user-data-dir=/home/ubuntu/.config/google-chrome-anvi-three
  --class=Google-chrome
)

# Kill prior three-window profile instances lightly
pkill -f 'google-chrome-anvi-three' 2>/dev/null || true
sleep 0.5

# Three tiled windows
nohup "$CHROME_BIN" "${COMMON[@]}" --window-size=640,1000 --window-position=0,0 --new-window "$U1" \
  >>/tmp/chrome-three.log 2>&1 &
sleep 1.5
nohup "$CHROME_BIN" "${COMMON[@]}" --window-size=640,1000 --window-position=640,0 --new-window "$U2" \
  >>/tmp/chrome-three.log 2>&1 &
sleep 1.5
nohup "$CHROME_BIN" "${COMMON[@]}" --window-size=640,1000 --window-position=1280,0 --new-window "$U3" \
  >>/tmp/chrome-three.log 2>&1 &
sleep 4

# Also prove unlock with Playwright (visible headed if possible)
node <<'NODE' || true
const { chromium } = require('playwright-core');
const fs = require('fs');
const store = '/cursor/stores/bc-13006a34-b590-4fbf-bb2f-cf84b243b163';
const base = (fs.readFileSync(store + '/internal/public-url.txt','utf8').trim().split('\n')[0] || '').replace(/\/$/,'');
const pass = 'anviops2026';
(async () => {
  const browser = await chromium.launch({
    executablePath: '/usr/bin/google-chrome-stable',
    headless: true,
    args: ['--no-sandbox','--disable-dev-shm-usage']
  });
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  async function shot(path, url, assertNot) {
    const page = await ctx.newPage();
    await page.goto(url, { waitUntil: 'networkidle', timeout: 45000 }).catch(() => page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 }));
    await page.waitForTimeout(1500);
    const body = await page.locator('body').innerText().catch(() => '');
    if (assertNot && body.includes(assertNot)) {
      console.error('[open-three] FAIL still showing:', assertNot, 'on', url);
    } else {
      console.log('[open-three] OK body snippet:', body.slice(0, 120).replace(/\n/g,' '), '←', url);
    }
    await page.screenshot({ path, fullPage: false });
    await page.close();
  }
  await shot(store + '/media/shot-guest.png', base + '/', null);
  await shot(store + '/media/shot-ops.png', base + '/ops?unlock=' + pass, 'Checking staff access');
  await shot(store + '/media/shot-admin.png', base + '/ops/admin?unlock=' + pass, 'Checking staff access');
  await browser.close();
})().catch((e) => { console.error(e); process.exitCode = 1; });
NODE

# Desktop composite shot
sleep 1
TMP=/tmp/anvi-three-raw.png
ffmpeg -y -f x11grab -video_size 1920x1080 -i "${DISPLAY%.0}.0" -frames:v 1 "$TMP" >/tmp/anvi-three-ffmpeg.log 2>&1 \
  || ffmpeg -y -f x11grab -i "${DISPLAY:-:1}.0" -frames:v 1 "$TMP" >/tmp/anvi-three-ffmpeg.log 2>&1 \
  || true

mkdir -p "$STORE/media"
if [[ -s "$TMP" ]]; then
  if python3 -c 'import PIL' 2>/dev/null; then
    python3 - <<PY
from PIL import Image
from pathlib import Path
im = Image.open("$TMP").convert("RGB")
w,h = im.size
if w > 1280:
    im = im.resize((1280, int(h*1280/w)), Image.Resampling.LANCZOS)
dst = Path("$SHOT")
for q in (70,55,40):
    im.save(dst, "JPEG", quality=q, optimize=True)
    if dst.stat().st_size <= 220_000:
        break
print(f"[open-three] shot {dst} ({dst.stat().st_size} bytes)")
PY
  else
    ffmpeg -y -i "$TMP" -vf scale=1280:-1 -q:v 5 "$SHOT" >/dev/null 2>&1 || cp "$TMP" "$SHOT"
  fi
fi

# If desktop blank-ish, stitch playwright shots
if [[ ! -s "$SHOT" ]] || [[ $(wc -c <"$SHOT") -lt 5000 ]]; then
  python3 - <<'PY' || true
from PIL import Image
from pathlib import Path
store = Path('/cursor/stores/bc-13006a34-b590-4fbf-bb2f-cf84b243b163/media')
paths = [store/'shot-guest.png', store/'shot-ops.png', store/'shot-admin.png']
imgs = [Image.open(p).convert('RGB') for p in paths if p.exists()]
if not imgs:
    raise SystemExit(0)
h = max(i.height for i in imgs)
w = sum(i.width for i in imgs)
canvas = Image.new('RGB', (w, h), (20,20,20))
x=0
for i in imgs:
    canvas.paste(i, (x, 0))
    x += i.width
out = store/'shot.jpg'
mw=1280
if canvas.width > mw:
    canvas = canvas.resize((mw, int(canvas.height*mw/canvas.width)), Image.Resampling.LANCZOS)
canvas.save(out, 'JPEG', quality=60, optimize=True)
print('stitched', out, out.stat().st_size)
PY
fi

echo "[open-three] DONE"
echo "[open-three] Try Live desktop has 3 Chrome windows; laptop must open public URLs or Try Live panel"
