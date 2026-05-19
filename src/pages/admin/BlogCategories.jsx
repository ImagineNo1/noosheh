import React, { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Plus, Pencil, Trash2, Loader2 } from 'lucide-react';
import { generateSlug } from '@/lib/blogUtils';
import ImageUploader from '@/components/blog/admin/ImageUploader';
import { useToast } from '@/components/ui/use-toast';
import { Skeleton } from '@/components/ui/skeleton';

const emptyForm = { name: '', slug: '', description: '', image: '', color: '#e91e63', parent_id: '', seo_title: '', seo_description: '' };

export default function BlogCategories() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [editId, setEditId] = useState(null);
  const [saving, setSaving] = useState(false);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: categories = [], isLoading } = useQuery({
    queryKey: ['blog-categories'],
    queryFn: () => base44.entities.BlogCategory.list(),
  });

  const handleOpen = (cat = null) => {
    if (cat) {
      setEditId(cat.id);
      setForm({
        name: cat.name || '', slug: cat.slug || '', description: cat.description || '',
        image: cat.image || '', color: cat.color || '#e91e63', parent_id: cat.parent_id || '',
        seo_title: cat.seo_title || '', seo_description: cat.seo_description || '',
      });
    } else {
      setEditId(null);
      setForm(emptyForm);
    }
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!form.name.trim()) {
      toast({ title: 'نام دسته‌بندی الزامی است', variant: 'destructive' });
      return;
    }
    setSaving(true);
    const data = { ...form, slug: form.slug || generateSlug(form.name) };
    if (editId) {
      await base44.entities.BlogCategory.update(editId, data);
    } else {
      await base44.entities.BlogCategory.create(data);
    }
    queryClient.invalidateQueries({ queryKey: ['blog-categories'] });
    setSaving(false);
    setDialogOpen(false);
    toast({ title: editId ? 'دسته‌بندی بروزرسانی شد' : 'دسته‌بندی ایجاد شد' });
  };

  const handleDelete = async (id) => {
    if (!confirm('آیا از حذف این دسته‌بندی مطمئنید؟')) return;
    await base44.entities.BlogCategory.delete(id);
    queryClient.invalidateQueries({ queryKey: ['blog-categories'] });
    toast({ title: 'دسته‌بندی حذف شد' });
  };

  const getParentName = (id) => categories.find(c => c.id === id)?.name || '-';

  if (isLoading) {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-bold">دسته‌بندی‌ها</h1>
        {[1,2,3].map(i => <Skeleton key={i} className="h-16 rounded-lg" />)}
      </div>
    );
  }

  return <div className="space-y-4">...full ui...</div>;
}
