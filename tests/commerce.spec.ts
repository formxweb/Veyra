import { expect, test, type Page } from '@playwright/test';

const PDP = '/urun/dyson-co-anda-2x-siklik-ve-guc-bir-arada';

/** Capture window.open calls instead of leaving the site. */
async function trapWindowOpen(page: Page) {
  await page.addInitScript(() => {
    (window as unknown as { __opened: string[] }).__opened = [];
    window.open = ((url: string) => {
      (window as unknown as { __opened: string[] }).__opened.push(String(url));
      return null;
    }) as typeof window.open;
  });
}

function collectErrors(page: Page) {
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(e.message));
  page.on('console', (m) => m.type() === 'error' && errors.push(m.text()));
  return errors;
}

const isMobile = (page: Page) => (page.viewportSize()?.width ?? 1440) < 768;

test.describe('home', () => {
  test('renders hero, collections and featured without errors', async ({ page }) => {
    const errors = collectErrors(page);
    await page.goto('/');
    await expect(page.getByRole('heading', { level: 1 })).toContainText('Özenle seçilir.');
    await expect(page.locator('#koleksiyonlar')).toBeVisible();
    await page.locator('.feat').scrollIntoViewIfNeeded();
    await expect(page.locator('.feat .pcard').first()).toBeVisible();
    expect(errors).toEqual([]);
  });

  test('every collection link resolves', async ({ page, request }) => {
    await page.goto('/');
    const hrefs = await page.locator('a[href^="/koleksiyon/"]').evaluateAll((as) => [...new Set(as.map((a) => a.getAttribute('href')))]);
    expect(hrefs.length).toBe(7);
    for (const h of hrefs) expect((await request.get(h!)).status()).toBe(200);
  });
});

test.describe('catalog', () => {
  test('search, category filter, sort and empty state', async ({ page }) => {
    await page.goto('/magaza');
    await page.locator('.catalog[data-ready]').waitFor();
    const cards = page.locator('.pgrid .pcard');
    await expect(cards).toHaveCount(68);

    await page.getByPlaceholder('Ürün veya marka ara').fill('dyson');
    await expect(page.locator('.catalog__status')).toContainText('“dyson”');
    const n = await cards.count();
    expect(n).toBeGreaterThan(5);
    for (const name of await page.locator('.pgrid .pcard__name').allTextContents()) expect(name.toLowerCase()).toContain('dyson');
    await expect(page).toHaveURL(/q=dyson/);

    await page.getByPlaceholder('Ürün veya marka ara').fill('');
    await page.locator('.catalog__chips').getByRole('button', { name: /Termos/ }).click();
    await expect(cards).toHaveCount(18);
    await expect(page).toHaveURL(/kategori=termos/);

    await page.locator('.catalog__selects select').nth(1).selectOption('fiyat-artan');
    const prices = (await page.locator('.pgrid .pcard__price').allTextContents()).map((t) => Number(t.replace(/\D/g, '')));
    expect(prices).toEqual([...prices].sort((a, b) => a - b));

    await page.locator('.catalog__selects select').nth(1).selectOption('fiyat-azalan');
    const desc = (await page.locator('.pgrid .pcard__price').allTextContents()).map((t) => Number(t.replace(/\D/g, '')));
    expect(desc).toEqual([...desc].sort((a, b) => b - a));

    await page.getByPlaceholder('Ürün veya marka ara').fill('zzzz-yok');
    await expect(page.getByText('Bu seçimle eşleşen ürün bulunamadı')).toBeVisible();
    await page.locator('.empty').getByRole('button', { name: 'Filtreleri Temizle' }).click();
    await expect(cards).toHaveCount(68);
  });

  test('filters are restored from the URL', async ({ page }) => {
    await page.goto('/magaza?kategori=saat-parfum&marka=Versace');
    await page.locator('.catalog[data-ready]').waitFor();
    await expect(page.locator('.pgrid .pcard')).toHaveCount(5);
  });

  test('Turkish-insensitive search', async ({ page }) => {
    await page.goto('/magaza');
    await page.getByPlaceholder('Ürün veya marka ara').fill('saç düzleştirici');
    const a = await page.locator('.pgrid .pcard').count();
    await page.getByPlaceholder('Ürün veya marka ara').fill('SAC DUZLESTIRICI');
    await expect(page.locator('.pgrid .pcard')).toHaveCount(a);
    expect(a).toBeGreaterThan(0);
  });
});

test.describe('cart', () => {
  test('add, update quantity, totals, remove, persist', async ({ page }) => {
    await page.goto('/magaza?kategori=termos&sirala=fiyat-artan');
    await page.locator('.catalog[data-ready]').waitFor();
    const first = page.locator('.pgrid .pcard').first();
    const priceText = await first.locator('.pcard__price').textContent();
    const price = Number(priceText!.replace(/\D/g, ''));
    if (isMobile(page)) await first.locator('.pcard__quickadd').click();
    else {
      await first.hover();
      await first.getByRole('button', { name: /sepete ekle/i }).click();
    }
    const drawer = page.getByRole('dialog', { name: 'Sepetiniz' });
    await expect(drawer).toBeVisible();
    await expect(drawer.locator('.line')).toHaveCount(1);
    await drawer.getByRole('button', { name: 'Adedi artır' }).click();
    await drawer.getByRole('button', { name: 'Adedi artır' }).click();
    const fmt = (n: number) => new Intl.NumberFormat('tr-TR').format(n) + ' ₺';
    await expect(drawer.locator('.sum__row--total dd')).toHaveText(fmt(price * 3));
    await expect(page.locator('[data-cart-button] .count-badge')).toHaveText('3');

    await page.reload();
    await expect(page.locator('[data-cart-button] .count-badge')).toHaveText('3');

    await page.locator('[data-cart-button]').click();
    await page.getByRole('dialog', { name: 'Sepetiniz' }).getByRole('button', { name: 'Kaldır' }).click();
    await expect(page.getByText('Sepetiniz şimdilik boş')).toBeVisible();
    await expect(page.locator('[data-cart-button] .count-badge')).toHaveCount(0);
  });
});

test.describe('favorites', () => {
  test('toggle from card and list on favorites page', async ({ page }) => {
    await page.goto('/magaza?kategori=saat-parfum');
    await page.locator('.catalog[data-ready]').waitFor();
    const card = page.locator('.pgrid .pcard').first();
    const name = (await card.locator('.pcard__name').textContent())!.trim();
    await card.locator('.pcard__fav').click();
    await expect(card.locator('.pcard__fav')).toHaveAttribute('aria-pressed', 'true');
    await page.goto('/favoriler');
    await expect(page.locator('.pgrid .pcard')).toHaveCount(1);
    await expect(page.locator('.pgrid .pcard__name')).toHaveText(name);
    await page.locator('.pgrid .pcard__fav').click();
    await expect(page.getByText('Henüz favoriniz yok')).toBeVisible();
  });
});

test.describe('product detail', () => {
  test('quantity, add to cart, WhatsApp link, similar products', async ({ page }) => {
    await page.goto(PDP);
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Dyson Co-anda 2x — Şıklık ve Güç Bir Arada');
    await expect(page.locator('.pdp__price')).toHaveText('9.000 ₺');
    const buy = page.locator('.buy');
    await buy.getByRole('button', { name: 'Adedi artır' }).click();
    const wa = await buy.getByRole('link', { name: /WhatsApp ile Sipariş Ver/ }).getAttribute('href');
    const text = decodeURIComponent(wa!.split('text=')[1]);
    expect(wa).toContain('https://wa.me/905467225490');
    expect(text).toContain('VR-001');
    expect(text).toContain('Adet: 2');
    expect(text).toContain('18.000 ₺');
    await buy.getByRole('button', { name: /Sepete Ekle/ }).click();
    await expect(page.getByRole('dialog', { name: 'Sepetiniz' }).locator('.qty output')).toHaveText('2');
    await page.keyboard.press('Escape');
    await page.locator('.pdp__related').scrollIntoViewIfNeeded();
    await expect(page.locator('.pdp__related .pcard').first()).toBeVisible();
  });

  test('JSON-LD product offer is present', async ({ page }) => {
    await page.goto(PDP);
    const ld = await page.locator('script[type="application/ld+json"]').allTextContents();
    const product = ld.map((t) => JSON.parse(t)).flat().find((d) => d['@type'] === 'Product');
    expect(product.offers.price).toBe(9000);
    expect(product.offers.priceCurrency).toBe('TRY');
  });

  test('mobile sticky buy bar appears after scrolling past the CTA', async ({ page }) => {
    test.skip(!isMobile(page), 'mobile only');
    await page.goto(PDP);
    const bar = page.locator('.buybar');
    await expect(bar).toHaveAttribute('data-visible', 'false');
    await page.locator('.pdp__acc').scrollIntoViewIfNeeded();
    await page.mouse.wheel(0, 900);
    await expect(bar).toHaveAttribute('data-visible', 'true');
    await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }));
    await expect(bar).toHaveAttribute('data-visible', 'false');
  });
});

test.describe('order flow', () => {
  test('validation, phone formatting and WhatsApp hand-off', async ({ page }) => {
    await trapWindowOpen(page);
    await page.goto(PDP);
    await page.locator('.buy').getByRole('button', { name: /Sepete Ekle/ }).click();
    await page.goto('/sepet');

    await page.getByRole('button', { name: 'Siparişi WhatsApp ile Gönder' }).click();
    await expect(page.locator('.field__error')).toHaveCount(6);
    await expect(page.locator('#f-name')).toBeFocused();

    await page.locator('#f-name').fill('Ayşe Yılmaz');
    await expect(page.locator('#e-name')).toHaveCount(0); // clears instantly once valid
    await page.locator('#f-phone').fill('5321234567');
    await expect(page.locator('#f-phone')).toHaveValue('0532 123 45 67');
    await page.locator('#f-city').selectOption('Mardin');
    await page.locator('#f-district').fill('Nusaybin');
    await page.locator('#f-address').fill('Yenişehir Mah. 123. Sokak No: 4 Daire 2');
    await page.getByRole('checkbox').check();
    await page.getByRole('button', { name: 'Siparişi WhatsApp ile Gönder' }).click();

    await expect(page.getByRole('heading', { name: 'Sipariş talebiniz hazır.' })).toBeVisible();
    const opened = await page.evaluate(() => (window as unknown as { __opened: string[] }).__opened);
    expect(opened).toHaveLength(1);
    const msg = decodeURIComponent(opened[0].split('text=')[1]);
    expect(opened[0]).toContain('https://wa.me/905467225490');
    expect(msg).toContain('Dyson Co-anda 2x');
    expect(msg).toContain('Ad Soyad: Ayşe Yılmaz');
    expect(msg).toContain('Telefon: 0532 123 45 67');
    expect(msg).toContain('İl / İlçe: Mardin / Nusaybin');
    expect(msg).toContain('Ödeme: EFT / Havale');
    expect(msg).toMatch(/Sipariş referansı: VR-\d{6}-\d{4}/);

    await page.getByRole('button', { name: 'Sepeti boşalt' }).click();
    await expect(page.getByText('Sepetiniz boş')).toBeVisible();
  });

  test('empty cart state', async ({ page }) => {
    await page.goto('/sepet');
    await expect(page.getByText('Sepetiniz boş')).toBeVisible();
    await expect(page.getByRole('link', { name: /Mağazaya Git/ })).toBeVisible();
  });
});

test.describe('global ui', () => {
  test('search dialog finds products and navigates', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: 'Ürün ara' }).click();
    const dlg = page.getByRole('dialog', { name: 'Ürün ara' });
    await expect(dlg).toBeVisible();
    await dlg.getByRole('combobox').fill('versace');
    await expect(dlg.locator('.search__hit').first()).toBeVisible();
    await dlg.getByRole('combobox').press('Enter');
    await expect(page).toHaveURL(/\/urun\/versace-/);
  });

  test('quick view adds to cart (desktop)', async ({ page }) => {
    test.skip(isMobile(page), 'hover-only on desktop');
    await page.goto('/magaza');
    const card = page.locator('.pgrid .pcard').nth(3);
    await card.hover();
    await card.getByRole('button', { name: /hızlı incele/i }).click();
    const qv = page.locator('dialog.qv');
    await expect(qv).toBeVisible();
    await qv.getByRole('button', { name: 'Sepete Ekle' }).click();
    await expect(page.getByRole('dialog', { name: 'Sepetiniz' }).locator('.line')).toHaveCount(1);
  });

  test('mobile menu opens and navigates', async ({ page }) => {
    test.skip(!isMobile(page), 'mobile only');
    await page.goto('/');
    await page.getByRole('button', { name: 'Menüyü aç' }).click();
    const menu = page.getByRole('dialog', { name: 'Menü' });
    await expect(menu).toBeVisible();
    await menu.getByRole('link', { name: 'Mağaza' }).click();
    await expect(page).toHaveURL(/\/magaza/);
  });

  test('contact form validates and hands off to WhatsApp', async ({ page }) => {
    await trapWindowOpen(page);
    await page.goto('/iletisim');
    await page.locator('#c-name').scrollIntoViewIfNeeded();
    await page.getByRole('button', { name: 'WhatsApp ile Gönder' }).click();
    await expect(page.locator('#ce-name')).toBeVisible();
    await page.locator('#c-name').fill('Mehmet');
    await page.locator('#c-message').fill('Dyson düzleştirici stokta var mı?');
    await page.getByRole('button', { name: 'WhatsApp ile Gönder' }).click();
    await expect(page.getByRole('heading', { name: 'Mesajınız hazır.' })).toBeVisible();
  });

  test('404 page', async ({ page }) => {
    const res = await page.goto('/olmayan-sayfa');
    expect(res?.status()).toBe(404);
    await expect(page.getByRole('heading', { level: 1 })).toContainText('burada değil');
  });
});
