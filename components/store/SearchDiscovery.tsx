'use client';

import Link from 'next/link';
import type { Product, Category } from '@/app/admin/types';
import ProductCard from './ProductCard';

const popularSearches = ['ست کیپور', 'سوتین بدون سیم', 'لباس خواب ساتن', 'لباس راحتی نخی', 'ست عروس'];
const recentSearches = ['سوتین بدون اسفنج', 'لباس خواب ساتن', 'لباس راحتی نخی'];

export default function SearchDiscovery({
  products,
  categories,
  query,
  onPick,
  noResults = false
}: {
  products: Product[];
  categories: Category[];
  query?: string;
  onPick: (value: string) => void;
  noResults?: boolean;
}) {
  const featuredProducts = products.filter((product) => product.is_active !== false).slice(0, 4);
  const categoryItems = categories.filter((category) => category.is_active !== false).slice(0, 5);

  return (
    <div className="store-search-discovery">
      {noResults ? (
        <section className="store-search-empty-state">
          <h2>برای «{query}» محصولی پیدا نشد</h2>
          <p>نام محصول، رنگ، سایز یا دسته‌بندی را کمی ساده‌تر وارد کنید. چند مسیر محبوب پایین آماده است.</p>
          <div>
            <Link href="/category/all">مشاهده همه محصولات</Link>
            <button type="button" onClick={() => onPick('')}>پاک کردن جستجو</button>
          </div>
        </section>
      ) : null}

      <section className="store-search-chip-section">
        <div>
          <h2>جستجوهای اخیر</h2>
          <div className="store-search-chips">
            {recentSearches.map((item) => <button key={item} type="button" onClick={() => onPick(item)}>{item}</button>)}
          </div>
        </div>
        <div>
          <h2>جستجوهای پرطرفدار</h2>
          <div className="store-search-chips">
            {popularSearches.map((item) => <button key={item} type="button" onClick={() => onPick(item)}>{item}</button>)}
          </div>
        </div>
      </section>

      {categoryItems.length > 0 ? (
        <section className="store-related-category-rail">
          <h2>دسته‌های مرتبط</h2>
          <div>
            {categoryItems.map((category) => (
              <Link key={category.id} href={`/category/${category.slug || category.id}`}>
                {category.image ? <img src={category.image} alt="" /> : <span />}
                <b>{category.title || category.name}</b>
              </Link>
            ))}
            <Link href="/category/all"><span />همه محصولات</Link>
          </div>
        </section>
      ) : null}

      {featuredProducts.length > 0 ? (
        <section>
          <div className="store-search-section-head">
            <h2>{noResults ? 'پیشنهادهای محبوب' : 'برای شروع ببینید'}</h2>
            <Link href="/category/all">مشاهده همه</Link>
          </div>
          <div className="store-product-grid boutique">
            {featuredProducts.map((product) => <ProductCard key={product.id} product={product} />)}
          </div>
        </section>
      ) : null}
    </div>
  );
}
