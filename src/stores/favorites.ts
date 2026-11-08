import { computed } from 'nanostores';
import { persistentAtom } from './persist';

const sanitize = (v: unknown): string[] =>
  Array.isArray(v) ? [...new Set(v.filter((x): x is string => typeof x === 'string'))].slice(0, 200) : [];

export const favorites = persistentAtom<string[]>('veyra:favorites:v1', [], sanitize);

export const favoriteCount = computed(favorites, (f) => f.length);

/** Returns true when the product is now a favourite. */
export function toggleFavorite(id: string): boolean {
  const list = favorites.get();
  if (list.includes(id)) {
    favorites.set(list.filter((x) => x !== id));
    return false;
  }
  favorites.set([id, ...list]);
  return true;
}
