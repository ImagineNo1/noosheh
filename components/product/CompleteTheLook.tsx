'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import type { Product } from '@/app/admin/types';
import { productHref } from '@/lib/product-normalization';
import { colorImageUrls, colorMatchesVariant, colorValue, formatPrice, normalizeColors, normalizeList, optionMatchesVariant, variantAvailable, type ProductColor } from './product-utils';

function ProductMiniCard({ product, preferredColor, onAddToCart }: { product: Product; preferredColor?: ProductColor | null; onAddToCart: (product: Product, size?: string, color?: string, cup?: string, variantId?: string, image?: string, price?: number) => void }) {
  const colors = normalizeColors(product);
  const defaultColor = colors.find((color) => colorValue(color) === colorValue(preferredColor)) || colors.find((color) => color.is_active !== false && color.active !== false) || colors[0] || null;
  const [selectedColor, setSelectedColor] = useState<ProductColor | null>(defaultColor);
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedCup, setSelectedCup] = useState('');
  const [added, setAdded] = useState(false);

  const variant = useMemo(() => product.variants?.find((item) => colorMatchesVariant(selectedColor, item.color) && optionMatchesVariant(selectedSize, item.size) && (!product.has_cup_option || optionMatchesVariant(selectedCup, item.cup))), [product, selectedColor, selectedSize, selectedCup]);
  const images = colorImageUrls(selectedColor);
  const coverImage = images[0] || product.images?.[0] || product.cover_image || '';
  const price = variant?.discount_price || variant?.price || product.discount_price || product.price;
  const comparePrice = variant?.compare_at_price || (variant?.discount_price ? variant.price : product.discount_price ? product.price : undefined);
  const hasConfiguredVariants = Boolean(product.variants?.length);
  const hasMissingSize = Boolean(product.sizes?.length && !selectedSize);
  const hasMissingCup = Boolean(product.has_cup_option && product.cups?.length && !selectedCup);
  const isAvailable = hasConfiguredVariants ? variantAvailable(variant) : (product.stock ?? 1) > 0;
  const canAdd = isAvailable && !hasMissingSize && !hasMissingCup;

  const handleAdd = () => {
    if (!canAdd) return;
    onAddToCart(product, selectedSize, selectedColor ? colorValue(selectedColor) : '', selectedCup, variant?.id || variant?.product_variant_id, coverImage, price);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  return (
    <article className="store-look-card">
      <Link href={productHref(product)} className="store-look-media">
        {coverImage ? <img src={coverImage} alt={product.title} /> : <span>بدون تصویر</span>}
      </Link>
      <div className="store-look-body">
        <Link href={productHref(product)}><h3>{product.title}</h3></Link>
        <div className="store-look-price"><strong>{formatPrice(price)} ریال</strong>{comparePrice && comparePrice > price ? <del>{formatPrice(comparePrice)}</del> : null}</div>
        {colors.length > 0 ? (
          <div className="store-look-swatches" aria-label="انتخاب رنگ">
            {colors.slice(0, 5).map((color) => <button key={colorValue(color)} type="button" onClick={() => { setSelectedColor(color); setSelectedSize(''); setSelectedCup(''); }} className={colorValue(selectedColor) === colorValue(color) ? 'active' : ''} style={{ backgroundColor: color.hex || color.value }} title={color.name} />)}
            {colors.length > 5 ? <small>+{(colors.length - 5).toLocaleString('fa-IR')}</small> : null}
          </div>
        ) : null}
        {product.sizes?.length ? <div className="store-look-options">{normalizeList(product.sizes).slice(0, 6).map((size) => <button key={size} type="button" onClick={() => { setSelectedSize(size); setSelectedCup(''); }} className={selectedSize === size ? 'active' : ''}>{size}</button>)}</div> : null}
        {product.has_cup_option && product.cups?.length ? <div className="store-look-options">{normalizeList(product.cups).slice(0, 6).map((cup) => <button key={cup} type="button" onClick={() => setSelectedCup(cup)} className={selectedCup === cup ? 'active' : ''}>{cup}</button>)}</div> : null}
        <button type="button" onClick={handleAdd} disabled={!canAdd} className={`store-look-add ${added ? 'added' : ''}`}>{added ? '✓ اضافه شد' : isAvailable ? 'افزودن به سبد' : 'ناموجود'}</button>
      </div>
    </article>
  );
}

export default function CompleteTheLook({ products = [], currentColor, onAddToCart }: { products?: Product[]; currentColor?: ProductColor | null; onAddToCart: (product: Product, size?: string, color?: string, cup?: string, variantId?: string, image?: string, price?: number) => void }) {
  return (
    <section className="store-complete-look-section" dir="rtl" id="complete-the-look">
      <div className="store-ref-heading">
        <span />
        <h2>استایلتان را کامل کنید</h2>
        <span />
        <small>Complete the Look</small>
      </div>
      {products.length ? <div className="store-look-rail">{products.map((product) => <ProductMiniCard key={product.id} product={product} preferredColor={currentColor} onAddToCart={onAddToCart} />)}</div> : <div className="store-empty-state">پیشنهاد مکملی ثبت نشده است.</div>}
    </section>
  );
}
