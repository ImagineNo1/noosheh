'use client';

type PriceRange = { min: number; max: number };

const sortOptions = [
  { value: 'default', label: 'پیش‌فرض' },
  { value: 'price_asc', label: 'ارزان‌ترین' },
  { value: 'price_desc', label: 'گران‌ترین' },
  { value: 'newest', label: 'جدیدترین' },
  { value: 'discount', label: 'بیشترین تخفیف' }
];

export default function CategoryFilters({ sort, setSort, priceRange, setPriceRange, totalCount }: {
  sort: string;
  setSort: (value: string) => void;
  priceRange: PriceRange;
  setPriceRange: (value: PriceRange) => void;
  totalCount: number;
}) {
  return (
    <div className="store-filter-bar">
      <div className="store-filter-count">{totalCount.toLocaleString('fa-IR')} محصول</div>
      <div className="store-filter-controls">
        <select value={sort} onChange={(event) => setSort(event.target.value)}>
          {sortOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
        </select>
        <input type="number" placeholder="حداقل قیمت" onChange={(event) => setPriceRange({ ...priceRange, min: Number(event.target.value) || 0 })} />
        <input type="number" placeholder="حداکثر قیمت" onChange={(event) => setPriceRange({ ...priceRange, max: Number(event.target.value) || Infinity })} />
      </div>
    </div>
  );
}
