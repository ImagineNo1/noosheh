import Link from 'next/link';
import type { Product } from '@/app/admin/types';
import { productHref } from '@/lib/product-normalization';
import ProductCardImageCarousel from './ProductCardImageCarousel';

const fallbackImage = '/store/product-fallback.png';
const formatPrice = (price?: number) => `${(price || 0).toLocaleString('fa-IR')} ریال`;

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

export default function StaticProductCard({ product, imageSizes = '(max-width: 768px) 50vw, 25vw' }: { product: Product; imageSizes?: string }) {
  const hasDiscount = Boolean(product.discount_price && product.discount_price < product.price);
  const discountPercent = hasDiscount ? Math.round((1 - (product.discount_price || 0) / product.price) * 100) : 0;
  const currentPrice = hasDiscount ? product.discount_price : product.price;
  const colors = activeColors(product);
  const href = productHref(product);

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

        {colors.length > 0 ? (
          <div className="store-product-colors">
            {colors.slice(0, 5).map((color) => <span key={color.key} title={color.name} style={{ backgroundColor: color.hex }} />)}
            {colors.length > 5 ? <small>+{(colors.length - 5).toLocaleString('fa-IR')}</small> : null}
          </div>
        ) : null}

        <div className="store-product-price">
          <strong>{formatPrice(currentPrice)}</strong>
          {hasDiscount ? <del>{formatPrice(product.price)}</del> : null}
        </div>

        <div className="store-product-actions">
          <Link href={href}>مشاهده</Link>
        </div>
      </div>
    </article>
  );
}
