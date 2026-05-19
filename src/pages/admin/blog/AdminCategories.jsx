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
    </div>
  );
}
