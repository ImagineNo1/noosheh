import type { Product } from '@/app/admin/types';

export type ProductColor = NonNullable<Product['color_swatches']>[number] & { value: string };
export type ProductImage = string | { url?: string; alt?: string };

export const normalizeList = (values?: string[]) => values?.filter(Boolean) || [];
export const formatPrice = (price?: number) => (price || 0).toLocaleString('fa-IR');

export function colorValue(color?: ProductColor | null) {
  return color?.value || color?.slug || color?.name || '';
}

export function normalizeColors(product?: Product): ProductColor[] {
  if (!product) return [];
  if (product.color_swatches?.length) {
    return product.color_swatches
      .map((color) => ({ ...color, value: color.value || color.slug || color.name }))
      .sort((a, b) => (a.order ?? a.sort_order ?? 0) - (b.order ?? b.sort_order ?? 0));
  }
  return normalizeList(product.colors).map((color) => ({ name: color, value: color, active: true }));
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
