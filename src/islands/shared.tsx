import { useEffect, useState } from 'preact/hooks';
import { useStore } from '@nanostores/preact';
import type { ReadableAtom } from 'nanostores';
import { icons, type IconName } from '../lib/icons';
import type { ImageView } from '../lib/types';
import { MAX_QTY } from '../stores/cart';

export function Icon({ name, class: cls = 'icon' }: { name: IconName; class?: string }) {
  return (
    <svg
      class={cls}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="1.4"
      stroke-linecap="round"
      stroke-linejoin="round"
      aria-hidden="true"
      focusable="false"
      dangerouslySetInnerHTML={{ __html: icons[name] }}
    />
  );
}

/** True after the first client render — lets SSR markup and the first hydration pass match. */
export function useMounted() {
  const [m, set] = useState(false);
  useEffect(() => set(true), []);
  return m;
}

/** Store value that equals `fallback` until hydrated (storage-backed stores differ from SSR). */
export function useHydratedStore<T>(store: ReadableAtom<T>, fallback: T): T {
  const v = useStore(store);
  return useMounted() ? v : fallback;
}

export function Img({
  image,
  sizes,
  class: cls,
  loading = 'lazy',
  priority = false,
  style,
}: {
  image: Pick<ImageView, 'src' | 'srcset' | 'width' | 'height'> & { alt?: string };
  sizes?: string;
  class?: string;
  loading?: 'lazy' | 'eager';
  priority?: boolean;
  style?: string;
}) {
  return (
    <img
      class={cls}
      src={image.src}
      srcset={image.srcset}
      sizes={image.srcset ? sizes : undefined}
      width={image.width}
      height={image.height}
      alt={image.alt ?? ''}
      loading={priority ? 'eager' : loading}
      decoding="async"
      fetchpriority={priority ? 'high' : undefined}
      style={style}
    />
  );
}

/* ------------------------------------------------------------------ qty */
export function Qty({
  value,
  onChange,
  size,
  label,
}: {
  value: number;
  onChange: (n: number) => void;
  size?: 'sm';
  label: string;
}) {
  return (
    <div class={`qty${size ? ` qty--${size}` : ''}`} role="group" aria-label={`${label} — adet`}>
      <button type="button" onClick={() => onChange(value - 1)} disabled={value <= 1} aria-label="Adedi azalt">
        <Icon name="minus" />
      </button>
      <output aria-live="polite">{value}</output>
      <button type="button" onClick={() => onChange(value + 1)} disabled={value >= MAX_QTY} aria-label="Adedi artır">
        <Icon name="plus" />
      </button>
    </div>
  );
}

