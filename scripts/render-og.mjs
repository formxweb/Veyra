// Renders the default social-share image (src/assets/og/og-default.jpg) from
// real catalogue photos and the brand typography. Run: npm run og
import { chromium } from 'playwright';
import sharp from 'sharp';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const data = JSON.parse(await readFile(path.join(root, 'src/data/products.json'), 'utf8'));
const picks = data.products
  .filter((p) => !p.hidden && p.featured != null)
  .sort((a, b) => a.featured - b.featured)
  .slice(0, 4);
// Inline everything as data URIs: a page created with setContent cannot read file:// URLs.
const b64 = async (p) => (await readFile(p)).toString('base64');
const fontCache = {};
for (const [pkg, file] of [
  ['fraunces', 'fraunces-latin-opsz-normal.woff2'],
  ['fraunces', 'fraunces-latin-ext-opsz-normal.woff2'],
  ['fraunces', 'fraunces-latin-opsz-italic.woff2'],
  ['fraunces', 'fraunces-latin-ext-opsz-italic.woff2'],
  ['hanken-grotesk', 'hanken-grotesk-latin-wght-normal.woff2'],
  ['hanken-grotesk', 'hanken-grotesk-latin-ext-wght-normal.woff2'],
]) {
  fontCache[file] = `data:font/woff2;base64,${await b64(path.join(root, 'node_modules/@fontsource-variable', pkg, 'files', file))}`;
}
const font = (_pkg, file) => fontCache[file];
const imgCache = {};
for (const p of picks) imgCache[p.images[0].file] = `data:image/jpeg;base64,${await b64(path.join(root, 'src/assets/products', p.images[0].file))}`;
const img = (f) => imgCache[f];

const html = `<!doctype html><html><head><style>
@font-face{font-family:F;src:url(${font('fraunces', 'fraunces-latin-opsz-normal.woff2')})}
@font-face{font-family:F;src:url(${font('fraunces', 'fraunces-latin-ext-opsz-normal.woff2')});unicode-range:U+0100-024F}
@font-face{font-family:FI;font-style:italic;src:url(${font('fraunces', 'fraunces-latin-opsz-italic.woff2')})}
@font-face{font-family:FI;font-style:italic;src:url(${font('fraunces', 'fraunces-latin-ext-opsz-italic.woff2')});unicode-range:U+0100-024F}
@font-face{font-family:H;src:url(${font('hanken-grotesk', 'hanken-grotesk-latin-wght-normal.woff2')})}
@font-face{font-family:H;src:url(${font('hanken-grotesk', 'hanken-grotesk-latin-ext-wght-normal.woff2')});unicode-range:U+0100-024F}
*{margin:0;box-sizing:border-box}
body{width:1200px;height:630px;display:grid;grid-template-columns:560px 1fr;background:linear-gradient(180deg,#f1ebe1,#e6dccb);color:#12110f;font-family:H}
.t{padding:72px 0 64px 72px;display:grid;align-content:space-between;height:630px}
.w{font-family:F;font-size:34px;letter-spacing:.36em}
.w small{display:block;margin-top:8px;font-family:H;font-size:11px;letter-spacing:.6em;font-weight:600;opacity:.7}
h1{font-family:F;font-weight:320;font-size:76px;line-height:1.02;letter-spacing:-.02em}
h1 em{font-family:FI;font-style:italic;font-weight:300}
p{font-size:17px;color:#4a453f;line-height:1.45;white-space:nowrap}
.g{display:grid;grid-template-columns:1fr 1fr;grid-template-rows:1fr 1fr;gap:16px;padding:48px 56px 48px 16px;height:630px}
.c{display:grid;place-items:center;background:#ebe3d6;padding:18px;min-height:0;overflow:hidden}
.c img{height:100%;width:auto;max-width:100%;box-shadow:0 1px 1px rgba(30,22,14,.08),0 10px 24px -14px rgba(30,22,14,.38)}
</style></head><body>
<div class="t"><div class="w">VEYRA<small>TİCARET</small></div>
<div><h1>Özenle seçilir.<br><em>Güvenle</em> ulaşır.</h1></div>
<p>WhatsApp ile sipariş · Türkiye’nin 81 iline kargo · EFT / Havale</p></div>
<div class="g">${picks.map((p) => `<div class="c"><img src="${img(p.images[0].file)}"></div>`).join('')}</div>
</body></html>`;

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1200, height: 630 }, deviceScaleFactor: 1 });
await page.setContent(html, { waitUntil: 'load' });
await page.evaluate(() => document.fonts.ready);
const png = await page.screenshot();
await sharp(png).jpeg({ quality: 86, mozjpeg: true }).toFile(path.join(root, 'src/assets/og/og-default.jpg'));
await browser.close();
console.log('src/assets/og/og-default.jpg');
