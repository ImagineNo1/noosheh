'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import type { Product } from '@/app/admin/types';
import { colorImageUrls, colorValue, formatPrice, imageUrl, normalizeColors, normalizeList, variantAvailable, type ProductColor } from './product-utils';

function ProductMiniCard({ product, preferredColor, onAddToCart }: { product: Product; preferredColor?: ProductColor | null; onAddToCart: (product: Product, size?: string, color?: string, cup?: string, variantId?: string, image?: string, price?: number) => void }) {
  const colors = normalizeColors(product);
  const defaultColor = colors.find((color) => colorValue(color) === colorValue(preferredColor)) || colors.find((color) => color.is_active !== false && color.active !== false) || colors[0] || null;
  const [selectedColor, setSelectedColor] = useState<ProductColor | null>(defaultColor);
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedCup, setSelectedCup] = useState('');
  const [added, setAdded] = useState(false);

  const variant = useMemo(() => product.variants?.find((item) => (!selectedColor || item.color === colorValue(selectedColor)) && (!selectedSize || item.size === selectedSize) && (!product.has_cup_option || !selectedCup || item.cup === selectedCup)), [product, selectedColor, selectedSize, selectedCup]);
  const images = colorImageUrls(selectedColor);
  const coverImage = images[0] || product.images?.[0] || '';
  const price = variant?.discount_price || variant?.price || product.discount_price || product.price;
  const comparePrice = variant?.compare_at_price || (variant?.discount_price ? variant.price : product.discount_price ? product.price : undefined);
  const hasConfiguredVariants = Boolean(product.variants?.length);
  const isAvailable = hasConfiguredVariants ? variantAvailable(variant) : (product.stock ?? 1) > 0;

  const handleAdd = () => {
    if (product.sizes?.length && !selectedSize) return;
    if (product.has_cup_option && product.cups?.length && !selectedCup) return;
    onAddToCart(product, selectedSize, selectedColor ? colorValue(selectedColor) : '', selectedCup, variant?.id, coverImage, price);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  return (
    <div className="overflow-hidden rounded-xl border border-border bg-card">
      <Link href={`/product/${product.id}`} className="block aspect-square overflow-hidden bg-secondary/30">{coverImage ? <img src={coverImage} alt={product.title} className="h-full w-full object-cover transition-transform duration-500 hover:scale-105" /> : <div className="flex h-full items-center justify-center text-sm text-muted-foreground">بدون تصویر</div>}</Link>
      <div className="space-y-3 p-4">
        <Link href={`/product/${product.id}`} className="block"><h3 className="line-clamp-2 text-sm font-semibold">{product.title}</h3></Link>
        <div className="flex items-center gap-2"><span className="font-bold text-primary">{formatPrice(price)} تومان</span>{comparePrice && comparePrice > price && <span className="text-xs text-muted-foreground line-through">{formatPrice(comparePrice)}</span>}</div>
        {colors.length > 0 && <div className="flex gap-1.5">{colors.map((color) => <button key={colorValue(color)} type="button" onClick={() => setSelectedColor(color)} className={`h-6 w-6 rounded-full border-2 transition ${colorValue(selectedColor) === colorValue(color) ? 'scale-110 border-primary' : 'border-transparent hover:scale-105'}`} style={{ backgroundColor: color.hex || color.value }} title={color.name} />)}</div>}
        {product.sizes?.length ? <div className="flex flex-wrap gap-1.5">{normalizeList(product.sizes).map((size) => <button key={size} type="button" onClick={() => setSelectedSize(size)} className={`min-w-9 rounded border px-2 py-1.5 text-xs ${selectedSize === size ? 'border-foreground bg-foreground text-background' : 'border-border hover:border-foreground'}`}>{size}</button>)}</div> : null}
        {product.has_cup_option && product.cups?.length ? <div className="flex flex-wrap gap-1.5">{normalizeList(product.cups).map((cup) => <button key={cup} type="button" onClick={() => setSelectedCup(cup)} className={`min-w-9 rounded border px-2 py-1.5 text-xs ${selectedCup === cup ? 'border-foreground bg-foreground text-background' : 'border-border hover:border-foreground'}`}>{cup}</button>)}</div> : null}
        <button type="button" onClick={handleAdd} disabled={!isAvailable || (Boolean(product.sizes?.length) && !selectedSize) || (Boolean(product.has_cup_option && product.cups?.length) && !selectedCup)} className={`flex h-10 w-full items-center justify-center gap-2 rounded-full text-sm font-medium transition disabled:cursor-not-allowed disabled:opacity-55 ${added ? 'bg-emerald-600 text-white' : isAvailable ? 'bg-foreground text-background hover:bg-foreground/90' : 'bg-secondary text-muted-foreground'}`}>{added ? '✓ اضافه شد' : isAvailable ? '🛍 افزودن به سبد' : 'ناموجود'}</button>
      </div>
    </div>
  );
}

export default function CompleteTheLook({ products = [], currentColor, onAddToCart }: { products?: Product[]; currentColor?: ProductColor | null; onAddToCart: (product: Product, size?: string, color?: string, cup?: string, variantId?: string, image?: string, price?: number) => void }) {
  return (
    <section className="mx-auto max-w-7xl px-4 pt-16">
      <h2 className="mb-8 text-center text-2xl font-bold italic">Complete the Look</h2>
      {products.length ? <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">{products.map((product) => <ProductMiniCard key={product.id} product={product} preferredColor={currentColor} onAddToCart={onAddToCart} />)}</div> : <div className="rounded-lg bg-secondary/30 p-12 text-center"><p className="text-sm text-muted-foreground">پیشنهاد مکملی ثبت نشده است.</p></div>}
    </section>
  );
}
