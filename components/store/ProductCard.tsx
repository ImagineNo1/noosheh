'use client';

import Link from 'next/link';
import type { Product } from '@/app/admin/types';

const formatPrice = (price?: number) => (price || 0).toLocaleString('fa-IR');

export default function ProductCard({ product }: { product: Product }) {
  const hasDiscount = !!product.discount_price && product.discount_price < product.price;
  const finalPrice = hasDiscount ? product.discount_price : product.price;
  const discountPercent = hasDiscount ? Math.round(((product.price - (product.discount_price || 0)) / product.price) * 100) : 0;

  return (
    <Link href={`/product/${product.id}`} className="store-product-card">
      <div className="store-product-image">
        {product.images?.[0] ? <img src={product.images[0]} alt={product.title} /> : <span>بدون تصویر</span>}
        {hasDiscount && <b className="store-discount-badge">٪{discountPercent}</b>}
      </div>
      <div className="store-product-info">
        <h3>{product.title}</h3>
        {product.code && <small>کد: {product.code}</small>}
        <div className="store-product-price">
          <strong>{formatPrice(finalPrice)} تومان</strong>
          {hasDiscount && <del>{formatPrice(product.price)}</del>}
        </div>
      </div>
    </Link>
  );
}
