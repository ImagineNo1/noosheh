'use client';

type PriceRange = { min: number; max: number };

const sortOptions = [
  { value: 'default', label: 'پیش‌فرض' },
  { value: 'price_asc', label: 'ارزان‌ترین' },
  { value: 'price_desc', label: 'گران‌ترین' },
  { value: 'newest', label: 'جدیدترین' },
  { value: 'discount', label: 'بیشترین تخفیف' }
];

const ranges = [
  { label: 'همه', min: 0, max: Infinity },
  { label: 'زیر ۵۰۰ هزار', min: 0, max: 500000 },
  { label: '۵۰۰ تا ۱ میلیون', min: 500000, max: 1000000 },
  { label: 'بالای ۱ میلیون', min: 1000000, max: Infinity }
];

export default function CategoryFilters({ sort, setSort, priceRange, setPriceRange, totalCount }: {
  sort: string;
  setSort: (value: string) => void;
  priceRange: PriceRange;
  setPriceRange: (value: PriceRange) => void;
  totalCount: number;
}) {
  return (
    <div className="store-filter-bar" dir="rtl">
      <div className="store-filter-count"><b>{totalCount.toLocaleString('fa-IR')}</b> محصول</div>
      <div className="store-filter-group"><span>↕ مرتب‌سازی:</span><div>{sortOptions.map((option) => <button key={option.value} onClick={() => setSort(option.value)} className={sort === option.value ? 'active' : ''}>{option.label}</button>)}</div></div>
      <div className="store-filter-group price"><span>☷ قیمت:</span><div>{ranges.map((range) => <button key={range.label} onClick={() => setPriceRange({ min: range.min, max: range.max })} className={priceRange.min === range.min && priceRange.max === range.max ? 'accent' : ''}>{range.label}</button>)}</div></div>
    </div>
  );
}
