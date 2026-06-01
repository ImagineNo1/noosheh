import type { Product } from '@/app/admin/types';
import { normalizeProductColors, normalizeProductImage, normalizeProductList, type StorefrontProductColor } from '@/lib/product-normalization';

export type ProductColor = StorefrontProductColor;
export type ProductImage = string | { url?: string; alt?: string };

export { normalizeProductList as normalizeList };
export const formatPrice = (price?: number) => (price || 0).toLocaleString('fa-IR');

export function colorValue(color?: ProductColor | null) {
  return color?.slug || (color?.value?.startsWith('#') ? '' : color?.value) || color?.name || '';
}

export function normalizeVariantValue(value?: unknown) {
  return String(value ?? '').trim().toLowerCase();
}

export function colorMatchesVariant(color: ProductColor | null | undefined, variantColor?: unknown) {
  if (!color) return true;
  const target = normalizeVariantValue(variantColor);
  if (!target) return false;
  return [color.name, color.value, color.slug, color.hex, colorValue(color)]
    .map(normalizeVariantValue)
    .filter(Boolean)
    .some((value) => value === target);
}

export function optionMatchesVariant(selected?: string, variantValue?: unknown) {
  if (!selected) return true;
  return normalizeVariantValue(selected) === normalizeVariantValue(variantValue);
}

export function normalizeColors(product?: Product): ProductColor[] {
  return normalizeProductColors(product);
}

export function imageUrl(image?: ProductImage) {
  return normalizeProductImage(image);
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
