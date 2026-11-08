import { atom } from 'nanostores';
import type { ProductView } from '../lib/types';

export type Panel = 'cart' | 'search' | 'menu' | null;

export const panel = atom<Panel>(null);
export const quickView = atom<ProductView | null>(null);

export interface Toast {
  id: number;
  text: string;
  href?: string;
  action?: string;
}

export const toasts = atom<Toast[]>([]);
let seq = 0;

export function toast(text: string, opts: { href?: string; action?: string; ms?: number } = {}) {
  const t: Toast = { id: ++seq, text, href: opts.href, action: opts.action };
  toasts.set([...toasts.get().slice(-2), t]);
  setTimeout(() => toasts.set(toasts.get().filter((x) => x.id !== t.id)), opts.ms ?? 3200);
}

export const openPanel = (p: Panel) => panel.set(p);
export const closePanel = () => panel.set(null);
