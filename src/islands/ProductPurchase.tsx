import { useEffect, useRef, useState } from 'preact/hooks';
import type { ProductView } from '../lib/types';
import { formatPrice } from '../lib/format';
import { productInquiry, waLink } from '../lib/whatsapp';
import { MAX_QTY } from '../stores/cart';
import { favorites, toggleFavorite } from '../stores/favorites';
import { toast } from '../stores/ui';
import { addAndReveal } from './ProductCard';
import { Icon, Qty, useHydratedStore } from './shared';

export default function ProductPurchase({ p }: { p: ProductView }) {
  const [qty, setQty] = useState(1);
  const [url, setUrl] = useState<string | undefined>();
  const [stuck, setStuck] = useState(false);
  const cta = useRef<HTMLDivElement>(null);
  const favs = useHydratedStore(favorites, [] as string[]);
  const isFav = favs.includes(p.id);

  useEffect(() => setUrl(window.location.origin + p.href), [p.href]);

  // Mobile: reveal a fixed buy bar once the main CTA has scrolled above the viewport.
  useEffect(() => {
    const el = cta.current;
    if (!el) return;
    let raf = 0;
    const update = () => {
      raf = 0;
      setStuck(el.getBoundingClientRect().bottom < 0);
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      cancelAnimationFrame(raf);
    };
  }, []);

  const wa = waLink(productInquiry(p, qty, url));
  const add = () => addAndReveal(p, qty);
  const fav = () => {
    const now = toggleFavorite(p.id);
    toast(now ? 'Favorilere eklendi' : 'Favorilerden çıkarıldı', now ? { href: '/favoriler', action: 'Favoriler' } : {});
  };

  return (
    <>
      <div class="buy" ref={cta}>
        <div class="buy__row">
          <Qty value={qty} onChange={(n) => setQty(Math.max(1, Math.min(MAX_QTY, n)))} label={p.name} />
          <button type="button" class="btn buy__add" onClick={add} disabled={!p.available}>
            <Icon name="bag-plus" />
            {p.available ? 'Sepete Ekle' : 'Tükendi'}
          </button>
          <button
            type="button"
            class="icon-btn buy__fav"
            aria-pressed={isFav}
            aria-label={isFav ? 'Favorilerden çıkar' : 'Favorilere ekle'}
            onClick={fav}
          >
            <Icon name="heart" />
          </button>
        </div>
        <a class="btn btn--outline btn--block buy__wa" href={wa} target="_blank" rel="noopener">
          <Icon name="whatsapp" /> WhatsApp ile Sipariş Ver
        </a>
        <p class="buy__note">
          <Icon name="info" />
          <span>Stok ve kargo bilgisi sipariş onayında teyit edilir. Ödeme EFT / Havale ile yapılır.</span>
        </p>
      </div>

      <div class="buybar" data-visible={stuck} aria-hidden={!stuck}>
        <div class="buybar__info">
          <span class="buybar__name">{p.name}</span>
          <span class="price buybar__price">{formatPrice(p.price)}</span>
        </div>
        <a class="icon-btn buybar__wa" href={wa} target="_blank" rel="noopener" aria-label="WhatsApp ile sipariş ver" tabIndex={stuck ? 0 : -1}>
          <Icon name="whatsapp" />
        </a>
        <button type="button" class="btn buybar__add" onClick={add} disabled={!p.available} tabIndex={stuck ? 0 : -1}>
          Sepete Ekle
        </button>
      </div>
    </>
  );
}
