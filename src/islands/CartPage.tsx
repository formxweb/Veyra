import { useEffect, useMemo, useRef, useState } from 'preact/hooks';
import type { ComponentChildren } from 'preact';
import { useStore } from '@nanostores/preact';
import { brand } from '../config/site';
import { formatPrice } from '../lib/format';
import { provincesAlpha } from '../lib/provinces';
import type { ProductView } from '../lib/types';
import { formatPhoneTR, normalizePhoneTR, digitsOnly, rules, validate } from '../lib/validation';
import { makeOrderRef, orderMessage, waLink } from '../lib/whatsapp';
import { cart, cartTotals, clearCart, reconcile, removeLine, setQty } from '../stores/cart';
import { Icon, Img, Qty, useMounted } from './shared';

type Values = { name: string; phone: string; city: string; district: string; address: string; note: string; consent: string };
const EMPTY: Values = { name: '', phone: '', city: '', district: '', address: '', note: '', consent: 'false' };
const DRAFT_KEY = 'veyra:order-draft:v1';

const schema = {
  name: [rules.fullName()],
  phone: [rules.phoneTR()],
  city: [rules.required('İl seçimi')],
  district: [rules.required('İlçe')],
  address: [rules.minLength(10, 'Mahalle, sokak ve kapı numarasıyla birlikte açık adresinizi yazın.')],
  consent: [rules.checked('Devam etmek için bilgilerinizin WhatsApp üzerinden iletilmesini onaylayın.')],
};

function loadDraft(): Values {
  try {
    const raw = localStorage.getItem(DRAFT_KEY);
    if (raw) return { ...EMPTY, ...JSON.parse(raw), consent: 'false' };
  } catch {
    /* ignore */
  }
  return EMPTY;
}

function Field({
  k,
  label,
  error,
  children,
  hint,
  optional,
}: {
  k: string;
  label: string;
  error?: string;
  children: ComponentChildren;
  hint?: string;
  optional?: boolean;
}) {
  return (
    <div class="field" data-invalid={error ? '' : undefined}>
      <label class="field__label" for={`f-${k}`}>
        {label} {optional && <span class="opt">(isteğe bağlı)</span>}
      </label>
      {children}
      {error ? (
        <p class="field__error" id={`e-${k}`} role="alert">
          <Icon name="info" />
          {error}
        </p>
      ) : (
        hint && (
          <p class="field__hint" id={`h-${k}`}>
            {hint}
          </p>
        )
      )}
    </div>
  );
}

export default function CartPage({ products, suggestions }: { products: ProductView[]; suggestions: ProductView[] }) {
  const mounted = useMounted();
  const lines = useStore(cart);
  const totals = useStore(cartTotals);
  const live = useMemo(() => new Map(products.map((p) => [p.id, p])), [products]);
  const [removed, setRemoved] = useState(0);
  const [values, setValues] = useState<Values>(EMPTY);
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [sent, setSent] = useState<{ ref: string; url: string } | null>(null);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    setRemoved(reconcile(live));
    setValues(loadDraft());
  }, []);

  useEffect(() => {
    if (!mounted) return;
    try {
      const { consent, ...draft } = values;
      localStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
    } catch {
      /* ignore */
    }
  }, [values]);

  const set = (k: keyof Values, v: string) => {
    const next = { ...values, [k]: v };
    setValues(next);
    // Errors clear the moment the field becomes valid; new errors wait for blur.
    if (errors[k]) {
      const e = validate(next, { [k]: schema[k as keyof typeof schema] ?? [] });
      setErrors((prev) => {
        const copy = { ...prev };
        if (e[k]) copy[k] = e[k];
        else delete copy[k];
        return copy;
      });
    }
  };

  const blur = (k: keyof Values) => {
    setTouched((t) => ({ ...t, [k]: true }));
    const e = validate(values, { [k]: schema[k as keyof typeof schema] ?? [] });
    setErrors((prev) => {
      const copy = { ...prev };
      if (e[k]) copy[k] = e[k];
      else delete copy[k];
      return copy;
    });
  };

  const submit = (ev: Event) => {
    ev.preventDefault();
    const e = validate(values, schema);
    setErrors(e);
    setTouched(Object.fromEntries(Object.keys(schema).map((k) => [k, true])));
    const first = Object.keys(schema).find((k) => e[k]);
    if (first) {
      formRef.current?.querySelector<HTMLElement>(`[name="${first}"]`)?.focus();
      return;
    }
    const ref = makeOrderRef();
    const msg = orderMessage(
      ref,
      lines.map((l) => ({ id: l.id, name: l.snap.name, qty: l.qty, price: l.snap.price })),
      {
        name: values.name.trim(),
        phone: formatPhoneTR(normalizePhoneTR(digitsOnly(values.phone)) ?? values.phone),
        city: values.city,
        district: values.district.trim(),
        address: values.address.trim(),
        note: values.note,
      },
    );
    const url = waLink(msg);
    setSent({ ref, url });
    window.open(url, '_blank', 'noopener');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const err = (k: keyof Values) => (touched[k] || errors[k] ? errors[k] : undefined);

  if (!mounted) {
    return <div class="cartpage__loading" aria-busy="true" />;
  }

  if (sent) {
    return (
      <div class="sent">
        <span class="empty__mark">
          <Icon name="check" />
        </span>
        <p class="eyebrow">Sipariş referansı · {sent.ref}</p>
        <h2 class="sent__title">Sipariş talebiniz hazır.</h2>
        <p class="lede">
          WhatsApp’ta açılan mesajı <strong>gönder</strong> tuşuna basarak bize iletin. Siparişinizi onayladığımızda IBAN ve kargo
          bilgisini aynı yazışmadan paylaşacağız.
        </p>
        <div class="cluster" style="justify-content:center">
          <a class="btn" href={sent.url} target="_blank" rel="noopener">
            <Icon name="whatsapp" /> WhatsApp’ı Tekrar Aç
          </a>
          <button type="button" class="btn btn--outline" onClick={() => setSent(null)}>
            Bilgileri Düzenle
          </button>
        </div>
        <p class="muted" style="font-size: var(--fs-sm)">
          Mesajı gönderdiyseniz sepetinizi boşaltabilirsiniz.{' '}
          <button
            type="button"
            class="line__remove"
            onClick={() => {
              clearCart();
              setSent(null);
            }}
          >
            Sepeti boşalt
          </button>
        </p>
      </div>
    );
  }

  if (!lines.length) {
    return (
      <div>
        <div class="empty">
          <span class="empty__mark">
            <Icon name="bag" />
          </span>
          <p class="empty__title">Sepetiniz boş</p>
          <p class="empty__text">
            {removed
              ? 'Sepetinizdeki ürün artık satışta olmadığı için kaldırıldı. Seçkideki diğer ürünlere göz atabilirsiniz.'
              : 'Seçkiye göz atın; beğendiğiniz ürünleri ekledikten sonra siparişinizi buradan WhatsApp’a iletebilirsiniz.'}
          </p>
          <a class="btn" href="/magaza">
            Mağazaya Git <Icon name="arrow-right" class="icon icon--arrow" />
          </a>
        </div>
        {suggestions.length > 0 && (
          <div class="cartpage__suggest">
            <p class="eyebrow eyebrow--rule">Başlamak için</p>
            <ul role="list" class="cartpage__suggest-list">
              {suggestions.map((p) => (
                <li key={p.id}>
                  <a href={p.href} class="search__hit">
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
          </div>
        )}
      </div>
    );
  }

  const describedBy = (k: keyof Values) => (err(k) ? `e-${k}` : `h-${k}`);

  return (
    <div class="cartpage">
      <section class="cartpage__lines" aria-labelledby="lines-title">
        <h2 id="lines-title" class="cartpage__h">
          Ürünler <span class="muted num">({totals.count})</span>
        </h2>
        {removed > 0 && (
          <p class="notice" style="margin-bottom: var(--s-4)">
            <Icon name="info" />
            <span>Sepetinizdeki {removed} ürün artık satışta olmadığı için kaldırıldı.</span>
          </p>
        )}
        <ul role="list">
          {lines.map((l) => (
            <li class="line line--lg" key={l.id}>
              <a class="line__thumb" href={l.snap.href} tabIndex={-1} aria-hidden="true">
                {l.snap.image && <Img image={{ ...l.snap.image, alt: '' }} sizes="96px" />}
              </a>
              <div>
                <p class="line__meta" style="margin:0 0 .2rem">
                  {l.snap.brand ?? ''}
                </p>
                <a class="line__name" href={l.snap.href}>
                  {l.snap.name}
                </a>
                <p class="line__meta">
                  {formatPrice(l.snap.price)} · Ürün kodu {l.id.toUpperCase()}
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
        <dl class="sum cartpage__sum">
          <div class="sum__row">
            <dt>Ara toplam</dt>
            <dd class="num">{formatPrice(totals.subtotal)}</dd>
          </div>
          <div class="sum__row">
            <dt>Kargo</dt>
            <dd>Sipariş onayında bildirilir</dd>
          </div>
          <div class="sum__row">
            <dt>Ödeme</dt>
            <dd>{brand.payment.label}</dd>
          </div>
          <div class="sum__row sum__row--total">
            <dt>Toplam (kargo hariç)</dt>
            <dd class="num">{formatPrice(totals.subtotal)}</dd>
          </div>
        </dl>
      </section>

      <section class="cartpage__form" aria-labelledby="form-title">
        <h2 id="form-title" class="cartpage__h">Teslimat bilgileri</h2>
        <p class="muted cartpage__intro">
          Bilgileriniz hazır bir WhatsApp mesajına dönüştürülür; mesajı siz gönderene kadar hiçbir yere iletilmez.
        </p>
        <form ref={formRef} onSubmit={submit} noValidate class="order-form">
          <Field k="name" error={err('name')} label="Ad Soyad">
            <input
              id="f-name"
              name="name"
              class="field__control"
              autoComplete="name"
              value={values.name}
              onInput={(e) => set('name', (e.target as HTMLInputElement).value)}
              onBlur={() => blur('name')}
              aria-invalid={!!err('name')}
              aria-describedby={err('name') ? 'e-name' : undefined}
            />
          </Field>
          <Field k="phone" error={err('phone')} label="Telefon" hint="Siparişinizi bu numara üzerinden teyit ederiz.">
            <input
              id="f-phone"
              name="phone"
              class="field__control"
              type="tel"
              inputMode="tel"
              autoComplete="tel"
              placeholder="05XX XXX XX XX"
              value={values.phone}
              onInput={(e) => set('phone', formatPhoneTR((e.target as HTMLInputElement).value))}
              onBlur={() => blur('phone')}
              aria-invalid={!!err('phone')}
              aria-describedby={describedBy('phone')}
            />
          </Field>
          <div class="order-form__row">
            <Field k="city" error={err('city')} label="İl">
              <select
                id="f-city"
                name="city"
                class="field__control"
                autoComplete="address-level1"
                value={values.city}
                onChange={(e) => {
                  set('city', (e.target as HTMLSelectElement).value);
                }}
                onBlur={() => blur('city')}
                aria-invalid={!!err('city')}
                aria-describedby={err('city') ? 'e-city' : undefined}
              >
                <option value="">İl seçin</option>
                {provincesAlpha.map((p) => (
                  <option value={p} key={p}>
                    {p}
                  </option>
                ))}
              </select>
            </Field>
            <Field k="district" error={err('district')} label="İlçe">
              <input
                id="f-district"
                name="district"
                class="field__control"
                autoComplete="address-level2"
                value={values.district}
                onInput={(e) => set('district', (e.target as HTMLInputElement).value)}
                onBlur={() => blur('district')}
                aria-invalid={!!err('district')}
                aria-describedby={err('district') ? 'e-district' : undefined}
              />
            </Field>
          </div>
          <Field k="address" error={err('address')} label="Açık adres">
            <textarea
              id="f-address"
              name="address"
              class="field__control"
              rows={3}
              autoComplete="street-address"
              value={values.address}
              onInput={(e) => set('address', (e.target as HTMLTextAreaElement).value)}
              onBlur={() => blur('address')}
              aria-invalid={!!err('address')}
              aria-describedby={err('address') ? 'e-address' : undefined}
            />
          </Field>
          <Field k="note" error={err('note')} label="Sipariş notu" optional>
            <textarea
              id="f-note"
              name="note"
              class="field__control"
              rows={2}
              placeholder="Örn. renk tercihi, teslimat saati"
              value={values.note}
              onInput={(e) => set('note', (e.target as HTMLTextAreaElement).value)}
            />
          </Field>
          <div class="field">
            <label class="check" data-invalid={err('consent') ? '' : undefined}>
              <input
                type="checkbox"
                name="consent"
                checked={values.consent === 'true'}
                onChange={(e) => {
                  const v = (e.target as HTMLInputElement).checked ? 'true' : 'false';
                  set('consent', v);
                  setTouched((t) => ({ ...t, consent: true }));
                  if (v === 'true') setErrors(({ consent, ...rest }) => rest);
                }}
                aria-invalid={!!err('consent')}
                aria-describedby={err('consent') ? 'e-consent' : undefined}
              />
              <span>Sipariş bilgilerimin, siparişimin hazırlanması amacıyla WhatsApp üzerinden VEYRA TİCARET’e iletilmesini onaylıyorum.</span>
            </label>
            {err('consent') && (
              <p class="field__error" id="e-consent" role="alert">
                <Icon name="info" />
                {err('consent')}
              </p>
            )}
          </div>
          <button type="submit" class="btn btn--block order-form__submit">
            <Icon name="whatsapp" /> Siparişi WhatsApp ile Gönder
          </button>
          <p class="order-form__fine">
            <Icon name="lock" /> Bu sitede ödeme alınmaz ve kart bilgisi istenmez. Ödeme, sipariş onayından sonra {brand.payment.label} ile yapılır.
          </p>
        </form>
      </section>
    </div>
  );
}
