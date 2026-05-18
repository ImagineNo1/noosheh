'use client';

import { useState } from 'react';
import { adminApi } from '@/app/admin/admin-api';
import { Button, Card, Input, Label, Toggle } from '@/app/admin/_components/ui';
import type { Product } from '@/app/admin/types';

type ColorSwatch = NonNullable<Product['color_swatches']>[number];
type ColorImage = string | { url?: string; alt?: string };

const imageUrl = (image: ColorImage) => typeof image === 'string' ? image : image.url || '';
const imageAlt = (image: ColorImage, fallback = '') => typeof image === 'string' ? fallback : image.alt || fallback;
const colorKey = (color: ColorSwatch) => color.slug || (color.value?.startsWith('#') ? '' : color.value) || color.name;
const slugify = (value: string) => value.trim().toLowerCase().replace(/\s+/g, '-').replace(/[^\w\u0600-\u06FF-]+/g, '');

function normalizeColor(color: ColorSwatch): ColorSwatch {
  const slug = color.slug || (color.value?.startsWith('#') ? '' : color.value) || slugify(color.name || '');
  return {
    ...color,
    slug,
    value: slug,
    hex: color.hex || '#000000',
    active: color.active !== false && color.is_active !== false,
    is_active: color.active !== false && color.is_active !== false,
    images: color.images || []
  };
}

export default function AdminColorManager({ colors = [], onChange }: { colors?: ColorSwatch[]; onChange: (colors: ColorSwatch[]) => void }) {
  const [uploadingIndex, setUploadingIndex] = useState<number | null>(null);
  const [error, setError] = useState('');

  const setColorAt = (index: number, nextColor: ColorSwatch) => {
    onChange(colors.map((color, colorIndex) => colorIndex === index ? normalizeColor(nextColor) : color));
  };

  const addColor = () => {
    onChange([
      ...colors,
      normalizeColor({
        name: '',
        hex: '#000000',
        slug: '',
        value: '',
        swatch_image: '',
        active: true,
        is_active: true,
        order: colors.length,
        sort_order: colors.length,
        images: []
      })
    ]);
  };

  const updateColor = (index: number, field: keyof ColorSwatch, value: unknown) => {
    const current = normalizeColor(colors[index]);
    const next = { ...current, [field]: value } as ColorSwatch;

    if (field === 'name' && !current.slug) {
      const slug = slugify(String(value));
      next.slug = slug;
      next.value = slug;
    }

    if (field === 'slug' || field === 'value') {
      const slug = slugify(String(value));
      next.slug = slug;
      next.value = slug;
    }

    setColorAt(index, next);
  };

  const updateColorActive = (index: number, value: boolean) => {
    setColorAt(index, { ...normalizeColor(colors[index]), active: value, is_active: value });
  };

  const removeColor = (index: number) => {
    onChange(colors.filter((_, colorIndex) => colorIndex !== index));
  };

  const uploadImage = async (index: number, file: File) => {
    setError('');
    setUploadingIndex(index);
    try {
      const { file_url } = await adminApi.upload(file);
      const current = normalizeColor(colors[index]);
      const images = (current.images || []) as ColorImage[];
      setColorAt(index, { ...current, images: [...images, { url: file_url, alt: current.name || `رنگ ${index + 1}` }] });
    } catch (uploadError) {
      setError(uploadError instanceof Error ? uploadError.message : 'آپلود تصویر رنگ ناموفق بود.');
    } finally {
      setUploadingIndex(null);
    }
  };

  const removeColorImage = (colorIndex: number, imageIndex: number) => {
    const current = normalizeColor(colors[colorIndex]);
    const images = ((current.images || []) as ColorImage[]).filter((_, index) => index !== imageIndex);
    setColorAt(colorIndex, { ...current, images: images as ColorSwatch['images'] });
  };

  return (
    <Card>
      <div className="admin-card-header compact manager-header">
        <h2>مدیریت رنگ‌ها</h2>
        <Button type="button" className="outline" onClick={addColor}>＋ افزودن رنگ</Button>
      </div>
      <div className="admin-card-body manager-list">
        {error && <div className="admin-alert destructive">{error}</div>}
        {colors.map((rawColor, index) => {
          const color = normalizeColor(rawColor);
          const images = (color.images || []) as ColorImage[];
          const hex = color.hex || '#000000';
          const label = color.name || `رنگ ${index + 1}`;

          return (
            <div key={`${colorKey(color) || 'color'}-${index}`} className="manager-item">
              <div className="manager-row between">
                <div className="manager-row">
                  <span className="color-dot" style={{ backgroundColor: hex }} />
                  <strong>{label}</strong>
                </div>
                <div className="manager-row">
                  <Toggle checked={color.is_active !== false} onChange={(value) => updateColorActive(index, value)} />
                  <Button type="button" className="ghost danger" onClick={() => removeColor(index)}>🗑</Button>
                </div>
              </div>

              <div className="admin-form-grid compact-grid">
                <div>
                  <Label>نام رنگ</Label>
                  <Input value={color.name || ''} onChange={(event) => updateColor(index, 'name', event.target.value)} />
                </div>
                <div>
                  <Label>کد رنگ</Label>
                  <div className="manager-row">
                    <input type="color" value={hex} onChange={(event) => updateColor(index, 'hex', event.target.value)} className="admin-color-input" />
                    <Input value={hex} onChange={(event) => updateColor(index, 'hex', event.target.value)} dir="ltr" />
                  </div>
                </div>
                <div>
                  <Label>اسلاگ</Label>
                  <Input value={color.slug || ''} onChange={(event) => updateColor(index, 'slug', event.target.value)} dir="ltr" />
                </div>
              </div>

              <div>
                <div className="manager-row between">
                  <Label>تصاویر این رنگ</Label>
                  <label className="admin-link-button">
                    ↥ {uploadingIndex === index ? 'در حال آپلود...' : 'آپلود تصویر'}
                    <input type="file" accept="image/*" hidden disabled={uploadingIndex === index} onChange={(event) => event.target.files?.[0] && uploadImage(index, event.target.files[0])} />
                  </label>
                </div>
                <div className="admin-image-list">
                  {images.map((image, imageIndex) => (
                    <div key={imageUrl(image) + imageIndex} className="admin-image-item">
                      <img src={imageUrl(image)} alt={imageAlt(image, label)} />
                      <button type="button" onClick={() => removeColorImage(index, imageIndex)} aria-label="حذف تصویر رنگ">×</button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
        {colors.length === 0 && <p className="admin-muted center pad-lg">هنوز رنگی اضافه نشده است</p>}
      </div>
    </Card>
  );
}
