'use client';

import Link from 'next/link';
import { FormEvent, useEffect, useMemo, useState } from 'react';
import ProductCard from '@/components/store/ProductCard';
import SearchDiscovery from '@/components/store/SearchDiscovery';
import StoreHeader from '@/components/store/StoreHeader';
import CategoryFilters, { emptyProductFilters, type FilterOptions, type ProductFilters } from '@/components/store/CategoryFilters';
import { storeApi } from '@/lib/store-api';
import type { Category, Product } from '@/app/admin/types';

const sortOptions = [
  { value: 'default', label: 'مرتبط‌ترین' },
  { value: 'price_asc', label: 'ارزان‌ترین' },
  { value: 'price_desc', label: 'گران‌ترین' },
  { value: 'newest', label: 'جدیدترین' },
  { value: 'discount', label: 'بیشترین تخفیف' }
];

function normalize(value?: string) {
  return String(value || '').trim().toLowerCase();
}

function searchableText(product: Product) {
  return [
    product.title,
    product.name,
    product.code,
    product.description,
    product.short_description,
    product.category,
    product.brand,
    product.collection,
    product.material,
    product.product_type,
    ...(product.colors || []),
    ...(product.sizes || []),
    ...(product.tags || []),
    ...(product.color_swatches?.map((color) => `${color.name} ${color.value} ${color.slug}`) || []),
    ...(product.variants?.map((variant) => `${variant.sku} ${variant.color} ${variant.size} ${variant.cup}`) || [])
  ].filter(Boolean).join(' ').toLowerCase();
}

function productStock(product: Product) {
  return product.variants?.length ? product.variants.reduce((sum, variant) => sum + Number(variant.stock ?? variant.inventory ?? 0), 0) : Number(product.stock ?? 0);
}

function productColors(product: Product) {
  if (product.color_swatches?.length) return product.color_swatches.map((color) => ({ label: color.name || color.value || '', value: color.value || color.slug || color.name || '', hex: color.hex || color.value }));
  return (product.colors || []).map((color) => ({ label: color, value: color, hex: color }));
}

function unique(values: Array<string | undefined>) {
  return Array.from(new Set(values.map((value) => String(value || '').trim()).filter(Boolean)));
}

function removeFilter(filters: ProductFilters, key: keyof ProductFilters, value?: string): ProductFilters {
  const current = filters[key];
  if (Array.isArray(current) && value) return { ...filters, [key]: current.filter((item) => item !== value) };
  if (key === 'priceMin') return { ...filters, priceMin: 0, priceMax: Infinity };
  if (key === 'rating') return { ...filters, rating: 0 };
  if (typeof current === 'boolean') return { ...filters, [key]: false };
  return filters;
}

export default function SearchPage() {
  const [query, setQuery] = useState('');
  const [draft, setDraft] = useState('');
  const [sort, setSort] = useState('default');
  const [filters, setFilters] = useState<ProductFilters>(emptyProductFilters);
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initial = new URLSearchParams(window.location.search).get('q') || '';
    setQuery(initial);
    setDraft(initial);
    Promise.all([storeApi.products(), storeApi.categories()])
      .then(([productData, categoryData]) => {
        setProducts(productData);
        setCategories(categoryData);
      })
      .finally(() => setIsLoading(false));
  }, []);

  const submit = (event?: FormEvent) => {
    event?.preventDefault();
    const next = draft.trim();
    setQuery(next);
    setFilters(emptyProductFilters);
    const url = next ? `/search?q=${encodeURIComponent(next)}` : '/search';
    window.history.replaceState(null, '', url);
  };

  const pickSearch = (value: string) => {
    setDraft(value);
    setQuery(value);
    setFilters(emptyProductFilters);
    window.history.replaceState(null, '', value ? `/search?q=${encodeURIComponent(value)}` : '/search');
  };

  const matched = useMemo(() => {
    const needle = normalize(query);
    if (!needle) return [];
    return products.filter((product) => product.is_active !== false && searchableText(product).includes(needle));
  }, [products, query]);

  const options = useMemo<FilterOptions>(() => {
    const prices = matched.map((product) => product.discount_price || product.price).filter(Boolean);
    const colors = matched.flatMap(productColors).filter((color) => color.value);
    return {
      sizes: unique(matched.flatMap((product) => [...(product.sizes || []), ...(product.variants?.map((variant) => variant.size) || [])])).slice(0, 12),
      cups: unique(matched.flatMap((product) => [...(product.cups || []), product.cup_size, ...(product.variants?.map((variant) => variant.cup) || [])])).slice(0, 10),
      colors: Array.from(new Map(colors.map((color) => [color.value, color])).values()).slice(0, 12),
      brands: unique(matched.map((product) => product.brand)).slice(0, 12),
      collections: unique(matched.map((product) => product.collection)).slice(0, 12),
      materials: unique(matched.map((product) => product.material || product.fabric_and_care || product.fabric_care)).slice(0, 12),
      priceMin: prices.length ? Math.min(...prices) : 0,
      priceMax: prices.length ? Math.max(...prices) : 0
    };
  }, [matched]);

  const results = useMemo(() => {
    let list = matched.filter((product) => {
      const price = product.discount_price || product.price;
      const colors = productColors(product).map((color) => color.value);
      const sizes = unique([...(product.sizes || []), ...(product.variants?.map((variant) => variant.size) || [])]);
      const cups = unique([...(product.cups || []), product.cup_size, ...(product.variants?.map((variant) => variant.cup) || [])]);
      const material = product.material || product.fabric_and_care || product.fabric_care || '';
      if (price < filters.priceMin || price > filters.priceMax) return false;
      if (filters.inStock && productStock(product) <= 0) return false;
      if (filters.discountOnly && !(product.discount_price && product.discount_price < product.price)) return false;
      if (filters.sizes.length && !filters.sizes.some((value) => sizes.includes(value))) return false;
      if (filters.cups.length && !filters.cups.some((value) => cups.includes(value))) return false;
      if (filters.colors.length && !filters.colors.some((value) => colors.includes(value))) return false;
      if (filters.brands.length && !filters.brands.includes(product.brand || '')) return false;
      if (filters.collections.length && !filters.collections.includes(product.collection || '')) return false;
      if (filters.materials.length && !filters.materials.includes(material)) return false;
      return true;
    });
    if (sort === 'price_asc') list = [...list].sort((a, b) => (a.discount_price || a.price) - (b.discount_price || b.price));
    else if (sort === 'price_desc') list = [...list].sort((a, b) => (b.discount_price || b.price) - (a.discount_price || a.price));
    else if (sort === 'newest') list = [...list].sort((a, b) => new Date(b.created_date || '').getTime() - new Date(a.created_date || '').getTime());
    else if (sort === 'discount') list = [...list].sort((a, b) => ((b.discount_price ? (b.price - b.discount_price) / b.price : 0) - (a.discount_price ? (a.price - a.discount_price) / a.price : 0)));
    return list;
  }, [filters, matched, sort]);

  const relatedCategories = useMemo(() => categories.filter((category) => matched.some((product) => product.category === category.slug || product.category === category.title)).slice(0, 5), [categories, matched]);

  return (
    <div className="store-page store-search-page" dir="rtl">
      <StoreHeader />
      <section className="store-search-hero">
        <div className="store-container">
          <form onSubmit={submit} className="store-search-main-form">
            <button type="submit" aria-label="جستجو">⌕</button>
            <input value={draft} onChange={(event) => setDraft(event.target.value)} placeholder="جستجو در نوشه..." />
            {draft ? <button type="button" onClick={() => { setDraft(''); pickSearch(''); }} aria-label="پاک کردن">×</button> : null}
          </form>
          {query ? <p>نتایج جستجو برای «{query}» {!isLoading && <span>{matched.length.toLocaleString('fa-IR')} محصول یافت شد</span>}</p> : <p>نام محصول، رنگ، سایز، کد کالا یا کالکشن موردنظر را جستجو کنید.</p>}
        </div>
      </section>

      <div className="store-container store-search-content">
        {!query ? <SearchDiscovery products={products} categories={categories} onPick={pickSearch} />
          : isLoading ? <div className="store-product-grid boutique">{Array.from({ length: 8 }).map((_, i) => <div key={i} className="store-skeleton square" />)}</div>
          : matched.length === 0 ? <SearchDiscovery products={products} categories={categories} query={query} onPick={pickSearch} noResults />
          : (
            <>
              {relatedCategories.length > 0 ? (
                <section className="store-related-category-rail">
                  <h2>دسته‌های مرتبط</h2>
                  <div>
                    {relatedCategories.map((category) => <Link key={category.id} href={`/category/${category.slug || category.id}`}>{category.image ? <img src={category.image} alt="" /> : <span />}{category.title || category.name}</Link>)}
                  </div>
                </section>
              ) : null}
              <div className="store-search-results-layout">
                <aside>
                  <CategoryFilters sort={sort} setSort={setSort} filters={filters} setFilters={setFilters} options={options} totalCount={results.length} onClear={() => setFilters(emptyProductFilters)} onRemove={(key, value) => setFilters((current) => removeFilter(current, key, value))} />
                </aside>
                <main>
                  <div className="store-search-results-head">
                    <h1>نتایج جستجو برای «{query}»</h1>
                    <label>
                      <span>مرتب‌سازی:</span>
                      <select value={sort} onChange={(event) => setSort(event.target.value)}>{sortOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</select>
                    </label>
                  </div>
                  {results.length ? <div className="store-product-grid boutique">{results.map((product) => <ProductCard key={product.id} product={product} />)}</div>
                    : <div className="store-empty premium"><h2>فیلترها نتیجه‌ای نداشتند</h2><p>برای دیدن محصولات مرتبط، فیلترها را کمتر کنید.</p><button type="button" onClick={() => setFilters(emptyProductFilters)}>حذف همه فیلترها</button></div>}
                </main>
              </div>
            </>
          )}
      </div>
    </div>
  );
}
