'use client';

import { useMemo, useState } from 'react';
import { Button, Card, Input, Label, Toggle } from '@/app/admin/_components/ui';
import type { Product } from '@/app/admin/types';

type ProductVariant = NonNullable<Product['variants']>[number];
type ColorSwatch = NonNullable<Product['color_swatches']>[number];

const colorKey = (color: ColorSwatch) => color.slug || (color.value?.startsWith('#') ? '' : color.value) || color.name || '';
const comboId = (color: string, size: string, cup: string) => `${color || 'default'}-${size || 'default'}-${cup || 'none'}`;

function uniqueOptions(...groups: string[][]) {
  return Array.from(new Set(groups.flat().map((item) => item.trim()).filter(Boolean)));
}

function CreatableMultiDropdown({ title, options, selected, placeholder, onChange, onCreate }: { title: string; options: string[]; selected: string[]; placeholder?: string; onChange: (values: string[]) => void; onCreate?: (value: string) => Promise<void> }) {
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const normalizedQuery = query.trim().toLowerCase();
  const allOptions = useMemo(() => uniqueOptions(options, selected), [options, selected]);
  const filteredOptions = useMemo(() => allOptions
    .filter((option) => !selected.includes(option))
    .filter((option) => !normalizedQuery || option.toLowerCase().includes(normalizedQuery))
    .slice(0, 10), [allOptions, normalizedQuery, selected]);
  const exactExists = allOptions.some((option) => option.toLowerCase() === normalizedQuery);
  const canCreate = Boolean(query.trim()) && !exactExists && Boolean(onCreate);

  const choose = (option: string) => {
    onChange(uniqueOptions(selected, [option]));
    setQuery('');
    setOpen(false);
  };

  const createOption = async () => {
    const nextValue = query.trim();
    if (!nextValue || creating || !onCreate) return;
    setCreating(true);
    try {
      await onCreate(nextValue);
      choose(nextValue);
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="admin-combobox">
      <Label>{title}</Label>
      {selected.length > 0 ? <div className="admin-combobox-chips">{selected.map((item) => <span key={item} className="relation-chip"><b>{item}</b><button type="button" onClick={() => onChange(selected.filter((value) => value !== item))} aria-label={`حذف ${item}`}>×</button></span>)}</div> : null}
      <div className="admin-combobox-input-wrap">
        <Input value={query} onFocus={() => setOpen(true)} onBlur={() => window.setTimeout(() => setOpen(false), 120)} onChange={(event) => { setQuery(event.target.value); setOpen(true); }} placeholder={placeholder || 'جستجو یا افزودن...'} />
        {canCreate && <button type="button" className="admin-combobox-add" onMouseDown={(event) => event.preventDefault()} onClick={createOption} disabled={creating} aria-label={`افزودن ${query}`}>＋</button>}
      </div>
      {open && (filteredOptions.length > 0 || canCreate) ? (
        <div className="admin-combobox-menu">
          {filteredOptions.map((option) => <button type="button" key={option} onMouseDown={(event) => event.preventDefault()} onClick={() => choose(option)}>{option}</button>)}
          {canCreate && <button type="button" className="create" onMouseDown={(event) => event.preventDefault()} onClick={createOption} disabled={creating}>＋ افزودن «{query.trim()}» به پیش‌فرض‌ها</button>}
          {!filteredOptions.length && !canCreate ? <span className="admin-muted small">گزینه‌ای یافت نشد.</span> : null}
        </div>
      ) : null}
      {!allOptions.length ? <span className="admin-muted small">هنوز پیش‌فرضی تعریف نشده؛ با تایپ کردن می‌توانید اضافه کنید.</span> : null}
    </div>
  );
}

export default function AdminVariantMatrix({ sizes, cups, hasCup, colors, variants, sizeOptions = [], cupOptions = [], onSizesChange, onCupsChange, onHasCupChange, onVariantsChange, onCreateSize, onCreateCup }: {
  sizes: string[]; cups: string[]; hasCup: boolean; colors: ColorSwatch[]; variants: ProductVariant[]; sizeOptions?: string[]; cupOptions?: string[];
  onSizesChange: (sizes: string[]) => void; onCupsChange: (cups: string[]) => void; onHasCupChange: (hasCup: boolean) => void; onVariantsChange: (variants: ProductVariant[]) => void; onCreateSize?: (value: string) => Promise<void>; onCreateCup?: (value: string) => Promise<void>;
}) {
  const generateVariants = () => {
    const colorSlugs = colors.filter((color) => color.active !== false && color.is_active !== false).map(colorKey).filter(Boolean);
    const sizeList = sizes.length ? sizes : [''];
    const cupList = hasCup && cups.length ? cups : [''];
    const generated: ProductVariant[] = [];
    for (const color of (colorSlugs.length ? colorSlugs : [''])) for (const size of sizeList) for (const cup of cupList) {
      const id = comboId(color, size, cup);
      const existing = variants.find((variant) => (variant.id || variant.product_variant_id) === id || (variant.color === color && variant.size === size && (variant.cup || '') === cup));
      generated.push(existing ? { ...existing, id, product_variant_id: id } : { id, product_variant_id: id, color, size, cup, sku: '', price: 0, compare_at_price: 0, inventory: 0, stock: 0, is_available: true });
    }
    onVariantsChange(generated);
  };
  const updateVariant = (index: number, values: Partial<ProductVariant>) => onVariantsChange(variants.map((variant, variantIndex) => variantIndex === index ? { ...variant, ...values } : variant));

  return <div className="admin-manager-stack">
    <Card><div className="admin-card-header compact"><h2>انتخاب ویژگی‌ها از پیش‌فرض‌ها</h2></div><div className="admin-card-body manager-list">
      <CreatableMultiDropdown title="سایزهای قابل استفاده" options={sizeOptions} selected={sizes} onChange={onSizesChange} onCreate={onCreateSize} placeholder="سایز را جستجو یا اضافه کنید..." />
      <div className="admin-inline"><Toggle checked={hasCup} onChange={(value) => { onHasCupChange(value); if (!value) onCupsChange([]); }} /><Label>این محصول کاپ دارد</Label></div>
      {hasCup && <CreatableMultiDropdown title="کاپ‌های قابل استفاده" options={cupOptions} selected={cups} onChange={onCupsChange} onCreate={onCreateCup} placeholder="کاپ را جستجو یا اضافه کنید..." />}
      <Button type="button" className="outline" onClick={generateVariants}>↻ ساخت و به‌روزرسانی وریانت‌ها</Button>
    </div></Card>
    {variants.length > 0 && <Card><div className="admin-card-header compact"><h2>وریانت‌های محصول ({variants.length.toLocaleString('fa-IR')})</h2></div><div className="admin-card-body"><div className="admin-table-wrap"><table className="admin-table compact-table"><thead><tr><th>رنگ</th><th>سایز</th>{hasCup && <th>کاپ</th>}<th>SKU</th><th>قیمت اضافه/اختصاصی (ریال)</th><th>موجودی</th><th>فعال</th></tr></thead><tbody>{variants.map((variant, index) => {
      const color = colors.find((item) => colorKey(item) === variant.color); const stock = variant.inventory ?? variant.stock ?? 0;
      return <tr key={`${variant.id}-${index}`}><td><span className="manager-row">{color && <span className="color-dot small" style={{ backgroundColor: color.hex || color.value }} />}{variant.color || 'پیش‌فرض'}</span></td><td>{variant.size || '—'}</td>{hasCup && <td>{variant.cup || '—'}</td>}<td><Input value={variant.sku || ''} onChange={(event) => updateVariant(index, { sku: event.target.value })} dir="ltr" /></td><td><Input type="number" value={variant.price || 0} onChange={(event) => updateVariant(index, { price: Number(event.target.value) })} dir="ltr" /></td><td><Input type="number" value={stock} onChange={(event) => updateVariant(index, { inventory: Number(event.target.value), stock: Number(event.target.value) })} dir="ltr" /></td><td><Toggle checked={variant.is_available !== false} onChange={(value) => updateVariant(index, { is_available: value })} /></td></tr>;
    })}</tbody></table></div></div></Card>}
  </div>;
}
