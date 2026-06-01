'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import ProductCard from '@/components/store/ProductCard';
import StoreHeader from '@/components/store/StoreHeader';
import { storeApi } from '@/lib/store-api';
import type { Product } from '@/app/admin/types';

const sortOptions = [
  { value: 'default', label: 'مرتبط‌ترین' },
  { value: 'price_asc', label: 'ارزان‌ترین' },
  { value: 'price_desc', label: 'گران‌ترین' },
  { value: 'newest', label: 'جدیدترین' }
];

export default function SearchPage() {
  const [query, setQuery] = useState('');
  const [sort, setSort] = useState('default');
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => setQuery(new URLSearchParams(window.location.search).get('q') || ''), []);
  useEffect(() => {
    if (!query) return;
    setIsLoading(true);
    storeApi.products().then(setProducts).finally(() => setIsLoading(false));
  }, [query]);

  const results = useMemo(() => {
    if (!query) return [];
    const needle = query.trim().toLowerCase();
    let list = products.filter((product) => product.is_active !== false).filter((product) =>
      product.title?.toLowerCase().includes(needle) || product.code?.toLowerCase().includes(needle) || product.description?.toLowerCase().includes(needle) || product.category?.toLowerCase().includes(needle)
    );
    if (sort === 'price_asc') list = [...list].sort((a, b) => (a.discount_price || a.price) - (b.discount_price || b.price));
    else if (sort === 'price_desc') list = [...list].sort((a, b) => (b.discount_price || b.price) - (a.discount_price || a.price));
    else if (sort === 'newest') list = [...list].sort((a, b) => new Date(b.created_date || '').getTime() - new Date(a.created_date || '').getTime());
    return list;
  }, [products, query, sort]);

  return (
    <div className="store-page" dir="rtl">
      <StoreHeader />
      <section className="store-gradient-hero"><div className="store-container"><h1>⌕ نتایج جستجو</h1>{query && <p>جستجو برای: <b>{query}</b> {!isLoading && `(${results.length.toLocaleString('fa-IR')} محصول یافت شد)`}</p>}</div></section>
      <div className="store-container store-page-body">
        {!query ? <div className="store-empty">عبارت جستجوی خود را وارد کنید</div>
          : isLoading ? <div className="store-product-grid">{Array.from({ length: 8 }).map((_, i) => <div key={i} className="store-skeleton square" />)}</div>
          : results.length === 0 ? <div className="store-empty"><h2>محصولی یافت نشد</h2><p>سعی کنید با کلمات متفاوتی جستجو کنید</p><Link href="/category/all">مشاهده همه محصولات ←</Link></div>
          : <><div className="store-sort-row"><span>مرتب‌سازی:</span>{sortOptions.map((option) => <button key={option.value} onClick={() => setSort(option.value)} className={sort === option.value ? 'active' : ''}>{option.label}</button>)}</div><div className="store-product-grid">{results.map((product) => <ProductCard key={product.id} product={product} />)}</div></>}
      </div>
    </div>
  );
}
