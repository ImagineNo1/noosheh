'use client';

import { useEffect, useState } from 'react';
import { adminApi } from '@/app/admin/admin-api';
import SeoTab from '@/components/seo/SeoTab';

export default function AdminBlogCategoriesPage() {
  const [categories, setCategories] = useState<any[]>([]);
  const [form, setForm] = useState({ name: '', slug: '', description: '', color: '' });
  const [editingId, setEditingId] = useState<string | null>(null);

  const token = typeof window !== 'undefined' ? localStorage.getItem('noosheh-admin-token') || '' : '';

  const load = async () => setCategories(await adminApi.list<any>('BlogCategory'));
  useEffect(() => { load(); }, []);

  const save = async () => {
    if (!form.name.trim()) return;
    const slug = form.slug || form.name.replace(/\s+/g, '-').toLowerCase();
    if (editingId) await adminApi.update('BlogCategory', editingId, { ...form, slug });
    else await adminApi.create('BlogCategory', { ...form, slug });
    setEditingId(null);
    setForm({ name: '', slug: '', description: '', color: '' });
    load();
  };

  const startEdit = (cat: any) => {
    setEditingId(cat.id);
    setForm({ name: cat.name || '', slug: cat.slug || '', description: cat.description || '', color: cat.color || '' });
  };

  const remove = async (id: string) => {
    if (!confirm('حذف شود؟')) return;
    await fetch(`/api/admin/entities/BlogCategory/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } });
    load();
  };

  return (
    <div className='p-6 sm:p-8 max-w-3xl' dir='rtl'>
      <div className='flex items-center justify-between mb-6'>
        <div>
          <h1 className='text-3xl font-extrabold'>دسته‌بندی‌ها</h1>
          <p className='text-sm text-muted-foreground mt-1'>مدیریت دسته‌بندی‌های مقالات</p>
        </div>
      </div>

      <div className='bg-card rounded-2xl border border-border/60 mb-6 p-5 space-y-4'>
        <h3 className='font-bold text-lg'>دسته‌بندی جدید</h3>
        <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
          <input className='w-full border rounded-lg px-3 py-2' placeholder='نام دسته‌بندی' value={form.name} onChange={e => setForm((p) => ({ ...p, name: e.target.value }))} />
          <input className='w-full border rounded-lg px-3 py-2' placeholder='category-slug' dir='ltr' value={form.slug} onChange={e => setForm((p) => ({ ...p, slug: e.target.value }))} />
        </div>
        <textarea className='w-full border rounded-lg px-3 py-2 min-h-20' placeholder='توضیحات کوتاه...' value={form.description} onChange={e => setForm((p) => ({ ...p, description: e.target.value }))} />
        <button onClick={save} className='px-4 py-2 rounded-xl bg-rose-500 hover:bg-rose-600 text-white font-semibold'>{editingId ? 'ذخیره ویرایش' : 'ذخیره'}</button>
        {editingId ? <SeoTab entity={form} entityType='blog_category' entityId={editingId} /> : null}
      </div>

      <div className='bg-card rounded-2xl border border-border/60 overflow-hidden'>
        <table className='w-full text-sm'>
          <thead><tr className='bg-muted/30'><th className='text-right p-3'>نام</th><th className='text-right p-3'>توضیحات</th><th className='text-right p-3'>عملیات</th></tr></thead>
          <tbody>
            {categories.map((cat) => (
              <tr key={cat.id} className='hover:bg-muted/20 border-t'>
                <td className='p-3 font-semibold'>{cat.name}</td>
                <td className='p-3 text-muted-foreground'>{cat.description || '—'}</td>
                <td className='p-3'>
                  <div className='flex items-center gap-3'>
                    <button onClick={() => startEdit(cat)}>✎</button>
                    <button onClick={() => remove(cat.id)} className='text-red-500'>🗑</button>
                  </div>
                </td>
              </tr>
            ))}
            {categories.length === 0 && <tr><td colSpan={3} className='text-center py-8 text-muted-foreground'>هنوز دسته‌بندی ایجاد نشده</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}
