import { atom, type WritableAtom } from 'nanostores';

/**
 * localStorage-backed atom. Every access is guarded: storage can be
 * unavailable (private mode, blocked cookies) and the site must keep
 * working in memory.
 */
export function persistentAtom<T>(key: string, initial: T, sanitize: (v: unknown) => T): WritableAtom<T> {
  const store = atom<T>(initial);
  if (typeof window === 'undefined') return store;

  try {
    const raw = window.localStorage.getItem(key);
    if (raw) store.set(sanitize(JSON.parse(raw)));
  } catch {
    /* ignore corrupt or unavailable storage */
  }

  store.listen((value) => {
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch {
      /* quota / disabled — keep in memory */
    }
  });

  window.addEventListener('storage', (e) => {
    if (e.key !== key) return;
    try {
      store.set(e.newValue ? sanitize(JSON.parse(e.newValue)) : initial);
    } catch {
      /* ignore */
    }
  });

  return store;
}
