import type { ProductView } from '../lib/types';
import { formatPrice } from '../lib/format';
import { addToCart } from '../stores/cart';
import { favorites, toggleFavorite } from '../stores/favorites';
import { openPanel, quickView, toast } from '../stores/ui';
import { Icon, Img, useHydratedStore } from './shared';

export const CARD_SIZES = '(min-width: 75em) min(16vw, 240px), (min-width: 48em) 22vw, 34vw';

/** Name the clicked card's print so the browser morphs it into the product page gallery. */
export function markTransition(e: Event) {
  const card = (e.currentTarget as HTMLElement).closest('.pcard');
  const print = card?.querySelector<HTMLElement>('.pcard__print');
  if (print) print.style.setProperty('view-transition-name', 'product-media');
}

export function addAndReveal(p: ProductView, qty = 1) {
  addToCart(p, qty);
  openPanel('cart');
}

export function ProductCard({
  p,
  priority = false,
  index,
  headingLevel = 3,
}: {
  p: ProductView;
  priority?: boolean;
  index?: number;
  headingLevel?: 2 | 3 | 4;
}) {
  const favs = useHydratedStore(favorites, [] as string[]);
  const isFav = favs.includes(p.id);
  const H = `h${headingLevel}` as 'h3';

  const onFav = () => {
    const now = toggleFavorite(p.id);
    toast(now ? 'Favorilere eklendi' : 'Favorilerden çıkarıldı', now ? { href: '/favoriler', action: 'Favoriler' } : {});
  };

  return (
    <article class="pcard" data-cat={p.category} data-product={p.id} data-hires={p.hires ? '' : undefined}>
      {index != null && <span class="rail__index">{String(index + 1).padStart(2, '0')}</span>}
      <div class="pcard__media">
        <a class="pcard__link" href={p.href} tabIndex={-1} aria-hidden="true" onClick={markTransition}>
          {p.image ? (
            <span class="pcard__print" style={`--ar:${p.image.width} / ${p.image.height}`}>
              <Img image={{ ...p.image, alt: p.image.alt }} sizes={CARD_SIZES} priority={priority} />
            </span>
          ) : (
            <span class="pcard__placeholder" aria-hidden="true">
              V
            </span>
          )}
        </a>
        <button
          type="button"
          class="icon-btn pcard__fav"
          aria-pressed={isFav}
          aria-label={isFav ? `${p.name} — favorilerden çıkar` : `${p.name} — favorilere ekle`}
          onClick={onFav}
        >
          <Icon name="heart" />
        </button>
        <div class="pcard__actions">
          <button type="button" onClick={() => quickView.set(p)} aria-label={`${p.name} — hızlı incele`}>
            <Icon name="eye" />
            Hızlı İncele
          </button>
          <button type="button" onClick={() => addAndReveal(p)} disabled={!p.available} aria-label={`${p.name} — sepete ekle`}>
            <Icon name="bag-plus" />
            {p.available ? 'Sepete Ekle' : 'Tükendi'}
          </button>
        </div>
        <button
          type="button"
          class="icon-btn pcard__quickadd"
          onClick={() => addAndReveal(p)}
          disabled={!p.available}
          aria-label={`${p.name} — sepete ekle`}
        >
          <Icon name="bag-plus" />
        </button>
      </div>
      <div class="pcard__body">
        <div class="pcard__meta">
          <span>{p.brand ?? p.categoryLabel}</span>
          {p.condition && <span class="pcard__cond">{p.condition}</span>}
        </div>
        <H class="pcard__name">
          <a href={p.href} onClick={markTransition}>
            {p.name}
          </a>
        </H>
        <p class="price pcard__price">{formatPrice(p.price)}</p>
      </div>
    </article>
  );
}
