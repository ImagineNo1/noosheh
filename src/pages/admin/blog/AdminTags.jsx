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

export default function AdminBlogTags() {
  const qc = useQueryClient();
  const [form, setForm] = useState({ name: '', slug: '', description: '', meta_title: '', meta_description: '' });
  const [editing, setEditing] = useState(null);
  const { data: tags = [], isLoading } = useQuery({ queryKey: ['blog-tags'], queryFn: () => base44.entities.BlogTag.list() });
  return <div className="p-6" dir="rtl">...</div>;
}
