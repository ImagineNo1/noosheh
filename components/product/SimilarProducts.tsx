'use client';

import type { Product } from '@/app/admin/types';
import type { ProductColor } from './product-utils';
import { ProductMiniCard } from './CompleteTheLook';

export default function SimilarProducts({ products = [], currentColor, onAddToCart }: { products?: Product[]; currentColor?: ProductColor | null; onAddToCart: (product: Product, size?: string, color?: string, cup?: string, variantId?: string, image?: string, price?: number) => void }) {
  return (
    <section className="store-similar-section" dir="rtl">
      <div className="store-ref-heading">
        <span />
        <h2>محصولات مشابه</h2>
        <span />
      </div>
      {products.length ? (
        <div className="store-look-rail store-similar-rail selectable">
          {products.map((product) => <ProductMiniCard key={product.id} product={product} preferredColor={currentColor} onAddToCart={onAddToCart} />)}
        </div>
      ) : (
        <div className="store-empty-state">محصول مشابهی یافت نشد.</div>
      )}
    </section>
  );
}
