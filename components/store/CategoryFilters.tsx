'use client';

import { useMemo, useState } from 'react';
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
  { value: 'price_asc', label: 'ارزان ترین' },
  { value: 'price_desc', label: 'گران ترین' },
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

function toman(value: number) {
  if (!Number.isFinite(value)) return 'همه قیمت ها';
  return `${Math.max(0, value).toLocaleString('fa-IR')} تومان`;
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
  const priceMax = Math.max(options.priceMax || 0, options.priceMin || 0, 1);
  const selectedMax = Number.isFinite(filters.priceMax) ? filters.priceMax : priceMax;
  const step = useMemo(() => Math.max(1000, Math.round(priceMax / 100)), [priceMax]);
  const toggleArray = (key: keyof ProductFilters, value: string) => {
    const current = filters[key];
    if (!Array.isArray(current)) return;
    setFilters({ ...filters, [key]: current.includes(value) ? current.filter((item) => item !== value) : [...current, value] });
  };
  const setBool = (key: 'inStock' | 'discountOnly', value: boolean) => setFilters({ ...filters, [key]: value });
  const setPriceMin = (value: number) => setFilters({ ...filters, priceMin: Math.min(value, selectedMax) });
  const setPriceMax = (value: number) => setFilters({ ...filters, priceMax: Math.max(value, filters.priceMin || 0) });

  const panel = (
    <div className="store-filter-panel">
      <div className="store-filter-panel-head">
        <h2>فیلترها</h2>
        {hasFilters(filters) ? <button type="button" onClick={onClear}>حذف همه</button> : null}
      </div>

      <FilterSection title="سایز">
        <ChipList values={options.sizes} selected={filters.sizes} onToggle={(value) => toggleArray('sizes', value)} limit={9} />
      </FilterSection>

      {options.cups.length ? (
        <FilterSection title="کاپ">
          <ChipList values={options.cups} selected={filters.cups} onToggle={(value) => toggleArray('cups', value)} limit={9} />
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

      <FilterSection title="محدوده قیمت">
        <div className="store-price-slider">
          <div><span>{toman(filters.priceMin || options.priceMin || 0)}</span><span>{toman(selectedMax)}</span></div>
          <input type="range" min={options.priceMin || 0} max={priceMax} step={step} value={filters.priceMin || options.priceMin || 0} onChange={(event) => setPriceMin(Number(event.target.value))} aria-label="حداقل قیمت" />
          <input type="range" min={options.priceMin || 0} max={priceMax} step={step} value={selectedMax} onChange={(event) => setPriceMax(Number(event.target.value))} aria-label="حداکثر قیمت" />
        </div>
      </FilterSection>

      <div className="store-switch-list">
        <label><input type="checkbox" checked={filters.inStock} onChange={(event) => setBool('inStock', event.target.checked)} />فقط کالاهای موجود</label>
        <label><input type="checkbox" checked={filters.discountOnly} onChange={(event) => setBool('discountOnly', event.target.checked)} />فقط کالاهای تخفیف دار</label>
      </div>

      {options.brands.length ? <ChipListSection title="برند" values={options.brands} selected={filters.brands} onToggle={(value) => toggleArray('brands', value)} /> : null}
      {options.collections.length ? <ChipListSection title="کالکشن" values={options.collections} selected={filters.collections} onToggle={(value) => toggleArray('collections', value)} /> : null}
      {options.materials.length ? <ChipListSection title="جنس" values={options.materials} selected={filters.materials} onToggle={(value) => toggleArray('materials', value)} /> : null}

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
          <span>مرتب سازی:</span>
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

function ChipListSection({ title, values, selected, onToggle }: { title: string; values: string[]; selected: string[]; onToggle: (value: string) => void }) {
  return (
    <FilterSection title={title}>
      <ChipList values={values} selected={selected} onToggle={onToggle} />
    </FilterSection>
  );
}

function ChipList({ values, selected, onToggle, limit = 8 }: { values: string[]; selected: string[]; onToggle: (value: string) => void; limit?: number }) {
  const [expanded, setExpanded] = useState(false);
  const visible = expanded ? values : values.slice(0, limit);
  return (
    <div className="store-filter-options">
      {visible.map((value) => <button key={value} type="button" className={selected.includes(value) ? 'active' : ''} onClick={() => onToggle(value)}>{value}</button>)}
      {values.length > limit ? <button type="button" className="ghost" onClick={() => setExpanded((value) => !value)}>{expanded ? 'نمایش کمتر' : 'نمایش بیشتر'}</button> : null}
    </div>
  );
}
