'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import type { Product } from '@/app/admin/types';
import { storeApi } from '@/lib/store-api';
import ProductCard from './ProductCard';

function SectionHeader({ title, subtitle, linkTo = '/category/all', linkLabel = 'مشاهده همه' }: { title: string; subtitle?: string; linkTo?: string; linkLabel?: string }) {
  return (
    <div className="mb-6 flex items-end justify-between gap-4">
      <div>
        <h2 className="text-xl font-bold md:text-2xl">{title}</h2>
        {subtitle && <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>}
      </div>
      {linkTo && <Link href={linkTo} className="flex shrink-0 items-center gap-1 text-sm text-primary hover:underline">{linkLabel} <span>←</span></Link>}
    </div>
  );
}

function ProductGrid({ products, isLoading, count = 4 }: { products: Product[]; isLoading: boolean; count?: number }) {
  if (isLoading) {
    return <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">{Array.from({ length: count }).map((_, index) => <div key={index} className="aspect-[3/4] animate-pulse rounded-xl bg-secondary" />)}</div>;
  }
  if (!products.length) return null;
  return <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">{products.map((product) => <ProductCard key={product.id} product={product} />)}</div>;
}

export function StoreHome() {
  const [products, setProducts] = useState<Product[]>([]);
  const [heroRectImage, setHeroRectImage] = useState('');
  const [heroCircleImage, setHeroCircleImage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let mounted = true;
    setIsLoading(true);
    storeApi.products()
      .then((data) => mounted && setProducts(data))
      .catch(() => mounted && setError('خطا در دریافت محصولات. لطفاً چند لحظه دیگر دوباره تلاش کنید.'))
      .finally(() => mounted && setIsLoading(false));
    return () => { mounted = false; };
  }, []);

  useEffect(() => {
    let mounted = true;
    storeApi.settings()
      .then((items) => {
        if (!mounted) return;
        const map = Object.fromEntries(items.map((item) => [item.key, item.value]));
        setHeroRectImage(map.home_hero_rect_image || '');
        setHeroCircleImage(map.home_hero_circle_image || '');
      })
      .catch(() => {});
    return () => { mounted = false; };
  }, []);

  const activeProducts = useMemo(() => products.filter((product) => product.is_active !== false), [products]);
  const newArrivals = activeProducts.filter((product) => product.badges?.includes('new') || product.collection === 'new').slice(0, 8);
  const bestSellers = activeProducts.filter((product) => product.badges?.includes('best_seller') || product.is_featured).slice(0, 8);
  const saleProducts = activeProducts.filter((product) => product.discount_price && product.discount_price < product.price).slice(0, 8);
  const featuredProducts = activeProducts.slice(0, 8);
  const collections = [...new Set(activeProducts.map((product) => product.collection).filter(Boolean))].slice(0, 4) as string[];

  return (
    <div className="pb-16" dir="rtl">
      <section className="relative overflow-hidden bg-gradient-to-br from-primary/10 via-background to-primary/5">
        <div className="absolute inset-0 opacity-5">
          <div className="absolute right-10 top-10 h-64 w-64 rounded-full bg-primary" />
          <div className="absolute bottom-10 left-20 h-40 w-40 rounded-full bg-primary" />
        </div>
        <div className="relative mx-auto flex max-w-7xl flex-col items-center gap-10 px-4 py-20 md:flex-row md:py-32">
          <div className="flex-1 text-center md:text-right">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1.5 text-xs font-medium text-primary"><span>✨</span> کالکشن جدید نوشه</div>
            <h1 className="mb-4 text-3xl font-bold leading-tight md:text-5xl">راحتی و سبک‌پوشی<br /><span className="text-primary">N♥OSHEH</span></h1>
            <p className="mx-auto mb-8 max-w-md text-base leading-relaxed text-muted-foreground md:mx-0">بهترین کیفیت، بیشترین راحتی. با ما لباس زیر مناسب خود را پیدا کنید.</p>
            <div className="flex flex-wrap justify-center gap-3 md:justify-start">
              <Link href="/category/all" className="rounded-full bg-primary px-8 py-3 text-sm font-bold text-primary-foreground shadow-sm transition hover:bg-primary/90">خرید همین حالا</Link>
              <Link href="/faq" className="rounded-full border border-border bg-background px-8 py-3 text-sm font-bold transition hover:border-primary hover:text-primary">راهنمای خرید و سایز</Link>
            </div>
            <div className="mt-8 flex flex-wrap justify-center gap-6 text-sm text-muted-foreground md:justify-start">
              <span className="flex items-center gap-1.5"><b className="text-primary">🚚</b> ارسال سریع</span>
              <span className="flex items-center gap-1.5"><b className="text-primary">↩</b> تعویض ۷ روزه</span>
            </div>
          </div>
          <div className="relative flex flex-1 justify-center">
            <div className="relative flex h-80 w-64 items-center justify-center overflow-hidden rounded-3xl bg-primary/10 shadow-inner md:h-96 md:w-80">
              {heroRectImage ? <img src={heroRectImage} alt="تصویر هیرو صفحه اصلی" className="h-full w-full object-cover" /> : <span className="text-6xl">👗</span>}
            </div>
            <div className="absolute -bottom-6 -left-4 h-24 w-24 overflow-hidden rounded-full border-4 border-background bg-primary/10 shadow-md md:h-28 md:w-28">
              {heroCircleImage ? <img src={heroCircleImage} alt="تصویر دایره‌ای هیرو" className="h-full w-full object-cover" /> : <div className="grid h-full w-full place-items-center text-3xl">✨</div>}
            </div>
          </div>
        </div>
      </section>

      <section className="border-y border-border bg-secondary/20">
        <div className="mx-auto max-w-7xl px-4 py-5">
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            {[
              { icon: '🚚', label: 'ارسال سریع', sub: 'سفارشات بالای ۵۰۰ هزار تومان رایگان' },
              { icon: '↩', label: 'تعویض آسان', sub: 'تا ۷ روز امکان مرجوعی' },
              { icon: '📦', label: 'کیفیت اصل', sub: 'ضمانت اصالت کالا' },
              { icon: '💗', label: 'پشتیبانی ۲۴/۷', sub: 'همیشه در کنار شما' }
            ].map((item) => <div key={item.label} className="flex items-center gap-3"><div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">{item.icon}</div><div><p className="text-sm font-medium">{item.label}</p><p className="text-[10px] text-muted-foreground">{item.sub}</p></div></div>)}
          </div>
        </div>
      </section>

      {error && <section className="mx-auto max-w-7xl px-4 pt-8"><div className="rounded-xl border border-destructive/20 bg-destructive/10 p-4 text-sm text-destructive">{error}</div></section>}

      {(isLoading || newArrivals.length > 0 || featuredProducts.length > 0) && <section className="mx-auto max-w-7xl px-4 pt-14"><SectionHeader title="جدیدترین‌ها" subtitle="تازه‌واردهای کالکشن" /><ProductGrid products={newArrivals.length ? newArrivals : featuredProducts.slice(0, 4)} isLoading={isLoading} /></section>}
      {(isLoading || bestSellers.length > 0) && <section className="mx-auto max-w-7xl px-4 pt-14"><SectionHeader title="پرفروش‌ترین‌ها" subtitle="محبوب‌ترین محصولات کاربران" /><ProductGrid products={bestSellers.length ? bestSellers : featuredProducts.slice(0, 4)} isLoading={isLoading} /></section>}

      {collections.length > 0 && <section className="mx-auto max-w-7xl px-4 pt-14"><SectionHeader title="کالکشن‌ها" subtitle="مجموعه‌های ویژه ما" linkTo="" /><div className="grid grid-cols-2 gap-4 md:grid-cols-4">{collections.map((collection) => <Link key={collection} href={`/category/all?collection=${encodeURIComponent(collection)}`} className="group relative block aspect-square overflow-hidden rounded-xl border border-border bg-gradient-to-br from-primary/10 to-primary/5 transition-all hover:border-primary/30 hover:shadow-md"><div className="absolute inset-0 flex items-end p-4"><div><p className="text-sm font-semibold">{collection}</p><p className="mt-0.5 flex items-center gap-1 text-xs text-muted-foreground">مشاهده ‹</p></div></div></Link>)}</div></section>}

      {(isLoading || saleProducts.length > 0) && <section className="mx-auto max-w-7xl px-4 pt-14"><div className="mb-6 rounded-2xl border border-primary/10 bg-gradient-to-l from-primary/5 to-transparent p-6"><SectionHeader title="🔥 تخفیف‌ها" subtitle="بهترین قیمت‌ها را از دست ندهید" /></div><ProductGrid products={saleProducts} isLoading={isLoading} /></section>}

      <section className="mx-auto max-w-7xl px-4 pt-14"><div className="flex flex-col items-center gap-6 rounded-2xl border border-primary/10 bg-gradient-to-l from-primary/10 to-primary/5 p-8 md:flex-row md:p-12"><div className="flex-1 text-center md:text-right"><h2 className="mb-2 text-xl font-bold md:text-2xl">سایز مناسب خود را پیدا کنید</h2><p className="mb-4 max-w-md text-sm text-muted-foreground">با راهنمای خرید و پاسخ پرسش‌های متداول، بهترین اندازه را برای راحتی کامل پیدا کنید.</p><Link href="/faq" className="inline-flex rounded-full bg-primary px-5 py-2.5 text-sm font-bold text-primary-foreground">راهنمای خرید ←</Link></div><div className="text-6xl md:text-7xl">📏</div></div></section>

      {!isLoading && newArrivals.length === 0 && bestSellers.length === 0 && activeProducts.length > 0 && <section className="mx-auto max-w-7xl px-4 pt-14"><SectionHeader title="محصولات" /><ProductGrid products={activeProducts.slice(0, 8)} isLoading={false} count={8} /></section>}

      <section className="mx-auto max-w-7xl px-4 pt-14"><div className="mb-10 text-center"><h2 className="mb-2 text-xl font-bold md:text-2xl">چرا نوشه؟</h2><p className="text-sm text-muted-foreground">تجربه‌ای متفاوت در خرید لباس زیر</p></div><div className="grid grid-cols-1 gap-6 md:grid-cols-3">{[
        { emoji: '🧵', title: 'کیفیت برتر', desc: 'پارچه‌های باکیفیت برای راحتی تمام‌وقت' },
        { emoji: '📦', title: 'بسته‌بندی خاص', desc: 'ارسال مطمئن با بسته‌بندی مراقبتی، هر بار مثل یک هدیه' },
        { emoji: '💯', title: 'رضایت تضمین‌شده', desc: 'اگر راضی نبودید، همراه شما هستیم' }
      ].map((item) => <article key={item.title} className="rounded-xl border border-border p-6 text-center transition-colors hover:border-primary/30"><div className="mb-4 text-4xl">{item.emoji}</div><h3 className="mb-2 font-semibold">{item.title}</h3><p className="text-sm leading-relaxed text-muted-foreground">{item.desc}</p></article>)}</div></section>
    </div>
  );
}

export const HeroBanner = StoreHome;
export function CategorySection() { return null; }
export function FeaturedProducts() { return null; }
export function FlashSaleSection() { return null; }
export function QuoteSection() { return null; }
export function WhyUsSection() { return null; }
