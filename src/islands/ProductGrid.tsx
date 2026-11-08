import type { ProductView } from '../lib/types';
import { ProductCard } from './ProductCard';

export default function ProductGrid({ items, eager = 0 }: { items: ProductView[]; eager?: number }) {
  return (
    <div class="pgrid">
      {items.map((p, i) => (
        <ProductCard key={p.id} p={p} priority={i < eager} />
      ))}
    </div>
  );
}
