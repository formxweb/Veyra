/** Client-safe product shape passed into islands (all URLs pre-resolved at build). */
export interface ImageView {
  src: string;
  srcset?: string;
  width: number;
  height: number;
  alt: string;
}

export interface ProductView {
  id: string;
  slug: string;
  href: string;
  name: string;
  brand: string | null;
  category: string;
  categoryLabel: string;
  collectionHref: string;
  price: number | null;
  condition: string | null;
  available: boolean;
  image: ImageView | null;
  /** False while the product only has an interim low-resolution photo. */
  hires: boolean;
  /** Lower-cased, diacritic-folded haystack for instant search. */
  search: string;
  featured: number | null;
}

export interface ProductDetailView extends ProductView {
  gallery: ImageView[];
  description: string | null;
  features: string[];
}
