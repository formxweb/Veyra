import { useRef, useState } from 'preact/hooks';
import type { ImageView } from '../lib/types';
import { Icon, Img } from './shared';

/** Large matted gallery: crossfade, thumbnails, swipe and arrow keys. */
export default function ProductGallery({ images, name, category }: { images: ImageView[]; name: string; category: string }) {
  const [i, setI] = useState(0);
  const start = useRef<{ x: number; y: number } | null>(null);
  const n = images.length;
  const go = (d: number) => setI((v) => (v + d + n) % n);

  if (!n) {
    return (
      <div class="gallery" data-cat={category}>
        <div class="gallery__stage gallery__stage--empty">
          <span class="pcard__placeholder" aria-hidden="true">
            V
          </span>
          <p class="muted">Bu ürünün fotoğrafı hazırlanıyor.</p>
        </div>
      </div>
    );
  }

  return (
    <div class="gallery" data-cat={category}>
      <div
        class="gallery__stage"
        role="region"
        aria-roledescription="galeri"
        aria-label={`${name} — görseller`}
        tabIndex={n > 1 ? 0 : -1}
        onKeyDown={(e) => {
          if (e.key === 'ArrowRight') go(1);
          if (e.key === 'ArrowLeft') go(-1);
        }}
        onPointerDown={(e) => (start.current = { x: e.clientX, y: e.clientY })}
        onPointerUp={(e) => {
          const s = start.current;
          start.current = null;
          if (!s || n < 2) return;
          const dx = e.clientX - s.x;
          if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(e.clientY - s.y)) go(dx < 0 ? 1 : -1);
        }}
      >
        {images.map((img, k) => (
          <figure class="gallery__slide" data-active={k === i} aria-hidden={k !== i} key={img.src}>
            <span
              class="pcard__print gallery__print"
              style={`--ar:${img.width} / ${img.height};--h:${img.height}px;${k === 0 ? 'view-transition-name: product-media;' : ''}`}
            >
              <Img image={img} sizes="(min-width: 64em) 30vw, 70vw" priority={k === 0} />
            </span>
          </figure>
        ))}
        {n > 1 && (
          <>
            <button type="button" class="gallery__nav gallery__nav--prev icon-btn" onClick={() => go(-1)} aria-label="Önceki görsel">
              <Icon name="arrow-left" />
            </button>
            <button type="button" class="gallery__nav gallery__nav--next icon-btn" onClick={() => go(1)} aria-label="Sonraki görsel">
              <Icon name="arrow-right" />
            </button>
            <p class="gallery__count num" aria-live="polite">
              {i + 1} / {n}
            </p>
          </>
        )}
      </div>
      {n > 1 && (
        <div class="gallery__thumbs" role="group" aria-label="Görsel seç">
          {images.map((img, k) => (
            <button type="button" key={img.src} aria-current={k === i} aria-label={`Görsel ${k + 1}`} onClick={() => setI(k)}>
              <Img image={img} sizes="80px" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
