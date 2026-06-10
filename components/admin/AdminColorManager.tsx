'use client';

import { useMemo, useState } from 'react';
import { adminApi } from '@/app/admin/admin-api';
import { Button, Card, Dialog, Input, Label, Toggle } from '@/app/admin/_components/ui';
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

export default function AdminColorManager({ colors = [], colorOptions = [], onChange }: { colors?: ColorSwatch[]; colorOptions?: string[]; onChange: (colors: ColorSwatch[]) => void }) {
  const [uploadingIndex, setUploadingIndex] = useState<number | null>(null);
  const [error, setError] = useState('');
  const [colorQuery, setColorQuery] = useState('');
  const [colorDropdownOpen, setColorDropdownOpen] = useState(false);
  const [colorModalOpen, setColorModalOpen] = useState(false);
  const [newColor, setNewColor] = useState({ name: '', hex: '#000000', slug: '' });

  const selectedNames = useMemo(() => colors.map((color) => color.name || color.value || color.slug).filter(Boolean) as string[], [colors]);
  const filteredColorOptions = useMemo(() => {
    const query = colorQuery.trim().toLowerCase();
    return colorOptions
      .filter((option) => !selectedNames.includes(option))
      .filter((option) => !query || option.toLowerCase().includes(query))
      .slice(0, 10);
  }, [colorOptions, colorQuery, selectedNames]);
  const canCreateColor = Boolean(colorQuery.trim()) && !colorOptions.some((option) => option.toLowerCase() === colorQuery.trim().toLowerCase());

  const setColorAt = (index: number, nextColor: ColorSwatch) => {
    onChange(colors.map((color, colorIndex) => colorIndex === index ? normalizeColor(nextColor) : color));
  };

  const addPresetColor = (name: string) => {
    if (colors.some((color) => (color.name || color.value || color.slug) === name)) return;
    onChange([...colors, normalizeColor({ name, hex: '#000000', slug: slugify(name), value: slugify(name), swatch_image: '', active: true, is_active: true, order: colors.length, sort_order: colors.length, images: [] })]);
  };

  const openNewColorModal = (name = '') => {
    const slug = slugify(name);
    setNewColor({ name, hex: '#000000', slug });
    setColorModalOpen(true);
    setColorDropdownOpen(false);
  };

  const saveNewColor = async () => {
    const name = newColor.name.trim();
    const slug = slugify(newColor.slug || name);
    if (!name || !slug) {
      setError('نام رنگ و اسلاگ الزامی است.');
      return;
    }
    setError('');
    if (!colorOptions.some((option) => option.toLowerCase() === name.toLowerCase())) {
      await adminApi.create('ProductAttribute', { type: 'color', name, value: name });
    }
    if (!colors.some((color) => (color.name || color.value || color.slug) === name || color.slug === slug || color.value === slug)) {
      onChange([...colors, normalizeColor({ name, hex: newColor.hex || '#000000', slug, value: slug, swatch_image: '', active: true, is_active: true, order: colors.length, sort_order: colors.length, images: [] })]);
    }
    setColorQuery('');
    setColorModalOpen(false);
  };

  const addColor = () => openNewColorModal(colorQuery.trim());

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
        <div className="admin-combobox">
          <Label>انتخاب یا افزودن رنگ</Label>
          <div className="admin-combobox-input-wrap">
            <Input value={colorQuery} onFocus={() => setColorDropdownOpen(true)} onBlur={() => window.setTimeout(() => setColorDropdownOpen(false), 120)} onChange={(event) => { setColorQuery(event.target.value); setColorDropdownOpen(true); }} placeholder="رنگ را جستجو یا اضافه کنید..." />
            <button type="button" className="admin-combobox-add" onMouseDown={(event) => event.preventDefault()} onClick={() => openNewColorModal(colorQuery.trim())} aria-label="افزودن رنگ جدید">＋</button>
          </div>
          {colorDropdownOpen && (filteredColorOptions.length > 0 || canCreateColor) ? (
            <div className="admin-combobox-menu">
              {filteredColorOptions.map((option) => <button type="button" key={option} onMouseDown={(event) => event.preventDefault()} onClick={() => { addPresetColor(option); setColorQuery(''); setColorDropdownOpen(false); }}>{option}</button>)}
              {canCreateColor && <button type="button" className="create" onMouseDown={(event) => event.preventDefault()} onClick={() => openNewColorModal(colorQuery.trim())}>＋ افزودن رنگ جدید «{colorQuery.trim()}»</button>}
            </div>
          ) : null}
        </div>
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
      <Dialog open={colorModalOpen} title="افزودن رنگ جدید" onClose={() => setColorModalOpen(false)}>
        <div className="admin-form">
          <div className="admin-form-grid compact-grid">
            <div>
              <Label>نام رنگ</Label>
              <Input value={newColor.name} onChange={(event) => setNewColor((current) => ({ ...current, name: event.target.value, slug: current.slug || slugify(event.target.value) }))} />
            </div>
            <div>
              <Label>کد رنگ</Label>
              <div className="manager-row">
                <input type="color" value={newColor.hex} onChange={(event) => setNewColor((current) => ({ ...current, hex: event.target.value }))} className="admin-color-input" />
                <Input value={newColor.hex} onChange={(event) => setNewColor((current) => ({ ...current, hex: event.target.value }))} dir="ltr" />
              </div>
            </div>
            <div>
              <Label>اسلاگ</Label>
              <Input value={newColor.slug} onChange={(event) => setNewColor((current) => ({ ...current, slug: slugify(event.target.value) }))} dir="ltr" />
            </div>
          </div>
          <div className="admin-dialog-footer">
            <Button type="button" className="outline" onClick={() => setColorModalOpen(false)}>انصراف</Button>
            <Button type="button" className="primary" onClick={saveNewColor}>افزودن رنگ</Button>
          </div>
        </div>
      </Dialog>
    </Card>
  );
}
