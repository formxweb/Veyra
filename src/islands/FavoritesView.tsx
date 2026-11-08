import { useMemo } from 'preact/hooks';
import type { ProductView } from '../lib/types';
import { favorites } from '../stores/favorites';
import { ProductCard } from './ProductCard';
import { Icon, useHydratedStore, useMounted } from './shared';

export default function FavoritesView({ products }: { products: ProductView[] }) {
  const mounted = useMounted();
  const ids = useHydratedStore(favorites, [] as string[]);
  const byId = useMemo(() => new Map(products.map((p) => [p.id, p])), [products]);
  const list = ids.map((id) => byId.get(id)).filter((p): p is ProductView => !!p);

  if (!mounted) return <div class="cartpage__loading" aria-busy="true" />;

  if (!list.length) {
    return (
      <div class="empty">
        <span class="empty__mark">
          <Icon name="heart" />
        </span>
        <p class="empty__title">Henüz favoriniz yok</p>
        <p class="empty__text">Ürünlerdeki kalp simgesine dokunarak beğendiklerinizi burada toplayabilir, daha sonra kolayca karşılaştırabilirsiniz.</p>
        <a class="btn" href="/magaza">
          Seçkiyi Keşfet <Icon name="arrow-right" class="icon icon--arrow" />
        </a>
      </div>
    );
  }

  return (
    <>
      <h2 class="sr-only">Favori ürünler</h2>
      <p class="catalog__status">
        <span>
          <span class="num">{list.length}</span> favori ürün · bu cihazda saklanır
        </span>
      </p>
      <div class="pgrid">
        {list.map((p, i) => (
          <ProductCard key={p.id} p={p} priority={i < 4} />
        ))}
      </div>
    </>
  );
}
