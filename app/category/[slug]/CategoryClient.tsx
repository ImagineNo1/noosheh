'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import CategoryFilters, { emptyProductFilters, type FilterOptions, type ProductFilters } from '@/components/store/CategoryFilters';
import ProductCard from '@/components/store/ProductCard';
import StoreHeader from '@/components/store/StoreHeader';
import { storeApi } from '@/lib/store-api';
import type { Product } from '@/app/admin/types';
import { safeDecodeURIComponent } from '@/lib/utils';

type RelatedCategory = { label: string; href: string };

function unique(values: Array<string | undefined>) {
  return Array.from(new Set(values.map((value) => String(value || '').trim()).filter(Boolean)));
}

function productStock(product: Product) {
  return product.variants?.length ? product.variants.reduce((sum, variant) => sum + Number(variant.stock ?? variant.inventory ?? 0), 0) : Number(product.stock ?? 0);
}

function productColors(product: Product) {
  if (product.color_swatches?.length) return product.color_swatches.map((color) => ({ label: color.name || color.value || '', value: color.value || color.slug || color.name || '', hex: color.hex || color.value }));
  return (product.colors || []).map((color) => ({ label: color, value: color, hex: color }));
}

function productSizes(product: Product) {
  return unique([...(product.sizes || []), ...(product.variants?.map((variant) => variant.size) || [])]);
}

function productCups(product: Product) {
  return unique([...(product.cups || []), product.cup_size, ...(product.variants?.map((variant) => variant.cup) || [])]);
}

function removeFilter(filters: ProductFilters, key: keyof ProductFilters, value?: string): ProductFilters {
  const current = filters[key];
  if (Array.isArray(current) && value) return { ...filters, [key]: current.filter((item) => item !== value) };
  if (key === 'priceMin') return { ...filters, priceMin: 0, priceMax: Infinity };
  if (key === 'rating') return { ...filters, rating: 0 };
  if (typeof current === 'boolean') return { ...filters, [key]: false };
  return filters;
}

export default function CategoryClient({
  params,
  initialProducts = [],
  categoryTitle,
  categoryDescription,
  relatedCategories = []
}: {
  params: { slug: string };
  initialProducts?: Product[];
  categoryTitle?: string;
  categoryDescription?: string;
  relatedCategories?: RelatedCategory[];
}) {
  const categorySlug = safeDecodeURIComponent(params.slug);
  const searchParams = useSearchParams();
  const collection = searchParams.get('collection') || '';
  const [sort, setSort] = useState('default');
  const [filters, setFilters] = useState<ProductFilters>(emptyProductFilters);
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [isLoading, setIsLoading] = useState(initialProducts.length === 0);
  const title = collection || categoryTitle || (categorySlug === 'all' ? 'همه محصولات' : categorySlug);

  useEffect(() => {
    let mounted = true;
    storeApi.products()
      .then((data) => {
        if (!mounted) return;
        setProducts(data.length ? data : initialProducts);
      })
      .finally(() => mounted && setIsLoading(false));
    return () => { mounted = false; };
  }, [initialProducts]);

  const categoryProducts = useMemo(() => products
    .filter((product) => product.is_active !== false)
    .filter((product) => categorySlug === 'all' || product.category === categorySlug || product.category === categoryTitle)
    .filter((product) => !collection || product.collection === collection), [categorySlug, categoryTitle, collection, products]);

  const options = useMemo<FilterOptions>(() => {
    const prices = categoryProducts.map((product) => product.discount_price || product.price).filter(Boolean);
    const colors = categoryProducts.flatMap(productColors).filter((color) => color.value);
    return {
      sizes: unique(categoryProducts.flatMap(productSizes)).slice(0, 12),
      cups: unique(categoryProducts.flatMap(productCups)).slice(0, 10),
      colors: Array.from(new Map(colors.map((color) => [color.value, color])).values()).slice(0, 12),
      brands: unique(categoryProducts.map((product) => product.brand)).slice(0, 12),
      collections: unique(categoryProducts.map((product) => product.collection)).slice(0, 12),
      materials: unique(categoryProducts.map((product) => product.material || product.fabric_and_care || product.fabric_care)).slice(0, 12),
      priceMin: prices.length ? Math.min(...prices) : 0,
      priceMax: prices.length ? Math.max(...prices) : 0
    };
  }, [categoryProducts]);

  const filtered = useMemo(() => {
    let list = categoryProducts.filter((product) => {
      const price = product.discount_price || product.price;
      const colors = productColors(product).map((color) => color.value);
      const sizes = productSizes(product);
      const cups = productCups(product);
      const material = product.material || product.fabric_and_care || product.fabric_care || '';
      if (price < filters.priceMin || price > filters.priceMax) return false;
      if (filters.inStock && productStock(product) <= 0) return false;
      if (filters.discountOnly && !(product.discount_price && product.discount_price < product.price)) return false;
      if (filters.rating && Number(product.avg_rating || 0) < filters.rating) return false;
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
    else if (sort === 'rating') list = [...list].sort((a, b) => Number(b.avg_rating || 0) - Number(a.avg_rating || 0));
    return list;
  }, [categoryProducts, filters, sort]);

  return (
    <div className="store-page store-boutique-listing" dir="rtl">
      <StoreHeader />
      <div className="store-container store-breadcrumb">
        <Link href="/">خانه</Link>
        <span>‹</span>
        <b>{title}</b>
      </div>
      <div className="store-container store-category-layout">
        <header className="store-category-seo-head premium">
          <div>
            <h1>{title}</h1>
            <span>{filtered.length.toLocaleString('fa-IR')} محصول</span>
          </div>
          {categoryDescription ? <p>{categoryDescription}</p> : null}
          {relatedCategories.length > 0 ? (
            <nav aria-label="دسته‌بندی‌های مرتبط">
              {relatedCategories.map((category) => category.label ? <Link key={category.href} href={category.href}>{category.label}</Link> : null)}
            </nav>
          ) : null}
        </header>

        <aside>
          <CategoryFilters
            sort={sort}
            setSort={setSort}
            filters={filters}
            setFilters={setFilters}
            options={options}
            totalCount={filtered.length}
            onClear={() => setFilters(emptyProductFilters)}
            onRemove={(key, value) => setFilters((current) => removeFilter(current, key, value))}
          />
        </aside>

        <main>
          {isLoading ? <div className="store-product-grid boutique">{Array.from({ length: 8 }).map((_, i) => <div key={i} className="store-skeleton square" />)}</div>
            : filtered.length === 0 ? <div className="store-empty premium"><h2>محصولی با این فیلترها پیدا نشد</h2><p>چند فیلتر را حذف کنید یا همه محصولات این دسته را ببینید.</p><button type="button" onClick={() => setFilters(emptyProductFilters)}>حذف همه فیلترها</button></div>
            : <div className="store-product-grid boutique">{filtered.map((product) => <ProductCard key={product.id} product={product} />)}</div>}
        </main>

        <section className="store-category-copy">
          <h2>راهنمای خرید {title}</h2>
          <p>برای انتخاب بهتر، مشخصات هر محصول، جنس، سایزهای موجود، رنگ‌ها و شرایط ارسال را در صفحه محصول بررسی کنید. لینک‌های دسته‌بندی بالا به گوگل و مشتریان کمک می‌کند سریع‌تر بین کالکشن‌های نوشه حرکت کنند.</p>
          <div>
            <Link href="/faq">راهنمای سایز و سوالات متداول</Link>
            <Link href="/contact">تماس با پشتیبانی</Link>
          </div>
        </section>
      </div>
    </div>
  );
}
