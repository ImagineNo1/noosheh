'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import CategoryFilters from '@/components/store/CategoryFilters';
import ProductCard from '@/components/store/ProductCard';
import StoreHeader from '@/components/store/StoreHeader';
import { storeApi } from '@/lib/store-api';
import type { Product } from '@/app/admin/types';

export default function CategoryPage({ params }: { params: { slug: string } }) {
  const categorySlug = decodeURIComponent(params.slug);
  const searchParams = useSearchParams();
  const collection = searchParams?.get('collection') || '';
  const [sort, setSort] = useState('default');
  const [priceRange, setPriceRange] = useState({ min: 0, max: Infinity });
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    storeApi.products().then(setProducts).finally(() => setIsLoading(false));
  }, []);

  const filtered = useMemo(() => {
    let list = products.filter((product) => product.is_active !== false).filter((product) => categorySlug === 'all' || product.category === categorySlug);
    if (collection) list = list.filter((product) => product.collection === collection);
    list = list.filter((product) => {
      const price = product.discount_price || product.price;
      return price >= priceRange.min && price <= priceRange.max;
    });
    if (sort === 'price_asc') list = [...list].sort((a, b) => (a.discount_price || a.price) - (b.discount_price || b.price));
    else if (sort === 'price_desc') list = [...list].sort((a, b) => (b.discount_price || b.price) - (a.discount_price || a.price));
    else if (sort === 'newest') list = [...list].sort((a, b) => new Date(b.created_date || '').getTime() - new Date(a.created_date || '').getTime());
    else if (sort === 'discount') list = [...list].sort((a, b) => ((b.discount_price ? (b.price - b.discount_price) / b.price : 0) - (a.discount_price ? (a.price - a.discount_price) / a.price : 0)));
    return list;
  }, [products, categorySlug, collection, sort, priceRange]);

  return (
    <div className="store-page" dir="rtl">
      <StoreHeader />
      <div className="store-container store-breadcrumb"><Link href="/">خانه</Link><span>‹</span><b>{collection || (categorySlug === 'all' ? 'همه محصولات' : categorySlug)}</b></div>
      <div className="store-container store-page-body">
        <h1>{collection || (categorySlug === 'all' ? 'همه محصولات' : categorySlug)}</h1>
        <CategoryFilters sort={sort} setSort={setSort} priceRange={priceRange} setPriceRange={setPriceRange} totalCount={filtered.length} />
        {isLoading ? <div className="store-product-grid">{Array.from({ length: 8 }).map((_, i) => <div key={i} className="store-skeleton square" />)}</div>
          : filtered.length === 0 ? <div className="store-empty">محصولی یافت نشد</div>
          : <div className="store-product-grid">{filtered.map((product) => <ProductCard key={product.id} product={product} />)}</div>}
      </div>
    </div>
  );
}
