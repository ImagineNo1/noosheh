'use client';

import { useEffect, useState } from 'react';
import { adminApi } from '@/app/admin/admin-api';

export default function AdminBlogCategoriesPage() {
  const [categories, setCategories] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({ name: '', slug: '', description: '', color: '' });

  const token = typeof window !== 'undefined' ? localStorage.getItem('noosheh-admin-token') || '' : '';

  const load = async () => {
    setIsLoading(true);
    const rows = await adminApi.list<any>('BlogCategory');
    setCategories(rows);
    setIsLoading(false);
  };

  useEffect(() => { load(); }, []);

  const resetForm = () => {
    setShowForm(false);
    setEditingId(null);
    setForm({ name: '', slug: '', description: '', color: '' });
  };

  const startEdit = (cat: any) => {
    setEditingId(cat.id);
    setForm({ name: cat.name || '', slug: cat.slug || '', description: cat.description || '', color: cat.color || '' });
    setShowForm(true);
  };

  const handleSave = async () => {
    if (!form.name.trim()) return alert('نام دسته‌بندی الزامی است');
    const slug = form.slug || form.name.replace(/\s+/g, '-').toLowerCase();
    if (editingId) await adminApi.update('BlogCategory', editingId, { ...form, slug });
    else await adminApi.create('BlogCategory', { ...form, slug });
    resetForm();
    load();
  };

  const handleDelete = async (id: string) => {
    if (!confirm('آیا مطمئن هستید؟')) return;
    await fetch(`/api/admin/entities/BlogCategory/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } });
    load();
  };

  return (
    <div className='p-6 sm:p-8 max-w-3xl' dir='rtl'>
      <div className='flex items-center justify-between mb-6'>
        <div>
          <h1 className='text-xl font-extrabold'>دسته‌بندی‌ها</h1>
          <p className='text-sm text-muted-foreground mt-1'>مدیریت دسته‌بندی‌های مقالات</p>
        </div>
        <button onClick={() => (showForm ? resetForm() : setShowForm(true))} className={`px-3 py-2 rounded-lg text-sm ${showForm ? 'border' : 'bg-primary text-primary-foreground'}`}>
          {showForm ? '✕ بستن' : '+ دسته‌بندی جدید'}
        </button>
      </div>

      {showForm && (
        <div className='bg-card rounded-2xl border border-border/60 mb-6 p-5 space-y-4'>
          <h3 className='font-bold text-base'>{editingId ? 'ویرایش دسته‌بندی' : 'دسته‌بندی جدید'}</h3>
          <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
            <div className='space-y-1'>
              <label className='text-xs'>نام</label>
              <input value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} placeholder='نام دسته‌بندی' className='w-full border rounded-lg px-3 py-2' />
            </div>
            <div className='space-y-1'>
              <label className='text-xs'>آدرس (slug)</label>
              <input value={form.slug} onChange={(e) => setForm((p) => ({ ...p, slug: e.target.value }))} placeholder='category-slug' dir='ltr' className='w-full border rounded-lg px-3 py-2' />
            </div>
          </div>
          <div className='space-y-1'>
            <label className='text-xs'>توضیحات</label>
            <textarea value={form.description} onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))} placeholder='توضیحات کوتاه...' rows={2} className='w-full border rounded-lg px-3 py-2' />
          </div>
          <div className='flex justify-end'>
            <button onClick={handleSave} className='px-4 py-2 rounded-lg bg-primary text-primary-foreground'>ذخیره</button>
          </div>
        </div>
      )}

      <div className='bg-card rounded-2xl border border-border/60 overflow-hidden'>
        <table className='w-full text-sm'>
          <thead>
            <tr className='bg-muted/30'>
              <th className='text-right p-3'>نام</th>
              <th className='text-right p-3'>توضیحات</th>
              <th className='text-right p-3'>عملیات</th>
            </tr>
          </thead>
          <tbody>
            {categories.map((cat) => (
              <tr key={cat.id} className='hover:bg-muted/20 border-t'>
                <td className='p-3 font-medium'>{cat.name}</td>
                <td className='p-3 text-muted-foreground max-w-[220px] truncate'>{cat.description || '—'}</td>
                <td className='p-3'>
                  <div className='flex items-center gap-1'>
                    <button className='h-8 px-2 rounded hover:bg-secondary' onClick={() => startEdit(cat)}>✎</button>
                    <button className='h-8 px-2 rounded text-destructive hover:bg-destructive/10' onClick={() => handleDelete(cat.id)}>🗑</button>
                  </div>
                </td>
              </tr>
            ))}
            {!isLoading && categories.length === 0 && (
              <tr><td colSpan={3} className='text-center py-8 text-muted-foreground'>هنوز دسته‌بندی ایجاد نشده</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
