'use client';

import { useState } from 'react';
import { adminApi } from '@/app/admin/admin-api';
import { Button, Card, Input, Label, Toggle } from '@/app/admin/_components/ui';
import type { Product } from '@/app/admin/types';

type ColorSwatch = NonNullable<Product['color_swatches']>[number];

type ColorImage = string | { url?: string; alt?: string };
const imageUrl = (image: ColorImage) => typeof image === 'string' ? image : image.url || '';
const slugify = (value: string) => value.trim().toLowerCase().replace(/\s+/g, '-').replace(/[^\w\u0600-\u06FF-]+/g, '');

export default function AdminColorManager({ colors = [], onChange }: { colors?: ColorSwatch[]; onChange: (colors: ColorSwatch[]) => void }) {
  const [uploadingIndex, setUploadingIndex] = useState<number | null>(null);

  const addColor = () => onChange([...colors, { name: '', value: '', hex: '#000000', slug: '', active: true, is_active: true, order: colors.length, sort_order: colors.length, images: [] }]);
  const updateColor = (index: number, field: keyof ColorSwatch, value: unknown) => {
    const updated = [...colors];
    const next = { ...updated[index], [field]: value } as ColorSwatch;
    if (field === 'name' && !next.slug && !next.value) {
      next.slug = slugify(String(value));
      next.value = next.slug;
    }
    if (field === 'hex') next.value = next.value || String(value);
    updated[index] = next;
    onChange(updated);
  };
  const removeColor = (index: number) => onChange(colors.filter((_, i) => i !== index));
  const updateColorActive = (index: number, value: boolean) => onChange(colors.map((color, i) => i === index ? { ...color, active: value, is_active: value } : color));
  const uploadImage = async (index: number, file: File) => {
    setUploadingIndex(index);
    try {
      const { file_url } = await adminApi.upload(file);
      const updated = [...colors];
      const currentImages = (updated[index].images || []) as ColorImage[];
      updated[index] = { ...updated[index], images: [...currentImages, { url: file_url, alt: updated[index].name }] };
      onChange(updated);
    } finally {
      setUploadingIndex(null);
    }
  };
  const removeColorImage = (colorIndex: number, imageIndex: number) => {
    const updated = [...colors];
    updated[colorIndex] = { ...updated[colorIndex], images: ((updated[colorIndex].images || []) as ColorImage[]).filter((_, i) => i !== imageIndex) as ColorSwatch['images'] };
    onChange(updated);
  };

  return (
    <Card>
      <div className="admin-card-header compact manager-header"><h2>مدیریت رنگ‌ها</h2><Button type="button" className="outline" onClick={addColor}>＋ افزودن رنگ</Button></div>
      <div className="admin-card-body manager-list">
        {colors.map((color, index) => {
          const hex = color.hex || color.value || '#000000';
          const images = (color.images || []) as ColorImage[];
          return (
            <div key={`${color.slug || color.value || 'color'}-${index}`} className="manager-item">
              <div className="manager-row between">
                <div className="manager-row"><span className="color-dot" style={{ backgroundColor: hex }} /><strong>{color.name || `رنگ ${index + 1}`}</strong></div>
                <div className="manager-row"><Toggle checked={color.active !== false && color.is_active !== false} onChange={(value) => updateColorActive(index, value)} /><Button type="button" className="ghost danger" onClick={() => removeColor(index)}>🗑</Button></div>
              </div>
              <div className="admin-form-grid compact-grid"><div><Label>نام رنگ</Label><Input value={color.name || ''} onChange={(event) => updateColor(index, 'name', event.target.value)} /></div><div><Label>کد رنگ</Label><div className="manager-row"><input type="color" value={hex} onChange={(event) => updateColor(index, 'hex', event.target.value)} className="admin-color-input" /><Input value={hex} onChange={(event) => updateColor(index, 'hex', event.target.value)} dir="ltr" /></div></div><div><Label>اسلاگ</Label><Input value={color.slug || color.value || ''} onChange={(event) => { updateColor(index, 'slug', event.target.value); updateColor(index, 'value', event.target.value); }} dir="ltr" /></div></div>
              <div><div className="manager-row between"><Label>تصاویر این رنگ</Label><label className="admin-link-button">↥ {uploadingIndex === index ? 'در حال آپلود...' : 'آپلود تصویر'}<input type="file" accept="image/*" hidden disabled={uploadingIndex === index} onChange={(event) => event.target.files?.[0] && uploadImage(index, event.target.files[0])} /></label></div><div className="admin-image-list">{images.map((image, imageIndex) => <div key={imageUrl(image) + imageIndex} className="admin-image-item"><img src={imageUrl(image)} alt={typeof image === 'string' ? '' : image.alt || ''} /><button type="button" onClick={() => removeColorImage(index, imageIndex)}>×</button></div>)}</div></div>
            </div>
          );
        })}
        {colors.length === 0 && <p className="admin-muted center pad-lg">هنوز رنگی اضافه نشده است</p>}
      </div>
    </Card>
  );
}
