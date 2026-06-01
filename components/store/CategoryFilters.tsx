'use client';

import { useState } from 'react';
import type { ReactNode } from 'react';
import ActiveFilterChips from './ActiveFilterChips';

export type ProductFilters = {
  sizes: string[];
  cups: string[];
  colors: string[];
  brands: string[];
  collections: string[];
  materials: string[];
  inStock: boolean;
  discountOnly: boolean;
  priceMin: number;
  priceMax: number;
  rating: number;
};

export const emptyProductFilters: ProductFilters = {
  sizes: [],
  cups: [],
  colors: [],
  brands: [],
  collections: [],
  materials: [],
  inStock: false,
  discountOnly: false,
  priceMin: 0,
  priceMax: Infinity,
  rating: 0
};

export type FilterOptions = {
  sizes: string[];
  cups: string[];
  colors: Array<{ label: string; value: string; hex?: string }>;
  brands: string[];
  collections: string[];
  materials: string[];
  priceMin: number;
  priceMax: number;
};

const sortOptions = [
  { value: 'default', label: 'پربازدیدترین' },
  { value: 'price_asc', label: 'ارزان‌ترین' },
  { value: 'price_desc', label: 'گران‌ترین' },
  { value: 'newest', label: 'جدیدترین' },
  { value: 'discount', label: 'بیشترین تخفیف' },
  { value: 'rating', label: 'بالاترین امتیاز' }
];

function hasFilters(filters: ProductFilters) {
  return Boolean(
    filters.sizes.length ||
    filters.cups.length ||
    filters.colors.length ||
    filters.brands.length ||
    filters.collections.length ||
    filters.materials.length ||
    filters.inStock ||
    filters.discountOnly ||
    filters.rating ||
    filters.priceMin ||
    Number.isFinite(filters.priceMax)
  );
}

export default function CategoryFilters({
  sort,
  setSort,
  filters,
  setFilters,
  options,
  totalCount,
  onClear,
  onRemove
}: {
  sort: string;
  setSort: (value: string) => void;
  filters: ProductFilters;
  setFilters: (value: ProductFilters) => void;
  options: FilterOptions;
  totalCount: number;
  onClear: () => void;
  onRemove: (key: keyof ProductFilters, value?: string) => void;
}) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const toggleArray = (key: keyof ProductFilters, value: string) => {
    const current = filters[key];
    if (!Array.isArray(current)) return;
    setFilters({ ...filters, [key]: current.includes(value) ? current.filter((item) => item !== value) : [...current, value] });
  };
  const setBool = (key: 'inStock' | 'discountOnly', value: boolean) => setFilters({ ...filters, [key]: value });

  const panel = (
    <div className="store-filter-panel">
      <div className="store-filter-panel-head">
        <h2>فیلترها</h2>
        {hasFilters(filters) ? <button type="button" onClick={onClear}>حذف همه فیلترها</button> : null}
      </div>

      <FilterSection title="سایز">
        <div className="store-filter-options grid">
          {options.sizes.map((size) => <button key={size} type="button" className={filters.sizes.includes(size) ? 'active' : ''} onClick={() => toggleArray('sizes', size)}>{size}</button>)}
        </div>
      </FilterSection>

      {options.cups.length ? (
        <FilterSection title="کاپ">
          <div className="store-filter-options grid">
            {options.cups.map((cup) => <button key={cup} type="button" className={filters.cups.includes(cup) ? 'active' : ''} onClick={() => toggleArray('cups', cup)}>{cup}</button>)}
          </div>
        </FilterSection>
      ) : null}

      {options.colors.length ? (
        <FilterSection title="رنگ">
          <div className="store-color-filter">
            {options.colors.map((color) => (
              <button key={color.value} type="button" className={filters.colors.includes(color.value) ? 'active' : ''} onClick={() => toggleArray('colors', color.value)} title={color.label}>
                <span style={{ backgroundColor: color.hex || color.value }} />
              </button>
            ))}
          </div>
        </FilterSection>
      ) : null}

      <FilterSection title="محدوده قیمت (تومان)">
        <div className="store-price-filter">
          <input inputMode="numeric" value={filters.priceMin || ''} onChange={(event) => setFilters({ ...filters, priceMin: Number(event.target.value || 0) })} placeholder={options.priceMin.toLocaleString('fa-IR')} />
          <input inputMode="numeric" value={Number.isFinite(filters.priceMax) ? filters.priceMax : ''} onChange={(event) => setFilters({ ...filters, priceMax: event.target.value ? Number(event.target.value) : Infinity })} placeholder={options.priceMax.toLocaleString('fa-IR')} />
        </div>
      </FilterSection>

      <div className="store-switch-list">
        <label><input type="checkbox" checked={filters.inStock} onChange={(event) => setBool('inStock', event.target.checked)} />فقط کالاهای موجود</label>
        <label><input type="checkbox" checked={filters.discountOnly} onChange={(event) => setBool('discountOnly', event.target.checked)} />فقط کالاهای تخفیف‌دار</label>
      </div>

      {options.brands.length ? <SelectList title="برند" values={options.brands} selected={filters.brands} onToggle={(value) => toggleArray('brands', value)} /> : null}
      {options.collections.length ? <SelectList title="کالکشن" values={options.collections} selected={filters.collections} onToggle={(value) => toggleArray('collections', value)} /> : null}
      {options.materials.length ? <SelectList title="جنس" values={options.materials} selected={filters.materials} onToggle={(value) => toggleArray('materials', value)} /> : null}

      <FilterSection title="امتیاز مشتری">
        <div className="store-filter-options">
          {[5, 4, 3].map((rating) => <button key={rating} type="button" className={filters.rating === rating ? 'active' : ''} onClick={() => setFilters({ ...filters, rating })}>{rating.toLocaleString('fa-IR')} ستاره به بالا</button>)}
        </div>
      </FilterSection>

      <button type="button" className="store-apply-filters" onClick={() => setDrawerOpen(false)}>اعمال فیلترها</button>
    </div>
  );

  return (
    <div className="store-listing-controls" dir="rtl">
      <div className="store-listing-toolbar">
        <button type="button" className="store-filter-toggle" onClick={() => setDrawerOpen(true)}>فیلترها</button>
        <label className="store-sort-select">
          <span>مرتب‌سازی:</span>
          <select value={sort} onChange={(event) => setSort(event.target.value)}>
            {sortOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
          </select>
        </label>
        <span className="store-filter-count">{totalCount.toLocaleString('fa-IR')} محصول یافت شد</span>
      </div>
      <ActiveFilterChips filters={filters} onRemove={onRemove} onClear={onClear} />
      <div className="store-filter-layout-aside">{panel}</div>
      {drawerOpen ? (
        <div className="store-filter-drawer">
          <button type="button" className="store-filter-drawer-backdrop" onClick={() => setDrawerOpen(false)} aria-label="بستن فیلترها" />
          <aside>{panel}</aside>
        </div>
      ) : null}
    </div>
  );
}

function FilterSection({ title, children }: { title: string; children: ReactNode }) {
  return <section className="store-filter-section"><h3>{title}</h3>{children}</section>;
}

function SelectList({ title, values, selected, onToggle }: { title: string; values: string[]; selected: string[]; onToggle: (value: string) => void }) {
  return (
    <FilterSection title={title}>
      <div className="store-filter-options">
        {values.map((value) => <button key={value} type="button" className={selected.includes(value) ? 'active' : ''} onClick={() => onToggle(value)}>{value}</button>)}
      </div>
    </FilterSection>
  );
}
