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

export default function PostEditor() {
  const path = window.location.pathname;
  const isNew = path.endsWith('/new');
  const postId = isNew ? null : path.split('/admin/blog/posts/')[1];
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [form, setForm] = useState({ title: '', slug: '', excerpt: '', content: '', categories: [], tags: [], status: 'draft' });
  const { data: existingPost } = useQuery({ queryKey: ['blog-post-edit', postId], queryFn: () => base44.entities.BlogPost.filter({ id: postId }), enabled: !!postId });
  useEffect(() => { if (existingPost?.[0]) setForm((f) => ({ ...f, ...existingPost[0] })); }, [existingPost]);
  return <div className="p-6 max-w-7xl mx-auto" dir="rtl">...</div>;
}
