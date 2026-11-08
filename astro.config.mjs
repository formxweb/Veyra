// @ts-check
import { defineConfig } from 'astro/config';
import preact from '@astrojs/preact';
import sitemap from '@astrojs/sitemap';

/**
 * SITE_URL is the public domain the site will be deployed to
 * (e.g. https://www.veyraticaret.com). It is required for canonical
 * URLs, Open Graph tags and the sitemap. We never guess a domain:
 * when it is not provided, absolute-URL features are simply skipped.
 */
const site = process.env.SITE_URL || undefined;

export default defineConfig({
  site,
  trailingSlash: 'ignore',
  integrations: [preact(), ...(site ? [sitemap()] : [])],
  prefetch: { prefetchAll: true, defaultStrategy: 'hover' },
  image: {
    responsiveStyles: false,
  },
  build: {
    inlineStylesheets: 'auto',
  },
});
