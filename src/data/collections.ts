/**
 * Editorial collections. Each maps 1:1 to a product category in
 * products.json. Copy describes what is actually in the category —
 * no invented claims.
 */
export interface Collection {
  id: string;
  slug: string;
  title: string;
  /** Short category label used on cards & filters. */
  label: string;
  kicker: string;
  intro: string;
}

export const collections: Collection[] = [
  {
    id: 'sac-bakim',
    slug: 'sac-ritueli',
    title: 'Saç Ritüeli',
    label: 'Saç Bakım',
    kicker: 'Şekillendirme · Düzleştirme · Kurutma',
    intro:
      'Şekillendirme setleri, saç düzleştiriciler ve kurutma makineleri. Salon sonucunu evin sakinliğine taşıyan araçlar, tek bir seçkide.',
  },
  {
    id: 'termos',
    slug: 'termos-ve-bardak',
    title: 'Termos & Bardak',
    label: 'Termos',
    kicker: 'Saplı bardaklar · Mataralar · Taraftar serileri',
    intro:
      'Gün boyu yanınızda: saplı termos bardaklar, klasik mataralar ve takım renklerinde taraftar serileri. Renk seçenekleriyle.',
  },
  {
    id: 'mutfak',
    slug: 'mutfak-klasikleri',
    title: 'Mutfak Klasikleri',
    label: 'Mutfak',
    kicker: 'Retro formlar · Gündelik ritüeller',
    intro:
      'Retro su ısıtıcılar, standlı bıçak setleri, stand mikserler ve Türk kahvesi makinesi. Tezgâhta göz önünde durmak için tasarlanmış parçalar.',
  },
  {
    id: 'saat-parfum',
    slug: 'saat-ve-parfum',
    title: 'Saat & Parfüm',
    label: 'Saat & Parfüm',
    kicker: 'Son dokunuş',
    intro: 'Kol saatleri ve parfüm setleri. Bir görünümü tamamlayan, hediye için de doğru seçimler.',
  },
  {
    id: 'ev-teknolojisi',
    slug: 'ev-teknolojisi',
    title: 'Ev Teknolojisi',
    label: 'Ev Teknolojisi',
    kicker: 'Süpürge · Robot süpürge · Hava temizleme',
    intro:
      'Kablosuz ve robot süpürgeler, Wi-Fi bağlantılı hava temizleyici. Evi sessizce düzende tutan teknoloji.',
  },
  {
    id: 'kisisel-bakim',
    slug: 'kisisel-bakim',
    title: 'Kişisel Bakım',
    label: 'Kişisel Bakım',
    kicker: 'IPL epilasyon',
    intro: 'Evde kullanım için IPL epilasyon cihazları ve setleri. Kendinize ayırdığınız zaman için.',
  },
  {
    id: 'elektronik',
    slug: 'elektronik-ve-hobi',
    title: 'Elektronik & Hobi',
    label: 'Elektronik',
    kicker: 'Drone · Tablet · Projeksiyon',
    intro: 'Kameralı drone setleri, klavyeli tablet ve projeksiyon cihazı. Hem iş hem keyif için.',
  },
];

export const collectionById = new Map(collections.map((c) => [c.id, c]));
export const collectionBySlug = new Map(collections.map((c) => [c.slug, c]));
