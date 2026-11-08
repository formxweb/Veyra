const tl = new Intl.NumberFormat('tr-TR', { maximumFractionDigits: 0 });

/** 9000 → "9.000 ₺" (Turkish grouping, lira sign after the amount). */
export function formatPrice(value: number | null | undefined): string {
  if (value == null) return 'Fiyat sorunuz';
  return `${tl.format(value)} ₺`;
}

export function formatCount(n: number): string {
  return tl.format(n);
}

/** Turkish-aware lowercase + diacritic folding for search. */
export function fold(input: string): string {
  return input
    .replace(/İ/g, 'i')
    .replace(/I/g, 'ı')
    .toLocaleLowerCase('tr-TR')
    .replace(/ı/g, 'i')
    .replace(/ğ/g, 'g')
    .replace(/ü/g, 'u')
    .replace(/ş/g, 's')
    .replace(/ö/g, 'o')
    .replace(/ç/g, 'c')
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[’'`]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

export function pluralTr(n: number, word: string): string {
  // Turkish nouns do not take a plural suffix after numerals.
  return `${formatCount(n)} ${word}`;
}
