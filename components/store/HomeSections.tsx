'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import type { Product, Category, SiteSetting } from '@/app/admin/types';
import { storeApi } from '@/lib/store-api';
import ProductCard from './ProductCard';

function useCountdown(targetHours = 8) {
  const [time, setTime] = useState(() => targetHours * 3600);
  useEffect(() => {
    const timer = setInterval(() => setTime((current) => Math.max(0, current - 1)), 1000);
    return () => clearInterval(timer);
  }, []);
  return {
    h: String(Math.floor(time / 3600)).padStart(2, '0'),
    m: String(Math.floor((time % 3600) / 60)).padStart(2, '0'),
    s: String(time % 60).padStart(2, '0')
  };
}

function TimeBox({ value, label }: { value: string; label: string }) {
  return <div className="store-time-box"><b>{value}</b><span>{label}</span></div>;
}

export function HeroBanner() {
  const [settings, setSettings] = useState<SiteSetting[]>([]);
  useEffect(() => { storeApi.settings().then(setSettings).catch(() => setSettings([])); }, []);
  const bannerImage = settings.find((item) => item.key === 'hero_banner')?.value;
  return (
    <section className="store-hero" style={bannerImage ? { backgroundImage: `url(${bannerImage})` } : undefined} dir="rtl">
      <div className="store-hero-overlay" />
      <div className="store-hero-content"><h1>NOOSHEH POOSH</h1><p>Beauty &amp; Quality</p></div>
    </section>
  );
}

export function CategorySection() {
  const [categories, setCategories] = useState<Category[]>([]);
  useEffect(() => { storeApi.categories().then(setCategories).catch(() => setCategories([])); }, []);
  const visible = categories.filter((category) => category.is_active !== false);
  if (!visible.length) return null;
  return (
    <section className="store-category-section" dir="rtl"><div className="store-container"><div className="store-category-grid">
      {visible.map((category) => <Link key={category.id} href={`/category/${category.slug || category.id}`} className="store-category-tile">{category.image ? <img src={category.image} alt={category.title} /> : <div /> }<span /><article><h3>{category.title_en || category.title}</h3><p>{category.title}</p><b>نمایش</b></article></Link>)}
    </div></div></section>
  );
}

export function FeaturedProducts({ title, titleEn, collection, limit = 8 }: { title: string; titleEn?: string; collection?: string; limit?: number }) {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  useEffect(() => { setIsLoading(true); storeApi.products().then(setProducts).finally(() => setIsLoading(false)); }, []);
  const filtered = useMemo(() => products.filter((product) => product.is_active !== false).filter((product) => collection ? product.collection === collection : product.is_featured).slice(0, limit), [products, collection, limit]);
  if (isLoading) return <section className="store-featured"><div className="store-container"><div className="store-product-grid">{Array.from({ length: 4 }).map((_, index) => <div className="store-skeleton square" key={index} />)}</div></div></section>;
  if (!filtered.length) return <section className="store-featured" dir="rtl"><div className="store-container"><div className="store-empty">در این بخش محصولی یافت نشد.</div></div></section>;
  return <section className="store-featured" dir="rtl"><div className="store-container"><div className="store-section-heading">{titleEn && <h2>{titleEn}</h2>}<h2 className="primary">{title}</h2></div><div className="store-product-grid">{filtered.map((product) => <ProductCard key={product.id} product={product} />)}</div></div></section>;
}

export function FlashSaleSection() {
  const { h, m, s } = useCountdown(8);
  const [products, setProducts] = useState<Product[]>([]);
  const [error, setError] = useState('');
  useEffect(() => { storeApi.products().then(setProducts).catch(() => { setProducts([]); setError('خطا در دریافت محصولات تخفیف‌دار'); }); }, []);
  const discounted = products.filter((product) => product.is_active !== false && product.discount_price && product.discount_price < product.price).slice(0, 4);
  if (error) return <section className="store-flash-sale" dir="rtl"><div className="store-container"><div className="store-empty">{error}</div></div></section>;
  if (!discounted.length) return <section className="store-flash-sale" dir="rtl"><div className="store-container"><div className="store-empty">تخفیف فعالی وجود ندارد.</div></div></section>;
  return <section className="store-flash-sale" dir="rtl"><div className="store-container"><header><div><span>⚡</span><div><h2>پیشنهاد شگفت‌انگیز</h2><p>تخفیف‌های ویژه برای مدت محدود</p></div></div><div className="store-countdown"><span>◷ اتمام پیشنهاد تا:</span><TimeBox value={h} label="ساعت" /><b>:</b><TimeBox value={m} label="دقیقه" /><b>:</b><TimeBox value={s} label="ثانیه" /></div></header><div className="store-product-grid">{discounted.map((product) => <div className="store-flash-item" key={product.id}><b>{Math.round(((product.price - (product.discount_price || 0)) / product.price) * 100)}٪ تخفیف</b><ProductCard product={product} /></div>)}</div><div className="store-flash-link"><Link href="/category/all">⚡ مشاهده همه پیشنهادها</Link></div></div></section>;
}

export function QuoteSection() {
  return <section className="store-quote" dir="rtl"><div className="store-container"><article><p>"در دنیای لباس زیر زنانه، نوشه فقط یک برند نیست؛ یک هنر است. جایی که زیبایی و کیفیت در هم می‌آمیزند تا اندامی با نوشیدنی و زیبایی را بیافرینند."</p></article></div></section>;
}

export function WhyUsSection() {
  const reasons = [{ icon: '💵', title: 'قیمت رقابتی', desc: 'تضمین قیمت رقابتی و اصالت محصولات فروشگاه‌های آنلاین سراسر کشور' }, { icon: '🎧', title: 'خدمات پشتیبانی', desc: 'پشتیبانی و خدمات پس از فروش کالاها و خدمات فروشگاه اینترنتی ما' }, { icon: '🛒', title: 'خرید امن', desc: 'خرید آسان از طریق درگاه‌های بانکی عضو شتاب با کارت بانکی و لحظه‌ای' }];
  return <section className="store-why" dir="rtl"><div className="store-container"><h2>چرا نوشه‌ پوش؟</h2><p>"چون ما باور داریم لباس زیر اولین لایه اعتماد به نفس است. نوشه پوش فقط برنده نیست؛ هنر دوخت، احساس راحتی، زیبایی و لطافت است."</p><div>{reasons.map((reason) => <article key={reason.title}><span>{reason.icon}</span><h3>{reason.title}</h3><p>{reason.desc}</p></article>)}</div></div></section>;
}
