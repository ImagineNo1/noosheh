'use client';

import Link from 'next/link';
import type { Product } from '@/app/admin/types';
import { useCart } from '@/lib/cart-context';
import { useCompare } from './ProductCompare';

const formatPrice = (price?: number) => (price || 0).toLocaleString('fa-IR');

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

export default function ProductCard({ product }: { product: Product }) {
  const hasDiscount = Boolean(product.discount_price && product.discount_price < product.price);
  const discountPercent = hasDiscount ? Math.round((1 - (product.discount_price || 0) / product.price) * 100) : 0;
  const currentPrice = hasDiscount ? product.discount_price : product.price;
  const cover = product.images?.[0];
  const inStock = (product.stock ?? 1) > 0;
  const compare = useCompare();
  const { addItem } = useCart();
  const colors = activeColors(product);

  return (
    <article className="group overflow-hidden rounded-xl border border-border bg-card transition-shadow hover:shadow-md" dir="rtl">
      <Link href={`/product/${product.id}`} className="block">
        <div className="relative aspect-[3/4] overflow-hidden bg-secondary/30">
          {cover ? (
            <img src={cover} alt={product.title} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-xs text-muted-foreground/50">بدون تصویر</div>
          )}
          <div className="absolute right-2 top-2 flex flex-col gap-1">
            {hasDiscount && <span className="rounded-full bg-primary px-2 py-0.5 text-[10px] font-bold text-primary-foreground">{discountPercent}٪</span>}
            {product.badges?.includes('new') && <span className="rounded-full bg-white/90 px-2 py-0.5 text-[10px] font-medium text-foreground">جدید</span>}
            {(product.badges?.includes('best_seller') || product.is_featured) && <span className="rounded-full bg-amber-500 px-2 py-0.5 text-[10px] font-bold text-white">پرفروش</span>}
          </div>
        </div>
      </Link>

      <div className="space-y-2 p-3">
        {product.brand && <p className="text-[10px] text-muted-foreground">{product.brand}</p>}
        <Link href={`/product/${product.id}`} className="block">
          <h3 className="line-clamp-2 min-h-[2.4rem] text-sm font-medium leading-snug text-card-foreground">{product.title}</h3>
        </Link>

        {colors.length > 0 && (
          <div className="flex items-center gap-1 pt-0.5">
            {colors.slice(0, 5).map((color) => (
              <span key={color.key} title={color.name} className="h-3.5 w-3.5 rounded-full border border-border/60" style={{ backgroundColor: color.hex }} />
            ))}
            {colors.length > 5 && <span className="text-[10px] text-muted-foreground">+{(colors.length - 5).toLocaleString('fa-IR')}</span>}
          </div>
        )}

        <div className="flex flex-wrap items-baseline gap-2 pt-0.5">
          <strong className="text-sm text-primary">{formatPrice(currentPrice)} تومان</strong>
          {hasDiscount && <del className="text-xs text-muted-foreground">{formatPrice(product.price)}</del>}
        </div>
        <p className="text-[11px] text-muted-foreground">{inStock ? 'موجود در انبار' : 'ناموجود'}</p>

        <div className="grid grid-cols-[1fr_auto_auto] gap-2 pt-1">
          <Link href={`/product/${product.id}`} className="inline-flex h-9 items-center justify-center rounded-full border border-border px-3 text-xs font-medium hover:border-primary hover:text-primary">
            مشاهده
          </Link>
          <button
            type="button"
            className="inline-flex h-9 items-center justify-center rounded-full bg-primary px-3 text-xs font-medium text-primary-foreground disabled:cursor-not-allowed disabled:opacity-50"
            disabled={!inStock}
            onClick={() => inStock && addItem(product, 1)}
          >
            افزودن
          </button>
          {compare && (
            <button
              type="button"
              title="افزودن به مقایسه"
              className={`inline-flex h-9 w-9 items-center justify-center rounded-full border border-border text-xs hover:border-primary hover:text-primary ${compare.isInCompare(product.id) ? 'border-primary text-primary' : ''}`}
              onClick={() => compare.addToCompare(product)}
            >
              ▥
            </button>
          )}
        </div>
      </div>
    </article>
  );
}
