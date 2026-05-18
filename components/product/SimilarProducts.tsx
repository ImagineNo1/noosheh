import Link from 'next/link';
import type { Product } from '@/app/admin/types';
import { formatPrice, normalizeColors } from './product-utils';

function SimilarCard({ product }: { product: Product }) {
  const coverImage = product.images?.[0];
  const hasDiscount = Boolean(product.discount_price && product.discount_price < product.price);
  const price = hasDiscount ? product.discount_price : product.price;
  const discountPercent = hasDiscount ? Math.round((1 - (price || 0) / product.price) * 100) : 0;
  const colors = normalizeColors(product).filter((color) => color.is_active !== false && color.active !== false);
  return (
    <Link href={`/product/${product.id}`} className="group block">
      <div className="overflow-hidden rounded-lg border border-border bg-card transition-shadow hover:shadow-md">
        <div className="relative aspect-[3/4] overflow-hidden bg-secondary/30">{coverImage ? <img src={coverImage} alt={product.title} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" /> : <div className="flex h-full items-center justify-center text-xs text-muted-foreground">بدون تصویر</div>}{hasDiscount && <span className="absolute right-2 top-2 rounded-full bg-primary px-2 py-0.5 text-[10px] text-primary-foreground">{discountPercent}٪</span>}</div>
        <div className="space-y-1.5 p-3"><h3 className="line-clamp-2 text-sm font-medium">{product.title}</h3><div className="flex items-center gap-2"><span className="text-sm font-bold text-primary">{formatPrice(price)} ریال</span>{hasDiscount && <span className="text-xs text-muted-foreground line-through">{formatPrice(product.price)}</span>}</div>{product.avg_rating ? <div className="text-xs text-muted-foreground">★ {product.avg_rating.toFixed(1)} ({product.review_count || 0})</div> : null}{colors.length > 0 && <div className="flex gap-1 pt-1">{colors.slice(0, 5).map((color) => <span key={color.value} className="h-4 w-4 rounded-full border border-border" style={{ backgroundColor: color.hex || color.value }} />)}{colors.length > 5 && <span className="self-center text-[10px] text-muted-foreground">+{colors.length - 5}</span>}</div>}</div>
      </div>
    </Link>
  );
}

export default function SimilarProducts({ products = [] }: { products?: Product[] }) {
  return (
    <section className="mx-auto max-w-7xl px-4 pt-16">
      <h2 className="mb-8 text-center text-2xl font-bold">محصولات مشابه</h2>
      {products.length ? <div className="grid grid-cols-2 gap-4 md:grid-cols-4">{products.map((product) => <SimilarCard key={product.id} product={product} />)}</div> : <div className="rounded-lg bg-secondary/30 p-12 text-center"><p className="text-sm text-muted-foreground">محصول مشابهی یافت نشد.</p></div>}
    </section>
  );
}
