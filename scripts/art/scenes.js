/* Scene definitions for VEYRA's art direction.
 * Every number is a fraction of the canvas so compositions stay
 * consistent at any render size. */

const S = (w, h, fn) => fn(w, h);

function plinthShadow(p, len, drop, H) {
  return {
    type: 'poly',
    blur: 46,
    alpha: 0.55,
    pts: [
      [p.x + p.w - 2, p.top + 2],
      [p.x + p.w + len, p.top + drop],
      [p.x + p.w + len, H],
      [p.x + p.w - 2, H],
    ],
  };
}

export const scenes = {
  // ------------------------------------------------------------ HERO (desktop)
  'hero-desktop': S(2880, 1800, (W, H) => {
    const plinth = {
      x: Math.round(W * 0.585), w: Math.round(W * 0.3), top: Math.round(H * 0.655), topH: Math.round(H * 0.024),
      stone: { shadow: '#b3a38c', lit: '#dccdb6', top: '#efe5d5' },
      windowShift: [-W * 0.035, H * 0.06],
    };
    const r = W * 0.074;
    const sph = { type: 'sphere', cx: W * 0.69, cy: plinth.top + plinth.topH * 0.55 - r, r, palette: 'ink', light: [-0.5, -0.55] };
    return {
      w: W, h: H, seed: 11,
      wall: { shadow: '#cdbfab', lit: '#f6efe3' },
      ambient: { from: [0.0, 0.0], to: [1, 1], a0: 0.5, a1: 0.12 },
      windows: [
        { type: 'grid', quad: [[W * 0.47, -H * 0.08], [W * 1.04, H * 0.06], [W * 0.95, H * 0.84], [W * 0.38, H * 0.68]], cols: 3, rows: 2, mullion: 0.022, blur: 16, strength: 0.6 },
        { type: 'grid', quad: [[W * 0.47, -H * 0.08], [W * 1.04, H * 0.06], [W * 0.95, H * 0.84], [W * 0.38, H * 0.68]], cols: 1, rows: 1, mullion: 0, blur: 160, strength: 0.16 },
      ],
      plinths: [plinth],
      shadows: [
        plinthShadow(plinth, W * 0.075, H * 0.035, H),
        { type: 'ellipse', cx: sph.cx + W * 0.085, cy: sph.cy + H * 0.02, rx: r * 1.08, ry: r * 0.98, blur: 48, alpha: 0.5 },
        { type: 'poly', blur: 22, alpha: 0.45, pts: [[W * 0.787, plinth.top - H * 0.105], [W * 0.84, plinth.top - H * 0.09], [W * 0.84, plinth.top], [W * 0.787, plinth.top]] },
      ],
      objects: [
        sph,
        { type: 'cylinder', x: W * 0.772, w: W * 0.026, bottom: plinth.top + plinth.topH * 0.5, h: H * 0.108, palette: 'brass', ellipse: 0.2 },
      ],
      haze: { from: [0.75, 0], to: [0.35, 0.85], a: 0.06 },
      overlayLight: 0.32,
      vignette: 0.16,
      grain: 7,
    };
  }),

  // ------------------------------------------------------------ HERO (mobile) — recomposed, arched light
  'hero-mobile': S(1290, 2580, (W, H) => {
    const plinth = {
      x: Math.round(W * 0.14), w: Math.round(W * 0.72), top: Math.round(H * 0.825), topH: Math.round(H * 0.012),
      stone: { shadow: '#b3a38c', lit: '#dccdb6', top: '#efe5d5' },
      windowShift: [-W * 0.05, H * 0.03],
    };
    const r = W * 0.125;
    const sph = { type: 'sphere', cx: W * 0.44, cy: plinth.top + plinth.topH * 0.55 - r, r, palette: 'ink', light: [-0.55, -0.5] };
    return {
      w: W, h: H, seed: 23,
      wall: { shadow: '#cdbfab', lit: '#f6efe3' },
      ambient: { from: [0.1, 0.0], to: [0.9, 1], a0: 0.52, a1: 0.16 },
      windows: [
        { type: 'arch', x: W * 0.38, y: H * 0.43, w: W * 0.46, h: H * 0.42, shear: -0.2, bar: 0.035, transom: 0.6, blur: 12, strength: 0.62 },
        { type: 'arch', x: W * 0.38, y: H * 0.43, w: W * 0.46, h: H * 0.42, shear: -0.2, bar: 0, transom: 0.6, blur: 120, strength: 0.16 },
      ],
      plinths: [plinth],
      shadows: [
        plinthShadow(plinth, W * 0.09, H * 0.02, H),
        { type: 'ellipse', cx: sph.cx + W * 0.11, cy: sph.cy + H * 0.006, rx: r * 1.1, ry: r * 0.98, blur: 30, alpha: 0.5 },
        { type: 'poly', blur: 14, alpha: 0.42, pts: [[W * 0.69, plinth.top - H * 0.066], [W * 0.76, plinth.top - H * 0.058], [W * 0.76, plinth.top], [W * 0.69, plinth.top]] },
      ],
      objects: [
        sph,
        { type: 'cylinder', x: W * 0.655, w: W * 0.045, bottom: plinth.top + plinth.topH * 0.5, h: H * 0.066, palette: 'brass', ellipse: 0.2 },
      ],
      haze: { from: [0.8, 0.3], to: [0.3, 0.95], a: 0.06 },
      overlayLight: 0.3,
      vignette: 0.12,
      grain: 7,
    };
  }),

  // ------------------------------------------------------------ BRAND STORY (dark, cinematic)
  'story-dark': S(2000, 2500, (W, H) => {
    const plinth = {
      x: Math.round(W * 0.16), w: Math.round(W * 0.68), top: Math.round(H * 0.7), topH: Math.round(H * 0.016),
      stone: { shadow: '#1d1a16', lit: '#756754', top: '#9a8a73' },
      windowShift: [-W * 0.03, 0],
    };
    const r = W * 0.12;
    return {
      w: W, h: H, seed: 37,
      wall: { shadow: '#0f0e0c', lit: '#6a5d4d' },
      ambient: { from: [0.5, 0], to: [0.5, 1], a0: 0.05, a1: 0.0 },
      windows: [
        { type: 'grid', quad: [[W * 0.54, -H * 0.05], [W * 0.63, -H * 0.05], [W * 0.53, H * 1.02], [W * 0.42, H * 1.02]], cols: 1, rows: 1, mullion: 0, blur: 18, strength: 0.92 },
        { type: 'grid', quad: [[W * 0.5, -H * 0.05], [W * 0.68, -H * 0.05], [W * 0.58, H * 1.02], [W * 0.36, H * 1.02]], cols: 1, rows: 1, mullion: 0, blur: 220, strength: 0.2 },
      ],
      plinths: [plinth],
      shadows: [
        { type: 'ellipse', cx: W * 0.47, cy: plinth.top - r * 0.4, rx: r * 0.7, ry: r * 1.6, blur: 40, alpha: 0.7 },
      ],
      objects: [
        { type: 'sphere', cx: W * 0.5, cy: plinth.top + plinth.topH * 0.55 - r, r, palette: 'dusk', light: [0.05, -0.8] },
      ],
      overlayLight: 0.5,
      vignette: 0.42,
      grain: 9,
    };
  }),
};

// ------------------------------------------------------------ collection covers (4:5)
const coverPresets = {
  ivory: { wall: { shadow: '#d6cbba', lit: '#f6efe3' }, stone: { shadow: '#b8a891', lit: '#ddcfb9', top: '#efe6d7' } },
  stone: { wall: { shadow: '#b9aa94', lit: '#e6dac7' }, stone: { shadow: '#8f7f69', lit: '#c7b79f', top: '#e2d6c3' } },
  ink: { wall: { shadow: '#121110', lit: '#4d453b' }, stone: { shadow: '#0f0e0d', lit: '#5a4f42', top: '#7c6e5b' } },
};

function cover(seed, tone, compose) {
  const W = 1200, H = 1500;
  const t = coverPresets[tone];
  const plinth = {
    x: Math.round(W * 0.14), w: Math.round(W * 0.72), top: Math.round(H * 0.68), topH: Math.round(H * 0.018),
    stone: t.stone, windowShift: [-W * 0.04, H * 0.04],
  };
  const base = plinth.top + plinth.topH * 0.55;
  const { objects, shadows } = compose(W, H, base);
  return {
    w: W, h: H, seed,
    wall: t.wall,
    ambient: { from: [0, 0], to: [1, 1], a0: tone === 'ink' ? 0.08 : 0.44, a1: tone === 'ink' ? 0.0 : 0.14 },
    windows: [
      tone === 'ink'
        ? { type: 'grid', quad: [[W * 0.46, -H * 0.05], [W * 0.62, -H * 0.05], [W * 0.5, H * 1.02], [W * 0.3, H * 1.02]], cols: 1, rows: 1, mullion: 0, blur: 22, strength: 0.85 }
        : { type: 'grid', quad: [[W * 0.18, -H * 0.06], [W * 1.05, H * 0.05], [W * 0.92, H * 0.78], [W * 0.05, H * 0.62]], cols: 2, rows: 2, mullion: 0.025, blur: 14, strength: 0.55 },
    ],
    plinths: [plinth],
    shadows: [
      { type: 'poly', blur: 36, alpha: 0.5, pts: [[plinth.x + plinth.w, plinth.top], [plinth.x + plinth.w + W * 0.07, plinth.top + H * 0.03], [plinth.x + plinth.w + W * 0.07, H], [plinth.x + plinth.w, H]] },
      ...shadows,
    ],
    objects,
    overlayLight: tone === 'ink' ? 0.5 : 0.3,
    vignette: tone === 'ink' ? 0.4 : 0.15,
    grain: 8,
  };
}

export const covers = {
  // tall cylinder + small sphere — personal care, rituals
  'cover-ritual': cover(101, 'ivory', (W, H, b) => {
    const r = W * 0.075;
    return {
      objects: [
        { type: 'cylinder', x: W * 0.36, w: W * 0.14, bottom: b, h: H * 0.3, palette: 'stone', ellipse: 0.18 },
        { type: 'sphere', cx: W * 0.6, cy: b - r, r, palette: 'ink' },
      ],
      shadows: [
        { type: 'poly', blur: 26, alpha: 0.45, pts: [[W * 0.5, b - H * 0.3], [W * 0.6, b - H * 0.27], [W * 0.6, b], [W * 0.5, b]] },
        { type: 'ellipse', cx: W * 0.68, cy: b - r, rx: r * 1.05, ry: r, blur: 26, alpha: 0.45 },
      ],
    };
  }),
  // slab + sphere on dark — technology, sound
  'cover-signal': cover(202, 'ink', (W, H, b) => {
    const r = W * 0.1;
    return {
      objects: [
        { type: 'slab', x: W * 0.28, w: W * 0.44, bottom: b, h: H * 0.06, palette: 'stone' },
        { type: 'sphere', cx: W * 0.5, cy: b - H * 0.06 - r, r, palette: 'stone', light: [0.0, -0.75] },
      ],
      shadows: [],
    };
  }),
  // arch + brass — home living
  'cover-dwell': cover(303, 'stone', (W, H, b) => ({
    objects: [
      { type: 'arch', x: W * 0.3, w: W * 0.26, bottom: b, h: H * 0.3, palette: 'stone', t: 0.3 },
      { type: 'cylinder', x: W * 0.62, w: W * 0.05, bottom: b, h: H * 0.12, palette: 'brass', ellipse: 0.2 },
    ],
    shadows: [
      { type: 'poly', blur: 24, alpha: 0.4, pts: [[W * 0.56, b - H * 0.3], [W * 0.66, b - H * 0.27], [W * 0.66, b], [W * 0.56, b]] },
    ],
  })),
  // stacked slabs + ink sphere — accessories, everyday objects
  'cover-carry': cover(404, 'ivory', (W, H, b) => {
    const r = W * 0.06;
    return {
      objects: [
        { type: 'slab', x: W * 0.3, w: W * 0.4, bottom: b, h: H * 0.05, palette: 'stone' },
        { type: 'slab', x: W * 0.36, w: W * 0.28, bottom: b - H * 0.05, h: H * 0.045, palette: 'ink' },
        { type: 'sphere', cx: W * 0.5, cy: b - H * 0.095 - r, r, palette: 'ink' },
      ],
      shadows: [
        { type: 'ellipse', cx: W * 0.58, cy: b - H * 0.1 - r, rx: r * 1.1, ry: r, blur: 22, alpha: 0.4 },
      ],
    };
  }),
  // large stone sphere on a low slab — personal care, calm
  'cover-glow': cover(606, 'stone', (W, H, b) => {
    const r = W * 0.13;
    return {
      objects: [
        { type: 'slab', x: W * 0.26, w: W * 0.48, bottom: b, h: H * 0.035, palette: 'stone' },
        { type: 'sphere', cx: W * 0.5, cy: b - H * 0.035 - r, r, palette: 'stone', light: [-0.5, -0.55] },
      ],
      shadows: [
        { type: 'ellipse', cx: W * 0.6, cy: b - H * 0.035 - r * 0.9, rx: r * 1.05, ry: r, blur: 30, alpha: 0.45 },
      ],
    };
  }),
  // lit arch + ink sphere on dark — electronics, play
  'cover-orbit': cover(707, 'ink', (W, H, b) => {
    const r = W * 0.055;
    return {
      objects: [
        { type: 'arch', x: W * 0.36, w: W * 0.28, bottom: b, h: H * 0.32, palette: 'lit', t: 0.24 },
        { type: 'sphere', cx: W * 0.5, cy: b - r, r, palette: 'dusk', light: [0, -0.8] },
      ],
      shadows: [],
    };
  }),
  // ink cylinder + stone sphere — fragrance, evening
  'cover-nocturne': cover(505, 'stone', (W, H, b) => {
    const r = W * 0.085;
    return {
      objects: [
        { type: 'cylinder', x: W * 0.55, w: W * 0.12, bottom: b, h: H * 0.22, palette: 'ink', ellipse: 0.18 },
        { type: 'sphere', cx: W * 0.42, cy: b - r, r, palette: 'stone' },
      ],
      shadows: [
        { type: 'poly', blur: 24, alpha: 0.45, pts: [[W * 0.67, b - H * 0.22], [W * 0.76, b - H * 0.2], [W * 0.76, b], [W * 0.67, b]] },
      ],
    };
  }),
};
