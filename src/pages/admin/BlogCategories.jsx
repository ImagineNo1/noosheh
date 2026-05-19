import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">دسته‌بندی‌ها</h1>
        <Button onClick={() => handleOpen()}>
          <Plus className="w-4 h-4 ml-2" />
          دسته‌بندی جدید
        </Button>
      </div>

      <Card className="overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>نام</TableHead>
              <TableHead>اسلاگ</TableHead>
              <TableHead className="hidden md:table-cell">دسته والد</TableHead>
              <TableHead className="hidden md:table-cell">توضیحات</TableHead>
              <TableHead className="w-24">عملیات</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {categories.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-12 text-muted-foreground">
                  هنوز دسته‌بندی ایجاد نشده
                </TableCell>
              </TableRow>
            ) : (
              categories.map(cat => (
                <TableRow key={cat.id}>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      {cat.color && <div className="w-3 h-3 rounded-full" style={{ backgroundColor: cat.color }} />}
                      {cat.name}
                    </div>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground" dir="ltr">{cat.slug}</TableCell>
                  <TableCell className="hidden md:table-cell text-sm">{cat.parent_id ? getParentName(cat.parent_id) : '-'}</TableCell>
                  <TableCell className="hidden md:table-cell text-sm text-muted-foreground truncate max-w-[200px]">
                    {cat.description || '-'}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleOpen(cat)}>
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => handleDelete(cat.id)}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg" dir="rtl">
          <DialogHeader>
            <DialogTitle>{editId ? 'ویرایش دسته‌بندی' : 'دسته‌بندی جدید'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>نام</Label>
              <Input value={form.name} onChange={(e) => setForm(prev => ({ ...prev, name: e.target.value, slug: generateSlug(e.target.value) }))} />
            </div>
            <div className="space-y-2">
              <Label>اسلاگ</Label>
              <Input value={form.slug} onChange={(e) => setForm(prev => ({ ...prev, slug: e.target.value }))} dir="ltr" />
            </div>
            <div className="space-y-2">
              <Label>توضیحات</Label>
              <Textarea value={form.description} onChange={(e) => setForm(prev => ({ ...prev, description: e.target.value }))} rows={2} />
            </div>
            <div className="space-y-2">
              <Label>دسته والد</Label>
              <Select value={form.parent_id || 'none'} onValueChange={(v) => setForm(prev => ({ ...prev, parent_id: v === 'none' ? '' : v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">بدون والد</SelectItem>
                  {categories.filter(c => c.id !== editId).map(c => (
                    <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>رنگ</Label>
              <Input type="color" value={form.color} onChange={(e) => setForm(prev => ({ ...prev, color: e.target.value }))} className="h-10 w-20" />
            </div>
            <ImageUploader value={form.image} onChange={(v) => setForm(prev => ({ ...prev, image: v }))} label="تصویر" />
            <div className="space-y-2">
              <Label>عنوان سئو</Label>
              <Input value={form.seo_title} onChange={(e) => setForm(prev => ({ ...prev, seo_title: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label>توضیحات سئو</Label>
              <Textarea value={form.seo_description} onChange={(e) => setForm(prev => ({ ...prev, seo_description: e.target.value }))} rows={2} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>انصراف</Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving && <Loader2 className="w-4 h-4 ml-1 animate-spin" />}
              {editId ? 'بروزرسانی' : 'ایجاد'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
