/** Form validation rules (Turkish copy, never blames the user). */
export type Rule = (value: string, all?: Record<string, string>) => string | null;

export const rules = {
  required:
    (label: string): Rule =>
    (v) =>
      v.trim() ? null : `${label} gerekli.`,
  fullName: (): Rule => (v) => {
    const t = v.trim();
    if (!t) return 'Ad ve soyadınızı yazın.';
    if (t.split(/\s+/).length < 2 || t.length < 5) return 'Ad ile birlikte soyadınızı da yazın.';
    return null;
  },
  phoneTR: (): Rule => (v) => {
    const d = digitsOnly(v);
    if (!d) return 'Size ulaşabileceğimiz bir telefon numarası yazın.';
    const n = normalizePhoneTR(d);
    if (!n) return 'Numara 05XX XXX XX XX biçiminde 11 hane olmalı.';
    return null;
  },
  minLength:
    (n: number, msg: string): Rule =>
    (v) =>
      v.trim().length >= n ? null : msg,
  checked:
    (msg: string): Rule =>
    (v) =>
      v === 'true' ? null : msg,
};

export function digitsOnly(v: string): string {
  return v.replace(/\D+/g, '');
}

/** Accepts 05XXXXXXXXX, 5XXXXXXXXX, 905XXXXXXXXX → returns 05XXXXXXXXX or null. */
export function normalizePhoneTR(d: string): string | null {
  let x = d;
  if (x.startsWith('90') && x.length === 12) x = '0' + x.slice(2);
  if (x.length === 10 && x.startsWith('5')) x = '0' + x;
  return /^05\d{9}$/.test(x) ? x : null;
}

/** Live formatting while typing: 0546 722 54 90 */
export function formatPhoneTR(v: string): string {
  let d = digitsOnly(v).slice(0, 12);
  if (d.startsWith('90')) d = '0' + d.slice(2);
  if (d.length && d[0] !== '0') d = '0' + d;
  d = d.slice(0, 11);
  const parts = [d.slice(0, 4), d.slice(4, 7), d.slice(7, 9), d.slice(9, 11)].filter(Boolean);
  return parts.join(' ');
}

export function validate(values: Record<string, string>, schema: Record<string, Rule[]>): Record<string, string> {
  const errors: Record<string, string> = {};
  for (const [k, list] of Object.entries(schema)) {
    for (const r of list) {
      const e = r(values[k] ?? '', values);
      if (e) {
        errors[k] = e;
        break;
      }
    }
  }
  return errors;
}
