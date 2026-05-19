'use client';

import { useState } from 'react';
import { adminApi } from '../admin-api';
import { useEntityList } from '../_components/hooks';
import { AlertDialog, Button, Card, Dialog, EmptyState, Input, Label, Toggle } from '../_components/ui';
import type { Category } from '../types';

const emptyCategory = { title: '', title_en: '', slug: '', image: '', order: 0, is_active: true, metaTitle: '', metaDescription: '', focusKeyword: '', canonicalUrl: '' };

export default function Categories() {
  const { data: categories, isLoading, reload } = useEntityList<Category>('Category', 'order', 50);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Category | null>(null);
  const [form, setForm] = useState<Omit<Category, 'id'>>(emptyCategory);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Category | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const close = () => { setDialogOpen(false); setEditing(null); };
  const openCreate = () => { setEditing(null); setForm(emptyCategory); setDialogOpen(true); };
  const openEdit = (category: Category) => {
    setEditing(category);
    setForm({ title: category.title || '', title_en: category.title_en || '', slug: category.slug || '', image: category.image || '', order: category.order || 0, is_active: category.is_active !== false, metaTitle: category.metaTitle || '', metaDescription: category.metaDescription || '', focusKeyword: category.focusKeyword || '', canonicalUrl: category.canonicalUrl || '' });
    setDialogOpen(true);
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const { file_url } = await adminApi.upload(file);
    setForm((current) => ({ ...current, image: file_url }));
    setUploading(false);
  };

  const handleSubmit = async () => {
    setSaving(true);
    const data = { ...form, order: Number(form.order) || 0 };
    if (editing) await adminApi.update<Category>('Category', editing.id, data);
    else await adminApi.create<Category>('Category', data);
    await reload();
    setSaving(false);
    close();
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleteLoading(true);
    await adminApi.delete('Category', deleteTarget.id);
    await reload();
    setDeleteLoading(false);
    setDeleteTarget(null);
  };

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <h1 className="admin-title">مدیریت دسته‌بندی‌ها</h1>
        <Button className="primary" onClick={openCreate}>＋ افزودن دسته‌بندی</Button>
      </div>

      {categories.length === 0 && !isLoading ? (
        <EmptyState icon="▤" text="هنوز دسته‌بندی اضافه نشده" />
      ) : (
        <div className="admin-grid cards-3">
          {categories.map((category) => (
            <Card key={category.id} className="overflow-hidden">
              <div className="admin-media aspect-video">
                {category.image ? <img src={category.image} alt={category.title} /> : <span>بدون تصویر</span>}
              </div>
              <div className="admin-card-body">
                <h3>{category.title}</h3>
                {category.title_en && <p className="admin-muted">{category.title_en}</p>}
                <div className="admin-actions-row">
                  <Button className="outline grow" onClick={() => openEdit(category)}>✎ ویرایش</Button>
                  <Button className="outline danger" onClick={() => setDeleteTarget(category)} aria-label={`حذف ${category.title}`}>🗑</Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      <AlertDialog
        open={!!deleteTarget}
        title="حذف دسته‌بندی"
        description={deleteTarget ? <>آیا از حذف دسته‌بندی <b>{deleteTarget.title}</b> مطمئن هستید؟ محصولات این دسته حذف نمی‌شوند.</> : ''}
        confirmText="حذف دسته‌بندی"
        danger
        loading={deleteLoading}
        onConfirm={handleDelete}
        onClose={() => setDeleteTarget(null)}
      />

      <Dialog open={dialogOpen} title={editing ? 'ویرایش دسته‌بندی' : 'افزودن دسته‌بندی'} onClose={close}>
        <div className="admin-form">
          <div><Label>عنوان فارسی *</Label><Input value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} /></div>
          <div><Label>عنوان انگلیسی</Label><Input value={form.title_en} onChange={(e) => setForm((f) => ({ ...f, title_en: e.target.value }))} dir="ltr" /></div>
          <div><Label>اسلاگ (لاتین)</Label><Input value={form.slug} onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value }))} dir="ltr" placeholder="e.g. bra" /></div>
          <div><Label>ترتیب نمایش</Label><Input type="number" value={form.order} onChange={(e) => setForm((f) => ({ ...f, order: Number(e.target.value) }))} dir="ltr" /></div>
          <div className="admin-inline"><Toggle checked={form.is_active !== false} onChange={(value) => setForm((f) => ({ ...f, is_active: value }))} /><Label>فعال</Label></div>
          <div><Label>Meta Title</Label><Input value={form.metaTitle || ''} onChange={(e) => setForm((f) => ({ ...f, metaTitle: e.target.value }))} /></div>
          <div><Label>Focus Keyword</Label><Input value={form.focusKeyword || ''} onChange={(e) => setForm((f) => ({ ...f, focusKeyword: e.target.value }))} /></div>
          <div><Label>Canonical URL</Label><Input dir="ltr" value={form.canonicalUrl || ''} onChange={(e) => setForm((f) => ({ ...f, canonicalUrl: e.target.value }))} /></div>
          <div><Label>Meta Description</Label><Input value={form.metaDescription || ''} onChange={(e) => setForm((f) => ({ ...f, metaDescription: e.target.value }))} /></div>
          <div>
            <Label>تصویر</Label>
            <div className="admin-upload-row">
              {form.image && <img src={form.image} alt="" className="admin-thumb" />}
              <label className="admin-upload-button">↥ {uploading ? 'آپلود...' : 'آپلود تصویر'}<input type="file" accept="image/*" onChange={handleImageUpload} disabled={uploading} hidden /></label>
            </div>
          </div>
        </div>
        <div className="admin-dialog-footer"><Button className="outline" onClick={close}>انصراف</Button><Button className="primary" onClick={handleSubmit} disabled={!form.title || saving}>{saving ? 'در حال ذخیره...' : editing ? 'ذخیره' : 'افزودن'}</Button></div>
      </Dialog>
    </div>
  );
}
