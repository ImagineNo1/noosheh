'use client';

import type { ProductFilters } from './CategoryFilters';

const labels: Record<string, string> = {
  sizes: 'سایز',
  cups: 'کاپ',
  colors: 'رنگ',
  brands: 'برند',
  collections: 'کالکشن',
  materials: 'جنس',
  inStock: 'فقط کالاهای موجود',
  discountOnly: 'فقط تخفیف‌دارها',
  rating: 'امتیاز مشتری'
};

export default function ActiveFilterChips({
  filters,
  onRemove,
  onClear
}: {
  filters: ProductFilters;
  onRemove: (key: keyof ProductFilters, value?: string) => void;
  onClear: () => void;
}) {
  const chips: Array<{ key: keyof ProductFilters; value?: string; label: string }> = [];
  (['sizes', 'cups', 'colors', 'brands', 'collections', 'materials'] as Array<keyof ProductFilters>).forEach((key) => {
    const values = filters[key];
    if (Array.isArray(values)) values.forEach((value) => chips.push({ key, value, label: `${labels[String(key)]}: ${value}` }));
  });
  if (filters.inStock) chips.push({ key: 'inStock', label: labels.inStock });
  if (filters.discountOnly) chips.push({ key: 'discountOnly', label: labels.discountOnly });
  if (filters.rating > 0) chips.push({ key: 'rating', label: `${filters.rating.toLocaleString('fa-IR')} ستاره به بالا` });
  if (filters.priceMin || Number.isFinite(filters.priceMax)) {
    chips.push({ key: 'priceMin', label: `محدوده قیمت: ${(filters.priceMin || 0).toLocaleString('fa-IR')} تا ${Number.isFinite(filters.priceMax) ? filters.priceMax.toLocaleString('fa-IR') : 'بیشتر'}` });
  }

  if (!chips.length) return null;

  return (
    <div className="store-active-filter-chips">
      <button type="button" onClick={onClear}>حذف همه</button>
      {chips.map((chip) => (
        <button key={`${String(chip.key)}-${chip.value || chip.label}`} type="button" onClick={() => onRemove(chip.key, chip.value)}>
          {chip.label}
          <span aria-hidden="true">×</span>
        </button>
      ))}
    </div>
  );
}
