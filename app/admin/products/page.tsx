'use client';

import { useState } from 'react';
import { adminApi } from '../admin-api';
import { formatPrice, useEntityList } from '../_components/hooks';
import { Button, Card, Dialog, EmptyState, Input, Label, Textarea, Toggle } from '../_components/ui';
import type { Product } from '../types';

const emptyProduct: Omit<Product, 'id'> = {
  title: '', code: '', price: 0, discount_price: 0, description: '', short_description: '',
  images: [], category: '', collection: '', sizes: [], colors: [], cup_size: '', material: '',
  brand: '', stock: 0, is_active: true, is_featured: false, wash_instructions: ''
};

export default function Products() {
  const { data: products, isLoading, reload } = useEntityList<Product>('Product', '-created_date', 100);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [form, setForm] = useState<Omit<Product, 'id'>>(emptyProduct);
  const [sizesInput, setSizesInput] = useState('');
  const [colorsInput, setColorsInput] = useState('');
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);

  const openCreate = () => { setEditingProduct(null); setForm(emptyProduct); setSizesInput(''); setColorsInput(''); setDialogOpen(true); };
  const openEdit = (product: Product) => {
    setEditingProduct(product);
    setForm({ ...emptyProduct, ...product });
    setSizesInput((product.sizes || []).join(', '));
    setColorsInput((product.colors || []).join(', '));
    setDialogOpen(true);
  };
  const closeDialog = () => { setDialogOpen(false); setEditingProduct(null); };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    if (!files.length) return;
    setUploading(true);
    const urls: string[] = [];
    for (const file of files) {
      const { file_url } = await adminApi.upload(file);
      urls.push(file_url);
    }
    setForm((current) => ({ ...current, images: [...(current.images || []), ...urls] }));
    setUploading(false);
  };

  const removeImage = (index: number) => setForm((current) => ({ ...current, images: (current.images || []).filter((_, i) => i !== index) }));

  const handleSubmit = async () => {
    setSaving(true);
    const data = {
      ...form,
      sizes: sizesInput ? sizesInput.split(',').map((s) => s.trim()).filter(Boolean) : [],
      colors: colorsInput ? colorsInput.split(',').map((s) => s.trim()).filter(Boolean) : [],
      price: Number(form.price) || 0,
      discount_price: Number(form.discount_price) || 0,
      stock: Number(form.stock) || 0
    };
    if (editingProduct) await adminApi.update<Product>('Product', editingProduct.id, data);
    else await adminApi.create<Product>('Product', data);
    await reload();
    setSaving(false);
    closeDialog();
  };

  const handleDelete = async (id: string) => {
    if (!confirm('آیا مطمئن هستید؟')) return;
    await adminApi.delete('Product', id);
    await reload();
  };

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <h1 className="admin-title">مدیریت محصولات</h1>
        <Button className="primary" onClick={openCreate}>＋ افزودن محصول</Button>
      </div>

      {isLoading ? (
        <div className="admin-grid cards-3">{Array.from({ length: 6 }).map((_, i) => <div key={i} className="admin-skeleton" />)}</div>
      ) : products.length === 0 ? (
        <EmptyState icon="▣" text="هنوز محصولی اضافه نشده"><Button className="primary" onClick={openCreate}>＋ اولین محصول را اضافه کنید</Button></EmptyState>
      ) : (
        <div className="admin-grid cards-3">
          {products.map((product) => (
            <Card key={product.id} className="overflow-hidden">
              <div className="admin-media aspect-video relative">
                {product.images?.[0] ? <img src={product.images[0]} alt={product.title} /> : <span>بدون تصویر</span>}
                {product.is_active === false && <small className="admin-floating-badge">غیرفعال</small>}
              </div>
              <div className="admin-card-body">
                <h3 className="truncate">{product.title}</h3>
                <p className="admin-price">{formatPrice(product.price)} تومان</p>
                {product.code && <p className="admin-muted small">کد: {product.code}</p>}
                <div className="admin-actions-row"><Button className="outline grow" onClick={() => openEdit(product)}>✎ ویرایش</Button><Button className="outline danger" onClick={() => handleDelete(product.id)}>🗑</Button></div>
              </div>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={dialogOpen} title={editingProduct ? 'ویرایش محصول' : 'افزودن محصول جدید'} onClose={closeDialog} wide>
        <div className="admin-form">
          <div className="admin-form-grid">
            <div><Label>عنوان محصول *</Label><Input value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} /></div>
            <div><Label>کد محصول</Label><Input value={form.code} onChange={(e) => setForm((f) => ({ ...f, code: e.target.value }))} /></div>
            <div><Label>قیمت (تومان) *</Label><Input type="number" value={form.price} onChange={(e) => setForm((f) => ({ ...f, price: Number(e.target.value) }))} dir="ltr" /></div>
            <div><Label>قیمت با تخفیف</Label><Input type="number" value={form.discount_price} onChange={(e) => setForm((f) => ({ ...f, discount_price: Number(e.target.value) }))} dir="ltr" /></div>
            <div><Label>دسته‌بندی</Label><Input value={form.category} onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))} /></div>
            <div><Label>کالکشن</Label><Input value={form.collection} onChange={(e) => setForm((f) => ({ ...f, collection: e.target.value }))} placeholder="مثلا: fantasy, new" /></div>
            <div><Label>سایزها (با کاما جدا کنید)</Label><Input value={sizesInput} onChange={(e) => setSizesInput(e.target.value)} placeholder="75, 80, 85, 90" /></div>
            <div><Label>رنگ‌ها (با کاما جدا کنید)</Label><Input value={colorsInput} onChange={(e) => setColorsInput(e.target.value)} placeholder="آبی, قرمز, مشکی" /></div>
            <div><Label>سایز کاپ</Label><Input value={form.cup_size} onChange={(e) => setForm((f) => ({ ...f, cup_size: e.target.value }))} placeholder="B" /></div>
            <div><Label>جنس پارچه</Label><Input value={form.material} onChange={(e) => setForm((f) => ({ ...f, material: e.target.value }))} /></div>
            <div><Label>برند</Label><Input value={form.brand} onChange={(e) => setForm((f) => ({ ...f, brand: e.target.value }))} placeholder="نوشه پوش" /></div>
            <div><Label>موجودی</Label><Input type="number" value={form.stock} onChange={(e) => setForm((f) => ({ ...f, stock: Number(e.target.value) }))} dir="ltr" /></div>
          </div>
          <div><Label>توضیحات</Label><Textarea value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} /></div>
          <div><Label>راهنمای شستشو</Label><Textarea value={form.wash_instructions} onChange={(e) => setForm((f) => ({ ...f, wash_instructions: e.target.value }))} className="short" /></div>
          <div className="admin-toggle-row"><div className="admin-inline"><Toggle checked={form.is_active !== false} onChange={(value) => setForm((f) => ({ ...f, is_active: value }))} /><Label>فعال</Label></div><div className="admin-inline"><Toggle checked={!!form.is_featured} onChange={(value) => setForm((f) => ({ ...f, is_featured: value }))} /><Label>محصول ویژه</Label></div></div>
          <div>
            <Label>تصاویر محصول</Label>
            <div className="admin-image-list">
              {(form.images || []).map((image, i) => <div key={image + i} className="admin-image-item"><img src={image} alt="" /><button type="button" onClick={() => removeImage(i)}>×</button></div>)}
              <label className="admin-image-uploader">↥<span>{uploading ? 'آپلود...' : 'افزودن'}</span><input type="file" multiple accept="image/*" onChange={handleImageUpload} disabled={uploading} hidden /></label>
            </div>
          </div>
        </div>
        <div className="admin-dialog-footer"><Button className="outline" onClick={closeDialog}>انصراف</Button><Button className="primary" onClick={handleSubmit} disabled={!form.title || saving}>{saving ? 'در حال ذخیره...' : editingProduct ? 'ذخیره تغییرات' : 'افزودن محصول'}</Button></div>
      </Dialog>
    </div>
  );
}
