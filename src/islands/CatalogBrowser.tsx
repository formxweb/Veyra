import { useEffect, useMemo, useRef, useState } from 'preact/hooks';
import type { ProductView } from '../lib/types';
import { fold, formatCount } from '../lib/format';
import { waLink } from '../lib/whatsapp';
import { ProductCard } from './ProductCard';
import { Icon } from './shared';

type Sort = 'onerilen' | 'fiyat-artan' | 'fiyat-azalan' | 'a-z';
const SORTS: { id: Sort; label: string }[] = [
  { id: 'onerilen', label: 'Önerilen' },
  { id: 'fiyat-artan', label: 'Fiyat: Düşükten yükseğe' },
  { id: 'fiyat-azalan', label: 'Fiyat: Yüksekten düşüğe' },
  { id: 'a-z', label: 'Ada göre (A–Z)' },
];

interface Category {
  id: string;
  label: string;
  count: number;
}

interface Props {
  items: ProductView[];
  categories: Category[];
  brands: { name: string; count: number }[];
  /** On collection pages the category is fixed and its chips are hidden. */
  lockedCategory?: string;
}

function readParams() {
  const u = new URL(window.location.href);
  return {
    q: u.searchParams.get('q') ?? '',
    cat: u.searchParams.get('kategori') ?? '',
    brand: u.searchParams.get('marka') ?? '',
    sort: (u.searchParams.get('sirala') as Sort) ?? 'onerilen',
  };
}

export default function CatalogBrowser({ items, categories, brands, lockedCategory }: Props) {
  const [q, setQ] = useState('');
  const [cat, setCat] = useState(lockedCategory ?? '');
  const [brand, setBrand] = useState('');
  const [sort, setSort] = useState<Sort>('onerilen');
  const ready = useRef(false);
  const [hydrated, setHydrated] = useState(false);

  // Initialise from the URL once (shareable, back-button friendly filters).
  useEffect(() => {
    const p = readParams();
    setQ(p.q);
    if (!lockedCategory && categories.some((c) => c.id === p.cat)) setCat(p.cat);
    if (brands.some((b) => b.name === p.brand)) setBrand(p.brand);
    if (SORTS.some((s) => s.id === p.sort)) setSort(p.sort);
    ready.current = true;
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!ready.current) return;
    const u = new URL(window.location.href);
    const set = (k: string, v: string, def = '') => (v && v !== def ? u.searchParams.set(k, v) : u.searchParams.delete(k));
    set('q', q.trim());
    if (!lockedCategory) set('kategori', cat);
    set('marka', brand);
    set('sirala', sort, 'onerilen');
    window.history.replaceState(null, '', u.pathname + (u.search ? u.search : '') + u.hash);
  }, [q, cat, brand, sort]);

  const scoped = useMemo(() => (cat ? items.filter((p) => p.category === cat) : items), [items, cat]);

  const results = useMemo(() => {
    const terms = fold(q).split(' ').filter(Boolean);
    let list = scoped.filter((p) => (!brand || p.brand === brand) && terms.every((t) => p.search.includes(t)));
    const price = (p: ProductView, dir: 1 | -1) => (p.price == null ? Infinity : p.price * dir);
    if (sort === 'fiyat-artan') list = [...list].sort((a, b) => price(a, 1) - price(b, 1));
    else if (sort === 'fiyat-azalan') list = [...list].sort((a, b) => price(a, -1) - price(b, -1));
    else if (sort === 'a-z') list = [...list].sort((a, b) => a.name.localeCompare(b.name, 'tr'));
    else list = [...list].sort((a, b) => (a.featured ?? 999) - (b.featured ?? 999));
    return list;
  }, [scoped, q, brand, sort]);

  const brandOptions = useMemo(() => {
    const m = new Map<string, number>();
    for (const p of scoped) if (p.brand) m.set(p.brand, (m.get(p.brand) ?? 0) + 1);
    return brands.filter((b) => m.has(b.name)).map((b) => ({ name: b.name, count: m.get(b.name)! }));
  }, [scoped, brands]);

  const filtered = !!(q.trim() || (!lockedCategory && cat) || brand);
  const clear = () => {
    setQ('');
    if (!lockedCategory) setCat('');
    setBrand('');
  };

  return (
    <div class="catalog" data-ready={hydrated ? '' : undefined}>
      <div class="catalog__bar">
        <div class="container catalog__bar-inner">
          <form class="catalog__search" role="search" onSubmit={(e) => e.preventDefault()}>
            <Icon name="search" />
            <label for="catalog-q" class="sr-only">
              Bu sayfada ara
            </label>
            <input
              id="catalog-q"
              type="search"
              placeholder="Ürün veya marka ara"
              value={q}
              autoComplete="off"
              enterKeyHint="search"
              onInput={(e) => setQ((e.target as HTMLInputElement).value)}
            />
            {q && (
              <button type="button" class="icon-btn" onClick={() => setQ('')} aria-label="Aramayı temizle">
                <Icon name="close" />
              </button>
            )}
          </form>
          <div class="catalog__selects">
            <label class="catalog__select">
              <span class="sr-only">Marka</span>
              <select value={brand} onChange={(e) => setBrand((e.target as HTMLSelectElement).value)}>
                <option value="">Tüm markalar</option>
                {brandOptions.map((b) => (
                  <option value={b.name} key={b.name}>
                    {b.name} ({b.count})
                  </option>
                ))}
              </select>
            </label>
            <label class="catalog__select">
              <span class="sr-only">Sıralama</span>
              <select value={sort} onChange={(e) => setSort((e.target as HTMLSelectElement).value as Sort)}>
                {SORTS.map((s) => (
                  <option value={s.id} key={s.id}>
                    {s.label}
                  </option>
                ))}
              </select>
            </label>
          </div>
        </div>
        {!lockedCategory && (
          <div class="catalog__chips" role="group" aria-label="Kategori">
            <button type="button" class="chip" aria-pressed={cat === ''} onClick={() => setCat('')}>
              Tümü <span class="chip__count">{items.length}</span>
            </button>
            {categories.map((c) => (
              <button type="button" class="chip" key={c.id} aria-pressed={cat === c.id} onClick={() => setCat(cat === c.id ? '' : c.id)}>
                {c.label} <span class="chip__count">{c.count}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      <div class="container">
        <h2 class="sr-only">Ürünler</h2>
        <div class="catalog__status" aria-live="polite">
          <p>
            <span class="num">{formatCount(results.length)}</span> ürün
            {q.trim() && (
              <>
                {' '}
                · “<strong>{q.trim()}</strong>”
              </>
            )}
          </p>
          {filtered && (
            <button type="button" class="link" onClick={clear}>
              Filtreleri temizle
            </button>
          )}
        </div>

        {results.length ? (
          <div class="pgrid">
            {results.map((p, i) => (
              <ProductCard key={p.id} p={p} priority={i < 4} />
            ))}
          </div>
        ) : (
          <div class="empty">
            <span class="empty__mark">
              <Icon name="search" />
            </span>
            <p class="empty__title">Bu seçimle eşleşen ürün bulunamadı</p>
            <p class="empty__text">Filtreleri temizleyerek tüm seçkiyi görebilir ya da aradığınız ürünü bize sorabilirsiniz.</p>
            <div class="cluster" style="justify-content:center">
              <button type="button" class="btn" onClick={clear}>
                Filtreleri Temizle
              </button>
              <a
                class="btn btn--outline"
                href={waLink(`Merhaba VEYRA, ${q.trim() ? `“${q.trim()}” ` : ''}ürününü arıyorum. Mevcut mu?`)}
                target="_blank"
                rel="noopener"
              >
                <Icon name="whatsapp" /> WhatsApp’tan Sorun
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
