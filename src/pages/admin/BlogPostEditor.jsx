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
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Save, Eye, ArrowRight, Loader2 } from 'lucide-react';
import RichTextEditor from '@/components/blog/admin/RichTextEditor';
import ImageUploader from '@/components/blog/admin/ImageUploader';
import { generateSlug, calculateReadingTime, generateExcerpt } from '@/lib/blogUtils';
import { useToast } from '@/components/ui/use-toast';

export default function BlogPostEditor() {
  const postId = window.location.pathname.split('/').filter(Boolean).find((_, i, arr) => arr[i - 1] === 'posts' && arr[i + 1] === 'edit') || null;
  const isEdit = !!postId;
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [form, setForm] = useState({ title: '', slug: '', excerpt: '', content: '', featured_image: '', featured_image_alt: '', author_name: '', author_email: '', categories: [], tags: [], status: 'draft', publish_at: '', is_featured: false, allow_comments: true, seo_title: '', seo_description: '', seo_keywords: '', canonical_url: '', og_image: '' });
  const [saving, setSaving] = useState(false);
  const [autoSlug, setAutoSlug] = useState(true);

  const { data: existingPost, isLoading: loadingPost } = useQuery({ queryKey: ['blog-post', postId], queryFn: () => base44.entities.BlogPost.list(), enabled: isEdit, select: (data) => data.find(p => p.id === postId) });
  const { data: categories = [] } = useQuery({ queryKey: ['blog-categories'], queryFn: () => base44.entities.BlogCategory.list() });
  const { data: tags = [] } = useQuery({ queryKey: ['blog-tags'], queryFn: () => base44.entities.BlogTag.list() });

  useEffect(() => { if (existingPost && isEdit) { setForm({ ...form, ...existingPost, allow_comments: existingPost.allow_comments !== false }); setAutoSlug(false);} }, [existingPost, isEdit]);
  useEffect(() => { if (autoSlug && form.title) setForm(prev => ({ ...prev, slug: generateSlug(prev.title) })); }, [form.title, autoSlug]);

  const handleSave = async (overrideStatus) => {
    if (!form.title.trim() || !form.slug.trim()) return;
    setSaving(true);
    const data = { ...form, reading_time: calculateReadingTime(form.content), excerpt: form.excerpt || generateExcerpt(form.content), status: overrideStatus || form.status };
    if (isEdit) await base44.entities.BlogPost.update(postId, data); else await base44.entities.BlogPost.create(data);
    queryClient.invalidateQueries({ queryKey: ['blog-posts'] });
    setSaving(false);
    toast({ title: isEdit ? 'نوشته بروزرسانی شد' : 'نوشته ایجاد شد' });
  };

  if (isEdit && loadingPost) return <div className="flex items-center justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;
  return <div className="space-y-4">...</div>;
}
