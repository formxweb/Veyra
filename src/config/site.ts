/**
 * Single source of truth for brand & business facts.
 * Everything here was supplied by VEYRA TİCARET. Do not add facts
 * (prices, IBAN, delivery times, guarantees) that were not confirmed.
 */
export const brand = {
  name: 'VEYRA',
  legalName: 'VEYRA TİCARET',
  tagline: 'Özenle seçilir. Güvenle ulaşır.',
  description:
    'VEYRA TİCARET — özenle seçilmiş ürünler, WhatsApp üzerinden kişisel sipariş deneyimi ve Türkiye’nin 81 iline kargo.',
  location: {
    city: 'Mardin',
    district: 'Nusaybin',
    label: 'Nusaybin',
  },
  shipping: {
    coverage: 81,
    label: 'Türkiye’nin 81 iline kargo',
  },
  payment: {
    methods: ['EFT', 'Havale'] as const,
    label: 'EFT / Havale',
    /** IBAN is intentionally not published; it is shared after order confirmation. */
    note: 'IBAN bilgileri, sipariş onayından sonra WhatsApp üzerinden iletilir.',
  },
  whatsapp: {
    display: '0546 722 54 90',
    /** E.164 without the plus sign, as wa.me expects. */
    e164: '905467225490',
    tel: '+905467225490',
  },
  marketplaces: {
    gardrops: 'https://www.gardrops.com/veyraticaret',
  },
  locale: 'tr-TR',
  currency: 'TRY',
} as const;

export const navigation = [
  { href: '/magaza', label: 'Mağaza' },
  { href: '/#koleksiyonlar', label: 'Koleksiyonlar' },
  { href: '/#hikaye', label: 'Hakkımızda' },
  { href: '/yardim', label: 'Sipariş & Kargo' },
  { href: '/iletisim', label: 'İletişim' },
] as const;
