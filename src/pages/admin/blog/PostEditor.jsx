import React, { useState, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { useNavigate, Link } from 'react-router-dom';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { ArrowRight, Save, Eye, X, Plus } from 'lucide-react';

const QUILL_MODULES = { toolbar: [[{ header: [1, 2, 3, false] }], ['bold', 'italic', 'underline', 'strike'], ['blockquote', 'code-block'], [{ list: 'ordered' }, { list: 'bullet' }], ['link', 'image'], ['clean']] };
function slugify(text) { return text.toLowerCase().replace(/\s+/g, '-').replace(/[^\w\-]+/g, '').replace(/\-\-+/g, '-').trim(); }
function calcReadingTime(html) { const text = html?.replace(/<[^>]*>/g, '') || ''; return Math.max(1, Math.ceil(text.split(/\s+/).length / 200)); }

export default function PostEditor() {
  const path = window.location.pathname;
  const isNew = path.endsWith('/new');
  const postId = isNew ? null : path.split('/admin/blog/posts/')[1];
  const navigate = useNavigate();
  const qc = useQueryClient();

  const [form, setForm] = useState({ title: '', slug: '', excerpt: '', content: '', featured_image: '', author_name: '', author_email: '', author_bio: '', author_avatar: '', categories: [], tags: [], status: 'draft', publish_at: '', is_featured: false, allow_comments: true, meta_title: '', meta_description: '', focus_keyword: '', canonical_url: '', og_image: '', noindex: false });
  const [tagInput, setTagInput] = useState('');
  const [autoSlug, setAutoSlug] = useState(isNew);
  const [saving, setSaving] = useState(false);

  const { data: existingPost } = useQuery({ queryKey: ['blog-post-edit', postId], queryFn: () => base44.entities.BlogPost.filter({ id: postId }), enabled: !!postId });
  const { data: categories = [] } = useQuery({ queryKey: ['blog-categories'], queryFn: () => base44.entities.BlogCategory.filter({ is_active: true }) });

  useEffect(() => { if (existingPost?.[0]) { const p = existingPost[0]; setForm({ title: p.title || '', slug: p.slug || '', excerpt: p.excerpt || '', content: p.content || '', featured_image: p.featured_image || '', author_name: p.author_name || '', author_email: p.author_email || '', author_bio: p.author_bio || '', author_avatar: p.author_avatar || '', categories: p.categories || [], tags: p.tags || [], status: p.status || 'draft', publish_at: p.publish_at ? p.publish_at.slice(0, 16) : '', is_featured: p.is_featured || false, allow_comments: p.allow_comments !== false, meta_title: p.meta_title || '', meta_description: p.meta_description || '', focus_keyword: p.focus_keyword || '', canonical_url: p.canonical_url || '', og_image: p.og_image || '', noindex: p.noindex || false }); setAutoSlug(false); } }, [existingPost]);

  const set = (key, val) => setForm(f => ({ ...f, [key]: val }));
  const handleTitleChange = (v) => { set('title', v); if (autoSlug) set('slug', slugify(v)); };

  const handleSave = async (statusOverride) => {
    if (!form.title) return toast.error('عنوان الزامی است');
    if (!form.slug) return toast.error('اسلاگ الزامی است');
    setSaving(true);
    const data = { ...form, reading_time: calcReadingTime(form.content), status: statusOverride || form.status };
    if (!data.publish_at && data.status === 'published') data.publish_at = new Date().toISOString();
    try {
      if (isNew) { const created = await base44.entities.BlogPost.create(data); toast.success('مقاله ایجاد شد'); navigate(`/admin/blog/posts/${created.id}`); }
      else { await base44.entities.BlogPost.update(postId, data); toast.success('تغییرات ذخیره شد'); qc.invalidateQueries(['admin-blog-posts']); }
    } finally { setSaving(false); }
  };

  const addTag = () => { const t = tagInput.trim().toLowerCase(); if (t && !form.tags.includes(t)) set('tags', [...form.tags, t]); setTagInput(''); };
  const addCategory = (slug) => { if (!form.categories.includes(slug)) set('categories', [...form.categories, slug]); };

  return (
    <div className="p-6 max-w-7xl mx-auto" dir="rtl">
      <div className="flex items-center gap-4 mb-6">
        <Link to="/admin/blog/posts"><Button variant="ghost" size="icon"><ArrowRight className="w-4 h-4" /></Button></Link>
        <div className="flex-1"><h1 className="text-xl font-bold">{isNew ? 'مقاله جدید' : 'ویرایش مقاله'}</h1></div>
        <div className="flex gap-2">
          {form.slug && !isNew && <Link to={`/blog/${form.slug}`} target="_blank"><Button variant="outline" size="sm" className="gap-1"><Eye className="w-3.5 h-3.5" />پیش‌نمایش</Button></Link>}
          <Button variant="outline" size="sm" onClick={() => handleSave('draft')} disabled={saving}>ذخیره پیش‌نویس</Button>
          <Button size="sm" onClick={() => handleSave('published')} disabled={saving} className="bg-primary hover:bg-primary/90 gap-1"><Save className="w-3.5 h-3.5" />{saving ? 'در حال ذخیره...' : 'انتشار'}</Button>
        </div>
      </div>
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 space-y-5">
          <Input placeholder="عنوان مقاله..." value={form.title} onChange={e => handleTitleChange(e.target.value)} className="text-xl font-bold border-0 border-b rounded-none px-0 focus-visible:ring-0 text-right" />
          <div className="flex items-center gap-2 text-sm"><span className="text-muted-foreground">آدرس:</span><span className="text-muted-foreground">/blog/</span><Input value={form.slug} onChange={e => { set('slug', e.target.value); setAutoSlug(false); }} className="h-7 text-sm flex-1" dir="ltr" /></div>
          <Textarea placeholder="خلاصه مقاله (اختیاری)..." value={form.excerpt} onChange={e => set('excerpt', e.target.value)} rows={2} />
          <div><Label className="mb-2 block text-sm font-medium">محتوا</Label><ReactQuill value={form.content} onChange={v => set('content', v)} modules={QUILL_MODULES} theme="snow" className="bg-white rounded-lg" style={{ minHeight: 300 }} /></div>
        </div>
        <div className="space-y-4">
          <Tabs defaultValue="general"><TabsList className="w-full grid grid-cols-3 text-xs"><TabsTrigger value="general">عمومی</TabsTrigger><TabsTrigger value="seo">سئو</TabsTrigger><TabsTrigger value="author">نویسنده</TabsTrigger></TabsList>
          <TabsContent value="general" className="space-y-4 mt-4"><div><Label className="text-xs mb-1.5 block">وضعیت</Label><Select value={form.status} onValueChange={v => set('status', v)}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="draft">پیش‌نویس</SelectItem><SelectItem value="published">منتشرشده</SelectItem><SelectItem value="private">خصوصی</SelectItem><SelectItem value="scheduled">زمان‌بندی‌شده</SelectItem><SelectItem value="archived">بایگانی</SelectItem></SelectContent></Select></div><div><Label className="text-xs mb-1.5 block">تاریخ انتشار</Label><Input type="datetime-local" value={form.publish_at} onChange={e => set('publish_at', e.target.value)} /></div><div><Label className="text-xs mb-1.5 block">تصویر شاخص</Label><Input placeholder="آدرس URL تصویر..." value={form.featured_image} onChange={e => set('featured_image', e.target.value)} dir="ltr" />{form.featured_image && <img src={form.featured_image} className="mt-2 rounded-lg w-full aspect-video object-cover" alt="" />}</div><div><Label className="text-xs mb-1.5 block">دسته‌بندی‌ها</Label><div className="flex flex-wrap gap-1.5 mb-2">{form.categories.map(c => <Badge key={c} variant="secondary" className="gap-1 cursor-pointer" onClick={() => set('categories', form.categories.filter(x => x !== c))}>{c}<X className="w-3 h-3" /></Badge>)}</div><Select onValueChange={addCategory}><SelectTrigger className="text-xs"><SelectValue placeholder="افزودن دسته‌بندی..." /></SelectTrigger><SelectContent>{categories.map(c => <SelectItem key={c.id} value={c.slug}>{c.name}</SelectItem>)}</SelectContent></Select></div><div><Label className="text-xs mb-1.5 block">تگ‌ها</Label><div className="flex flex-wrap gap-1.5 mb-2">{form.tags.map(t => <Badge key={t} variant="outline" className="gap-1 cursor-pointer" onClick={() => set('tags', form.tags.filter(x => x !== t))}>#{t}<X className="w-3 h-3" /></Badge>)}</div><div className="flex gap-2"><Input placeholder="تگ جدید..." value={tagInput} onChange={e => setTagInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && addTag()} className="text-xs h-8" /><Button size="sm" variant="outline" onClick={addTag} className="h-8 px-2"><Plus className="w-3.5 h-3.5" /></Button></div></div><div className="space-y-3"><div className="flex items-center justify-between"><Label className="text-xs">مقاله ویژه</Label><Switch checked={form.is_featured} onCheckedChange={v => set('is_featured', v)} /></div><div className="flex items-center justify-between"><Label className="text-xs">اجازه دیدگاه</Label><Switch checked={form.allow_comments} onCheckedChange={v => set('allow_comments', v)} /></div></div></TabsContent>
          <TabsContent value="seo" className="space-y-4 mt-4"><div><Label className="text-xs mb-1.5 block">عنوان سئو</Label><Input value={form.meta_title} onChange={e => set('meta_title', e.target.value)} placeholder={form.title} /><p className="text-xs text-muted-foreground mt-1">{form.meta_title?.length || 0}/60</p></div><div><Label className="text-xs mb-1.5 block">توضیحات سئو</Label><Textarea rows={3} value={form.meta_description} onChange={e => set('meta_description', e.target.value)} /><p className="text-xs text-muted-foreground mt-1">{form.meta_description?.length || 0}/160</p></div><div><Label className="text-xs mb-1.5 block">کلیدواژه اصلی</Label><Input value={form.focus_keyword} onChange={e => set('focus_keyword', e.target.value)} /></div><div><Label className="text-xs mb-1.5 block">URL کانونیکال</Label><Input value={form.canonical_url} onChange={e => set('canonical_url', e.target.value)} dir="ltr" /></div><div><Label className="text-xs mb-1.5 block">تصویر Open Graph</Label><Input value={form.og_image} onChange={e => set('og_image', e.target.value)} dir="ltr" placeholder={form.featured_image} /></div><div className="flex items-center justify-between"><Label className="text-xs">noindex (عدم ایندکس)</Label><Switch checked={form.noindex} onCheckedChange={v => set('noindex', v)} /></div></TabsContent>
          <TabsContent value="author" className="space-y-4 mt-4"><div><Label className="text-xs mb-1.5 block">نام نویسنده</Label><Input value={form.author_name} onChange={e => set('author_name', e.target.value)} /></div><div><Label className="text-xs mb-1.5 block">ایمیل نویسنده</Label><Input type="email" value={form.author_email} onChange={e => set('author_email', e.target.value)} dir="ltr" /></div><div><Label className="text-xs mb-1.5 block">آواتار</Label><Input value={form.author_avatar} onChange={e => set('author_avatar', e.target.value)} dir="ltr" />{form.author_avatar && <img src={form.author_avatar} className="mt-2 w-16 h-16 rounded-full object-cover" alt="" />}</div><div><Label className="text-xs mb-1.5 block">بیوگرافی</Label><Textarea rows={3} value={form.author_bio} onChange={e => set('author_bio', e.target.value)} /></div></TabsContent></Tabs>
        </div>
      </div>
    </div>
  );
}
