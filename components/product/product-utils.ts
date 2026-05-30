import type { Product } from '@/app/admin/types';

export type ProductColor = NonNullable<Product['color_swatches']>[number] & { value: string; name: string };
export type ProductImage = string | { url?: string; alt?: string };

type LegacyProductColor = string | (Partial<ProductColor> & { label?: string; title?: string });

export const normalizeList = (values?: string[]) => values?.filter(Boolean) || [];
export const formatPrice = (price?: number) => (price || 0).toLocaleString('fa-IR');

const stringifyValue = (value: unknown) => typeof value === 'string' ? value : value == null ? '' : String(value);
const slugifyColor = (value: string) => value.trim().toLowerCase().replace(/\s+/g, '-').replace(/[^\w\u0600-\u06FF-]+/g, '');

function normalizeColorEntry(color: LegacyProductColor, index = 0): ProductColor {
  if (typeof color === 'string') {
    return { name: color, value: color, active: true, order: index };
  }

  const name = stringifyValue(color.name || color.label || color.title || color.slug || color.value || `رنگ ${index + 1}`);
  const rawValue = stringifyValue(color.slug || (stringifyValue(color.value).startsWith('#') ? '' : color.value) || name);
  const value = rawValue || slugifyColor(name) || `color-${index + 1}`;

  return {
    ...color,
    name,
    value,
    slug: stringifyValue(color.slug) || value,
    active: color.active !== false && color.is_active !== false,
    is_active: color.active !== false && color.is_active !== false
  };
}

export function colorValue(color?: ProductColor | null) {
  return color?.slug || (color?.value?.startsWith('#') ? '' : color?.value) || color?.name || '';
}

export function normalizeColors(product?: Product): ProductColor[] {
  if (!product) return [];
  if (product.color_swatches?.length) {
    return product.color_swatches
      .map((color, index) => normalizeColorEntry(color as LegacyProductColor, index))
      .sort((a, b) => (a.order ?? a.sort_order ?? 0) - (b.order ?? b.sort_order ?? 0));
  }
  return ((product.colors || []) as LegacyProductColor[]).map((color, index) => normalizeColorEntry(color, index));
}

export function imageUrl(image?: ProductImage) {
  if (!image) return '';
  return typeof image === 'string' ? image : image.url || '';
}

export function imageAlt(image: ProductImage | undefined, fallback: string) {
  return typeof image === 'string' ? fallback : image?.alt || fallback;
}

export function colorImageUrls(color?: ProductColor | null) {
  return (color?.images || []).map(imageUrl).filter(Boolean);
}

export function variantStock(variant?: NonNullable<Product['variants']>[number]) {
  return variant?.inventory ?? variant?.stock ?? 0;
}

export function variantAvailable(variant?: NonNullable<Product['variants']>[number]) {
  if (!variant) return true;
  return variant.is_available !== false && variantStock(variant) > 0;
}
