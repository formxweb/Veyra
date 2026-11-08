// Renders VEYRA's original atmospheric art (scripts/art/*) to src/assets/art.
// Usage: npm run art [-- name1 name2]
import { chromium } from 'playwright';
import sharp from 'sharp';
import { readFile, mkdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const outDir = path.join(root, 'src/assets/art');
await mkdir(outDir, { recursive: true });

const strip = (s) => s.replace(/^export\s+/gm, '');
const painter = strip(await readFile(path.join(root, 'scripts/art/painter.js'), 'utf8'));
const scenesSrc = strip(await readFile(path.join(root, 'scripts/art/scenes.js'), 'utf8'));

const only = process.argv.slice(2);
const browser = await chromium.launch();
const page = await browser.newPage();
await page.setContent('<!doctype html><body></body>');
await page.addScriptTag({ content: `${painter}\n${scenesSrc}\nwindow.paint = paint; window.ALL = Object.assign({}, scenes, covers);` });
const names = await page.evaluate(() => Object.keys(window.ALL));
for (const name of names) {
  if (only.length && !only.includes(name)) continue;
  const t = Date.now();
  const dataUrl = await page.evaluate((n) => window.paint(window.ALL[n]).toDataURL('image/png'), name);
  const buf = Buffer.from(dataUrl.split(',')[1], 'base64');
  const file = path.join(outDir, `${name}.jpg`);
  await sharp(buf).jpeg({ quality: 88, mozjpeg: true, chromaSubsampling: '4:4:4' }).toFile(file);
  console.log(`${name} → ${path.relative(root, file)} (${Date.now() - t} ms)`);
}
await browser.close();
