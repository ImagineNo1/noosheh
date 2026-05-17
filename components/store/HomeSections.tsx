'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import type { Product, Category } from '@/app/admin/types';
import { storeApi } from '@/lib/store-api';
import ProductCard from './ProductCard';

export function HeroBanner() {
  return (
    <section className="store-hero">
      <div className="store-hero-overlay" />
      <div className="store-hero-content">
        <h1>NOOSHEH POOSH</h1>
        <p>Beauty &amp; Quality</p>
        <Link href="/category/all">مشاهده محصولات</Link>
      </div>
    </section>
  );
}

export function CategorySection() {
  const [categories, setCategories] = useState<Category[]>([]);
  useEffect(() => { storeApi.categories().then(setCategories).catch(() => setCategories([])); }, []);
  const visible = categories.filter((category) => category.is_active !== false).slice(0, 2);
  return (
    <section className="store-category-cards store-container">
      {(visible.length ? visible : [
        { id: 'sets', title: 'کالکشن ست', title_en: 'Set Collection', slug: 'sets' },
        { id: 'bra', title: 'کالکشن سوتین', title_en: 'Bra Collection', slug: 'bra' }
      ] as Category[]).map((category) => (
        <Link key={category.id} href={`/category/${category.slug || category.title}`} className="store-category-card" style={category.image ? { backgroundImage: `url(${category.image})` } : undefined}>
          <span />
          <h3>{category.title_en || category.title}</h3>
          <p>{category.title}</p>
          <b>نمایش</b>
        </Link>
      ))}
    </section>
  );
}

export function FeaturedProducts({ title, titleEn, collection, limit = 4 }: { title: string; titleEn?: string; collection?: string; limit?: number }) {
  const [products, setProducts] = useState<Product[]>([]);
  useEffect(() => { storeApi.products().then(setProducts).catch(() => setProducts([])); }, []);
  const filtered = useMemo(() => products
    .filter((product) => product.is_active !== false)
    .filter((product) => !collection || product.collection === collection)
    .slice(0, limit), [products, collection, limit]);

  if (!filtered.length) return null;
  return (
    <section className="store-container store-products-section">
      <div className="store-section-heading"><h2>{title}</h2>{titleEn && <h2>{titleEn}</h2>}</div>
      <div className="store-product-grid">{filtered.map((product) => <ProductCard key={product.id} product={product} />)}</div>
    </section>
  );
}

export function QuoteSection() {
  return <section className="store-feature-banner"><div>زیبایی و کیفیت دو اصل مهم در تولیدی لباس زیر نوشه هستند.</div></section>;
}

export function FlashSaleSection() {
  return <section className="store-feature-banner second"><div>نوشه فقط یک برند نیست؛ جایی که زیبایی و کیفیت در کنار هم قرار می‌گیرند.</div></section>;
}

export function WhyUsSection() {
  return (
    <section className="store-container store-benefits">
      <h3>چرا نوشه پوش؟</h3>
      <p>چون ما باور داریم لباس زیر، اولین لایه اعتماد به نفس است.</p>
      <div>
        <article><h4>قیمت رقابتی</h4><p>تضمین قیمت رقابتی و اصالت کالا در فروشگاه آنلاین</p></article>
        <article><h4>خدمات پشتیبانی</h4><p>پشتیبانی و خدمات پس از فروش برای تمام سفارش‌ها</p></article>
        <article><h4>خرید امن</h4><p>پرداخت امن و ثبت سفارش سریع</p></article>
      </div>
    </section>
  );
}
