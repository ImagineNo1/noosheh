'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import AddToCartButton from '@/components/product/AddToCartButton';
import ColorSelector from '@/components/product/ColorSelector';
import CompleteTheLook from '@/components/product/CompleteTheLook';
import CupSelector from '@/components/product/CupSelector';
import ProductBadges from '@/components/product/ProductBadges';
import ProductGallery from '@/components/product/ProductGallery';
import ProductTabs from '@/components/product/ProductTabs';
import QuantitySelector from '@/components/product/QuantitySelector';
import SimilarProducts from '@/components/product/SimilarProducts';
import SizeSelector from '@/components/product/SizeSelector';
import TrustBadges from '@/components/product/TrustBadges';
import { colorImageUrls, colorValue, formatPrice, normalizeColors, normalizeList, variantAvailable, variantStock, type ProductColor } from '@/components/product/product-utils';
import StoreHeader from '@/components/store/StoreHeader';
import { useCart } from '@/lib/cart-context';
import { storeApi } from '@/lib/store-api';
import type { Product } from '@/app/admin/types';

export default function ProductDetail({ params }: { params: { id: string } }) {
  const { addItem } = useCart();
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [selectedColor, setSelectedColor] = useState<ProductColor | null>(null);
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedCup, setSelectedCup] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [notifyMessage, setNotifyMessage] = useState('');

  useEffect(() => {
    let mounted = true;
    storeApi.products()
      .then((data) => mounted && setProducts(data))
      .catch(() => mounted && setLoadError('خطا در دریافت اطلاعات محصول.'))
      .finally(() => mounted && setIsLoading(false));
    return () => { mounted = false; };
  }, []);

  const product = useMemo(() => products.find((item) => item.id === params.id || item.code === params.id), [products, params.id]);
  const colorOptions = useMemo(() => normalizeColors(product), [product]);

  useEffect(() => {
    if (!product) return;
    if (!selectedColor && colorOptions[0]) setSelectedColor(colorOptions.find((color) => color.active !== false && color.is_active !== false) || colorOptions[0]);
    if (!selectedSize && product.sizes?.length === 1) setSelectedSize(product.sizes[0]);
    if (product.has_cup_option && !selectedCup && product.cups?.length === 1) setSelectedCup(product.cups[0]);
  }, [product, colorOptions, selectedColor, selectedSize, selectedCup]);

  const galleryImages = useMemo(() => {
    const selectedImages = colorImageUrls(selectedColor);
    return selectedImages.length ? selectedImages : (product?.images || []);
  }, [selectedColor, product]);

  const availableSizes = useMemo(() => {
    if (!product?.variants?.length) return normalizeList(product?.sizes);
    const sizes = product.variants
      .filter((variant) => (!selectedColor || variant.color === colorValue(selectedColor)) && variantAvailable(variant))
      .map((variant) => variant.size)
      .filter(Boolean) as string[];
    return [...new Set(sizes.length ? sizes : normalizeList(product.sizes))];
  }, [product, selectedColor]);

  const availableCups = useMemo(() => {
    if (!product?.has_cup_option) return [];
    if (!product.variants?.length) return normalizeList(product.cups);
    const cups = product.variants
      .filter((variant) => (!selectedColor || variant.color === colorValue(selectedColor)) && (!selectedSize || variant.size === selectedSize) && variantAvailable(variant))
      .map((variant) => variant.cup)
      .filter(Boolean) as string[];
    return [...new Set(cups.length ? cups : normalizeList(product.cups))];
  }, [product, selectedColor, selectedSize]);

  const currentVariant = useMemo(() => product?.variants?.find((variant) =>
    (!selectedColor || variant.color === colorValue(selectedColor)) &&
    (!selectedSize || variant.size === selectedSize) &&
    (!product.has_cup_option || !selectedCup || variant.cup === selectedCup)
  ), [product, selectedColor, selectedSize, selectedCup]);

  if (isLoading) {
    return <div className="store-page" dir="rtl"><StoreHeader /><div className="mx-auto grid max-w-7xl grid-cols-1 gap-10 px-4 py-8 lg:grid-cols-2"><ProductGallery isLoading /><div className="space-y-4"><div className="h-8 w-56 animate-pulse rounded bg-secondary" /><div className="h-6 w-36 animate-pulse rounded bg-secondary" /><div className="h-12 w-full animate-pulse rounded bg-secondary" /></div></div></div>;
  }

  if (loadError || !product) {
    return <div className="store-page" dir="rtl"><StoreHeader /><div className="mx-auto max-w-7xl px-4 py-20 text-center"><h1 className="mb-2 text-xl font-bold">محصول یافت نشد</h1><p className="mb-4 text-sm text-muted-foreground">{loadError || 'این محصول وجود ندارد یا حذف شده است.'}</p><Link href="/" className="text-sm text-primary hover:underline">بازگشت به خانه</Link></div></div>;
  }

  const currentPrice = currentVariant?.discount_price || currentVariant?.price || product.discount_price || product.price;
  const comparePrice = currentVariant?.compare_at_price || (currentVariant?.discount_price ? currentVariant.price : product.discount_price ? product.price : undefined);
  const totalStock = product.variants?.length ? product.variants.reduce((sum, variant) => sum + variantStock(variant), 0) : Number(product.stock ?? 0);
  const stock = currentVariant ? variantStock(currentVariant) : totalStock;
  const hasConfiguredVariants = Boolean(product.variants?.length);
  const isAvailable = hasConfiguredVariants ? Boolean(currentVariant && variantAvailable(currentVariant)) : totalStock > 0;
  const hasDiscount = Boolean(comparePrice && comparePrice > currentPrice);
  const discountPercent = hasDiscount ? Math.round((1 - currentPrice / (comparePrice || currentPrice)) * 100) : 0;
  const features = product.features || [];
  const completeTheLook = products.filter((item) => (product.complete_the_look_ids || []).includes(item.id));
  const similarProducts = (product.similar_product_ids?.length ? products.filter((item) => product.similar_product_ids?.includes(item.id)) : products.filter((item) => item.category === product.category && item.id !== product.id && item.is_active !== false)).slice(0, 8);
  const validationErrors = [
    ...(product.sizes?.length && !selectedSize ? ['لطفاً سایز را انتخاب کنید'] : []),
    ...(product.has_cup_option && product.cups?.length && !selectedCup ? ['لطفاً کاپ را انتخاب کنید'] : [])
  ];
  const selectedImage = galleryImages[0] || product.images?.[0] || '';

  const addConfiguredProduct = (target: Product, size = '', color = '', cup = '', variantId = '', image = target.images?.[0] || '', price = target.discount_price || target.price) => {
    addItem({ ...target, price, discount_price: undefined, images: image ? [image, ...(target.images || []).filter((item) => item !== image)] : target.images }, quantity, size, color, cup, variantId);
  };

  const handleAdd = () => addConfiguredProduct(product, selectedSize, selectedColor ? colorValue(selectedColor) : '', selectedCup, currentVariant?.id || '', selectedImage, currentPrice);

  return (
    <div className="store-page pb-20" dir="rtl">
      <StoreHeader />
      <div className="mx-auto max-w-7xl px-4 py-3">
        <nav className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Link href="/" className="transition-colors hover:text-primary">خانه</Link><span>‹</span>
          {product.category && <><Link href={`/category/${product.category}`} className="transition-colors hover:text-primary">{product.category}</Link><span>‹</span></>}
          <span className="font-medium text-foreground">{product.title}</span>
        </nav>
      </div>

      <main className="mx-auto max-w-7xl px-4">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2 lg:gap-12">
          <section className="lg:sticky lg:top-28 lg:self-start"><ProductGallery images={galleryImages} title={product.title} /></section>
          <section className="space-y-5">
            <ProductBadges badges={product.badges} isAvailable={isAvailable} />
            <div><h1 className="text-2xl font-bold md:text-3xl">{product.title}</h1>{(product.brand || product.collection) && <p className="mt-2 text-xs text-muted-foreground">{product.brand && <>برند: {product.brand}</>}{product.brand && product.collection && ' | '}{product.collection && <>کالکشن: {product.collection}</>}</p>}</div>
            <div className="flex flex-wrap items-baseline gap-3"><span className="text-2xl font-bold text-primary">{formatPrice(currentPrice)} ریال</span>{hasDiscount && <><span className="text-sm text-muted-foreground line-through">{formatPrice(comparePrice)} ریال</span><span className="rounded-full bg-destructive/10 px-2 py-0.5 text-xs font-medium text-destructive">{discountPercent}٪ تخفیف</span></>}</div>
            {product.short_description && <p className="text-sm leading-relaxed text-muted-foreground">{product.short_description}</p>}
            {features.length > 0 && <ul className="space-y-1">{features.map((feature) => <li key={feature} className="flex items-start gap-2 text-sm text-foreground/80"><span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />{feature}</li>)}</ul>}

            <div className="space-y-5 border-t border-border pt-5">
              <ColorSelector colors={colorOptions} selectedColor={selectedColor} onSelect={(color) => { setSelectedColor(color); setSelectedSize(''); setSelectedCup(''); setNotifyMessage(''); }} />
              <SizeSelector sizes={product.sizes} selectedSize={selectedSize} availableSizes={availableSizes} onSelect={(size) => { setSelectedSize(size); setSelectedCup(''); setNotifyMessage(''); }} sizeGuide={product.size_fit} />
              <CupSelector cups={product.cups} selectedCup={selectedCup} availableCups={availableCups} onSelect={(cup) => { setSelectedCup(cup); setNotifyMessage(''); }} />
              <QuantitySelector value={quantity} max={Math.max(1, stock || 99)} onChange={setQuantity} />
              {hasConfiguredVariants && selectedSize && (!product.has_cup_option || selectedCup) && !isAvailable && <p className="rounded-xl bg-destructive/10 p-3 text-sm text-destructive">این حالت محصول ناموجود است.</p>}
              {notifyMessage && <p className="rounded-xl bg-primary/10 p-3 text-sm text-primary">{notifyMessage}</p>}
              <AddToCartButton isAvailable={isAvailable} isValid={validationErrors.length === 0} validationErrors={validationErrors} onAdd={handleAdd} onNotify={() => setNotifyMessage('درخواست اطلاع‌رسانی شما ثبت شد.')} />
            </div>
            <TrustBadges />
          </section>
        </div>
        <ProductTabs product={product} />
      </main>

      {completeTheLook.length > 0 && <CompleteTheLook products={completeTheLook} currentColor={selectedColor} onAddToCart={addConfiguredProduct} />}
      {similarProducts.length > 0 && <SimilarProducts products={similarProducts} />}
    </div>
  );
}
