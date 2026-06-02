'use client';

import { useState } from 'react';
import { adminApi } from '../admin-api';
import { useEntityList } from '../_components/hooks';
import { AlertDialog, Button, Card, Dialog, EmptyState, Input, Label, Toggle } from '../_components/ui';
import SeoTab from '@/components/seo/SeoTab';
import type { Category } from '../types';

const emptyCategory = {
  title: '',
  title_en: '',
  slug: '',
  parent_id: '',
  description: '',
  menu_title: '',
  homepage_title: '',
  image: '',
  icon: '',
  order: 0,
  sort_order: 0,
  menu_column: 0,
  menu_group: '',
  highlight_label: '',
  highlight_url: '',
  is_active: true,
  show_in_header: true,
  show_on_home: false,
  is_featured: false
};

export default function Categories() {
  const { data: categories, isLoading, reload } = useEntityList<Category>('Category', 'order', 100);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Category | null>(null);
  const [form, setForm] = useState<Omit<Category, 'id'>>(emptyCategory);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Category | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [editorTab, setEditorTab] = useState<'basic' | 'seo'>('basic');

  const close = () => { setDialogOpen(false); setEditing(null); };
  const openCreate = () => { setEditing(null); setForm(emptyCategory); setEditorTab('basic'); setDialogOpen(true); };
  const openEdit = (category: Category) => {
    setEditing(category);
    setForm({
      title: category.title || '',
      title_en: category.title_en || '',
      slug: category.slug || '',
      parent_id: category.parent_id || '',
      description: category.description || '',
      menu_title: category.menu_title || '',
      homepage_title: category.homepage_title || '',
      image: category.image || '',
      icon: category.icon || '',
      order: category.order || category.sort_order || 0,
      sort_order: category.sort_order || category.order || 0,
      menu_column: category.menu_column || 0,
      menu_group: category.menu_group || '',
      highlight_label: category.highlight_label || '',
      highlight_url: category.highlight_url || '',
      is_active: category.is_active !== false,
      show_in_header: category.show_in_header !== false,
      show_on_home: Boolean(category.show_on_home),
      is_featured: Boolean(category.is_featured)
    });
    setEditorTab('basic');
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
    const order = Number(form.order) || 0;
    const data = { ...form, order, sort_order: order, menu_column: Number(form.menu_column) || 0, parent_id: form.parent_id || undefined };
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
    <div className="admin-page" dir="rtl">
      <div className="admin-page-header">
        <h1 className="admin-title">مدیریت دسته بندی ها</h1>
        <Button className="primary" onClick={openCreate}>افزودن دسته بندی</Button>
      </div>

      {categories.length === 0 && !isLoading ? (
        <EmptyState icon="□" text="هنوز دسته بندی اضافه نشده است" />
      ) : (
        <div className="admin-grid cards-3">
          {categories.map((category) => {
            const parent = categories.find((item) => item.id === category.parent_id);
            return (
              <Card key={category.id} className="overflow-hidden">
                <div className="admin-media aspect-video">
                  {category.image ? <img src={category.image} alt={category.title} /> : <span>بدون تصویر</span>}
                </div>
                <div className="admin-card-body">
                  <h3>{category.title || category.name}</h3>
                  {parent ? <p className="admin-muted">والد: {parent.title || parent.name}</p> : null}
                  <p className="admin-muted">
                    {category.show_in_header !== false ? 'هدر' : 'بدون هدر'}
                    {' · '}
                    {category.show_on_home || category.is_featured ? 'صفحه اصلی' : 'فقط آرشیو'}
                  </p>
                  <div className="admin-actions-row">
                    <Button className="outline grow" onClick={() => openEdit(category)}>ویرایش</Button>
                    <Button className="outline danger" onClick={() => setDeleteTarget(category)} aria-label={`حذف ${category.title}`}>حذف</Button>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      <AlertDialog
        open={!!deleteTarget}
        title="حذف دسته بندی"
        description={deleteTarget ? <>آیا از حذف دسته بندی <b>{deleteTarget.title}</b> مطمئن هستید؟ محصولات این دسته حذف نمی شوند.</> : ''}
        confirmText="حذف دسته بندی"
        danger
        loading={deleteLoading}
        onConfirm={handleDelete}
        onClose={() => setDeleteTarget(null)}
      />

      <Dialog open={dialogOpen} title={editing ? 'ویرایش دسته بندی' : 'افزودن دسته بندی'} onClose={close}>
        <div className="store-tab-list mb-3">
          {[['basic', 'اطلاعات پایه'], ['seo', 'SEO']].map(([key, label]) => (
            <button key={key} type="button" className={editorTab === key ? 'active' : ''} onClick={() => setEditorTab(key as 'basic' | 'seo')}>{label}</button>
          ))}
        </div>
        {editorTab === 'basic' ? (
          <div className="admin-form">
            <div><Label>عنوان فارسی *</Label><Input value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} /></div>
            <div><Label>عنوان انگلیسی</Label><Input value={form.title_en} onChange={(e) => setForm((f) => ({ ...f, title_en: e.target.value }))} dir="ltr" /></div>
            <div><Label>اسلاگ لاتین</Label><Input value={form.slug} onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value }))} dir="ltr" placeholder="e.g. bra" /></div>
            <div>
              <Label>دسته والد</Label>
              <select className="admin-input" value={form.parent_id || ''} onChange={(e) => setForm((f) => ({ ...f, parent_id: e.target.value }))}>
                <option value="">بدون والد</option>
                {categories.filter((category) => category.id !== editing?.id).map((category) => <option key={category.id} value={category.id}>{category.title || category.name || category.slug}</option>)}
              </select>
            </div>
            <div><Label>عنوان منو</Label><Input value={form.menu_title || ''} onChange={(e) => setForm((f) => ({ ...f, menu_title: e.target.value }))} /></div>
            <div><Label>عنوان صفحه اصلی</Label><Input value={form.homepage_title || ''} onChange={(e) => setForm((f) => ({ ...f, homepage_title: e.target.value }))} /></div>
            <div><Label>گروه مگامنو</Label><Input value={form.menu_group || ''} onChange={(e) => setForm((f) => ({ ...f, menu_group: e.target.value }))} /></div>
            <div><Label>ستون مگامنو</Label><Input type="number" value={form.menu_column || 0} onChange={(e) => setForm((f) => ({ ...f, menu_column: Number(e.target.value) }))} dir="ltr" /></div>
            <div><Label>برچسب لینک ویژه</Label><Input value={form.highlight_label || ''} onChange={(e) => setForm((f) => ({ ...f, highlight_label: e.target.value }))} /></div>
            <div><Label>آدرس لینک ویژه</Label><Input value={form.highlight_url || ''} onChange={(e) => setForm((f) => ({ ...f, highlight_url: e.target.value }))} dir="ltr" /></div>
            <div><Label>ترتیب نمایش</Label><Input type="number" value={form.order} onChange={(e) => setForm((f) => ({ ...f, order: Number(e.target.value) }))} dir="ltr" /></div>
            <div><Label>توضیحات</Label><Input value={form.description || ''} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} /></div>
            <div className="admin-inline"><Toggle checked={form.is_active !== false} onChange={(value) => setForm((f) => ({ ...f, is_active: value }))} /><Label>فعال</Label></div>
            <div className="admin-inline"><Toggle checked={form.show_in_header !== false} onChange={(value) => setForm((f) => ({ ...f, show_in_header: value }))} /><Label>نمایش در هدر</Label></div>
            <div className="admin-inline"><Toggle checked={Boolean(form.show_on_home)} onChange={(value) => setForm((f) => ({ ...f, show_on_home: value }))} /><Label>نمایش در صفحه اصلی</Label></div>
            <div className="admin-inline"><Toggle checked={Boolean(form.is_featured)} onChange={(value) => setForm((f) => ({ ...f, is_featured: value }))} /><Label>دسته محبوب</Label></div>
            <div>
              <Label>تصویر</Label>
              <div className="admin-upload-row">
                {form.image && <img src={form.image} alt="" className="admin-thumb" />}
                <label className="admin-upload-button">{uploading ? 'در حال آپلود...' : 'آپلود تصویر'}<input type="file" accept="image/*" onChange={handleImageUpload} disabled={uploading} hidden /></label>
              </div>
            </div>
          </div>
        ) : (editing ? <SeoTab entity={form} entityType="category" entityId={editing.id} /> : <div className="admin-soft-box">ابتدا دسته بندی را ذخیره کنید، سپس SEO را تنظیم کنید.</div>)}
        <div className="admin-dialog-footer">
          <Button className="outline" onClick={close}>انصراف</Button>
          <Button className="primary" onClick={handleSubmit} disabled={!form.title || saving}>{saving ? 'در حال ذخیره...' : editing ? 'ذخیره' : 'افزودن'}</Button>
        </div>
      </Dialog>
    </div>
  );
}
