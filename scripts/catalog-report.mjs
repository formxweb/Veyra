// Writes docs/KATALOG.md — the owner's checklist of what each product still needs.
import { readFile, writeFile } from 'node:fs/promises';

const data = JSON.parse(await readFile(new URL('../src/data/products.json', import.meta.url), 'utf8'));
const tl = (n) => (n == null ? '—' : `${new Intl.NumberFormat('tr-TR').format(n)} ₺`);
const rows = data.products.map((p) => {
  const pos = p.source?.listingPositions?.map((x) => `#${x}`).join(', ') ?? '';
  const status = p.hidden ? 'Gizli' : 'Yayında';
  const need = [
    p.review.includes('name') ? 'gerçek başlık' : null,
    !p.description ? 'açıklama' : null,
    p.images.some((i) => i.quality === 'interim-lowres') ? 'orijinal fotoğraf' : null,
  ]
    .filter(Boolean)
    .join(', ');
  return `| ${p.id.toUpperCase()} | ${pos} | ${status} | ${p.name.replace(/\|/g, '/')} | ${p.brand ?? 'Diğer'} | ${tl(p.price)} | ${need} | ${p.reviewNote ?? ''} |`;
});

const md = `# Katalog durumu ve eksik bilgiler

> Bu dosya \`npm run catalog:report\` ile \`src/data/products.json\` dosyasından üretilir. Elle düzenlemeyin.

## Kaynak

Ürünler, mağaza sahibinin paylaştığı **Gardrops mağaza ekran görüntülerinden** aktarıldı
(gardrops.com/veyraticaret). Gardrops sayfaları otomatik erişime kapalı olduğu (Cloudflare doğrulaması)
için hiçbir koruma aşılmadı; veri yalnızca bu ekran görüntülerinden okundu.

- Mağazadaki ilan sayısı: **${data.storeListingCount}**
- Ekran görüntülerinde görünen ilan: **${data.visibleListingCount}** → ${data.storeListingCount - data.visibleListingCount} ilan görüntülerde yoktu ve aktarılamadı.
- Birebir aynı fotoğraf ve aynı fiyatla iki kez listelenen ilanlar tek ürün olarak birleştirildi.
- Sitede: **${data.products.filter((p) => !p.hidden).length} ürün yayında**, ${data.products.filter((p) => p.hidden).length} ürün gizli.

### Doğrulanmış (ekran görüntüsünden okunan) bilgiler
Fiyat · ilandaki marka etiketi · “Yeni & Etiketli” durumu · ilan fotoğrafı.

### Doğrulanmamış / eksik bilgiler
- **Ürün başlıkları:** Gardrops ızgarası başlık göstermediği için isimler fotoğraftan tanımlanarak *betimleyici* yazıldı.
  Tek istisna VR-001: başlığı ilan bağlantısından alındı. Gerçek başlıklar gelince \`name\` alanı değiştirilmeli.
- **Açıklamalar:** Hiçbir ürün için yok. Ürün sayfasında açıklama yerine “WhatsApp’tan sorun” yönlendirmesi gösteriliyor.
- **Fotoğraflar:** Ekran görüntülerinden kırpılan ~110×140 px kareler, 220×282 px ara görsel olarak kullanılıyor. Sitede
  paspartu (çerçeve) içinde ve dosya boyutunun en fazla 1,6 katına kadar büyütülerek gösteriliyor; yine de yumuşak görünürler.
  Orijinal fotoğraflar \`src/assets/products/\` klasörüne konduğunda otomatik olarak optimize edilir.
- **Stok adedi:** Bilinmiyor. İlanlar ekran görüntüsü anında aktifti; sitede “Satışta” ve “stok sipariş onayında teyit edilir” yazıyor.
- **“Kargo Bedava”:** Gardrops ilanlarında görünüyor ancak web sitesi siparişleri için teyit edilmediğinden sitede kullanılmadı.

## Ürün tablosu

| Kod | Gardrops sırası | Durum | Sitedeki ad | Marka (ilandaki) | Fiyat | Gereken | Not |
|---|---|---|---|---|---|---|---|
${rows.join('\n')}
`;
await writeFile(new URL('../docs/KATALOG.md', import.meta.url), md);
console.log('docs/KATALOG.md yazıldı');
