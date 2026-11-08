import { useCallback, useEffect, useMemo, useRef, useState } from 'preact/hooks';
import type { ComponentChildren } from 'preact';
import { useStore } from '@nanostores/preact';
import { brand } from '../config/site';
import { fold, formatPrice } from '../lib/format';
import type { ProductView } from '../lib/types';
import { productInquiry, waLink } from '../lib/whatsapp';
import { cart, cartTotals, MAX_QTY, removeLine, setQty } from '../stores/cart';
import { closePanel, panel, quickView, toasts } from '../stores/ui';
import { addAndReveal, CARD_SIZES } from './ProductCard';
import { Icon, Img, Qty, useHydratedStore } from './shared';

/* ------------------------------------------------------------------ overlay */
function Overlay({
  open,
  onClose,
  className,
  label,
  children,
}: {
  open: boolean;
  onClose: () => void;
  className: string;
  label: string;
  children: ComponentChildren;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (open && !d.open) d.showModal();
    else if (!open && d.open) d.close();
  }, [open]);
  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    const h = () => onClose();
    d.addEventListener('close', h);
    return () => d.removeEventListener('close', h);
  }, [onClose]);
  return (
    <dialog
      ref={ref}
      class={`overlay ${className}`}
      aria-label={label}
      onClick={(e) => {
        if (e.target === ref.current) onClose();
      }}
    >
      {children}
    </dialog>
  );
}

/* ------------------------------------------------------------------ cart drawer */
function CartDrawer({ open, onClose }: { open: boolean; onClose: () => void }) {
  const lines = useStore(cart);
  const totals = useStore(cartTotals);
  return (
    <Overlay open={open} onClose={onClose} className="drawer" label="Sepetiniz">
      <div class="drawer__inner">
        <header class="drawer__head">
          <h2 class="drawer__title">
            Sepetiniz <span class="muted num">({totals.count})</span>
          </h2>
          <button type="button" class="icon-btn" onClick={onClose} aria-label="Sepeti kapat">
            <Icon name="close" />
          </button>
        </header>
        <div class="drawer__body">
          {lines.length === 0 ? (
            <div class="empty">
              <span class="empty__mark">
                <Icon name="bag" />
              </span>
              <p class="empty__title">Sepetiniz şimdilik boş</p>
              <p class="empty__text">Seçkiye göz atın; beğendiğiniz ürünü tek dokunuşla buraya ekleyebilirsiniz.</p>
              <a class="btn" href="/magaza">
                Mağazaya Git <Icon name="arrow-right" class="icon icon--arrow" />
              </a>
            </div>
          ) : (
            <ul role="list">
              {lines.map((l) => (
                <li class="line" key={l.id}>
                  <a class="line__thumb" href={l.snap.href} tabIndex={-1} aria-hidden="true">
                    {l.snap.image && <Img image={{ ...l.snap.image, alt: '' }} sizes="72px" />}
                  </a>
                  <div>
                    <a class="line__name" href={l.snap.href}>
                      {l.snap.name}
                    </a>
                    <p class="line__meta">
                      {formatPrice(l.snap.price)} · {l.id.toUpperCase()}
                    </p>
                    <div class="line__controls">
                      <Qty size="sm" value={l.qty} onChange={(n) => setQty(l.id, n)} label={l.snap.name} />
                      <button type="button" class="line__remove" onClick={() => removeLine(l.id)}>
                        Kaldır
                      </button>
                    </div>
                  </div>
                  <p class="price line__price">{l.snap.price != null ? formatPrice(l.snap.price * l.qty) : '—'}</p>
                </li>
              ))}
            </ul>
          )}
        </div>
        {lines.length > 0 && (
          <footer class="drawer__foot">
            <dl class="sum">
              <div class="sum__row sum__row--total">
                <dt>Ara toplam</dt>
                <dd class="num">{formatPrice(totals.subtotal)}</dd>
              </div>
            </dl>
            <p class="muted" style="font-size: var(--fs-xs)">
              Kargo ücreti ve IBAN bilgisi sipariş onayında WhatsApp üzerinden iletilir. Ödeme: {brand.payment.label}.
            </p>
            <a class="btn btn--block" href="/sepet">
              Siparişi Tamamla <Icon name="arrow-right" class="icon icon--arrow" />
            </a>
            <button type="button" class="btn btn--outline btn--block" onClick={onClose}>
              Alışverişe Devam Et
            </button>
          </footer>
        )}
      </div>
    </Overlay>
  );
}

/* ------------------------------------------------------------------ quick view */
function QuickView({ p, onClose }: { p: ProductView | null; onClose: () => void }) {
  const [qty, set] = useState(1);
  const [last, setLast] = useState<ProductView | null>(p);
  useEffect(() => {
    if (p) {
      setLast(p);
      set(1);
    }
  }, [p]);
  const v = p ?? last;
  return (
    <Overlay open={!!p} onClose={onClose} className="modal qv" label={v ? `${v.name} — hızlı inceleme` : 'Hızlı inceleme'}>
      {v && (
        <div class="qv__grid">
          <button type="button" class="icon-btn modal__close" onClick={onClose} aria-label="Kapat">
            <Icon name="close" />
          </button>
          <div class="qv__media" data-cat={v.category}>
            {v.image && (
              <span class="pcard__print" style={`--ar:${v.image.width} / ${v.image.height};--w:${v.image.width}px`}>
                <Img image={v.image} sizes="(min-width: 48em) 300px, 60vw" priority />
              </span>
            )}
          </div>
          <div class="qv__info">
            <p class="eyebrow">{v.brand ?? v.categoryLabel}</p>
            <h2 class="qv__name">{v.name}</h2>
            <p class="price qv__price">{formatPrice(v.price)}</p>
            {v.condition && (
              <p class="qv__cond">
                <Icon name="check" /> {v.condition}
              </p>
            )}
            <div class="qv__buy">
              <Qty value={qty} onChange={(n) => set(Math.max(1, Math.min(MAX_QTY, n)))} label={v.name} />
              <button
                type="button"
                class="btn"
                disabled={!v.available}
                onClick={() => {
                  onClose();
                  addAndReveal(v, qty);
                }}
              >
                Sepete Ekle
              </button>
            </div>
            <a
              class="btn btn--outline btn--block"
              href={waLink(productInquiry(v, qty, typeof location !== 'undefined' ? location.origin + v.href : undefined))}
              target="_blank"
              rel="noopener"
            >
              <Icon name="whatsapp" /> WhatsApp ile Sor
            </a>
            <a class="link" href={v.href}>
              Ürün detayına git <Icon name="arrow-right" />
            </a>
          </div>
        </div>
      )}
    </Overlay>
  );
}

/* ------------------------------------------------------------------ search */
let indexPromise: Promise<ProductView[]> | null = null;
function loadIndex() {
  indexPromise ??= fetch('/katalog.json')
    .then((r) => (r.ok ? r.json() : Promise.reject(r.status)))
    .then((d: { products: ProductView[] }) => d.products)
    .catch((e) => {
      indexPromise = null;
      throw e;
    });
  return indexPromise;
}

type Shortcut = { href: string; label: string; count: number };

function SearchDialog({ open, onClose, shortcuts }: { open: boolean; onClose: () => void; shortcuts: Shortcut[] }) {
  const [q, setQ] = useState('');
  const [items, setItems] = useState<ProductView[] | null>(null);
  const [failed, setFailed] = useState(false);
  const [active, setActive] = useState(0);
  const input = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open) return;
    setFailed(false);
    loadIndex().then(setItems, () => setFailed(true));
    requestAnimationFrame(() => input.current?.focus());
  }, [open]);

  const results = useMemo(() => {
    if (!items) return [];
    const terms = fold(q).split(' ').filter(Boolean);
    if (!terms.length) return [];
    return items.filter((p) => terms.every((t) => p.search.includes(t)));
  }, [items, q]);

  useEffect(() => setActive(0), [q]);

  const go = (href: string) => {
    window.location.href = href;
  };
  const allHref = `/magaza?q=${encodeURIComponent(q.trim())}`;

  return (
    <Overlay open={open} onClose={onClose} className="modal search" label="Ürün ara">
      <div class="search__inner">
        <form
          class="search__bar"
          role="search"
          onSubmit={(e) => {
            e.preventDefault();
            if (results[active] && q.trim()) go(results[active].href);
            else if (q.trim()) go(allHref);
          }}
        >
          <Icon name="search" />
          <label class="sr-only" for="site-search">
            Ürün, marka veya koleksiyon ara
          </label>
          <input
            ref={input}
            id="site-search"
            type="search"
            autoComplete="off"
            enterKeyHint="search"
            placeholder="Ürün, marka veya koleksiyon ara"
            value={q}
            onInput={(e) => setQ((e.target as HTMLInputElement).value)}
            onKeyDown={(e) => {
              if (e.key === 'ArrowDown') {
                e.preventDefault();
                setActive((a) => Math.min(a + 1, Math.min(results.length, 6) - 1));
              } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                setActive((a) => Math.max(a - 1, 0));
              }
            }}
            role="combobox"
            list={undefined}
            aria-expanded={results.length > 0}
            aria-controls="search-results"
            aria-activedescendant={results.length ? `sr-${results[active]?.id}` : undefined}
          />
          <button type="button" class="icon-btn" onClick={onClose} aria-label="Aramayı kapat">
            <Icon name="close" />
          </button>
        </form>

        <div class="search__body">
          {failed && (
            <p class="notice">
              <Icon name="info" />
              <span>Arama dizini şu anda yüklenemedi. Bağlantınızı kontrol edip tekrar deneyin ya da mağazaya göz atın.</span>
            </p>
          )}
          {!q.trim() && (
            <div>
              <p class="eyebrow">Koleksiyonlar</p>
              <ul role="list" class="search__shortcuts">
                {shortcuts.map((s) => (
                  <li key={s.href}>
                    <a class="chip" href={s.href}>
                      {s.label} <span class="chip__count">{s.count}</span>
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}
          {q.trim() && items && results.length === 0 && (
            <div class="empty" style="padding-block: var(--s-6)">
              <p class="empty__title">“{q.trim()}” için sonuç bulunamadı</p>
              <p class="empty__text">Daha kısa bir kelime deneyin ya da aradığınız ürünü WhatsApp’tan bize sorun.</p>
              <a class="link" href={waLink(`Merhaba VEYRA, “${q.trim()}” ürününü arıyorum. Mevcut mu?`)} target="_blank" rel="noopener">
                WhatsApp’tan sorun <Icon name="arrow-up-right" />
              </a>
            </div>
          )}
          {results.length > 0 && (
            <>
              <ul role="listbox" id="search-results" class="search__results" aria-label="Arama sonuçları">
                {results.slice(0, 6).map((p, i) => (
                  <li key={p.id} id={`sr-${p.id}`} role="option" aria-selected={i === active}>
                    <a href={p.href} class="search__hit" data-active={i === active} onMouseEnter={() => setActive(i)}>
                      <span class="line__thumb">{p.image && <Img image={p.image} sizes="64px" />}</span>
                      <span>
                        <span class="search__hit-name">{p.name}</span>
                        <span class="search__hit-meta">{p.brand ?? p.categoryLabel}</span>
                      </span>
                      <span class="price">{formatPrice(p.price)}</span>
                    </a>
                  </li>
                ))}
              </ul>
              <a class="link search__all" href={allHref}>
                Tüm sonuçları gör ({results.length}) <Icon name="arrow-right" />
              </a>
            </>
          )}
        </div>
      </div>
    </Overlay>
  );
}

/* ------------------------------------------------------------------ mobile menu */
type NavItem = { href: string; label: string };

function MobileMenu({
  open,
  onClose,
  nav,
  shortcuts,
}: {
  open: boolean;
  onClose: () => void;
  nav: NavItem[];
  shortcuts: Shortcut[];
}) {
  return (
    <Overlay open={open} onClose={onClose} className="drawer drawer--left menu" label="Menü">
      <div class="drawer__inner">
        <header class="drawer__head">
          <span class="menu__brand">VEYRA</span>
          <button type="button" class="icon-btn" onClick={onClose} aria-label="Menüyü kapat">
            <Icon name="close" />
          </button>
        </header>
        <nav class="drawer__body menu__body" aria-label="Mobil">
          <ul role="list" class="menu__primary">
            {nav.map((n) => (
              <li key={n.href}>
                <a href={n.href} onClick={onClose}>
                  {n.label}
                  <Icon name="arrow-right" />
                </a>
              </li>
            ))}
            <li>
              <a href="/favoriler" onClick={onClose}>
                Favoriler
                <Icon name="arrow-right" />
              </a>
            </li>
          </ul>
          <p class="eyebrow" style="margin-top: var(--s-6)">
            Koleksiyonlar
          </p>
          <ul role="list" class="menu__secondary">
            {shortcuts.map((s) => (
              <li key={s.href}>
                <a href={s.href} onClick={onClose}>
                  <span>{s.label}</span>
                  <span class="muted num">{s.count}</span>
                </a>
              </li>
            ))}
          </ul>
        </nav>
        <footer class="drawer__foot">
          <a class="btn btn--block" href={waLink('Merhaba VEYRA, bilgi almak istiyorum.')} target="_blank" rel="noopener">
            <Icon name="whatsapp" /> {brand.whatsapp.display}
          </a>
          <p class="muted" style="font-size: var(--fs-xs); text-align: center">
            {brand.location.label} · {brand.shipping.label}
          </p>
        </footer>
      </div>
    </Overlay>
  );
}

/* ------------------------------------------------------------------ toaster */
function Toaster() {
  const list = useStore(toasts);
  return (
    <div class="toaster" role="status" aria-live="polite">
      {list.map((t) => (
        <div class="toast" key={t.id}>
          <Icon name="check" />
          <span>{t.text}</span>
          {t.href && <a href={t.href}>{t.action ?? 'Görüntüle'}</a>}
        </div>
      ))}
    </div>
  );
}

/* ------------------------------------------------------------------ root */
export default function GlobalUI({ nav, shortcuts }: { nav: NavItem[]; shortcuts: Shortcut[] }) {
  const current = useHydratedStore(panel, null);
  const qv = useStore(quickView);
  const close = useCallback(() => closePanel(), []);
  const closeQv = useCallback(() => quickView.set(null), []);

  // Clear a stale view-transition name when returning via back/forward cache.
  useEffect(() => {
    const h = () =>
      document.querySelectorAll<HTMLElement>('.pcard__print').forEach((el) => el.style.removeProperty('view-transition-name'));
    window.addEventListener('pageshow', h);
    return () => window.removeEventListener('pageshow', h);
  }, []);

  // Global keyboard shortcut: "/" opens search.
  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement;
      if (e.key === '/' && !/input|textarea|select/i.test(t.tagName) && !t.isContentEditable) {
        e.preventDefault();
        panel.set('search');
      }
    };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, []);

  return (
    <>
      <CartDrawer open={current === 'cart'} onClose={close} />
      <SearchDialog open={current === 'search'} onClose={close} shortcuts={shortcuts} />
      <MobileMenu open={current === 'menu'} onClose={close} nav={nav} shortcuts={shortcuts} />
      <QuickView p={qv} onClose={closeQv} />
      <Toaster />
    </>
  );
}

export { CARD_SIZES };
