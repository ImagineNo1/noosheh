'use client';

import Link from 'next/link';
import type { Product } from '@/app/admin/types';
import { useCompare } from './ProductCompare';

const formatPrice = (price?: number) => (price || 0).toLocaleString('fa-IR');

export default function ProductCard({ product }: { product: Product }) {
  const hasDiscount = !!product.discount_price && product.discount_price < product.price;
  const compare = useCompare();
  const discountPercent = hasDiscount ? Math.round(((product.price - (product.discount_price || 0)) / product.price) * 100) : 0;

  return (
    <Link href={`/product/${product.id}`} className="store-product-card" dir="rtl">
      <div className="store-product-image">
        {product.images?.[0] ? <img src={product.images[0]} alt={product.title} /> : <span>بدون تصویر</span>}
        {hasDiscount && <b className="store-discount-badge">{discountPercent}%-</b>}
        <button onClick={(event) => event.preventDefault()} className="store-card-heart">♡</button>
        {compare && <button onClick={(event) => { event.preventDefault(); compare.addToCompare(product); }} className={`store-card-compare ${compare.isInCompare(product.id) ? 'active' : ''}`} title="افزودن به مقایسه">▥</button>}
      </div>
      <div className="store-product-info">
        <h3>{product.title}</h3>
        <div className="store-product-price">
          {hasDiscount ? <><strong>{formatPrice(product.discount_price)} تومان</strong><del>{formatPrice(product.price)}</del></> : <strong>{formatPrice(product.price)} تومان</strong>}
        </div>
      </div>
    </Link>
  );
}
