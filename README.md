# VEYRA TİCARET — Dijital Mağaza

Özenle seçilir. Güvenle ulaşır.

VEYRA TİCARET’in kendi markası altında çalışan, statik olarak derlenen e-ticaret sitesi. Sipariş akışı
WhatsApp üzerinden ilerler, ödeme EFT / Havale ile alınır; sitede kart bilgisi istenmez.

- **Teknoloji:** [Astro 7](https://astro.build) (statik çıktı) + Preact adaları + nanostores
- **Yazı tipleri:** Fraunces (başlık) ve Hanken Grotesk (metin), kendi sunucunuzdan servis edilir, Türkçe karakter destekli
- **Görseller:** Astro görsel boru hattı ile AVIF/WebP, duyarlı `srcset`
- **Testler:** Playwright uçtan uca testler (masaüstü + mobil)

## Komutlar

| Komut | Ne yapar |
| --- | --- |
| `npm install` | Bağımlılıkları kurar |
| `npm run dev` | Geliştirme sunucusu (`http://localhost:4321`) |
| `npm run build` | Katalog kontrolü + üretim derlemesi (`dist/`) |
| `npm run preview` | Derlenmiş siteyi yerelde açar |
| `npm run test:e2e` | Uçtan uca testler (önce `npm run build`) |
| `npm run catalog:check` | Katalogda eksik/hatalı veriyi raporlar |
| `npm run catalog:report` | `docs/KATALOG.md` kontrol listesini yeniden üretir |
| `npm run photos:import -- <klasör>` | Orijinal ürün fotoğraflarını içe aktarır (aşağıya bakın) |
| `npm run og` | Sosyal medya paylaşım görselini ürün fotoğraflarından yeniden üretir |

## Yayına alma

Site Vercel’de yayında (`veyra` projesi, https://veyra-sooty.vercel.app). Depoya gönderilen her değişiklik otomatik olarak
yeniden yayınlanır. `dist/` klasörü başka bir statik barındırmada da (Netlify, Cloudflare Pages, cPanel vb.) çalışır.
Alan adını derleme sırasında verin; kanonik adresler, Open Graph görselleri ve site haritası buna göre oluşur:

```bash
SITE_URL=https://www.alanadiniz.com npm run build
```

`SITE_URL` verilmezse site yine çalışır, yalnızca mutlak adres gerektiren özellikler (canonical, og:image, sitemap) atlanır.
Hiçbir alan adı tahmin edilmez.

## Proje yapısı

```
src/
  config/site.ts          Marka bilgileri (WhatsApp, konum, ödeme, kargo) — tek kaynak
  data/products.json      Canlı katalog
  data/collections.ts     Koleksiyonlar (editoryal başlık, açıklama, kapak görseli)
  data/catalog.ts         Derleme anında katalog erişimi ve görsel çözümleme
  assets/products/        Ürün fotoğrafları
  assets/og/              Sosyal medya paylaşım görseli
  components/             Astro bileşenleri (header, footer, ana sayfa bölümleri)
  islands/                Etkileşimli Preact bileşenleri (sepet, arama, katalog, galeri, formlar)
  stores/                 Sepet / favori / arayüz durumu (localStorage’da saklanır)
  styles/                 Tasarım token’ları ve bileşen stilleri
  pages/                  Sayfalar (/, /magaza, /koleksiyon/*, /urun/*, /sepet, /favoriler, /iletisim, /yardim)
scripts/                  Katalog kontrolü, rapor, fotoğraf içe aktarımı, paylaşım görseli, Gardrops ekran görüntüsü içe aktarımı
tests/                    Playwright testleri
docs/KATALOG.md           Ürün bazında eksik bilgi listesi
```

## Ürün ekleme ve güncelleme

Her ürün `src/data/products.json` içinde bir kayıttır:

```jsonc
{
  "id": "vr-001",                 // benzersiz kod; sitede "VR-001" olarak görünür
  "slug": "dyson-co-anda-2x-...", // ürün adresi: /urun/<slug>
  "name": "Dyson Co-anda 2x — Şıklık ve Güç Bir Arada",
  "brand": "Dyson",               // yoksa null
  "category": "sac-bakim",        // collections.ts içindeki id'lerden biri
  "price": 9000,                  // TL, tam sayı; bilinmiyorsa null → "Fiyat sorunuz"
  "condition": "Yeni & Etiketli",
  "availability": "listed",       // listed | in_stock | sold_out | on_request
  "description": null,            // metin eklendiğinde ürün sayfasında görünür
  "features": [],                 // madde madde özellikler
  "images": [{ "file": "vr-001-1.jpg", "alt": "…" }],
  "featured": 1,                  // ana sayfa vitrin sırası; vitrinde değilse null
  "hidden": false                 // true → yayından kaldırır
}
```

**Fotoğraf eklemek:** Fotoğrafları bir klasöre ürün koduyla adlandırarak koyun (`vr-001.jpg` ana görsel, `vr-001-2.jpg`
ikinci görsel …) ve çalıştırın:

```bash
npm run photos:import -- ./fotograflar
```

Betik fotoğrafları döndürür, en fazla 2000 px’e küçültür, ara (düşük çözünürlüklü) görselleri siler ve `products.json`’u
günceller. Orijinal fotoğrafı olan ürünlerde kartlar ve galeri otomatik olarak çerçevesiz, tam boy gösterime geçer; birden
fazla fotoğraf varsa galeri ok, küçük görsel ve kaydırma kazanır.

**Tükenen ürün:** `"availability": "sold_out"` → kartta ve ürün sayfasında sepete ekleme kapanır.

## Veri dürüstlüğü

Site, doğrulanmamış bilgi göstermemek üzere kurulmuştur:

- Ürün verileri Gardrops mağaza ekran görüntülerinden aktarıldı. Okunamayan bilgiler (gerçek başlık, açıklama, orijinal
  fotoğraf, stok adedi) uydurulmadı; ayrıntılı liste için **[docs/KATALOG.md](docs/KATALOG.md)**.
- Kargo ücreti, teslim süresi, IBAN, garanti veya “orijinal ürün” gibi teyit edilmemiş ifadeler sitede yer almaz.
  Bunlar onaylandığında `src/config/site.ts` üzerinden eklenebilir.
- Sitede stok fotoğraf veya üçüncü taraf görseli kullanılmaz; tüm görseller mağazanın kendi ürün fotoğraflarıdır.

## Henüz eksik olanlar (mağaza sahibinden gerekenler)

1. Ürünlerin **gerçek başlıkları ve açıklamaları**
2. Ürünlerin **orijinal, yüksek çözünürlüklü fotoğrafları**
3. Ekran görüntülerinde yer almayan **4 ilan**
4. Web sitesi siparişlerinde **kargo ücreti** (Gardrops’taki “Kargo Bedava” sitede de geçerli mi?)
5. **Alan adı** (`SITE_URL`)
6. Yasal metinler için şirket bilgileri (ticari unvan, vergi no, açık adres): **KVKK aydınlatma metni** ve
   **mesafeli satış sözleşmesi** sayfaları bu bilgiler olmadan yazılmadı.
