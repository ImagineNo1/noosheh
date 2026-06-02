import Link from 'next/link';
import type { Product } from '@/app/admin/types';
import { productHref } from '@/lib/product-normalization';
import { formatPrice, normalizeColors } from './product-utils';

function SimilarCard({ product }: { product: Product }) {
  const coverImage = product.images?.[0] || product.cover_image;
  const hasDiscount = Boolean(product.discount_price && product.discount_price < product.price);
  const price = hasDiscount ? product.discount_price : product.price;
  const discountPercent = hasDiscount ? Math.round((1 - (price || 0) / product.price) * 100) : 0;
  const colors = normalizeColors(product).filter((color) => color.is_active !== false && color.active !== false);

  return (
    <Link href={productHref(product)} className="store-similar-card">
      <div className="store-similar-media">
        {coverImage ? <img src={coverImage} alt={product.title} /> : <span>بدون تصویر</span>}
        {hasDiscount ? <b>{discountPercent.toLocaleString('fa-IR')}٪</b> : null}
      </div>
      <div className="store-similar-body">
        <h3>{product.title}</h3>
        <div>
          <strong>{formatPrice(price)} ریال</strong>
          {hasDiscount ? <del>{formatPrice(product.price)}</del> : null}
        </div>
        {product.avg_rating ? <small>★ {product.avg_rating.toLocaleString('fa-IR')} ({(product.review_count || 0).toLocaleString('fa-IR')})</small> : null}
        {colors.length > 0 ? (
          <p>
            {colors.slice(0, 5).map((color) => <i key={color.value} style={{ backgroundColor: color.hex || color.value }} />)}
            {colors.length > 5 ? <em>+{(colors.length - 5).toLocaleString('fa-IR')}</em> : null}
          </p>
        ) : null}
      </div>
    </Link>
  );
}

export default function SimilarProducts({ products = [] }: { products?: Product[] }) {
  return (
    <section className="store-similar-section" dir="rtl">
      <div className="store-ref-heading">
        <span />
        <h2>محصولات مشابه</h2>
        <span />
      </div>
      {products.length ? (
        <div className="store-similar-rail">
          {products.map((product) => <SimilarCard key={product.id} product={product} />)}
        </div>
      ) : (
        <div className="store-empty-state">محصول مشابهی یافت نشد.</div>
      )}
    </section>
  );
}
