import React, { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Plus, Pencil, Trash2, Loader2 } from 'lucide-react';
import { generateSlug } from '@/lib/blogUtils';
import { useToast } from '@/components/ui/use-toast';
import { Skeleton } from '@/components/ui/skeleton';

const emptyForm = { name: '', slug: '', description: '', seo_title: '', seo_description: '' };

export default function BlogTags() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [editId, setEditId] = useState(null);
  const [saving, setSaving] = useState(false);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: tags = [], isLoading } = useQuery({
    queryKey: ['blog-tags'],
    queryFn: () => base44.entities.BlogTag.list(),
  });

  const handleOpen = (tag = null) => {
    if (tag) {
      setEditId(tag.id);
      setForm({ name: tag.name || '', slug: tag.slug || '', description: tag.description || '', seo_title: tag.seo_title || '', seo_description: tag.seo_description || '' });
    } else {
      setEditId(null);
      setForm(emptyForm);
    }
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!form.name.trim()) {
      toast({ title: 'نام تگ الزامی است', variant: 'destructive' });
      return;
    }
    setSaving(true);
    const data = { ...form, slug: form.slug || generateSlug(form.name) };
    if (editId) {
      await base44.entities.BlogTag.update(editId, data);
    } else {
      await base44.entities.BlogTag.create(data);
    }
    queryClient.invalidateQueries({ queryKey: ['blog-tags'] });
    setSaving(false);
    setDialogOpen(false);
    toast({ title: editId ? 'تگ بروزرسانی شد' : 'تگ ایجاد شد' });
  };

  const handleDelete = async (id) => {
    if (!confirm('آیا از حذف این تگ مطمئنید؟')) return;
    await base44.entities.BlogTag.delete(id);
    queryClient.invalidateQueries({ queryKey: ['blog-tags'] });
    toast({ title: 'تگ حذف شد' });
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-bold">تگ‌ها</h1>
        {[1,2,3].map(i => <Skeleton key={i} className="h-16 rounded-lg" />)}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">تگ‌ها</h1>
        <Button onClick={() => handleOpen()}>
          <Plus className="w-4 h-4 ml-2" />
          تگ جدید
        </Button>
      </div>

      <Card className="overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>نام</TableHead>
              <TableHead>اسلاگ</TableHead>
              <TableHead className="hidden md:table-cell">توضیحات</TableHead>
              <TableHead className="w-24">عملیات</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {tags.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-12 text-muted-foreground">
                  هنوز تگی ایجاد نشده
                </TableCell>
              </TableRow>
            ) : (
              tags.map(tag => (
                <TableRow key={tag.id}>
                  <TableCell className="font-medium">{tag.name}</TableCell>
                  <TableCell className="text-sm text-muted-foreground" dir="ltr">{tag.slug}</TableCell>
                  <TableCell className="hidden md:table-cell text-sm text-muted-foreground truncate max-w-[200px]">
                    {tag.description || '-'}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleOpen(tag)}>
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => handleDelete(tag.id)}>
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
            <DialogTitle>{editId ? 'ویرایش تگ' : 'تگ جدید'}</DialogTitle>
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
