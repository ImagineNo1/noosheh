import type { Product } from '@/app/admin/types';

export type StorefrontProductColor = NonNullable<Product['color_swatches']>[number] & { value: string; name: string };
type ProductImageInput = string | { url?: unknown; alt?: unknown };
type ProductColorInput = string | (Partial<StorefrontProductColor> & { label?: unknown; title?: unknown });

type AnyRecord = Record<string, any>;

export function stringifyProductValue(value: unknown, fallback = ''): string {
  if (typeof value === 'string') return value;
  if (typeof value === 'number' || typeof value === 'boolean') return String(value);
  if (value == null) return fallback;
  if (Array.isArray(value)) return value.map((item) => stringifyProductValue(item)).filter(Boolean).join('، ') || fallback;
  if (typeof value === 'object') {
    const record = value as AnyRecord;
    return stringifyProductValue(
      record.title ?? record.name ?? record.label ?? record.value ?? record.slug ?? record.code ?? record.id ?? record.url,
      fallback
    );
  }
  return fallback;
}

export function normalizeProductList(values?: unknown): string[] {
  if (!Array.isArray(values)) return [];
  return values.map((value) => stringifyProductValue(value).trim()).filter(Boolean);
}

function normalizeNumber(value: unknown, fallback = 0) {
  const numberValue = Number(value);
  return Number.isFinite(numberValue) ? numberValue : fallback;
}

function normalizeBoolean(value: unknown, fallback = false) {
  return typeof value === 'boolean' ? value : value == null ? fallback : Boolean(value);
}

function slugifyProductValue(value: string) {
  return value.trim().toLowerCase().replace(/\s+/g, '-').replace(/[^\w\u0600-\u06FF-]+/g, '');
}

export function normalizeProductImage(image?: ProductImageInput | null) {
  return typeof image === 'string' ? image : stringifyProductValue(image?.url);
}

export function normalizeProductImages(images?: unknown) {
  if (!Array.isArray(images)) return [];
  return images.map((image) => normalizeProductImage(image as ProductImageInput)).filter(Boolean);
}

export function normalizeProductColor(color: ProductColorInput, index = 0): StorefrontProductColor {
  if (typeof color === 'string') {
    return { name: color, value: color, slug: slugifyProductValue(color) || color, active: true, is_active: true, order: index };
  }

  const name = stringifyProductValue(color.name ?? color.label ?? color.title ?? color.slug ?? color.value, `رنگ ${index + 1}`);
  const valueSource = stringifyProductValue(color.slug ?? (stringifyProductValue(color.value).startsWith('#') ? '' : color.value) ?? name);
  const value = valueSource || slugifyProductValue(name) || `color-${index + 1}`;
  const isActive = color.active !== false && color.is_active !== false;

  return {
    ...color,
    name,
    value,
    slug: stringifyProductValue(color.slug) || value,
    hex: stringifyProductValue(color.hex) || stringifyProductValue(color.value) || undefined,
    swatch_image: stringifyProductValue(color.swatch_image) || undefined,
    active: isActive,
    is_active: isActive,
    images: normalizeProductImages(color.images),
    order: normalizeNumber(color.order ?? color.sort_order, index),
    sort_order: normalizeNumber(color.sort_order ?? color.order, index)
  };
}

export function normalizeProductColors(product?: Pick<Product, 'color_swatches' | 'colors'> | null): StorefrontProductColor[] {
  if (!product) return [];
  const source = Array.isArray(product.color_swatches) && product.color_swatches.length ? product.color_swatches : product.colors;
  if (!Array.isArray(source)) return [];
  return (source as ProductColorInput[])
    .map((color, index) => normalizeProductColor(color, index))
    .sort((a, b) => (a.order ?? a.sort_order ?? 0) - (b.order ?? b.sort_order ?? 0));
}

function normalizeProductVariants(variants?: unknown): NonNullable<Product['variants']> {
  if (!Array.isArray(variants)) return [];
  return variants.map((variant, index) => {
    const item = (variant && typeof variant === 'object' ? variant : {}) as AnyRecord;
    const id = stringifyProductValue(item.id ?? item.product_variant_id) || `variant-${index + 1}`;
    const stock = normalizeNumber(item.stock ?? item.inventory);
    return {
      ...item,
      id,
      product_variant_id: stringifyProductValue(item.product_variant_id ?? item.id) || id,
      color: stringifyProductValue(item.color),
      size: stringifyProductValue(item.size),
      cup: stringifyProductValue(item.cup),
      sku: stringifyProductValue(item.sku),
      price: normalizeNumber(item.price),
      compare_at_price: normalizeNumber(item.compare_at_price),
      discount_price: item.discount_price == null ? undefined : normalizeNumber(item.discount_price),
      stock,
      inventory: stock,
      is_available: item.is_available !== false
    };
  });
}

export function normalizeStorefrontProduct(input: Product): Product {
  const record = (input || {}) as AnyRecord;
  const id = stringifyProductValue(record.id ?? record._id ?? record.code);
  const title = stringifyProductValue(record.title ?? record.name, id || 'محصول');
  const images = normalizeProductImages(record.images);
  const coverImage = normalizeProductImage(record.cover_image) || images[0] || '';
  const colorSwatches = normalizeProductColors(record);
  const variants = normalizeProductVariants(record.variants);
  const stock = variants.length ? variants.reduce((sum, variant) => sum + normalizeNumber(variant.stock ?? variant.inventory), 0) : normalizeNumber(record.stock);

  return {
    ...record,
    id,
    name: stringifyProductValue(record.name ?? title, title),
    title,
    slug: stringifyProductValue(record.slug),
    code: stringifyProductValue(record.code),
    brand: stringifyProductValue(record.brand),
    short_description: stringifyProductValue(record.short_description),
    description: stringifyProductValue(record.description),
    price: normalizeNumber(record.price),
    compare_at_price: record.compare_at_price == null ? undefined : normalizeNumber(record.compare_at_price),
    discount_price: record.discount_price == null ? undefined : normalizeNumber(record.discount_price),
    category: stringifyProductValue(record.category),
    collection: stringifyProductValue(record.collection),
    tags: normalizeProductList(record.tags),
    cover_image: coverImage,
    images,
    colors: colorSwatches.map((color) => color.value),
    color_swatches: colorSwatches,
    sizes: normalizeProductList(record.sizes),
    has_cup: normalizeBoolean(record.has_cup ?? record.has_cup_option),
    has_cup_option: normalizeBoolean(record.has_cup_option ?? record.has_cup),
    cups: normalizeProductList(record.cups),
    cup_size: stringifyProductValue(record.cup_size),
    variants,
    product_details: stringifyProductValue(record.product_details ?? record.details),
    details: stringifyProductValue(record.details ?? record.product_details),
    size_and_fit: stringifyProductValue(record.size_and_fit ?? record.size_fit),
    size_fit: stringifyProductValue(record.size_fit ?? record.size_and_fit),
    fabric_and_care: stringifyProductValue(record.fabric_and_care ?? record.fabric_care),
    fabric_care: stringifyProductValue(record.fabric_care ?? record.fabric_and_care),
    shipping_and_returns: stringifyProductValue(record.shipping_and_returns ?? record.shipping_returns),
    shipping_returns: stringifyProductValue(record.shipping_returns ?? record.shipping_and_returns),
    faq: stringifyProductValue(record.faq),
    features: normalizeProductList(record.features),
    badges: normalizeProductList(record.badges),
    complete_the_look: normalizeProductList(record.complete_the_look ?? record.complete_the_look_ids),
    complete_the_look_ids: normalizeProductList(record.complete_the_look_ids ?? record.complete_the_look),
    similar_products: normalizeProductList(record.similar_products ?? record.similar_product_ids),
    similar_product_ids: normalizeProductList(record.similar_product_ids ?? record.similar_products),
    complete_the_look_enabled: record.complete_the_look_enabled !== false,
    is_active: record.is_active !== false,
    product_type: stringifyProductValue(record.product_type),
    weight: normalizeNumber(record.weight),
    avg_rating: normalizeNumber(record.avg_rating),
    review_count: normalizeNumber(record.review_count),
    material: stringifyProductValue(record.material),
    stock,
    is_featured: Boolean(record.is_featured),
    wash_instructions: stringifyProductValue(record.wash_instructions),
    created_date: stringifyProductValue(record.created_date),
    updated_date: stringifyProductValue(record.updated_date)
  };
}


export function productIdentifierMatches(product: Pick<Product, 'id' | 'code'>, id: string) {
  const target = stringifyProductValue(id);
  return Boolean(target) && [product.id, product.code].some((value) => stringifyProductValue(value) === target);
}

export function normalizeStorefrontProducts(products: Product[]): Product[] {
  return products.map(normalizeStorefrontProduct);
}
