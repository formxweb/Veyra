import { cartCount } from '../stores/cart';
import { favoriteCount } from '../stores/favorites';
import { openPanel } from '../stores/ui';
import { Icon, useHydratedStore } from './shared';

export default function HeaderActions() {
  const count = useHydratedStore(cartCount, 0);
  const favs = useHydratedStore(favoriteCount, 0);
  return (
    <div class="hdr-actions">
      <button type="button" class="icon-btn" onClick={() => openPanel('search')} aria-label="Ürün ara" aria-haspopup="dialog">
        <Icon name="search" />
      </button>
      <a class="icon-btn hdr-actions__fav" href="/favoriler" aria-label={`Favoriler${favs ? ` (${favs})` : ''}`}>
        <Icon name="heart" />
        {favs > 0 && (
          <span class="count-badge" aria-hidden="true">
            {favs}
          </span>
        )}
      </a>
      <button
        type="button"
        class="icon-btn"
        onClick={() => openPanel('cart')}
        aria-label={`Sepet${count ? ` (${count} ürün)` : ''}`}
        aria-haspopup="dialog"
        data-cart-button
      >
        <Icon name="bag" />
        {count > 0 && (
          <span class="count-badge" aria-hidden="true" key={count}>
            {count}
          </span>
        )}
      </button>
    </div>
  );
}
