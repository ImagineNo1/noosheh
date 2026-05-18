'use client';

import { Button, Card, Input, Label, Toggle } from '@/app/admin/_components/ui';
import type { Product } from '@/app/admin/types';

type ProductVariant = NonNullable<Product['variants']>[number];
type ColorSwatch = NonNullable<Product['color_swatches']>[number];

const colorKey = (color: ColorSwatch) => color.slug || (color.value?.startsWith('#') ? '' : color.value) || color.name || '';
const comboId = (color: string, size: string, cup: string) => `${color || 'default'}-${size || 'default'}-${cup || 'none'}`;

function MultiChecks({ title, options, selected, onChange }: { title: string; options: string[]; selected: string[]; onChange: (values: string[]) => void }) {
  return <div><Label>{title}</Label><div className="admin-actions-row">{options.length ? options.map((option) => <label key={option} className="admin-inline small"><input type="checkbox" checked={selected.includes(option)} onChange={(event) => onChange(event.target.checked ? [...selected, option] : selected.filter((item) => item !== option))} /> {option}</label>) : <span className="admin-muted small">ابتدا در صفحه پیش‌فرض‌ها موردی تعریف کنید.</span>}</div></div>;
}

export default function AdminVariantMatrix({ sizes, cups, hasCup, colors, variants, sizeOptions = [], cupOptions = [], onSizesChange, onCupsChange, onHasCupChange, onVariantsChange }: {
  sizes: string[]; cups: string[]; hasCup: boolean; colors: ColorSwatch[]; variants: ProductVariant[]; sizeOptions?: string[]; cupOptions?: string[];
  onSizesChange: (sizes: string[]) => void; onCupsChange: (cups: string[]) => void; onHasCupChange: (hasCup: boolean) => void; onVariantsChange: (variants: ProductVariant[]) => void;
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
      <MultiChecks title="سایزهای قابل استفاده" options={sizeOptions} selected={sizes} onChange={onSizesChange} />
      <div className="admin-inline"><Toggle checked={hasCup} onChange={(value) => { onHasCupChange(value); if (!value) onCupsChange([]); }} /><Label>این محصول کاپ دارد</Label></div>
      {hasCup && <MultiChecks title="کاپ‌های قابل استفاده" options={cupOptions} selected={cups} onChange={onCupsChange} />}
      <Button type="button" className="outline" onClick={generateVariants}>↻ ساخت و به‌روزرسانی وریانت‌ها</Button>
    </div></Card>
    {variants.length > 0 && <Card><div className="admin-card-header compact"><h2>وریانت‌های محصول ({variants.length.toLocaleString('fa-IR')})</h2></div><div className="admin-card-body"><div className="admin-table-wrap"><table className="admin-table compact-table"><thead><tr><th>رنگ</th><th>سایز</th>{hasCup && <th>کاپ</th>}<th>SKU</th><th>قیمت اضافه/اختصاصی (ریال)</th><th>موجودی</th><th>فعال</th></tr></thead><tbody>{variants.map((variant, index) => {
      const color = colors.find((item) => colorKey(item) === variant.color); const stock = variant.inventory ?? variant.stock ?? 0;
      return <tr key={`${variant.id}-${index}`}><td><span className="manager-row">{color && <span className="color-dot small" style={{ backgroundColor: color.hex || color.value }} />}{variant.color || 'پیش‌فرض'}</span></td><td>{variant.size || '—'}</td>{hasCup && <td>{variant.cup || '—'}</td>}<td><Input value={variant.sku || ''} onChange={(event) => updateVariant(index, { sku: event.target.value })} dir="ltr" /></td><td><Input type="number" value={variant.price || 0} onChange={(event) => updateVariant(index, { price: Number(event.target.value) })} dir="ltr" /></td><td><Input type="number" value={stock} onChange={(event) => updateVariant(index, { inventory: Number(event.target.value), stock: Number(event.target.value) })} dir="ltr" /></td><td><Toggle checked={variant.is_available !== false} onChange={(value) => updateVariant(index, { is_available: value })} /></td></tr>;
    })}</tbody></table></div></div></Card>}
  </div>;
}
