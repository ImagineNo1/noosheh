'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import ProductCard from '@/components/store/ProductCard';
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
  const [quantity, setQuantity] = useState(1);
  const [currentImage, setCurrentImage] = useState(0);
  const [activeTab, setActiveTab] = useState('description');
  const [added, setAdded] = useState(false);

  useEffect(() => {
    storeApi.products().then(setProducts).finally(() => setIsLoading(false));
  }, []);

  const product = products.find((item) => item.id === params.id);
  const relatedProducts = useMemo(() => products.filter((item) => item.category === product?.category && item.id !== product?.id && item.is_active !== false).slice(0, 4), [products, product]);

  if (isLoading) return <div className="store-container store-detail-skeleton" dir="rtl"><div className="store-skeleton square" /><div><div className="store-skeleton line" /><div className="store-skeleton line short" /><div className="store-skeleton block" /></div></div>;
  if (!product) return <div className="store-page" dir="rtl"><StoreHeader /><div className="store-container store-empty">محصول یافت نشد<Link href="/">بازگشت به خانه</Link></div></div>;

  const images = product.images || [];
  const hasDiscount = !!product.discount_price && product.discount_price < product.price;

  const handleAdd = () => {
    addItem(product, quantity, selectedSize, selectedColor);
    setAdded(true);
    setTimeout(() => setAdded(false), 1800);
  };

  return (
    <div className="store-page" dir="rtl">
      <StoreHeader />
      <div className="store-container store-breadcrumb"><Link href="/">خانه</Link><span>‹</span>{product.category && <><Link href={`/category/${product.category}`}>{product.category}</Link><span>‹</span></>}<b>{product.title}</b></div>
      <main className="store-container store-product-detail">
        <section className="store-gallery">
          <div className="store-gallery-main">
            {images[currentImage] ? <img src={images[currentImage]} alt={product.title} /> : <span>بدون تصویر</span>}
            {images.length > 1 && <><button className="next" onClick={() => setCurrentImage((i) => (i + 1) % images.length)}>‹</button><button className="prev" onClick={() => setCurrentImage((i) => (i - 1 + images.length) % images.length)}>›</button></>}
          </div>
          {images.length > 1 && <div className="store-thumbs">{images.map((image, index) => <button key={image} onClick={() => setCurrentImage(index)} className={currentImage === index ? 'active' : ''}><img src={image} alt="" /></button>)}</div>}
        </section>

        <section className="store-detail-info">
          <h1>{product.title}</h1>
          <div className="store-detail-price">{hasDiscount ? <><strong>{formatPrice(product.discount_price)} تومان</strong><del>{formatPrice(product.price)}</del></> : <strong>{formatPrice(product.price)} تومان</strong>}</div>
          <div className="store-meta">{product.code && <p>کد محصول: {product.code}</p>}{product.cup_size && <p>کاپ: {product.cup_size}</p>}{product.material && <p>جنس: {product.material}</p>}{product.brand && <p>برند: {product.brand}</p>}</div>
          {!!product.sizes?.length && <div><p className="store-option-title">سایز:</p><div className="store-choice-row">{product.sizes.map((size) => <button key={size} className={selectedSize === size ? 'active' : ''} onClick={() => setSelectedSize(size)}>{size}</button>)}</div></div>}
          {!!product.colors?.length && <div><p className="store-option-title">رنگ:</p><div className="store-choice-row colors">{product.colors.map((color) => <button key={color} className={selectedColor === color ? 'active' : ''} onClick={() => setSelectedColor(color)}>{color}</button>)}</div></div>}
          <div><p className="store-option-title">تعداد:</p><div className="store-quantity"><button onClick={() => setQuantity((q) => q + 1)}>+</button><span>{quantity.toLocaleString('fa-IR')}</span><button onClick={() => setQuantity((q) => Math.max(1, q - 1))}>−</button></div></div>
          <button className="store-primary-btn big" onClick={handleAdd}>🛍 {added ? 'به سبد اضافه شد' : 'افزودن به سبد خرید'}</button>
          <div className="store-detail-links"><button>♡ افزودن به علاقه‌مندی</button><button>▥ راهنمای اندازه</button></div>
        </section>
      </main>

      <section className="store-container store-tabs">
        <div className="store-tab-list"><button className={activeTab === 'description' ? 'active' : ''} onClick={() => setActiveTab('description')}>توضیحات</button><button className={activeTab === 'extra' ? 'active' : ''} onClick={() => setActiveTab('extra')}>توضیحات تکمیلی</button><button className={activeTab === 'reviews' ? 'active' : ''} onClick={() => setActiveTab('reviews')}>نظرات</button></div>
        {activeTab === 'description' && <div className="store-tab-content"><p>{product.description || 'توضیحاتی برای این محصول ثبت نشده است.'}</p>{product.wash_instructions && <div><h4>راهنمای شستشو:</h4><p>{product.wash_instructions}</p></div>}</div>}
        {activeTab === 'extra' && <div className="store-tab-content"><p>جنس پارچه: {product.material || '—'}</p><p>سایز کاپ: {product.cup_size || '—'}</p><p>برند: {product.brand || '—'}</p></div>}
        {activeTab === 'reviews' && <div className="store-tab-content">هنوز نظری برای این محصول ثبت نشده است.</div>}
      </section>

      {!!relatedProducts.length && <section className="store-container store-related"><div className="store-section-heading"><h2>محصولات مرتبط</h2><Link href={`/category/${product.category}`}>مشاهده همه ‹</Link></div><div className="store-product-grid">{relatedProducts.map((item) => <ProductCard key={item.id} product={item} />)}</div></section>}
    </div>
  );
}
