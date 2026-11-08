import { useState } from 'preact/hooks';
import { formatPhoneTR, rules, validate } from '../lib/validation';
import { waLink } from '../lib/whatsapp';
import { Icon } from './shared';

const TOPICS = ['Ürün bilgisi', 'Stok sorusu', 'Sipariş durumu', 'Kargo', 'Diğer'];
type V = { name: string; phone: string; topic: string; message: string };
const schema = {
  name: [rules.required('Adınız')],
  phone: [(v: string) => (v.trim() ? rules.phoneTR()(v) : null)],
  topic: [rules.required('Konu')],
  message: [rules.minLength(10, 'Size doğru yanıt verebilmemiz için mesajınızı biraz daha açın (en az 10 karakter).')],
};

export default function ContactForm() {
  const [v, setV] = useState<V>({ name: '', phone: '', topic: TOPICS[0], message: '' });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [done, setDone] = useState<string | null>(null);

  const check = (k: keyof V, next = v) => {
    const e = validate(next, { [k]: schema[k] });
    setErrors((p) => {
      const c = { ...p };
      if (e[k]) c[k] = e[k];
      else delete c[k];
      return c;
    });
  };
  const set = (k: keyof V, val: string) => {
    const next = { ...v, [k]: val };
    setV(next);
    if (errors[k]) check(k, next);
  };

  const submit = (e: Event) => {
    e.preventDefault();
    const errs = validate(v, schema);
    setErrors(errs);
    const first = Object.keys(schema).find((k) => errs[k]);
    if (first) {
      document.getElementById(`c-${first}`)?.focus();
      return;
    }
    const text = [
      `Merhaba VEYRA, ben ${v.name.trim()}.`,
      `Konu: ${v.topic}`,
      '',
      v.message.trim(),
      v.phone.trim() ? `\nTelefon: ${v.phone.trim()}` : '',
    ].join('\n');
    const url = waLink(text);
    setDone(url);
    window.open(url, '_blank', 'noopener');
  };

  if (done) {
    return (
      <div class="sent sent--compact">
        <span class="empty__mark">
          <Icon name="check" />
        </span>
        <h2 class="sent__title">Mesajınız hazır.</h2>
        <p class="lede">WhatsApp’ta açılan mesajı göndererek bize ulaşın.</p>
        <div class="cluster" style="justify-content:center">
          <a class="btn" href={done} target="_blank" rel="noopener">
            <Icon name="whatsapp" /> WhatsApp’ı Tekrar Aç
          </a>
          <button type="button" class="btn btn--outline" onClick={() => setDone(null)}>
            Mesajı Düzenle
          </button>
        </div>
      </div>
    );
  }

  const F = (k: keyof V) => ({
    id: `c-${k}`,
    name: k,
    'aria-invalid': !!errors[k],
    'aria-describedby': errors[k] ? `ce-${k}` : undefined,
    onBlur: () => check(k),
  });
  const Err = ({ k }: { k: keyof V }) =>
    errors[k] ? (
      <p class="field__error" id={`ce-${k}`} role="alert">
        <Icon name="info" />
        {errors[k]}
      </p>
    ) : null;

  return (
    <form class="order-form" noValidate onSubmit={submit}>
      <div class="order-form__row">
        <div class="field" data-invalid={errors.name ? '' : undefined}>
          <label class="field__label" for="c-name">
            Adınız
          </label>
          <input class="field__control" autoComplete="name" value={v.name} onInput={(e) => set('name', (e.target as HTMLInputElement).value)} {...F('name')} />
          <Err k="name" />
        </div>
        <div class="field" data-invalid={errors.phone ? '' : undefined}>
          <label class="field__label" for="c-phone">
            Telefon <span class="opt">(isteğe bağlı)</span>
          </label>
          <input
            class="field__control"
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            placeholder="05XX XXX XX XX"
            value={v.phone}
            onInput={(e) => set('phone', formatPhoneTR((e.target as HTMLInputElement).value))}
            {...F('phone')}
          />
          <Err k="phone" />
        </div>
      </div>
      <div class="field" data-invalid={errors.topic ? '' : undefined}>
        <label class="field__label" for="c-topic">
          Konu
        </label>
        <select class="field__control" value={v.topic} onChange={(e) => set('topic', (e.target as HTMLSelectElement).value)} {...F('topic')}>
          {TOPICS.map((t) => (
            <option key={t}>{t}</option>
          ))}
        </select>
        <Err k="topic" />
      </div>
      <div class="field" data-invalid={errors.message ? '' : undefined}>
        <label class="field__label" for="c-message">
          Mesajınız
        </label>
        <textarea class="field__control" rows={5} value={v.message} onInput={(e) => set('message', (e.target as HTMLTextAreaElement).value)} {...F('message')} />
        <Err k="message" />
      </div>
      <button type="submit" class="btn btn--block">
        <Icon name="whatsapp" /> WhatsApp ile Gönder
      </button>
    </form>
  );
}
