'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import type { Product } from '@/app/admin/types';
import { useCart } from '@/lib/cart-context';
import { productHref } from '@/lib/product-normalization';
import ProductCardImageCarousel from './ProductCardImageCarousel';
import ProductCardOptions, { findProductCardVariant, getProductCardOptions, hasProductCardOptions, isProductCardSelectionAvailable, isProductCardSelectionComplete, type ProductCardSelection } from './ProductCardOptions';

const fallbackImage = '/store/product-fallback.png';
const formatPrice = (price?: number) => `${(price || 0).toLocaleString('fa-IR')} ریال`;
const totalStock = (product: Product) => product.variants?.length ? product.variants.reduce((sum, variant) => sum + Number(variant.stock ?? variant.inventory ?? 0), 0) : Number(product.stock ?? 0);

export default function StaticProductCard({ product, imageSizes = '(max-width: 768px) 50vw, 25vw' }: { product: Product; imageSizes?: string }) {
  const hasDiscount = Boolean(product.discount_price && product.discount_price < product.price);
  const discountPercent = hasDiscount ? Math.round((1 - (product.discount_price || 0) / product.price) * 100) : 0;
  const currentPrice = hasDiscount ? product.discount_price : product.price;
  const [selection, setSelection] = useState<ProductCardSelection>({});
  const href = productHref(product);
  const { addItem } = useCart();
  const optionGroups = useMemo(() => getProductCardOptions(product), [product]);
  const hasOptions = hasProductCardOptions(optionGroups);
  const selectionComplete = isProductCardSelectionComplete(optionGroups, selection);
  const selectionAvailable = !selectionComplete || isProductCardSelectionAvailable(product, selection);
  const selectedVariant = findProductCardVariant(product, selection);
  const inStock = totalStock(product) > 0;
  const showCartAction = inStock && (!hasOptions || selectionComplete);

  const handleAddToCart = () => {
    if (!showCartAction || !selectionAvailable) return;
    addItem(product, 1, selection.size || '', selection.color || '', selection.cup || '', selectedVariant?.id || selectedVariant?.product_variant_id || '');
  };

  return (
    <article className="store-product-card" dir="rtl">
      <ProductCardImageCarousel
        href={href}
        title={product.title}
        images={product.images}
        coverImage={product.cover_image}
        fallbackImage={fallbackImage}
        imageSizes={imageSizes}
      >
        <div className="store-product-badges">
          {hasDiscount ? <span>{discountPercent.toLocaleString('fa-IR')}٪ تخفیف</span> : null}
          {product.badges?.includes('new') ? <span className="light">جدید</span> : null}
        </div>
      </ProductCardImageCarousel>

      <div className="store-product-body">
        <div className="store-product-meta">
          {product.brand ? <span>{product.brand}</span> : <span>NOOSHEH</span>}
          {product.avg_rating ? <small>{product.avg_rating.toLocaleString('fa-IR')} از ۵</small> : null}
        </div>
        <Link href={href} className="store-product-title">{product.title}</Link>

        <ProductCardOptions product={product} selection={selection} onSelectionChange={setSelection} compact />

        <div className="store-product-price">
          <strong>{formatPrice(currentPrice)}</strong>
          {hasDiscount ? <del>{formatPrice(product.price)}</del> : null}
        </div>

        <div className={`store-product-actions ${showCartAction ? 'has-inline-cart' : ''}`}>
          <Link href={href}>مشاهده</Link>
          {showCartAction ? (
            <button type="button" disabled={!selectionAvailable} onClick={handleAddToCart}>
              {selectionAvailable ? 'افزودن به سبد' : 'ناموجود'}
            </button>
          ) : null}
        </div>
      </div>
    </article>
  );
}
