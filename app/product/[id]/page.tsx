'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import ProductCard from '@/components/store/ProductCard';
import ProductReviews from '@/components/store/ProductReviews';
import StoreHeader from '@/components/store/StoreHeader';
import { useCart } from '@/lib/cart-context';
import { storeApi } from '@/lib/store-api';
import type { Product } from '@/app/admin/types';

const formatPrice = (price?: number) => (price || 0).toLocaleString('fa-IR');

export default function ProductDetail({ params }: { params: { id: string } }) {
  const { addItem } = useCart();
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [selectedCup, setSelectedCup] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [currentImage, setCurrentImage] = useState(0);
  const [activeTab, setActiveTab] = useState('details');
  const [added, setAdded] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => { storeApi.products().then(setProducts).finally(() => setIsLoading(false)); }, []);

  const product = products.find((item) => item.id === params.id);
  const completeTheLook = useMemo(() => products.filter((p) => (product?.complete_the_look_ids || []).includes(p.id)), [products, product]);
  const similarProducts = useMemo(() => {
    const ids = product?.similar_product_ids || [];
    if (ids.length) return products.filter((p) => ids.includes(p.id));
    return products.filter((item) => item.category === product?.category && item.id !== product?.id && item.is_active !== false).slice(0, 8);
  }, [products, product]);

  const colorSwatches = product?.color_swatches?.filter((c) => c.active !== false).sort((a, b) => (a.order || 0) - (b.order || 0)) || [];
  const fallbackImages = product?.images || [];
  const activeColor = colorSwatches.find((c) => c.value === selectedColor) || colorSwatches[0];
  const images = activeColor?.images?.length ? activeColor.images : fallbackImages;
  const sizes = product?.sizes || [];
  const cups = product?.has_cup_option ? (product.cups || []) : [];

  useEffect(() => {
    if (!product) return;
    if (!selectedColor && colorSwatches[0]) setSelectedColor(colorSwatches[0].value);
    if (!selectedSize && sizes.length === 1) setSelectedSize(sizes[0]);
    if (product.has_cup_option && !selectedCup && cups.length === 1) setSelectedCup(cups[0]);
  }, [product, selectedColor, selectedSize, selectedCup, colorSwatches, sizes, cups]);

  const variant = useMemo(() => product?.variants?.find((v) => (!selectedColor || v.color === selectedColor) && (!selectedSize || v.size === selectedSize) && (!product?.has_cup_option || !selectedCup || v.cup === selectedCup)), [product, selectedColor, selectedSize, selectedCup]);
  const variantStock = variant?.stock ?? product?.stock ?? 0;
  const isOutOfStock = variantStock <= 0;
  const hasDiscount = !!(variant?.discount_price ?? product?.discount_price) && (variant?.discount_price ?? 0) < (variant?.price ?? product?.price ?? 0);
  const effectivePrice = variant?.price ?? product?.price;
  const effectiveDiscountPrice = variant?.discount_price ?? product?.discount_price;

  if (isLoading) return <div className="store-container store-detail-skeleton" dir="rtl"><div className="store-skeleton square" /><div><div className="store-skeleton line" /><div className="store-skeleton line short" /><div className="store-skeleton block" /></div></div>;
  if (!product) return <div className="store-page" dir="rtl"><StoreHeader /><div className="store-container store-empty">محصول یافت نشد<Link href="/">بازگشت به خانه</Link></div></div>;

  const onAdd = (target: Product, opts?: { size?: string; color?: string; cup?: string }) => {
    const size = opts?.size ?? selectedSize;
    const color = opts?.color ?? selectedColor;
    const cup = opts?.cup ?? selectedCup;
    if (target.sizes?.length && !size) return setError('لطفاً سایز را انتخاب کنید.');
    if (target.has_cup_option && !cup) return setError('لطفاً کاپ را انتخاب کنید.');
    setError('');
    addItem(target, 1, size, color, cup, variant?.id);
    setAdded(true);
    setTimeout(() => setAdded(false), 1800);
  };

  return (
    <div className="store-page" dir="rtl">
      <StoreHeader />
      <div className="store-container store-breadcrumb"><Link href="/">خانه</Link><span>‹</span>{product.category && <><Link href={`/category/${product.category}`}>{product.category}</Link><span>‹</span></>}<b>{product.title}</b></div>
      <main className="store-container store-product-detail">
        <section className="store-gallery">
          <div className="store-gallery-main">{images[currentImage] ? <img src={images[currentImage]} alt={`${product.title} - ${currentImage + 1}`} /> : <span>بدون تصویر</span>}</div>
          {!!images.length && <div className="store-thumbs">{images.map((image, index) => <button key={image + index} onClick={() => setCurrentImage(index)} className={currentImage === index ? 'active' : ''}><img src={image} alt={`نمای ${index + 1}`} /></button>)}</div>}
        </section>

        <section className="store-detail-info">
          <div><h1>{product.title}</h1><div className="store-meta">{product.brand && <p>برند: {product.brand}</p>}{product.collection && <p>کالکشن: {product.collection}</p>}</div></div>
          <div className="store-detail-price">{hasDiscount ? <><strong>{formatPrice(effectiveDiscountPrice)} تومان</strong><del>{formatPrice(effectivePrice)} تومان</del></> : <strong>{formatPrice(effectivePrice)} تومان</strong>} {isOutOfStock ? <span className="store-status danger">ناموجود</span> : <span className="store-status success">موجود</span>}</div>
          {product.short_description && <p>{product.short_description}</p>}

          {!!colorSwatches.length && <div><p className="store-option-title">رنگ: {activeColor?.name || selectedColor}</p><div className="store-choice-row">{colorSwatches.map((c) => <button key={c.value} className={selectedColor === c.value ? 'active' : ''} onClick={() => { setSelectedColor(c.value); setCurrentImage(0); }} aria-label={`انتخاب رنگ ${c.name}`}>{c.hex ? <span className="store-color-dot" style={{ background: c.hex }} /> : null}{c.name}</button>)}</div></div>}
          {!!sizes.length && <div><p className="store-option-title">سایز</p><div className="store-choice-row">{sizes.map((size) => <button key={size} className={selectedSize === size ? 'active' : ''} onClick={() => setSelectedSize(size)}>{size}</button>)}</div></div>}
          {!!cups.length && <div><p className="store-option-title">کاپ</p><div className="store-choice-row">{cups.map((cup) => <button key={cup} className={selectedCup === cup ? 'active' : ''} onClick={() => setSelectedCup(cup)}>{cup}</button>)}</div></div>}

          <div><p className="store-option-title">تعداد</p><div className="store-quantity"><button onClick={() => setQuantity((q) => q + 1)}>+</button><span>{quantity.toLocaleString('fa-IR')}</span><button onClick={() => setQuantity((q) => Math.max(1, q - 1))}>−</button></div></div>
          {!!error && <p className="store-error-inline">{error}</p>}
          <button className="store-primary-btn big" disabled={isOutOfStock} onClick={() => { for (let i=0;i<quantity;i++) onAdd(product); }}>🛍 {added ? 'به سبد اضافه شد' : isOutOfStock ? 'ناموجود' : 'افزودن به سبد خرید'}</button>
        </section>
      </main>

      <section className="store-container store-tabs" id="reviews">
        <div className="store-tab-list">{[['details','Product Details'],['size','Size & Fit'],['fabric','Fabric & Care'],['shipping','Shipping & Returns'],['reviews','Reviews']].map(([k,l]) => <button key={k} className={activeTab===k?'active':''} onClick={()=>setActiveTab(k)}>{l}</button>)}</div>
        {activeTab==='details' && <div className="store-tab-content"><p>{product.details || product.description || '—'}</p></div>}
        {activeTab==='size' && <div className="store-tab-content"><p>{product.size_fit || 'راهنمای سایز به‌زودی اضافه می‌شود.'}</p></div>}
        {activeTab==='fabric' && <div className="store-tab-content"><p>{product.fabric_care || product.material || '—'}</p></div>}
        {activeTab==='shipping' && <div className="store-tab-content"><p>{product.shipping_returns || 'ارسال سریع و امکان تعویض تا ۷ روز.'}</p></div>}
        {activeTab==='reviews' && <div className="store-tab-content"><ProductReviews productId={product.id} /></div>}
      </section>

      <section className="store-container store-related"><div className="store-section-heading"><h2>Complete the Look</h2></div>{completeTheLook.length ? <div className="store-product-grid store-horizontal-scroll">{completeTheLook.map((item) => <article key={item.id} className="store-product-card"><ProductCard product={item} /><button className="store-outline-btn" onClick={() => onAdd(item, { color: selectedColor })}>افزودن سریع</button></article>)}</div> : <div className="store-empty bordered">پیشنهاد مکملی ثبت نشده است.</div>}</section>

      <section className="store-container store-related"><div className="store-section-heading"><h2>محصولات مشابه</h2></div>{similarProducts.length ? <div className="store-product-grid">{similarProducts.filter((i)=>i.id!==product.id).map((item) => <ProductCard key={item.id} product={item} />)}</div> : <div className="store-empty bordered">محصول مشابهی یافت نشد.</div>}</section>
    </div>
  );
}
