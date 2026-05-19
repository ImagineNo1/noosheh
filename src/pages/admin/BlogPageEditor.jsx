import React, { useState, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowRight, Save, Loader2 } from 'lucide-react';
import RichTextEditor from '@/components/blog/admin/RichTextEditor';
import ImageUploader from '@/components/blog/admin/ImageUploader';
import { generateSlug } from '@/lib/blogUtils';
import { useToast } from '@/components/ui/use-toast';

export default function BlogPageEditor() {
  const pageId = window.location.pathname.split('/').filter(Boolean).find((_, i, arr) => arr[i - 1] === 'pages' && arr[i + 1] === 'edit') || null;
  const isEdit = !!pageId;
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const [form, setForm] = useState({
    title: '', slug: '', content: '', excerpt: '', featured_image: '',
    parent_id: '', template: 'default', status: 'draft', sort_order: 0,
    seo_title: '', seo_description: '', seo_keywords: '',
  });
  const [saving, setSaving] = useState(false);

  const { data: existingPage, isLoading } = useQuery({
    queryKey: ['blog-page', pageId],
    queryFn: () => base44.entities.BlogPage.list(),
    enabled: isEdit,
    select: (data) => data.find(p => p.id === pageId),
  });

  const { data: pages = [] } = useQuery({
    queryKey: ['blog-pages'],
    queryFn: () => base44.entities.BlogPage.list(),
  });

  useEffect(() => {
    if (existingPage && isEdit) {
      setForm({
        title: existingPage.title || '', slug: existingPage.slug || '',
        content: existingPage.content || '', excerpt: existingPage.excerpt || '',
        featured_image: existingPage.featured_image || '', parent_id: existingPage.parent_id || '',
        template: existingPage.template || 'default', status: existingPage.status || 'draft',
        sort_order: existingPage.sort_order || 0,
        seo_title: existingPage.seo_title || '', seo_description: existingPage.seo_description || '',
        seo_keywords: existingPage.seo_keywords || '',
      });
    }
  }, [existingPage, isEdit]);

  const handleChange = (field, value) => setForm(prev => ({ ...prev, [field]: value }));

  const handleSave = async () => {
    if (!form.title.trim()) {
      toast({ title: 'عنوان صفحه الزامی است', variant: 'destructive' });
      return;
    }
    setSaving(true);
    const data = { ...form, slug: form.slug || generateSlug(form.title) };
    if (isEdit) {
      await base44.entities.BlogPage.update(pageId, data);
    } else {
      await base44.entities.BlogPage.create(data);
    }
    queryClient.invalidateQueries({ queryKey: ['blog-pages'] });
    setSaving(false);
    toast({ title: isEdit ? 'صفحه بروزرسانی شد' : 'صفحه ایجاد شد' });
    if (!isEdit) navigate('/admin/blog/pages');
  };

  if (isEdit && isLoading) {
    return <div className="flex items-center justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate('/admin/blog/pages')}>
            <ArrowRight className="w-5 h-5" />
          </Button>
          <h1 className="text-2xl font-bold">{isEdit ? 'ویرایش صفحه' : 'صفحه جدید'}</h1>
        </div>
        <Button onClick={handleSave} disabled={saving}>
          {saving && <Loader2 className="w-4 h-4 ml-1 animate-spin" />}
          <Save className="w-4 h-4 ml-1" />
          ذخیره
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <Card>
            <CardContent className="p-6 space-y-4">
              <div className="space-y-2">
                <Label>عنوان صفحه</Label>
                <Input value={form.title} onChange={(e) => { handleChange('title', e.target.value); if (!isEdit) handleChange('slug', generateSlug(e.target.value)); }} className="text-lg" />
              </div>
              <div className="space-y-2">
                <Label>اسلاگ</Label>
                <Input value={form.slug} onChange={(e) => handleChange('slug', e.target.value)} dir="ltr" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <RichTextEditor value={form.content} onChange={(v) => handleChange('content', v)} />
            </CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle className="text-lg">سئو</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>عنوان سئو</Label>
                <Input value={form.seo_title} onChange={(e) => handleChange('seo_title', e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>توضیحات سئو</Label>
                <Textarea value={form.seo_description} onChange={(e) => handleChange('seo_description', e.target.value)} rows={2} />
              </div>
            </CardContent>
          </Card>
        </div>
        <div className="space-y-4">
          <Card>
            <CardHeader><CardTitle className="text-base">تنظیمات</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>وضعیت</Label>
                <Select value={form.status} onValueChange={(v) => handleChange('status', v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">پیش‌نویس</SelectItem>
                    <SelectItem value="published">منتشرشده</SelectItem>
                    <SelectItem value="private">خصوصی</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>قالب</Label>
                <Select value={form.template} onValueChange={(v) => handleChange('template', v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="default">پیش‌فرض</SelectItem>
                    <SelectItem value="full_width">تمام عرض</SelectItem>
                    <SelectItem value="sidebar">با سایدبار</SelectItem>
                    <SelectItem value="contact">تماس با ما</SelectItem>
                    <SelectItem value="about">درباره ما</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>صفحه والد</Label>
                <Select value={form.parent_id || 'none'} onValueChange={(v) => handleChange('parent_id', v === 'none' ? '' : v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">بدون والد</SelectItem>
                    {pages.filter(p => p.id !== pageId).map(p => (
                      <SelectItem key={p.id} value={p.id}>{p.title}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>ترتیب نمایش</Label>
                <Input type="number" value={form.sort_order} onChange={(e) => handleChange('sort_order', parseInt(e.target.value) || 0)} />
              </div>
            </CardContent>
          </Card>
          <ImageUploader value={form.featured_image} onChange={(v) => handleChange('featured_image', v)} />
        </div>
      </div>
    </div>
  );
}
