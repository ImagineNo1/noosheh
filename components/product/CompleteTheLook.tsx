'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import type { Product } from '@/app/admin/types';
import { productHref } from '@/lib/product-normalization';
import ProductCardOptions, { findProductCardVariant, getProductCardOptions, hasProductCardOptions, isProductCardSelectionAvailable, isProductCardSelectionComplete, type ProductCardSelection } from '@/components/store/ProductCardOptions';
import { colorImageUrls, colorValue, formatPrice, normalizeColors, variantAvailable, type ProductColor } from './product-utils';

function totalStock(product: Product) {
  return product.variants?.length ? product.variants.reduce((sum, variant) => sum + Number(variant.stock ?? variant.inventory ?? 0), 0) : Number(product.stock ?? 0);
}

function ProductMiniCard({ product, preferredColor, onAddToCart }: { product: Product; preferredColor?: ProductColor | null; onAddToCart: (product: Product, size?: string, color?: string, cup?: string, variantId?: string, image?: string, price?: number) => void }) {
  const colors = normalizeColors(product);
  const defaultColor = colors.find((color) => colorValue(color) === colorValue(preferredColor)) || colors.find((color) => color.is_active !== false && color.active !== false) || colors[0] || null;
  const [selection, setSelection] = useState<ProductCardSelection>({ color: defaultColor ? colorValue(defaultColor) : '' });
  const [selectionError, setSelectionError] = useState(false);
  const [added, setAdded] = useState(false);

  const optionGroups = useMemo(() => getProductCardOptions(product), [product]);
  const hasOptions = hasProductCardOptions(optionGroups);
  const selectedColor = useMemo(() => colors.find((color) => colorValue(color) === selection.color || color.name === selection.color || color.slug === selection.color || color.value === selection.color) || defaultColor, [colors, defaultColor, selection.color]);
  const variant = useMemo(() => findProductCardVariant(product, selection), [product, selection]);
  const images = colorImageUrls(selectedColor);
  const coverImage = images[0] || product.images?.[0] || product.cover_image || '';
  const price = variant?.discount_price || variant?.price || product.discount_price || product.price;
  const comparePrice = variant?.compare_at_price || (variant?.discount_price ? variant.price : product.discount_price ? product.price : undefined);
  const stock = totalStock(product);
  const selectionComplete = isProductCardSelectionComplete(optionGroups, selection);
  const selectionAvailable = !selectionComplete || isProductCardSelectionAvailable(product, selection);
  const isAvailable = product.variants?.length ? (selectionComplete ? Boolean(variant && variantAvailable(variant)) : stock > 0) : stock > 0;
  const canAdd = (!hasOptions || selectionComplete) && selectionAvailable && isAvailable;

  const handleSelectionChange = (nextSelection: ProductCardSelection) => {
    setSelection(nextSelection);
    setSelectionError(false);
  };

  const handleAdd = () => {
    if (!canAdd) {
      setSelectionError(true);
      return;
    }
    onAddToCart(product, selection.size || '', selection.color || '', selection.cup || '', variant?.id || variant?.product_variant_id, coverImage, price);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  return (
    <article className="store-look-card">
      <Link href={productHref(product)} className="store-look-media">
        {coverImage ? <img src={coverImage} alt={product.title} /> : <span>بدون تصویر</span>}
      </Link>
      <div className="store-look-body">
        <span className="store-look-brand">{product.brand || 'NOOSHEH'}</span>
        <Link href={productHref(product)}><h3>{product.title}</h3></Link>
        <div className="store-look-price"><strong>{formatPrice(price)} ریال</strong>{comparePrice && comparePrice > price ? <del>{formatPrice(comparePrice)}</del> : null}</div>
        <ProductCardOptions product={product} selection={selection} onSelectionChange={handleSelectionChange} showError={selectionError} compact />
        <button type="button" onClick={handleAdd} disabled={!isAvailable} className={`store-look-add ${added ? 'added' : ''}`}>{added ? '✓ اضافه شد' : isAvailable ? 'افزودن به سبد' : 'ناموجود'}</button>
      </div>
    </article>
  );
}

export default function CompleteTheLook({ products = [], currentColor, onAddToCart }: { products?: Product[]; currentColor?: ProductColor | null; onAddToCart: (product: Product, size?: string, color?: string, cup?: string, variantId?: string, image?: string, price?: number) => void }) {
  return (
    <section className="store-complete-look-section" dir="rtl" id="complete-the-look">
      <div className="store-ref-heading">
        <span />
        <h2>استایلتان را کامل کنید</h2>
        <span />
        <small>Complete the Look</small>
      </div>
      {products.length ? <div className="store-look-rail">{products.map((product) => <ProductMiniCard key={product.id} product={product} preferredColor={currentColor} onAddToCart={onAddToCart} />)}</div> : <div className="store-empty-state">پیشنهاد مکملی ثبت نشده است.</div>}
    </section>
  );
}
