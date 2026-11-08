import type { APIRoute } from 'astro';
import { products, views } from '../data/catalog';

/** Static search index for the header search dialog. */
export const GET: APIRoute = async () => {
  const items = await views(products);
  return new Response(JSON.stringify({ products: items }), {
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
  });
};
