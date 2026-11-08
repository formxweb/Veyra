"""
One-off importer: builds src/data/products.json from the Gardrops store
screenshots the owner shared (79 listings in store, 75 visible).

Only what is visible in the screenshots is recorded as fact:
price, brand label as listed, condition badge. Product *titles* are not
shown in Gardrops' grid, so names are descriptive (identified from the
listing photo) and flagged for owner review. Nothing else is invented.

Usage: python3 scripts/import/gardrops-screenshots.py <crops_dir>

WARNING: re-running OVERWRITES src/data/products.json. After the catalog has
been edited by hand, edit products.json directly instead of re-running this.
"""
import json, sys, os, re, unicodedata
from PIL import Image, ImageFilter

CROPS = sys.argv[1]
ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
IMG_OUT = os.path.join(ROOT, 'src', 'assets', 'products')
os.makedirs(IMG_OUT, exist_ok=True)

DYSON_URL = 'https://www.gardrops.com/dyson-co-anda-2x-siklik-ve-guc-bir-arada-6cc5df0c3b73c932-p-79259481-9056996'

# (positions, price, brand-as-listed, descriptive name, category, extra)
T = [
 ([1, 47], 9000, 'Dyson', 'Dyson Co-anda 2x — Şıklık ve Güç Bir Arada', 'sac-bakim', {'nameSource': 'gardrops-url', 'url': DYSON_URL, 'featured': 1}),
 ([2], 7500, None, 'Katlanabilir Kameralı Drone', 'elektronik', {}),
 ([3], 8000, None, 'Retro Su Isıtıcı ve Bıçak Bloğu — Siyah', 'mutfak', {'note': '#6 ile aynı fotoğraf, farklı fiyat (8.000 / 16.000 ₺). Hangisinin set olduğu teyit edilmeli.'}),
 ([4], 18500, 'Xiaomi', 'Xiaomi İstasyonlu Robot Süpürge', 'ev-teknolojisi', {}),
 ([5], 8000, 'Dyson', 'Dyson Saç Şekillendirme Seti — Mavi & Bakır', 'sac-bakim', {}),
 ([6], 16000, None, 'Retro Mutfak Seti — Siyah', 'mutfak', {'note': '#3 ile aynı fotoğraf, farklı fiyat (8.000 / 16.000 ₺).'}),
 ([7], 8000, 'Dyson', 'Dyson Saç Şekillendirme Seti — Pembe', 'sac-bakim', {}),
 ([8], 1500, None, 'Taraftar Serisi Termos Bardak — Transit', 'termos', {}),
 ([9, 16], 5500, 'Dyson', 'Dyson Saç Şekillendirici — Renk Seçenekli', 'sac-bakim', {'note': 'İki ilanda marka “Dyson” ve “Dyson / diğer” olarak girilmiş.'}),
 ([10], 5500, 'Dyson', 'Dyson — Kutulu Ürün', 'sac-bakim', {'hidden': True, 'note': 'Fotoğrafta yalnızca koliler görünüyor; ürün tanımlanamadı. Başlık ve fotoğraf gelene kadar yayında gizli.'}),
 ([11], 2500, 'Bosch', 'Bosch Türk Kahvesi Makinesi', 'mutfak', {}),
 ([12, 41], 16000, 'Dyson', 'Dyson Wi-Fi Hava Temizleyici Fan', 'ev-teknolojisi', {'features': ['Akıllı kontrol', 'Wi-Fi bağlantısı'], 'featuresSource': 'Satıcının ilan görselindeki ibare', 'featured': 3}),
 ([13], 2500, None, 'Klasik Termos Matara — Yeşil', 'termos', {}),
 ([14], 4000, None, 'Ultra HD Projeksiyon Cihazı', 'elektronik', {}),
 ([15], 1500, None, 'Taraftar Serisi Termos — Takım Renkleri', 'termos', {'note': '#63 ile aynı fotoğraf, farklı fiyat (1.500 / 1.700 ₺).'}),
 ([17], 8500, 'Philips', 'Philips IPL Epilasyon Cihazı', 'kisisel-bakim', {}),
 ([18], 19500, 'Dyson', 'Dyson V15s Detect Submarine Kablosuz Süpürge', 'ev-teknolojisi', {'featured': 2}),
 ([19], 1300, None, 'Saplı Termos Bardak — Pastel Tonlar', 'termos', {}),
 ([20], 7000, None, 'Ekranlı Kumandalı Drone Seti', 'elektronik', {}),
 ([21], 1300, None, 'Saplı Termos Bardak — Renk Seçenekli', 'termos', {}),
 ([22], 7500, None, 'Stand Mikser — Lila & Kırmızı', 'mutfak', {}),
 ([23], 9000, 'Dyson', 'Dyson Saç Şekillendirme Seti', 'sac-bakim', {}),
 ([24], 8000, 'Dyson', 'Dyson Saç Şekillendirme Seti — Kırmızı', 'sac-bakim', {}),
 ([25, 27], 8000, None, 'Retro Su Isıtıcı — Renk Seçenekli', 'mutfak', {}),
 ([26], 8000, 'Braun', 'Braun IPL Epilasyon Cihazı', 'kisisel-bakim', {'featured': 6}),
 ([28], 8000, None, 'Retro Su Isıtıcı — Siyah', 'mutfak', {}),
 ([29], 1300, None, 'Saplı Termos Bardak — Pembe Çiçek Desenli', 'termos', {}),
 ([30], 7000, 'Dyson', 'Dyson Saç Şekillendirici — Pembe', 'sac-bakim', {}),
 ([31], 16000, 'Xiaomi', 'Xiaomi Robot Süpürge', 'ev-teknolojisi', {}),
 ([32], 7300, None, 'G17 Pro Tablet — Klavyeli', 'elektronik', {'featured': 8}),
 ([33], 1300, None, 'Termos Bardak — Geniş Renk Seçeneği', 'termos', {}),
 ([34], 7200, None, 'Retro Bıçak Seti — Standlı', 'mutfak', {}),
 ([35], 8000, 'Dyson', 'Dyson Saç Şekillendirme Seti — Kutulu', 'sac-bakim', {}),
 ([36], 8000, 'Philips', 'Philips IPL Epilasyon Cihazı — Pembe', 'kisisel-bakim', {}),
 ([37], 8000, None, 'Retro Çaydanlık — Krem & Siyah', 'mutfak', {}),
 ([38], 9000, 'Dyson', 'Dyson Saç Şekillendirme Seti — Mor Kutu', 'sac-bakim', {'condition': None, 'note': 'İlanda “Yeni & Etiketli” rozeti görünmüyor; ürün durumu teyit edilmeli.'}),
 ([39], 6000, 'Dyson', 'Dyson Saç Düzleştirici — Mor & Bakır', 'sac-bakim', {}),
 ([40, 44], 6200, 'Dyson', 'Dyson Saç Düzleştirici — Pembe Kutulu', 'sac-bakim', {}),
 ([42], 8000, None, 'Retro Su Isıtıcı — Krem & Mavi', 'mutfak', {'featured': 5}),
 ([43], 5500, 'Dyson', 'Dyson Saç Düzleştirici — Renk Seçenekli', 'sac-bakim', {}),
 ([45], 8000, 'Philips', 'Philips IPL Epilasyon Seti', 'kisisel-bakim', {}),
 ([46, 60], 8000, 'Dyson', 'Dyson Saç Şekillendirme Seti — Taşıma Kutulu', 'sac-bakim', {}),
 ([48], 6500, 'Dyson', 'Dyson Saç Kurutma Makinesi', 'sac-bakim', {}),
 ([49], 9000, 'Dyson', 'Dyson Saç Şekillendirme Seti — Bordo Kutu', 'sac-bakim', {}),
 ([50], 1300, None, 'Saplı Termos Bardak — Sakura Desenli', 'termos', {}),
 ([51], 1707, None, 'Saplı Termos Bardak 1,16 L', 'termos', {}),
 ([52], 1750, None, 'Saplı Termos Matara — Renk Seçenekli', 'termos', {}),
 ([53], 1750, None, 'Saplı Termos Matara — Canlı Renkler', 'termos', {}),
 ([54], 1800, None, 'Saplı Termos Bardak — Karakter Desenli', 'termos', {}),
 ([55], 20000, 'Dyson', 'Dyson V15 Detect Submarine Kablosuz Süpürge', 'ev-teknolojisi', {}),
 ([56], 2900, 'Columbia', 'Columbia Termos — Siyah & Yeşil', 'termos', {}),
 ([57], 3000, 'Columbia', 'Columbia Termos', 'termos', {}),
 ([58], 15000, 'Dyson', 'Dyson V15s Absolute Kablosuz Süpürge', 'ev-teknolojisi', {}),
 ([59], 3500, 'Columbia', 'Columbia Termos — Haki & Antrasit', 'termos', {}),
 ([61], 4000, 'Chanel', 'Chanel Parfüm Seti — 4’lü', 'saat-parfum', {}),
 ([62], 5000, None, 'Kutulu Parfüm — Turkuaz Şişe', 'saat-parfum', {}),
 ([63], 1700, None, 'Taraftar Serisi Termos — Takım Renkleri', 'termos', {'note': '#15 ile aynı fotoğraf, farklı fiyat (1.500 / 1.700 ₺).'}),
 ([64], 6000, 'Versace', 'Versace Kol Saati — Model Seçenekli', 'saat-parfum', {}),
 ([65], 1500, None, 'Termos Şişe — Siyah', 'termos', {}),
 ([66], 3000, None, 'Klasik Termos Seti — Yeşil', 'termos', {'featured': 7}),
 ([67], 7000, 'Dyson', 'Dyson Saç Düzleştirici — Kutulu', 'sac-bakim', {}),
 ([68], 8000, 'Dyson', 'Dyson Saç Şekillendirme Seti — Gül Kurusu', 'sac-bakim', {}),
 ([69], 6000, 'Versace', 'Versace Kol Saati — Yeşil Kadran', 'saat-parfum', {'featured': 4}),
 ([70], 7000, 'Dyson', 'Dyson Saç Düzleştirici — 4 Renk', 'sac-bakim', {}),
 ([71], 7000, 'Braun', 'Braun IPL Epilasyon Cihazı — Çantalı', 'kisisel-bakim', {}),
 ([72], 6500, 'Versace', 'Versace Kadın Kol Saati', 'saat-parfum', {}),
 ([73], 6500, 'Versace', 'Versace Kadın Kol Saati — Altın Ton', 'saat-parfum', {}),
 ([74], 6000, 'Versace', 'Versace Erkek Kol Saati — Çelik', 'saat-parfum', {}),
 ([75], 9000, 'Dyson', 'Dyson Saç Şekillendirme Seti — Lacivert Kutu', 'sac-bakim', {}),
]

TR = str.maketrans({'ç': 'c', 'Ç': 'c', 'ğ': 'g', 'Ğ': 'g', 'ı': 'i', 'İ': 'i', 'ö': 'o', 'Ö': 'o', 'ş': 's', 'Ş': 's', 'ü': 'u', 'Ü': 'u', '’': '', "'": ''})
def slugify(s):
    s = s.translate(TR).lower()
    s = unicodedata.normalize('NFKD', s).encode('ascii', 'ignore').decode()
    return re.sub(r'[^a-z0-9]+', '-', s).strip('-')

products = []
seen = set()
for positions, price, brand, name, cat, extra in T:
    first = positions[0]
    pid = f'vr-{first:03d}'
    slug = slugify(name) if extra.get('nameSource') == 'gardrops-url' else f'{slugify(name)}-{first:02d}'
    assert slug not in seen, slug
    seen.add(slug)
    # interim image: owner's own listing photo, cropped from the screenshot
    src = Image.open(os.path.join(CROPS, f'p{first:02d}.png')).convert('RGB')
    up = src.resize((src.width * 2, src.height * 2), Image.LANCZOS).filter(ImageFilter.UnsharpMask(radius=1.2, percent=55, threshold=2))
    fname = f'{pid}-1.jpg'
    up.save(os.path.join(IMG_OUT, fname), quality=92, subsampling=0, optimize=True)
    review = []
    if extra.get('nameSource') != 'gardrops-url':
        review.append('name')
    review += ['description', 'images']
    if extra.get('note'):
        review.append('note')
    p = {
        'id': pid,
        'slug': slug,
        'name': name,
        'brand': brand,
        'category': cat,
        'price': price,
        'condition': extra.get('condition', 'Yeni & Etiketli'),
        'availability': 'listed',
        'description': None,
        'features': extra.get('features', []),
        'images': [{'file': fname, 'alt': name, 'quality': 'interim-lowres'}],
        'featured': extra.get('featured'),
        'hidden': extra.get('hidden', False),
        'source': {
            'platform': 'gardrops',
            'store': 'https://www.gardrops.com/veyraticaret',
            'listingPositions': positions,
            'url': extra.get('url'),
            'capturedFrom': 'owner-screenshots',
            'nameSource': extra.get('nameSource', 'identified-from-listing-photo'),
            'featuresSource': extra.get('featuresSource'),
        },
        'review': review,
        'reviewNote': extra.get('note'),
    }
    products.append(p)

out = {
    '$comment': 'VEYRA canlı katalog. Kaynak: Gardrops mağaza ekran görüntüleri (79 ilan; 75 görünür). Ayrıntı: docs/KATALOG.md',
    'generatedFrom': 'scripts/import/gardrops-screenshots.py',
    'storeListingCount': 79,
    'visibleListingCount': 75,
    'products': products,
}
with open(os.path.join(ROOT, 'src', 'data', 'products.json'), 'w', encoding='utf-8') as f:
    json.dump(out, f, ensure_ascii=False, indent=2)
print(len(products), 'products;', sum(1 for p in products if p['hidden']), 'hidden')
