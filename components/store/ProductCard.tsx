'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import type { Product } from '@/app/admin/types';
import { useCart } from '@/lib/cart-context';
import { productHref } from '@/lib/product-normalization';
import { useCompare } from './ProductCompare';

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

function activeColors(product: Product) {
  if (product.color_swatches?.length) {
    return product.color_swatches.filter((color) => color.active !== false && color.is_active !== false).map((color) => ({
      key: color.slug || (color.value?.startsWith('#') ? '' : color.value) || color.name,
      name: color.name,
      hex: color.hex || color.value || color.slug
    }));
  }
  return (product.colors || []).map((color) => ({ key: color, name: color, hex: color }));
}

function availableSizes(product: Product) {
  const variantSizes = product.variants?.map((variant) => variant.size).filter(Boolean) || [];
  return Array.from(new Set([...(product.sizes || []), ...variantSizes])).slice(0, 5);
}

export default function ProductCard({ product }: { product: Product }) {
  const [wished, setWished] = useState(false);
  const hasDiscount = Boolean(product.discount_price && product.discount_price < product.price);
  const discountPercent = hasDiscount ? Math.round((1 - (product.discount_price || 0) / product.price) * 100) : 0;
  const currentPrice = hasDiscount ? product.discount_price : product.price;
  const cover = product.images?.[0] || product.cover_image || fallbackImage;
  const stock = totalStock(product);
  const inStock = stock > 0;
  const needsVariantSelection = Boolean(product.variants?.length || product.sizes?.length || product.color_swatches?.length || product.has_cup || product.cups?.length);
  const compare = useCompare();
  const { addItem } = useCart();
  const colors = activeColors(product);
  const sizes = availableSizes(product);
  const href = productHref(product);
  const rating = product.avg_rating || 4.6;
  const reviews = product.review_count || 0;

  const handlePrimaryAction = () => {
    if (!inStock) return;
    if (needsVariantSelection) window.location.assign(href);
    else addItem(product, 1);
  };

  return (
    <article className={`store-product-card premium ${!inStock ? 'is-out' : ''}`} dir="rtl">
      <div className="store-product-card-frame">
        <Link href={href} className="store-product-media" aria-label={`مشاهده ${product.title}`}>
          <Image src={cover} alt={product.title} fill sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw" unoptimized={cover.startsWith('http')} />
          <div className="store-product-badges">
            {!inStock ? <span className="muted">ناموجود</span> : hasDiscount ? <span>{discountPercent.toLocaleString('fa-IR')}٪ تخفیف</span> : null}
            {inStock && product.badges?.includes('new') ? <span className="light">جدید</span> : null}
          </div>
          <span className="store-quick-view"><Icon name="eye" /> مشاهده سریع</span>
        </Link>

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

        {colors.length > 0 ? (
          <div className="store-product-colors">
            {colors.slice(0, 5).map((color) => <span key={color.key} title={color.name} style={{ backgroundColor: color.hex }} />)}
            {colors.length > 5 ? <small>+{(colors.length - 5).toLocaleString('fa-IR')}</small> : null}
          </div>
        ) : null}

        {sizes.length > 0 ? (
          <div className="store-product-sizes">
            {sizes.map((size) => <span key={size}>{size}</span>)}
          </div>
        ) : null}

        <div className="store-product-stock-row">
          {inStock ? <span className={stock <= 3 ? 'low' : ''}>{stock <= 3 ? 'موجودی کم' : 'ارسال سریع'}</span> : <span className="out">اطلاع‌رسانی موجودی</span>}
        </div>

        <div className="store-product-actions">
          <button type="button" disabled={!inStock} onClick={handlePrimaryAction}>
            {inStock ? <Icon name="cart" /> : <Icon name="bell" />}
            <span>{!inStock ? 'ناموجود' : needsVariantSelection ? 'انتخاب سایز' : 'افزودن به سبد'}</span>
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
