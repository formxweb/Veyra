import { brand } from '../config/site';
import { formatPrice } from './format';

export function waLink(text?: string): string {
  const base = `https://wa.me/${brand.whatsapp.e164}`;
  return text ? `${base}?text=${encodeURIComponent(text)}` : base;
}

export function productInquiry(p: { name: string; price: number | null; id: string }, qty = 1, url?: string): string {
  return [
    'Merhaba VEYRA, bu ürünü sipariş etmek istiyorum:',
    '',
    `• ${p.name}`,
    `  Ürün kodu: ${p.id.toUpperCase()}`,
    `  Adet: ${qty}`,
    `  Fiyat: ${formatPrice(p.price)}${qty > 1 && p.price != null ? ` × ${qty} = ${formatPrice(p.price * qty)}` : ''}`,
    url ? `  ${url}` : '',
    '',
    'Stok ve kargo bilgisini paylaşabilir misiniz?',
  ]
    .filter((l, i, a) => !(l === '' && a[i - 1] === ''))
    .join('\n');
}

export interface OrderLine {
  id: string;
  name: string;
  qty: number;
  price: number | null;
}

export interface OrderCustomer {
  name: string;
  phone: string;
  city: string;
  district: string;
  address: string;
  note?: string;
}

export function orderMessage(ref: string, lines: OrderLine[], customer: OrderCustomer): string {
  const priced = lines.filter((l) => l.price != null);
  const subtotal = priced.reduce((s, l) => s + (l.price as number) * l.qty, 0);
  const unpriced = lines.length - priced.length;
  const out = [
    'Merhaba VEYRA, web sitesinden sipariş talebi oluşturdum.',
    '',
    `Sipariş referansı: ${ref}`,
    '',
    'Ürünler:',
    ...lines.map(
      (l) =>
        `• ${l.name} (${l.id.toUpperCase()}) — ${l.qty} adet × ${formatPrice(l.price)}${l.price != null ? ` = ${formatPrice(l.price * l.qty)}` : ''}`,
    ),
    '',
    `Ara toplam: ${formatPrice(subtotal)}${unpriced ? ` (+ fiyatı teyit edilecek ${unpriced} ürün)` : ''}`,
    'Kargo: sipariş onayında bildirilecek',
    `Ödeme: ${brand.payment.label}`,
    '',
    'Teslimat bilgileri:',
    `Ad Soyad: ${customer.name}`,
    `Telefon: ${customer.phone}`,
    `İl / İlçe: ${customer.city} / ${customer.district}`,
    `Adres: ${customer.address}`,
  ];
  if (customer.note?.trim()) out.push(`Not: ${customer.note.trim()}`);
  out.push('', 'Sipariş onayı ve IBAN bilgisi için dönüşünüzü bekliyorum.');
  return out.join('\n');
}

export function makeOrderRef(d = new Date()): string {
  const p = (n: number) => String(n).padStart(2, '0');
  const rnd = Math.floor(1000 + Math.random() * 9000);
  return `VR-${String(d.getFullYear()).slice(2)}${p(d.getMonth() + 1)}${p(d.getDate())}-${rnd}`;
}
