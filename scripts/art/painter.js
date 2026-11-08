/* VEYRA — procedural still-life painter.
 * Runs inside Chromium (via scripts/render-art.mjs). Produces original
 * atmospheric imagery: window light on plaster, travertine plinths,
 * matte ceramic objects and a restrained champagne-brass accent.
 */

// ---------- deterministic noise ----------
function hash2(ix, iy, seed) {
  let h = (ix * 374761393 + iy * 668265263 + seed * 982451653) | 0;
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  h = h ^ (h >>> 16);
  return (h >>> 0) / 4294967295;
}
function vnoise(x, y, seed) {
  const ix = Math.floor(x), iy = Math.floor(y);
  const fx = x - ix, fy = y - iy;
  const u = fx * fx * (3 - 2 * fx), v = fy * fy * (3 - 2 * fy);
  const a = hash2(ix, iy, seed), b = hash2(ix + 1, iy, seed);
  const c = hash2(ix, iy + 1, seed), d = hash2(ix + 1, iy + 1, seed);
  return a + (b - a) * u + (c - a) * v + (a - b - c + d) * u * v;
}
function fbm(x, y, seed, oct = 5) {
  let s = 0, amp = 0.5, f = 1, n = 0;
  for (let i = 0; i < oct; i++) {
    s += amp * vnoise(x * f, y * f, seed + i * 17);
    n += amp; amp *= 0.5; f *= 2.03;
  }
  return s / n;
}
function rng(seed) {
  let a = seed >>> 0;
  return () => {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const hex = (h) => {
  const n = parseInt(h.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
};
const lerp = (a, b, t) => a + (b - a) * t;
const clamp = (v, a = 0, b = 255) => (v < a ? a : v > b ? b : v);

function canvas(w, h) {
  const c = document.createElement('canvas');
  c.width = w; c.height = h;
  return c;
}

// ---------- light mask ----------
function bilerp(q, u, v) {
  // q: [tl, tr, br, bl]
  const top = [lerp(q[0][0], q[1][0], u), lerp(q[0][1], q[1][1], u)];
  const bot = [lerp(q[3][0], q[2][0], u), lerp(q[3][1], q[2][1], u)];
  return [lerp(top[0], bot[0], v), lerp(top[1], bot[1], v)];
}

function drawGridWindow(ctx, win) {
  const { quad, cols, rows, mullion } = win;
  ctx.fillStyle = '#fff';
  for (let i = 0; i < cols; i++) {
    for (let j = 0; j < rows; j++) {
      const u0 = i / cols + mullion, u1 = (i + 1) / cols - mullion;
      const v0 = j / rows + mullion, v1 = (j + 1) / rows - mullion;
      const p = [bilerp(quad, u0, v0), bilerp(quad, u1, v0), bilerp(quad, u1, v1), bilerp(quad, u0, v1)];
      ctx.beginPath();
      ctx.moveTo(p[0][0], p[0][1]);
      for (let k = 1; k < 4; k++) ctx.lineTo(p[k][0], p[k][1]);
      ctx.closePath();
      ctx.fill();
    }
  }
}

function drawArchWindow(ctx, win) {
  const { x, y, w, h, shear = 0, bar = 0.04, transom = 0.62 } = win;
  ctx.save();
  ctx.translate(x, y);
  ctx.transform(1, 0, shear, 1, 0, 0);
  const r = w / 2;
  ctx.fillStyle = '#fff';
  ctx.beginPath();
  ctx.moveTo(0, h);
  ctx.lineTo(0, r);
  ctx.arc(r, r, r, Math.PI, 0);
  ctx.lineTo(w, h);
  ctx.closePath();
  ctx.fill();
  // mullion + transom
  ctx.fillStyle = '#000';
  const b = w * bar;
  ctx.fillRect(r - b / 2, 0, b, h);
  ctx.fillRect(0, h * transom - b / 2, w, b);
  ctx.restore();
}

function lightMask(scene) {
  const { w, h } = scene;
  const sharp = canvas(w, h);
  const s = sharp.getContext('2d');
  s.fillStyle = '#000';
  s.fillRect(0, 0, w, h);

  const out = canvas(w, h);
  const o = out.getContext('2d');
  // ambient fill (soft directional falloff)
  const a = scene.ambient;
  const g = o.createLinearGradient(a.from[0] * w, a.from[1] * h, a.to[0] * w, a.to[1] * h);
  g.addColorStop(0, `rgba(255,255,255,${a.a0})`);
  g.addColorStop(1, `rgba(255,255,255,${a.a1})`);
  o.fillStyle = '#000';
  o.fillRect(0, 0, w, h);
  o.fillStyle = g;
  o.fillRect(0, 0, w, h);

  for (const win of scene.windows) {
    s.fillStyle = '#000';
    s.fillRect(0, 0, w, h);
    const draw = (ctx) => (win.type === 'arch' ? drawArchWindow(ctx, win) : drawGridWindow(ctx, win));
    draw(s);
    // the same light continues on plinth faces, displaced (different plane)
    for (const p of scene.plinths || []) {
      if (!p.windowShift) continue;
      s.save();
      s.beginPath();
      s.rect(p.x * 1, p.top, p.w, h - p.top);
      s.clip();
      s.fillStyle = '#000';
      s.fillRect(p.x, p.top, p.w, h - p.top);
      s.translate(p.windowShift[0], p.windowShift[1]);
      draw(s);
      s.restore();
    }
    o.save();
    o.globalCompositeOperation = 'lighter';
    o.globalAlpha = win.strength;
    o.filter = `blur(${win.blur}px)`;
    o.drawImage(sharp, 0, 0);
    o.restore();
  }

  // cast shadows subtract light
  for (const sh of scene.shadows || []) {
    o.save();
    o.filter = `blur(${sh.blur}px)`;
    o.fillStyle = `rgba(0,0,0,${sh.alpha})`;
    o.beginPath();
    if (sh.type === 'ellipse') {
      o.ellipse(sh.cx, sh.cy, sh.rx, sh.ry, sh.rot || 0, 0, Math.PI * 2);
    } else {
      o.moveTo(sh.pts[0][0], sh.pts[0][1]);
      for (let k = 1; k < sh.pts.length; k++) o.lineTo(sh.pts[k][0], sh.pts[k][1]);
      o.closePath();
    }
    o.fill();
    o.restore();
  }
  return o.getImageData(0, 0, w, h).data;
}

// ---------- materials ----------
function plaster(x, y, seed) {
  const big = fbm(x / 340, y / 340, seed, 4) - 0.5;
  const trowel = fbm((x + y * 0.35) / 90, (y - x * 0.2) / 26, seed + 5, 4) - 0.5;
  const fine = vnoise(x / 2.2, y / 2.2, seed + 9) - 0.5;
  return 1 + big * 0.07 + trowel * 0.035 + fine * 0.02;
}
function travertine(x, y, seed) {
  const band = fbm(x / 420, y / 9, seed + 31, 5) - 0.5;
  const drift = fbm(x / 160, y / 60, seed + 41, 3) - 0.5;
  const pitN = fbm(x / 7, y / 3.2, seed + 51, 3);
  const pit = pitN > 0.72 ? (pitN - 0.72) * 2.2 : 0;
  const fine = vnoise(x / 1.8, y / 1.8, seed + 61) - 0.5;
  return 1 + band * 0.11 + drift * 0.05 - pit * 0.5 + fine * 0.025;
}

function shadeScene(scene, mask) {
  const { w, h, seed } = scene;
  const c = canvas(w, h);
  const ctx = c.getContext('2d');
  const img = ctx.createImageData(w, h);
  const d = img.data;
  const wallS = hex(scene.wall.shadow), wallL = hex(scene.wall.lit);
  const plinths = (scene.plinths || []).map((p) => ({
    ...p,
    S: hex(p.stone.shadow), L: hex(p.stone.lit), T: hex(p.stone.top),
  }));
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const i = (y * w + x) * 4;
      const m = mask[i] / 255;
      let S = wallS, L = wallL, tex;
      let mat = 0;
      for (const p of plinths) {
        if (x >= p.x && x < p.x + p.w && y >= p.top) {
          mat = y < p.top + p.topH ? 2 : 1;
          if (mat === 2) { S = p.L; L = p.T; } else { S = p.S; L = p.L; }
          tex = travertine(x, y, seed + 100);
          if (mat === 1) {
            // front face: slightly darker toward the bottom (bounce falloff)
            const t = (y - p.top) / (h - p.top);
            tex *= 1 - t * 0.08;
            // edge highlight just under the top face
            const e = y - (p.top + p.topH);
            if (e >= 0 && e < 6) tex *= 0.9 + e * 0.017;
          }
          break;
        }
      }
      if (mat === 0) tex = plaster(x, y, seed);
      const mm = Math.pow(m, 0.92);
      d[i] = clamp(lerp(S[0], L[0], mm) * tex);
      d[i + 1] = clamp(lerp(S[1], L[1], mm) * tex);
      d[i + 2] = clamp(lerp(S[2], L[2], mm) * tex);
      d[i + 3] = 255;
    }
  }
  ctx.putImageData(img, 0, 0);
  return c;
}

// ---------- objects ----------
function sphere(ctx, o, scene) {
  const { cx, cy, r } = o;
  const pal = o.palette === 'stone'
    ? { core: '#8f8170', mid: '#b9ab96', hi: '#e8dccb', bounce: 'rgba(240,226,204,0.35)' }
    : o.palette === 'dusk'
      ? { core: '#090807', mid: '#221e19', hi: '#9a8a72', bounce: 'rgba(160,140,110,0.12)' }
      : { core: '#0c0b0a', mid: '#1f1c19', hi: '#5b544a', bounce: 'rgba(214,196,168,0.22)' };
  // contact shadow
  ctx.save();
  ctx.filter = `blur(${r * 0.08}px)`;
  ctx.fillStyle = 'rgba(20,16,12,0.55)';
  ctx.beginPath();
  ctx.ellipse(cx + r * 0.08, cy + r * 0.97, r * 0.72, r * 0.09, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
  ctx.save();
  ctx.filter = `blur(${r * 0.25}px)`;
  ctx.fillStyle = 'rgba(30,22,14,0.22)';
  ctx.beginPath();
  ctx.ellipse(cx + r * 0.35, cy + r * 0.98, r * 1.25, r * 0.16, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  const lx = o.light ? o.light[0] : -0.45, ly = o.light ? o.light[1] : -0.5;
  const g = ctx.createRadialGradient(cx + lx * r * 0.85, cy + ly * r * 0.85, r * 0.05, cx, cy, r * 1.08);
  g.addColorStop(0, pal.hi);
  g.addColorStop(0.42, pal.mid);
  g.addColorStop(0.85, pal.core);
  g.addColorStop(1, pal.core);
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.fill();
  // bounce light from the stone below / opposite side
  ctx.save();
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.clip();
  const b = ctx.createRadialGradient(cx - lx * r * 1.1, cy - ly * r * 1.1, r * 0.1, cx - lx * r * 0.8, cy - ly * r * 0.8, r * 0.95);
  b.addColorStop(0, pal.bounce);
  b.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = b;
  ctx.fillRect(cx - r, cy - r, r * 2, r * 2);
  // soft specular
  ctx.filter = `blur(${r * 0.06}px)`;
  const sp = ctx.createRadialGradient(cx + lx * r * 0.55, cy + ly * r * 0.6, 0, cx + lx * r * 0.55, cy + ly * r * 0.6, r * 0.2);
  sp.addColorStop(0, o.palette === 'stone' ? 'rgba(255,250,240,0.35)' : 'rgba(255,244,226,0.28)');
  sp.addColorStop(1, 'rgba(255,244,226,0)');
  ctx.fillStyle = sp;
  ctx.fillRect(cx - r, cy - r, r * 2, r * 2);
  ctx.restore();
  // micro texture (matte ceramic)
  grainRegion(ctx, cx - r, cy - r, r * 2, r * 2, 7, scene.seed + 3, (x, y) => (x - cx) ** 2 + (y - cy) ** 2 < r * r);
}

function cylinder(ctx, o, scene) {
  const { x, bottom, w, h } = o;
  const top = bottom - h;
  const ry = w * (o.ellipse || 0.16);
  const brass = o.palette === 'brass';
  const stops = brass
    ? [[0, '#5d4a2f'], [0.18, '#9c845b'], [0.36, '#e8d6ad'], [0.48, '#c9b183'], [0.72, '#8c7450'], [1, '#4a3a24']]
    : o.palette === 'ink'
      ? [[0, '#0d0c0b'], [0.25, '#2a2622'], [0.4, '#4c463e'], [0.6, '#1d1a17'], [1, '#0a0908']]
      : [[0, '#a8977f'], [0.3, '#ddd0bc'], [0.45, '#efe5d5'], [0.7, '#c5b59d'], [1, '#8a7a65']];
  // contact + cast shadow
  ctx.save();
  ctx.filter = `blur(${w * 0.08}px)`;
  ctx.fillStyle = 'rgba(20,16,12,0.5)';
  ctx.beginPath();
  ctx.ellipse(x + w / 2 + w * 0.06, bottom, w * 0.56, ry * 0.9, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
  const g = ctx.createLinearGradient(x, 0, x + w, 0);
  for (const [p, c] of stops) g.addColorStop(p, c);
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.moveTo(x, top);
  ctx.lineTo(x, bottom);
  ctx.ellipse(x + w / 2, bottom, w / 2, ry, 0, Math.PI, 0, true);
  ctx.lineTo(x + w, top);
  ctx.closePath();
  ctx.fill();
  // top face
  const tg = ctx.createLinearGradient(x, top - ry, x + w, top + ry);
  if (brass) { tg.addColorStop(0, '#f1e3c0'); tg.addColorStop(1, '#a88f63'); }
  else if (o.palette === 'ink') { tg.addColorStop(0, '#3b3631'); tg.addColorStop(1, '#151311'); }
  else { tg.addColorStop(0, '#f6eee2'); tg.addColorStop(1, '#cfc1ab'); }
  ctx.fillStyle = tg;
  ctx.beginPath();
  ctx.ellipse(x + w / 2, top, w / 2, ry, 0, 0, Math.PI * 2);
  ctx.fill();
  if (brass) {
    // fine brushed lines
    ctx.save();
    ctx.globalAlpha = 0.08;
    ctx.strokeStyle = '#fff';
    for (let yy = top + ry; yy < bottom; yy += 3) {
      ctx.beginPath(); ctx.moveTo(x + 2, yy); ctx.lineTo(x + w - 2, yy); ctx.stroke();
    }
    ctx.restore();
  }
}

function slab(ctx, o) {
  // low rectangular stone/ink slab seen frontally, with a thin top face
  const { x, bottom, w, h, topH = h * 0.18 } = o;
  const top = bottom - h;
  const pal = o.palette === 'ink'
    ? { front: ['#1b1917', '#0d0c0b'], top: ['#3a3530', '#25221e'] }
    : { front: ['#cdbfa9', '#a7967f'], top: ['#efe6d8', '#ddd1bf'] };
  ctx.save();
  ctx.filter = `blur(${w * 0.03}px)`;
  ctx.fillStyle = 'rgba(20,16,12,0.45)';
  ctx.fillRect(x + w * 0.02, bottom - 4, w * 1.0, 10);
  ctx.restore();
  let g = ctx.createLinearGradient(0, top + topH, 0, bottom);
  g.addColorStop(0, pal.front[0]); g.addColorStop(1, pal.front[1]);
  ctx.fillStyle = g;
  ctx.fillRect(x, top + topH, w, h - topH);
  g = ctx.createLinearGradient(x, 0, x + w, 0);
  g.addColorStop(0, pal.top[0]); g.addColorStop(1, pal.top[1]);
  ctx.fillStyle = g;
  ctx.fillRect(x, top, w, topH);
}

function arch(ctx, o) {
  // freestanding arch sculpture (stone)
  const { x, bottom, w, h, t = 0.28 } = o;
  const r = w / 2;
  const top = bottom - h;
  const pal = o.palette === 'ink' ? ['#2c2824', '#0e0d0c'] : o.palette === 'lit' ? ['#efe4d2', '#8a7862'] : ['#d6c8b3', '#857360'];
  const g = ctx.createLinearGradient(x, top, x + w, bottom);
  g.addColorStop(0, pal[0]); g.addColorStop(1, pal[1]);
  ctx.save();
  ctx.filter = `blur(${w * 0.04}px)`;
  ctx.fillStyle = 'rgba(20,16,12,0.4)';
  ctx.fillRect(x - w * 0.02, bottom - 6, w * 1.08, 12);
  ctx.restore();
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.moveTo(x, bottom);
  ctx.lineTo(x, top + r);
  ctx.arc(x + r, top + r, r, Math.PI, 0);
  ctx.lineTo(x + w, bottom);
  const ir = r * (1 - t);
  ctx.lineTo(x + w - r * t, bottom);
  ctx.lineTo(x + w - r * t, top + r);
  ctx.arc(x + r, top + r, ir, 0, Math.PI, true);
  ctx.lineTo(x + r * t, bottom);
  ctx.closePath();
  ctx.fill();
}

function grainRegion(ctx, x0, y0, w, h, amp, seed, inside) {
  x0 = Math.max(0, Math.floor(x0)); y0 = Math.max(0, Math.floor(y0));
  w = Math.ceil(w); h = Math.ceil(h);
  const img = ctx.getImageData(x0, y0, w, h);
  const d = img.data;
  const r = rng(seed);
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    if (inside && !inside(x0 + x, y0 + y)) continue;
    const i = (y * w + x) * 4;
    const n = (r() - 0.5) * amp;
    d[i] = clamp(d[i] + n); d[i + 1] = clamp(d[i + 1] + n); d[i + 2] = clamp(d[i + 2] + n);
  }
  ctx.putImageData(img, x0, y0);
}

function finish(ctx, scene) {
  const { w, h } = scene;
  // vignette
  const v = ctx.createRadialGradient(w * 0.5, h * 0.48, Math.min(w, h) * 0.35, w * 0.5, h * 0.5, Math.max(w, h) * 0.78);
  v.addColorStop(0, 'rgba(0,0,0,0)');
  v.addColorStop(1, `rgba(24,18,12,${scene.vignette ?? 0.14})`);
  ctx.fillStyle = v;
  ctx.fillRect(0, 0, w, h);
  // warm atmospheric haze in the light
  if (scene.haze) {
    const hz = ctx.createLinearGradient(scene.haze.from[0] * w, scene.haze.from[1] * h, scene.haze.to[0] * w, scene.haze.to[1] * h);
    hz.addColorStop(0, `rgba(255,240,214,${scene.haze.a})`);
    hz.addColorStop(1, 'rgba(255,240,214,0)');
    ctx.fillStyle = hz;
    ctx.fillRect(0, 0, w, h);
  }
  grainRegion(ctx, 0, 0, w, h, scene.grain ?? 7, scene.seed + 77);
}

export function paint(scene) {
  const mask = lightMask(scene);
  const base = shadeScene(scene, mask);
  const ctx = base.getContext('2d');
  for (const o of scene.objects || []) {
    if (o.type === 'sphere') sphere(ctx, o, scene);
    else if (o.type === 'cylinder') cylinder(ctx, o, scene);
    else if (o.type === 'slab') slab(ctx, o, scene);
    else if (o.type === 'arch') arch(ctx, o, scene);
  }
  // light also falls over objects: overlay the window mask softly
  if (scene.overlayLight) {
    const m = canvas(scene.w, scene.h);
    const mc = m.getContext('2d');
    const id = mc.createImageData(scene.w, scene.h);
    for (let i = 0; i < mask.length; i += 4) {
      id.data[i] = 255; id.data[i + 1] = 236; id.data[i + 2] = 205;
      id.data[i + 3] = mask[i] * scene.overlayLight;
    }
    mc.putImageData(id, 0, 0);
    ctx.save();
    ctx.globalCompositeOperation = 'soft-light';
    ctx.drawImage(m, 0, 0);
    ctx.restore();
  }
  finish(ctx, scene);
  return base;
}
