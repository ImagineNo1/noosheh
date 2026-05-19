import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Edit, Trash2, X } from 'lucide-react';

function slugify(t) { return t.toLowerCase().replace(/\s+/g, '-').replace(/[^\w\-]+/g, '').replace(/\-\-+/g, '-').trim(); }

export default function AdminBlogCategories() {
  const qc = useQueryClient();
  const [form, setForm] = useState({ name: '', slug: '', description: '', color: '#e91e8c', meta_title: '', meta_description: '' });
  const [editing, setEditing] = useState(null);

  const { data: cats = [], isLoading } = useQuery({
    queryKey: ['blog-categories'],
    queryFn: () => base44.entities.BlogCategory.list(),
  });

  const save = useMutation({
    mutationFn: () => editing ? base44.entities.BlogCategory.update(editing, form) : base44.entities.BlogCategory.create({ ...form, is_active: true }),
    onSuccess: () => { qc.invalidateQueries(['blog-categories']); resetForm(); toast.success(editing ? 'به‌روز شد' : 'دسته‌بندی ایجاد شد'); },
  });

  const del = useMutation({
    mutationFn: (id) => base44.entities.BlogCategory.delete(id),
    onSuccess: () => { qc.invalidateQueries(['blog-categories']); toast.success('حذف شد'); },
  });

  const resetForm = () => { setForm({ name: '', slug: '', description: '', color: '#e91e8c', meta_title: '', meta_description: '' }); setEditing(null); };

  const startEdit = (cat) => {
    setEditing(cat.id);
    setForm({ name: cat.name, slug: cat.slug, description: cat.description || '', color: cat.color || '#e91e8c', meta_title: cat.meta_title || '', meta_description: cat.meta_description || '' });
  };

  return (
    <div className="p-6" dir="rtl">
      <h1 className="text-2xl font-bold mb-6">دسته‌بندی‌های بلاگ</h1>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="border border-border/50 rounded-xl p-5">
          <h2 className="font-bold mb-4">{editing ? 'ویرایش دسته‌بندی' : 'دسته‌بندی جدید'}</h2>
          <div className="space-y-3">
            <div>
              <Label className="text-xs mb-1 block">نام *</Label>
              <Input value={form.name} onChange={e => { setForm(f => ({ ...f, name: e.target.value, slug: editing ? f.slug : slugify(e.target.value) })); }} />
            </div>
            <div>
              <Label className="text-xs mb-1 block">اسلاگ *</Label>
              <Input value={form.slug} onChange={e => setForm(f => ({ ...f, slug: e.target.value }))} dir="ltr" />
            </div>
            <div>
              <Label className="text-xs mb-1 block">توضیحات</Label>
              <Textarea rows={2} value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
            </div>
            <div className="flex items-center gap-3">
              <Label className="text-xs">رنگ</Label>
              <input type="color" value={form.color} onChange={e => setForm(f => ({ ...f, color: e.target.value }))} className="w-10 h-8 rounded border cursor-pointer" />
              <span className="text-xs text-muted-foreground" dir="ltr">{form.color}</span>
            </div>
            <div>
              <Label className="text-xs mb-1 block">عنوان سئو</Label>
              <Input value={form.meta_title} onChange={e => setForm(f => ({ ...f, meta_title: e.target.value }))} />
            </div>
            <div>
              <Label className="text-xs mb-1 block">توضیحات سئو</Label>
              <Textarea rows={2} value={form.meta_description} onChange={e => setForm(f => ({ ...f, meta_description: e.target.value }))} />
            </div>
            <div className="flex gap-2">
              <Button onClick={() => save.mutate()} disabled={!form.name || !form.slug || save.isPending} className="flex-1 bg-primary hover:bg-primary/90">
                {save.isPending ? 'در حال ذخیره...' : editing ? 'به‌روزرسانی' : 'ایجاد'}
              </Button>
              {editing && <Button variant="outline" onClick={resetForm}><X className="w-4 h-4" /></Button>}
            </div>
          </div>
        </div>

        <div className="lg:col-span-2">
          <div className="border border-border/50 rounded-xl overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-secondary/50">
                <tr>
                  <th className="p-3 text-right">نام</th>
                  <th className="p-3 text-center">اسلاگ</th>
                  <th className="p-3 text-center">مقالات</th>
                  <th className="p-3 text-center">عملیات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/30">
                {isLoading ? (
                  <tr><td colSpan={4} className="p-4 text-center text-muted-foreground">در حال بارگذاری...</td></tr>
                ) : cats.length === 0 ? (
                  <tr><td colSpan={4} className="p-8 text-center text-muted-foreground">دسته‌بندی‌ای ثبت نشده</td></tr>
                ) : cats.map(cat => (
                  <tr key={cat.id} className="hover:bg-secondary/20">
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        <span className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: cat.color || '#e91e8c' }} />
                        <span className="font-medium">{cat.name}</span>
                      </div>
                    </td>
                    <td className="p-3 text-center text-xs text-muted-foreground" dir="ltr">{cat.slug}</td>
                    <td className="p-3 text-center text-xs">{cat.posts_count || 0}</td>
                    <td className="p-3 text-center">
                      <div className="flex gap-1 justify-center">
                        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => startEdit(cat)}><Edit className="w-3.5 h-3.5" /></Button>
                        <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => del.mutate(cat.id)}><Trash2 className="w-3.5 h-3.5" /></Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
