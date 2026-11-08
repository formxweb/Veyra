/**
 * Build-time catalog access. Reads src/data/products.json (the live,
 * owner-sourced catalog) and resolves optimised image URLs.
 */
import { getImage } from 'astro:assets';
import type { ImageMetadata } from 'astro';
import raw from './products.json';
import { collectionById, collections } from './collections';
import { fold } from '../lib/format';
import type { ImageView, ProductDetailView, ProductView } from '../lib/types';

export interface ProductRecord {
  id: string;
  slug: string;
  name: string;
  brand: string | null;
  category: string;
  price: number | null;
  condition: string | null;
  availability: 'listed' | 'in_stock' | 'sold_out' | 'on_request';
  description: string | null;
  features: string[];
  images: { file: string; alt: string; quality?: string }[];
  featured: number | null;
  hidden: boolean;
  source: Record<string, unknown>;
  review: string[];
  reviewNote: string | null;
}

const all = (raw as unknown as { products: ProductRecord[] }).products;

export const products: ProductRecord[] = all.filter((p) => !p.hidden && collectionById.has(p.category));

const imageModules = import.meta.glob<{ default: ImageMetadata }>('/src/assets/products/*.{jpg,jpeg,png,webp,avif}', {
  eager: true,
});

function meta(file: string): ImageMetadata | undefined {
  return imageModules[`/src/assets/products/${file}`]?.default;
}

const CARD_WIDTHS = [240, 360, 480, 720];
const GALLERY_WIDTHS = [480, 720, 960, 1280, 1600];

async function resolve(file: string, alt: string, widths: number[]): Promise<ImageView | null> {
  const m = meta(file);
  if (!m) return null;
  const usable = widths.filter((w) => w <= m.width);
  const ws = usable.length ? usable : [m.width];
  const img = await getImage({ src: m, widths: ws, format: 'webp', quality: 84 });
  return {
    src: img.src,
    srcset: img.srcSet.attribute || undefined,
    width: m.width,
    height: m.height,
    alt,
  };
}

const cardCache = new Map<string, Promise<ProductView>>();

export function toView(p: ProductRecord): Promise<ProductView> {
  let v = cardCache.get(p.id);
  if (!v) {
    v = (async () => {
      const c = collectionById.get(p.category)!;
      const first = p.images[0];
      return {
        id: p.id,
        slug: p.slug,
        href: `/urun/${p.slug}`,
        name: p.name,
        brand: p.brand,
        category: p.category,
        categoryLabel: c.label,
        collectionHref: `/koleksiyon/${c.slug}`,
        price: p.price,
        condition: p.condition,
        available: p.availability !== 'sold_out',
        image: first ? await resolve(first.file, first.alt, CARD_WIDTHS) : null,
        search: fold([p.name, p.brand ?? '', c.title, c.label, p.id].join(' ')),
        featured: p.featured,
      } satisfies ProductView;
    })();
    cardCache.set(p.id, v);
  }
  return v;
}

export async function toDetail(p: ProductRecord): Promise<ProductDetailView> {
  const base = await toView(p);
  const gallery = (await Promise.all(p.images.map((i) => resolve(i.file, i.alt, GALLERY_WIDTHS)))).filter(
    (x): x is ImageView => !!x,
  );
  return { ...base, gallery, description: p.description, features: p.features };
}

export const views = (list: ProductRecord[]) => Promise.all(list.map(toView));

export function bySlug(slug: string) {
  return products.find((p) => p.slug === slug);
}

export function inCategory(id: string) {
  return products.filter((p) => p.category === id);
}

export function featured(limit = 8) {
  return products
    .filter((p) => p.featured != null)
    .sort((a, b) => (a.featured ?? 99) - (b.featured ?? 99))
    .slice(0, limit);
}

/** Same collection first, then same brand, then nearest price. */
export function similar(p: ProductRecord, limit = 8) {
  const score = (q: ProductRecord) =>
    (q.category === p.category ? 0 : 1000) +
    (q.brand && q.brand === p.brand ? 0 : 100) +
    Math.min(99, Math.abs((q.price ?? 0) - (p.price ?? 0)) / 250);
  return products
    .filter((q) => q.id !== p.id)
    .sort((a, b) => score(a) - score(b))
    .slice(0, limit);
}

export function collectionStats() {
  return collections
    .map((c) => {
      const items = inCategory(c.id);
      const prices = items.map((i) => i.price).filter((x): x is number => x != null);
      return {
        ...c,
        count: items.length,
        from: prices.length ? Math.min(...prices) : null,
        brands: [...new Set(items.map((i) => i.brand).filter(Boolean))] as string[],
      };
    })
    .filter((c) => c.count > 0);
}

export function brandsWithCounts() {
  const m = new Map<string, number>();
  for (const p of products) if (p.brand) m.set(p.brand, (m.get(p.brand) ?? 0) + 1);
  return [...m.entries()].sort((a, b) => b[1] - a[1]).map(([name, count]) => ({ name, count }));
}

export const catalogMeta = {
  total: products.length,
  collections: collectionStats().length,
};
