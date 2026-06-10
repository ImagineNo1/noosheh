'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import type { Product } from '@/app/admin/types';
import { useCart } from '@/lib/cart-context';
import { productHref } from '@/lib/product-normalization';
import { useCompare } from './ProductCompare';
import ProductCardImageCarousel from './ProductCardImageCarousel';
import ProductCardOptions, { findProductCardVariant, getProductCardOptions, hasProductCardOptions, isProductCardSelectionAvailable, isProductCardSelectionComplete, type ProductCardSelection } from './ProductCardOptions';

const fallbackImage = '/store/product-fallback.png';
const formatPrice = (price?: number) => `${(price || 0).toLocaleString('fa-IR')} تومان`;
const totalStock = (product: Product) => product.variants?.length ? product.variants.reduce((sum, variant) => sum + Number(variant.stock ?? variant.inventory ?? 0), 0) : Number(product.stock ?? 0);

function Icon({ name }: { name: 'heart' | 'cart' | 'compare' | 'eye' | 'bell' }) {
  const paths = {
    heart: <path d="M20.2 5.8c-1.7-1.9-4.5-1.9-6.2 0L12 8l-2-2.2c-1.7-1.9-4.5-1.9-6.2 0-1.9 2.1-1.7 5.3.4 7.2L12 20l7.8-7c2.1-1.9 2.3-5.1.4-7.2Z" />,
    cart: <><path d="M6 7h15l-2 8H8L6 7Z" /><path d="M6 7 5.2 4H3" /><circle cx="9" cy="20" r="1.5" /><circle cx="18" cy="20" r="1.5" /></>,
    compare: <><path d="M8 7h12M8 17h12" /><path d="m12 3-4 4 4 4M16 13l4 4-4 4" /></>,
    eye: <><path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6S2 12 2 12Z" /><circle cx="12" cy="12" r="2.5" /></>,
    bell: <><path d="M18 9a6 6 0 0 0-12 0c0 7-3 7-3 7h18s-3 0-3-7" /><path d="M10 20a2 2 0 0 0 4 0" /></>
  };
  return <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">{paths[name]}</svg>;
}

export default function ProductCard({ product }: { product: Product }) {
  const [wished, setWished] = useState(false);
  const [selection, setSelection] = useState<ProductCardSelection>({});
  const [selectionError, setSelectionError] = useState(false);
  const hasDiscount = Boolean(product.discount_price && product.discount_price < product.price);
  const discountPercent = hasDiscount ? Math.round((1 - (product.discount_price || 0) / product.price) * 100) : 0;
  const currentPrice = hasDiscount ? product.discount_price : product.price;
  const stock = totalStock(product);
  const inStock = stock > 0;
  const compare = useCompare();
  const { addItem } = useCart();
  const href = productHref(product);
  const rating = product.avg_rating || 4.6;
  const reviews = product.review_count || 0;
  const optionGroups = useMemo(() => getProductCardOptions(product), [product]);
  const hasOptions = hasProductCardOptions(optionGroups);
  const selectionComplete = isProductCardSelectionComplete(optionGroups, selection);
  const selectedVariant = findProductCardVariant(product, selection);
  const selectionAvailable = !selectionComplete || isProductCardSelectionAvailable(product, selection);
  const canAddConfiguredProduct = (!hasOptions || selectionComplete) && selectionAvailable;

  const handleSelectionChange = (nextSelection: ProductCardSelection) => {
    setSelection(nextSelection);
    setSelectionError(false);
  };

  const handlePrimaryAction = () => {
    if (!inStock) return;
    if (!canAddConfiguredProduct) {
      setSelectionError(true);
      return;
    }
    addItem(product, 1, selection.size || '', selection.color || '', selection.cup || '', selectedVariant?.id || selectedVariant?.product_variant_id || '');
  };

  return (
    <article className={`store-product-card premium ${!inStock ? 'is-out' : ''}`} dir="rtl">
      <div className="store-product-card-frame">
        <ProductCardImageCarousel
          href={href}
          title={product.title}
          images={product.images}
          coverImage={product.cover_image}
          fallbackImage={fallbackImage}
          imageSizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
          quickView={<span className="store-quick-view"><Icon name="eye" /> مشاهده سریع</span>}
        >
          <div className="store-product-badges">
            {!inStock ? <span className="muted">ناموجود</span> : hasDiscount ? <span>{discountPercent.toLocaleString('fa-IR')}٪ تخفیف</span> : null}
            {inStock && product.badges?.includes('new') ? <span className="light">جدید</span> : null}
          </div>
        </ProductCardImageCarousel>

        <button
          type="button"
          className={`store-wishlist-button ${wished ? 'active' : ''}`}
          onClick={() => setWished((value) => !value)}
          aria-label={wished ? 'حذف از علاقه‌مندی‌ها' : 'افزودن به علاقه‌مندی‌ها'}
        >
          <Icon name="heart" />
        </button>
      </div>

      <div className="store-product-body">
        <span className="store-product-brand">{product.brand || 'NOOSHEH'}</span>
        <Link href={href} className="store-product-title">{product.title}</Link>
        {product.short_description ? <p className="store-product-subtitle">{product.short_description}</p> : null}

        <div className="store-product-rating">
          <span>{rating.toLocaleString('fa-IR')}</span>
          <i>★★★★★</i>
          {reviews ? <small>({reviews.toLocaleString('fa-IR')})</small> : null}
        </div>

        <div className="store-product-price">
          <strong>{formatPrice(currentPrice)}</strong>
          {hasDiscount ? <del>{formatPrice(product.price)}</del> : null}
        </div>

        <ProductCardOptions product={product} selection={selection} onSelectionChange={handleSelectionChange} showError={selectionError} />

        <div className="store-product-stock-row">
          {inStock ? <span className={stock <= 3 ? 'low' : ''}>{stock <= 3 ? 'موجودی کم' : 'ارسال سریع'}</span> : <span className="out">اطلاع‌رسانی موجودی</span>}
        </div>

        <div className="store-product-actions">
          <button type="button" disabled={!inStock} onClick={handlePrimaryAction}>
            {inStock ? <Icon name="cart" /> : <Icon name="bell" />}
            <span>{!inStock ? 'ناموجود' : hasOptions && !selectionComplete ? 'انتخاب گزینه‌ها' : selectionComplete && !selectionAvailable ? 'ناموجود' : 'افزودن به سبد'}</span>
          </button>
          {compare ? (
            <button type="button" className={`store-compare-mini ${compare.isInCompare(product.id) ? 'active' : ''}`} onClick={() => compare.addToCompare(product)} aria-label="افزودن به مقایسه">
              <Icon name="compare" />
            </button>
          ) : null}
        </div>
      </div>
    </article>
  );
}
