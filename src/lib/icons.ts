/**
 * One icon set for both Astro and Preact. 24×24 grid, 1.4 stroke,
 * drawn for VEYRA (thin, slightly architectural).
 */
export const icons = {
  'arrow-right': '<path d="M4 12h15.5M14 6.5l5.5 5.5-5.5 5.5"/>',
  'arrow-left': '<path d="M20 12H4.5M10 6.5 4.5 12l5.5 5.5"/>',
  'arrow-up-right': '<path d="M7 17 17 7M8.5 7H17v8.5"/>',
  bag: '<path d="M5.2 8.5h13.6l-1 11.5H6.2z"/><path d="M8.8 8.5V7a3.2 3.2 0 0 1 6.4 0v1.5"/>',
  'bag-plus': '<path d="M5.2 8.5h13.6l-1 11.5H6.2z"/><path d="M8.8 8.5V7a3.2 3.2 0 0 1 6.4 0v1.5"/><path d="M12 11.6v5.6M9.2 14.4h5.6"/>',
  heart: '<path d="M12 19.6s-7.3-4.4-7.3-9.6A4.2 4.2 0 0 1 12 7.5a4.2 4.2 0 0 1 7.3 2.5c0 5.2-7.3 9.6-7.3 9.6z"/>',
  search: '<circle cx="10.8" cy="10.8" r="6.3"/><path d="m15.4 15.4 4.6 4.6"/>',
  close: '<path d="M5.5 5.5l13 13M18.5 5.5l-13 13"/>',
  menu: '<path d="M3.5 8h17M3.5 16h11"/>',
  plus: '<path d="M12 4.5v15M4.5 12h15"/>',
  minus: '<path d="M4.5 12h15"/>',
  eye: '<path d="M2.8 12S6.2 5.8 12 5.8 21.2 12 21.2 12 17.8 18.2 12 18.2 2.8 12 2.8 12z"/><circle cx="12" cy="12" r="2.7"/>',
  truck: '<path d="M2.8 6.5h11v9.8h-11zM13.8 10h4l2.9 3.2v3.1h-6.9"/><circle cx="6.8" cy="17.6" r="1.6"/><circle cx="17.2" cy="17.6" r="1.6"/>',
  bank: '<path d="M3 9.2 12 4l9 5.2M4.5 9.5h15M5.8 9.5v7.8M10 9.5v7.8M14 9.5v7.8M18.2 9.5v7.8M3.5 19.8h17"/>',
  pin: '<path d="M12 21s-6.5-5.6-6.5-11a6.5 6.5 0 0 1 13 0c0 5.4-6.5 11-6.5 11z"/><circle cx="12" cy="10" r="2.3"/>',
  chat: '<path d="M4 18.8 5.3 15A7.6 7.6 0 1 1 8.6 18z"/>',
  check: '<path d="m4.8 12.6 4.4 4.3 10-10.1"/>',
  info: '<circle cx="12" cy="12" r="8.6"/><path d="M12 11v5.4M12 7.6v.1"/>',
  'chevron-down': '<path d="m6 9.5 6 6 6-6"/>',
  'chevron-right': '<path d="m9.5 6 6 6-6 6"/>',
  phone: '<path d="M6.6 3.8h2.6l1.4 4-1.9 1.3a10.6 10.6 0 0 0 6.2 6.2l1.3-1.9 4 1.4v2.6a1.8 1.8 0 0 1-1.9 1.8A15.6 15.6 0 0 1 4.8 5.7a1.8 1.8 0 0 1 1.8-1.9z"/>',
  lock: '<rect x="5" y="10.5" width="14" height="9.5" rx="1"/><path d="M8.2 10.5V8a3.8 3.8 0 0 1 7.6 0v2.5"/>',
  box: '<path d="M3.8 7.6 12 3.5l8.2 4.1v8.8L12 20.5l-8.2-4.1z"/><path d="M3.8 7.6 12 11.7l8.2-4.1M12 11.7v8.8"/>',
  sliders: '<path d="M4 7h9M17 7h3M4 17h3M11 17h9"/><circle cx="15" cy="7" r="2"/><circle cx="9" cy="17" r="2"/>',
  whatsapp:
    '<path d="M4.2 19.8 5.3 16a8.1 8.1 0 1 1 2.8 2.7z"/><path d="M9.2 8.4c.2-.4.5-.5.8-.5h.5c.2 0 .4.1.5.4l.7 1.6c.1.2 0 .5-.1.6l-.5.6c-.1.2-.1.4 0 .5a6 6 0 0 0 2.6 2.4c.2.1.4.1.5-.1l.6-.7c.2-.2.4-.2.6-.1l1.6.8c.2.1.3.3.3.5 0 .7-.4 1.4-1.1 1.6-.6.2-1.4.2-2.5-.2a9.4 9.4 0 0 1-4.6-4.5c-.5-1.1-.4-2 0-2.5z" fill="currentColor" stroke="none"/>',
} as const;

export type IconName = keyof typeof icons;

export function iconSvg(name: IconName, cls = 'icon'): string {
  return `<svg class="${cls}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">${icons[name]}</svg>`;
}
