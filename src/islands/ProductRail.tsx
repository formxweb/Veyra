import { useEffect, useRef, useState } from 'preact/hooks';
import type { ProductView } from '../lib/types';
import { ProductCard } from './ProductCard';
import { Icon } from './shared';

/** Horizontal, snap-scrolling editorial rail with numbered cards. */
export default function ProductRail({
  items,
  label,
  cta,
}: {
  items: ProductView[];
  label: string;
  cta?: { href: string; label: string };
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [edge, setEdge] = useState<{ start: boolean; end: boolean }>({ start: true, end: false });

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const update = () =>
      setEdge({ start: el.scrollLeft < 8, end: el.scrollLeft + el.clientWidth >= el.scrollWidth - 8 });
    update();
    el.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
    return () => {
      el.removeEventListener('scroll', update);
      window.removeEventListener('resize', update);
    };
  }, []);

  const step = (dir: 1 | -1) => {
    const el = ref.current;
    if (!el) return;
    const card = el.querySelector<HTMLElement>(':scope > *');
    const by = card ? card.getBoundingClientRect().width + parseFloat(getComputedStyle(el).columnGap || '0') : el.clientWidth * 0.8;
    el.scrollBy({ left: dir * by, behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
  };

  return (
    <div class="rail-wrap">
      <div class="rail-wrap__controls container">
        {cta && (
          <a class="link" href={cta.href}>
            {cta.label} <Icon name="arrow-right" />
          </a>
        )}
        <div class="rail-controls" role="group" aria-label={`${label} — kaydır`}>
          <button type="button" onClick={() => step(-1)} disabled={edge.start} aria-label="Önceki ürünler">
            <Icon name="arrow-left" />
          </button>
          <button type="button" onClick={() => step(1)} disabled={edge.end} aria-label="Sonraki ürünler">
            <Icon name="arrow-right" />
          </button>
        </div>
      </div>
      <div class="rail" ref={ref} role="list" aria-label={label}>
        {items.map((p, i) => (
          <div role="listitem" key={p.id}>
            <ProductCard p={p} index={i} />
          </div>
        ))}
      </div>
    </div>
  );
}
