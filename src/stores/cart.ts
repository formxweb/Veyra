import { computed } from 'nanostores';
import { persistentAtom } from './persist';
import type { ProductView } from '../lib/types';

export const MAX_QTY = 10;

export interface CartLine {
  id: string;
  qty: number;
  /** Snapshot taken when added; refreshed against the live catalog on the cart page. */
  snap: {
    name: string;
    slug: string;
    href: string;
    price: number | null;
    brand: string | null;
    image: { src: string; srcset?: string; width: number; height: number } | null;
  };
}

function sanitize(v: unknown): CartLine[] {
  if (!Array.isArray(v)) return [];
  return v
    .filter((l): l is CartLine => !!l && typeof l === 'object' && typeof (l as CartLine).id === 'string' && !!(l as CartLine).snap)
    .map((l) => ({ ...l, qty: clampQty(Number(l.qty) || 1) }));
}

export const clampQty = (n: number) => Math.max(1, Math.min(MAX_QTY, Math.round(n)));

export const cart = persistentAtom<CartLine[]>('veyra:cart:v1', [], sanitize);

export const cartCount = computed(cart, (lines) => lines.reduce((s, l) => s + l.qty, 0));

export const cartTotals = computed(cart, (lines) => {
  let subtotal = 0;
  let unpriced = 0;
  for (const l of lines) {
    if (l.snap.price == null) unpriced += 1;
    else subtotal += l.snap.price * l.qty;
  }
  return { subtotal, unpriced, count: lines.reduce((s, l) => s + l.qty, 0) };
});

export function snapshot(p: ProductView): CartLine['snap'] {
  return {
    name: p.name,
    slug: p.slug,
    href: p.href,
    price: p.price,
    brand: p.brand,
    image: p.image ? { src: p.image.src, srcset: p.image.srcset, width: p.image.width, height: p.image.height } : null,
  };
}

/** Returns the resulting quantity for that product. */
export function addToCart(p: ProductView, qty = 1): number {
  const lines = cart.get();
  const i = lines.findIndex((l) => l.id === p.id);
  if (i === -1) {
    const q = clampQty(qty);
    cart.set([...lines, { id: p.id, qty: q, snap: snapshot(p) }]);
    return q;
  }
  const next = [...lines];
  const q = clampQty(next[i].qty + qty);
  next[i] = { ...next[i], qty: q, snap: snapshot(p) };
  cart.set(next);
  return q;
}

export function setQty(id: string, qty: number) {
  cart.set(cart.get().map((l) => (l.id === id ? { ...l, qty: clampQty(qty) } : l)));
}

export function removeLine(id: string) {
  cart.set(cart.get().filter((l) => l.id !== id));
}

export function clearCart() {
  cart.set([]);
}

/** Refresh snapshots from the live catalog; drop items that no longer exist. */
export function reconcile(live: Map<string, ProductView>) {
  const lines = cart.get();
  const next = lines.filter((l) => live.has(l.id)).map((l) => ({ ...l, snap: snapshot(live.get(l.id)!) }));
  if (JSON.stringify(next) !== JSON.stringify(lines)) cart.set(next);
  return lines.length - next.length;
}
