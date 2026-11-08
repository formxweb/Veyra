# Katalog durumu ve eksik bilgiler

> Bu dosya `npm run catalog:report` ile `src/data/products.json` dosyasından üretilir. Elle düzenlemeyin.

## Kaynak

Ürünler, mağaza sahibinin paylaştığı **Gardrops mağaza ekran görüntülerinden** aktarıldı
(gardrops.com/veyraticaret). Gardrops sayfaları otomatik erişime kapalı olduğu (Cloudflare doğrulaması)
için hiçbir koruma aşılmadı; veri yalnızca bu ekran görüntülerinden okundu.

- Mağazadaki ilan sayısı: **79**
- Ekran görüntülerinde görünen ilan: **75** → 4 ilan görüntülerde yoktu ve aktarılamadı.
- Birebir aynı fotoğraf ve aynı fiyatla iki kez listelenen ilanlar tek ürün olarak birleştirildi.
- Sitede: **68 ürün yayında**, 1 ürün gizli.

### Doğrulanmış (ekran görüntüsünden okunan) bilgiler
Fiyat · ilandaki marka etiketi · “Yeni & Etiketli” durumu · ilan fotoğrafı.

### Doğrulanmamış / eksik bilgiler
- **Ürün başlıkları:** Gardrops ızgarası başlık göstermediği için isimler fotoğraftan tanımlanarak *betimleyici* yazıldı.
  Tek istisna VR-001: başlığı ilan bağlantısından alındı. Gerçek başlıklar gelince `name` alanı değiştirilmeli.
- **Açıklamalar:** Hiçbir ürün için yok. Ürün sayfasında açıklama yerine “WhatsApp’tan sorun” yönlendirmesi gösteriliyor.
- **Fotoğraflar:** Ekran görüntülerinden kırpılan ~110×140 px kareler, 220×282 px ara görsel olarak kullanılıyor. Sitede
  paspartu (çerçeve) içinde ve dosya boyutunun en fazla 1,6 katına kadar büyütülerek gösteriliyor; yine de yumuşak görünürler.
  Orijinal fotoğraflar `src/assets/products/` klasörüne konduğunda otomatik olarak optimize edilir.
- **Stok adedi:** Bilinmiyor. İlanlar ekran görüntüsü anında aktifti; sitede “Satışta” ve “stok sipariş onayında teyit edilir” yazıyor.
- **“Kargo Bedava”:** Gardrops ilanlarında görünüyor ancak web sitesi siparişleri için teyit edilmediğinden sitede kullanılmadı.

## Ürün tablosu

| Kod | Gardrops sırası | Durum | Sitedeki ad | Marka (ilandaki) | Fiyat | Gereken | Not |
|---|---|---|---|---|---|---|---|
| VR-001 | #1, #47 | Yayında | Dyson Co-anda 2x — Şıklık ve Güç Bir Arada | Dyson | 9.000 ₺ | açıklama, orijinal fotoğraf |  |
| VR-002 | #2 | Yayında | Katlanabilir Kameralı Drone | Diğer | 7.500 ₺ | gerçek başlık, açıklama, orijinal fotoğraf |  |
| VR-003 | #3 | Yayında | Retro Su Isıtıcı ve Bıçak Bloğu — Siyah | Diğer | 8.000 ₺ | gerçek başlık, açıklama, orijinal fotoğraf | #6 ile aynı fotoğraf, farklı fiyat (8.000 / 16.000 ₺). Hangisinin set olduğu teyit edilmeli. |
| VR-004 | #4 | Yayında | Xiaomi İstasyonlu Robot Süpürge | Xiaomi | 18.500 ₺ | gerçek başlık, açıklama, orijinal fotoğraf |  |
| VR-005 | #5 | Yayında | Dyson Saç Şekillendirme Seti — Mavi & Bakır | Dyson | 8.000 ₺ | gerçek başlık, açıklama, orijinal fotoğraf |  |
| VR-006 | #6 | Yayında | Retro Mutfak Seti — Siyah | Diğer | 16.000 ₺ | gerçek başlık, açıklama, orijinal fotoğraf | #3 ile aynı fotoğraf, farklı fiyat (8.000 / 16.000 ₺). |
| VR-007 | #7 | Yayında | Dyson Saç Şekillendirme Seti — Pembe | Dyson | 8.000 ₺ | gerçek başlık, açıklama, orijinal fotoğraf |  |
| VR-008 | #8 | Yayında | Taraftar Serisi Termos Bardak — Transit | Diğer | 1.500 ₺ | gerçek başlık, açıklama, orijinal fotoğraf |  |
| VR-009 | #9, #16 | Yayında | Dyson Saç Şekillendirici — Renk Seçenekli | Dyson | 5.500 ₺ | gerçek başlık, açıklama, orijinal fotoğraf | İki ilanda marka “Dyson” ve “Dyson / diğer” olarak girilmiş. |
| VR-010 | #10 | Gizli | Dyson — Kutulu Ürün | Dyson | 5.500 ₺ | gerçek başlık, açıklama, orijinal fotoğraf | Fotoğrafta yalnızca koliler görünüyor; ürün tanımlanamadı. Başlık ve fotoğraf gelene kadar yayında gizli. |
| VR-011 | #11 | Yayında | Bosch Türk Kahvesi Makinesi | Bosch | 2.500 ₺ | gerçek başlık, açıklama, orijinal fotoğraf |  |
| VR-012 | #12, #41 | Yayında | Dyson Wi-Fi Hava Temizleyici Fan | Dyson | 16.000 ₺ | gerçek başlık, açıklama, orijinal fotoğraf |  |
| VR-013 | #13 | Yayında | Klasik Termos Matara — Yeşil | Diğer | 2.500 ₺ | gerçek başlık, açıklama, orijinal fotoğraf |  |
| VR-014 | #14 | Yayında | Ultra HD Projeksiyon Cihazı | Diğer | 4.000 ₺ | gerçek başlık, açıklama, orijinal fotoğraf |  |
| VR-015 | #15 | Yayında | Taraftar Serisi Termos — Takım Renkleri | Diğer | 1.500 ₺ | gerçek başlık, açıklama, orijinal fotoğraf | #63 ile aynı fotoğraf, farklı fiyat (1.500 / 1.700 ₺). |
| VR-017 | #17 | Yayında | Philips IPL Epilasyon Cihazı | Philips | 8.500 ₺ | gerçek başlık, açıklama, orijinal fotoğraf |  |
| VR-018 | #18 | Yayında | Dyson V15s Detect Submarine Kablosuz Süpürge | Dyson | 19.500 ₺ | gerçek başlık, açıklama, orijinal fotoğraf |  |
| VR-019 | #19 | Yayında | Saplı Termos Bardak — Pastel Tonlar | Diğer | 1.300 ₺ | gerçek başlık, açıklama, orijinal fotoğraf |  |
| VR-020 | #20 | Yayında | Ekranlı Kumandalı Drone Seti | Diğer | 7.000 ₺ | gerçek başlık, açıklama, orijinal fotoğraf |  |
| VR-021 | #21 | Yayında | Saplı Termos Bardak — Renk Seçenekli | Diğer | 1.300 ₺ | gerçek başlık, açıklama, orijinal fotoğraf |  |
| VR-022 | #22 | Yayında | Stand Mikser — Lila & Kırmızı | Diğer | 7.500 ₺ | gerçek başlık, açıklama, orijinal fotoğraf |  |
| VR-023 | #23 | Yayında | Dyson Saç Şekillendirme Seti | Dyson | 9.000 ₺ | gerçek başlık, açıklama, orijinal fotoğraf |  |
| VR-024 | #24 | Yayında | Dyson Saç Şekillendirme Seti — Kırmızı | Dyson | 8.000 ₺ | gerçek başlık, açıklama, orijinal fotoğraf |  |
| VR-025 | #25, #27 | Yayında | Retro Su Isıtıcı — Renk Seçenekli | Diğer | 8.000 ₺ | gerçek başlık, açıklama, orijinal fotoğraf |  |
| VR-026 | #26 | Yayında | Braun IPL Epilasyon Cihazı | Braun | 8.000 ₺ | gerçek başlık, açıklama, orijinal fotoğraf |  |
| VR-028 | #28 | Yayında | Retro Su Isıtıcı — Siyah | Diğer | 8.000 ₺ | gerçek başlık, açıklama, orijinal fotoğraf |  |
| VR-029 | #29 | Yayında | Saplı Termos Bardak — Pembe Çiçek Desenli | Diğer | 1.300 ₺ | gerçek başlık, açıklama, orijinal fotoğraf |  |
| VR-030 | #30 | Yayında | Dyson Saç Şekillendirici — Pembe | Dyson | 7.000 ₺ | gerçek başlık, açıklama, orijinal fotoğraf |  |
| VR-031 | #31 | Yayında | Xiaomi Robot Süpürge | Xiaomi | 16.000 ₺ | gerçek başlık, açıklama, orijinal fotoğraf |  |
| VR-032 | #32 | Yayında | G17 Pro Tablet — Klavyeli | Diğer | 7.300 ₺ | gerçek başlık, açıklama, orijinal fotoğraf |  |
| VR-033 | #33 | Yayında | Termos Bardak — Geniş Renk Seçeneği | Diğer | 1.300 ₺ | gerçek başlık, açıklama, orijinal fotoğraf |  |
| VR-034 | #34 | Yayında | Retro Bıçak Seti — Standlı | Diğer | 7.200 ₺ | gerçek başlık, açıklama, orijinal fotoğraf |  |
| VR-035 | #35 | Yayında | Dyson Saç Şekillendirme Seti — Kutulu | Dyson | 8.000 ₺ | gerçek başlık, açıklama, orijinal fotoğraf |  |
| VR-036 | #36 | Yayında | Philips IPL Epilasyon Cihazı — Pembe | Philips | 8.000 ₺ | gerçek başlık, açıklama, orijinal fotoğraf |  |
| VR-037 | #37 | Yayında | Retro Çaydanlık — Krem & Siyah | Diğer | 8.000 ₺ | gerçek başlık, açıklama, orijinal fotoğraf |  |
| VR-038 | #38 | Yayında | Dyson Saç Şekillendirme Seti — Mor Kutu | Dyson | 9.000 ₺ | gerçek başlık, açıklama, orijinal fotoğraf | İlanda “Yeni & Etiketli” rozeti görünmüyor; ürün durumu teyit edilmeli. |
| VR-039 | #39 | Yayında | Dyson Saç Düzleştirici — Mor & Bakır | Dyson | 6.000 ₺ | gerçek başlık, açıklama, orijinal fotoğraf |  |
| VR-040 | #40, #44 | Yayında | Dyson Saç Düzleştirici — Pembe Kutulu | Dyson | 6.200 ₺ | gerçek başlık, açıklama, orijinal fotoğraf |  |
| VR-042 | #42 | Yayında | Retro Su Isıtıcı — Krem & Mavi | Diğer | 8.000 ₺ | gerçek başlık, açıklama, orijinal fotoğraf |  |
| VR-043 | #43 | Yayında | Dyson Saç Düzleştirici — Renk Seçenekli | Dyson | 5.500 ₺ | gerçek başlık, açıklama, orijinal fotoğraf |  |
| VR-045 | #45 | Yayında | Philips IPL Epilasyon Seti | Philips | 8.000 ₺ | gerçek başlık, açıklama, orijinal fotoğraf |  |
| VR-046 | #46, #60 | Yayında | Dyson Saç Şekillendirme Seti — Taşıma Kutulu | Dyson | 8.000 ₺ | gerçek başlık, açıklama, orijinal fotoğraf |  |
| VR-048 | #48 | Yayında | Dyson Saç Kurutma Makinesi | Dyson | 6.500 ₺ | gerçek başlık, açıklama, orijinal fotoğraf |  |
| VR-049 | #49 | Yayında | Dyson Saç Şekillendirme Seti — Bordo Kutu | Dyson | 9.000 ₺ | gerçek başlık, açıklama, orijinal fotoğraf |  |
| VR-050 | #50 | Yayında | Saplı Termos Bardak — Sakura Desenli | Diğer | 1.300 ₺ | gerçek başlık, açıklama, orijinal fotoğraf |  |
| VR-051 | #51 | Yayında | Saplı Termos Bardak 1,16 L | Diğer | 1.707 ₺ | gerçek başlık, açıklama, orijinal fotoğraf |  |
| VR-052 | #52 | Yayında | Saplı Termos Matara — Renk Seçenekli | Diğer | 1.750 ₺ | gerçek başlık, açıklama, orijinal fotoğraf |  |
| VR-053 | #53 | Yayında | Saplı Termos Matara — Canlı Renkler | Diğer | 1.750 ₺ | gerçek başlık, açıklama, orijinal fotoğraf |  |
| VR-054 | #54 | Yayında | Saplı Termos Bardak — Karakter Desenli | Diğer | 1.800 ₺ | gerçek başlık, açıklama, orijinal fotoğraf |  |
| VR-055 | #55 | Yayında | Dyson V15 Detect Submarine Kablosuz Süpürge | Dyson | 20.000 ₺ | gerçek başlık, açıklama, orijinal fotoğraf |  |
| VR-056 | #56 | Yayında | Columbia Termos — Siyah & Yeşil | Columbia | 2.900 ₺ | gerçek başlık, açıklama, orijinal fotoğraf |  |
| VR-057 | #57 | Yayında | Columbia Termos | Columbia | 3.000 ₺ | gerçek başlık, açıklama, orijinal fotoğraf |  |
| VR-058 | #58 | Yayında | Dyson V15s Absolute Kablosuz Süpürge | Dyson | 15.000 ₺ | gerçek başlık, açıklama, orijinal fotoğraf |  |
| VR-059 | #59 | Yayında | Columbia Termos — Haki & Antrasit | Columbia | 3.500 ₺ | gerçek başlık, açıklama, orijinal fotoğraf |  |
| VR-061 | #61 | Yayında | Chanel Parfüm Seti — 4’lü | Chanel | 4.000 ₺ | gerçek başlık, açıklama, orijinal fotoğraf |  |
| VR-062 | #62 | Yayında | Kutulu Parfüm — Turkuaz Şişe | Diğer | 5.000 ₺ | gerçek başlık, açıklama, orijinal fotoğraf |  |
| VR-063 | #63 | Yayında | Taraftar Serisi Termos — Takım Renkleri | Diğer | 1.700 ₺ | gerçek başlık, açıklama, orijinal fotoğraf | #15 ile aynı fotoğraf, farklı fiyat (1.500 / 1.700 ₺). |
| VR-064 | #64 | Yayında | Versace Kol Saati — Model Seçenekli | Versace | 6.000 ₺ | gerçek başlık, açıklama, orijinal fotoğraf |  |
| VR-065 | #65 | Yayında | Termos Şişe — Siyah | Diğer | 1.500 ₺ | gerçek başlık, açıklama, orijinal fotoğraf |  |
| VR-066 | #66 | Yayında | Klasik Termos Seti — Yeşil | Diğer | 3.000 ₺ | gerçek başlık, açıklama, orijinal fotoğraf |  |
| VR-067 | #67 | Yayında | Dyson Saç Düzleştirici — Kutulu | Dyson | 7.000 ₺ | gerçek başlık, açıklama, orijinal fotoğraf |  |
| VR-068 | #68 | Yayında | Dyson Saç Şekillendirme Seti — Gül Kurusu | Dyson | 8.000 ₺ | gerçek başlık, açıklama, orijinal fotoğraf |  |
| VR-069 | #69 | Yayında | Versace Kol Saati — Yeşil Kadran | Versace | 6.000 ₺ | gerçek başlık, açıklama, orijinal fotoğraf |  |
| VR-070 | #70 | Yayında | Dyson Saç Düzleştirici — 4 Renk | Dyson | 7.000 ₺ | gerçek başlık, açıklama, orijinal fotoğraf |  |
| VR-071 | #71 | Yayında | Braun IPL Epilasyon Cihazı — Çantalı | Braun | 7.000 ₺ | gerçek başlık, açıklama, orijinal fotoğraf |  |
| VR-072 | #72 | Yayında | Versace Kadın Kol Saati | Versace | 6.500 ₺ | gerçek başlık, açıklama, orijinal fotoğraf |  |
| VR-073 | #73 | Yayında | Versace Kadın Kol Saati — Altın Ton | Versace | 6.500 ₺ | gerçek başlık, açıklama, orijinal fotoğraf |  |
| VR-074 | #74 | Yayında | Versace Erkek Kol Saati — Çelik | Versace | 6.000 ₺ | gerçek başlık, açıklama, orijinal fotoğraf |  |
| VR-075 | #75 | Yayında | Dyson Saç Şekillendirme Seti — Lacivert Kutu | Dyson | 9.000 ₺ | gerçek başlık, açıklama, orijinal fotoğraf |  |
