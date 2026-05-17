'use client';

import Link from 'next/link';
import type { Product } from '@/app/admin/types';
import { useCompare } from './ProductCompare';
import { useCart } from '@/lib/cart-context';

const formatPrice = (price?: number) => (price || 0).toLocaleString('fa-IR');

export default function ProductCard({ product }: { product: Product }) {
  const hasDiscount = !!product.discount_price && product.discount_price < product.price;
  const compare = useCompare();
  const { addItem } = useCart();
  const discountPercent = hasDiscount ? Math.round(((product.price - (product.discount_price || 0)) / product.price) * 100) : 0;
  const inStock = (product.stock ?? 1) > 0;

  return (
    <article className="store-product-card" dir="rtl">
      <Link href={`/product/${product.id}`}>
        <div className="store-product-image">
          {product.images?.[0] ? <img src={product.images[0]} alt={product.title} /> : <span>بدون تصویر</span>}
          {hasDiscount && <b className="store-discount-badge">{discountPercent}%-</b>}
          <button onClick={(event) => event.preventDefault()} className="store-card-heart">♡</button>
          {compare && <button onClick={(event) => { event.preventDefault(); compare.addToCompare(product); }} className={`store-card-compare ${compare.isInCompare(product.id) ? 'active' : ''}`}>▥</button>}
        </div>
      </Link>
      <div className="store-product-info">
        <h3>{product.title}</h3>
        <div className="store-product-price">{hasDiscount ? <><strong>{formatPrice(product.discount_price)} تومان</strong><del>{formatPrice(product.price)}</del></> : <strong>{formatPrice(product.price)} تومان</strong>}</div>
        <small>{inStock ? 'موجود در انبار' : 'ناموجود'}</small>
        <div className="store-card-actions"><Link href={`/product/${product.id}`} className="store-outline-btn">مشاهده</Link><button className="store-primary-btn" disabled={!inStock} onClick={() => inStock && addItem(product, 1)}>افزودن</button></div>
      </div>
    </article>
  );
}
