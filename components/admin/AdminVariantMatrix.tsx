'use client';

import { Button, Card, Input, Label, Toggle } from '@/app/admin/_components/ui';
import type { Product } from '@/app/admin/types';

type ProductVariant = NonNullable<Product['variants']>[number];
type ColorSwatch = NonNullable<Product['color_swatches']>[number];

const colorKey = (color: ColorSwatch) => color.slug || color.value || color.name;

export default function AdminVariantMatrix({
  sizes,
  cups,
  hasCup,
  colors,
  variants,
  onSizesChange,
  onCupsChange,
  onHasCupChange,
  onVariantsChange
}: {
  sizes: string[];
  cups: string[];
  hasCup: boolean;
  colors: ColorSwatch[];
  variants: ProductVariant[];
  onSizesChange: (sizes: string[]) => void;
  onCupsChange: (cups: string[]) => void;
  onHasCupChange: (hasCup: boolean) => void;
  onVariantsChange: (variants: ProductVariant[]) => void;
}) {
  const generateVariants = () => {
    const colorSlugs = colors.length ? colors.map(colorKey).filter(Boolean) : ['default'];
    const sizeList = sizes.length ? sizes : ['default'];
    const cupList = hasCup && cups.length ? cups : [''];
    const generated: ProductVariant[] = [];

    for (const color of colorSlugs) {
      for (const size of sizeList) {
        for (const cup of cupList) {
          const existing = variants.find((variant) => variant.color === color && variant.size === size && (variant.cup || '') === cup);
          generated.push(existing || { color, size, cup, sku: '', price: 0, compare_at_price: 0, inventory: 0, stock: 0, is_available: true });
        }
      }
    }
    onVariantsChange(generated);
  };
  const updateVariant = (index: number, field: keyof ProductVariant, value: unknown) => onVariantsChange(variants.map((variant, i) => i === index ? { ...variant, [field]: value } : variant));
  const updateVariantFields = (index: number, values: Partial<ProductVariant>) => onVariantsChange(variants.map((variant, i) => i === index ? { ...variant, ...values } : variant));

  return (
    <div className="admin-manager-stack">
      <Card>
        <div className="admin-card-header compact"><h2>سایزها و کاپ‌ها</h2></div>
        <div className="admin-card-body manager-list">
          <div><Label>سایزها (با ویرگول جدا کنید)</Label><Input value={sizes.join(', ')} onChange={(event) => onSizesChange(event.target.value.split(',').map((item) => item.trim()).filter(Boolean))} placeholder="S, M, L, XL" dir="ltr" /></div>
          <div className="admin-inline"><Toggle checked={hasCup} onChange={onHasCupChange} /><Label>این محصول کاپ دارد</Label></div>
          {hasCup && <div><Label>کاپ‌ها (با ویرگول جدا کنید)</Label><Input value={cups.join(', ')} onChange={(event) => onCupsChange(event.target.value.split(',').map((item) => item.trim()).filter(Boolean))} placeholder="A, B, C, D" dir="ltr" /></div>}
          <Button type="button" className="outline" onClick={generateVariants}>↻ تولید/به‌روزرسانی واریانت‌ها</Button>
        </div>
      </Card>

      {variants.length > 0 && (
        <Card>
          <div className="admin-card-header compact"><h2>ماتریس واریانت‌ها ({variants.length.toLocaleString('fa-IR')})</h2></div>
          <div className="admin-card-body">
            <div className="admin-table-wrap">
              <table className="admin-table compact-table">
                <thead><tr><th>رنگ</th><th>سایز</th>{hasCup && <th>کاپ</th>}<th>SKU</th><th>قیمت</th><th>قیمت قبلی</th><th>موجودی</th><th>فعال</th></tr></thead>
                <tbody>{variants.map((variant, index) => {
                  const color = colors.find((item) => colorKey(item) === variant.color);
                  return <tr key={`${variant.color}-${variant.size}-${variant.cup}-${index}`}><td><span className="manager-row">{color && <span className="color-dot small" style={{ backgroundColor: color.hex || color.value }} />}{variant.color}</span></td><td>{variant.size}</td>{hasCup && <td>{variant.cup}</td>}<td><Input value={variant.sku || ''} onChange={(event) => updateVariant(index, 'sku', event.target.value)} dir="ltr" /></td><td><Input type="number" value={variant.price || 0} onChange={(event) => updateVariant(index, 'price', Number(event.target.value))} dir="ltr" /></td><td><Input type="number" value={variant.compare_at_price ?? variant.discount_price ?? 0} onChange={(event) => updateVariant(index, 'compare_at_price', Number(event.target.value))} dir="ltr" /></td><td><Input type="number" value={variant.inventory ?? variant.stock ?? 0} onChange={(event) => updateVariantFields(index, { inventory: Number(event.target.value), stock: Number(event.target.value) })} dir="ltr" /></td><td><Toggle checked={variant.is_available !== false} onChange={(value) => updateVariant(index, 'is_available', value)} /></td></tr>;
                })}</tbody>
              </table>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
