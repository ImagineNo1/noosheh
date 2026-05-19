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
export default function AdminBlogTags() { const qc=useQueryClient(); const [form,setForm]=useState({name:'',slug:'',description:'',meta_title:'',meta_description:''}); const [editing,setEditing]=useState(null); const {data:tags=[],isLoading}=useQuery({queryKey:['blog-tags'],queryFn:()=>base44.entities.BlogTag.list()}); const save=useMutation({mutationFn:()=>editing?base44.entities.BlogTag.update(editing,form):base44.entities.BlogTag.create(form),onSuccess:()=>{qc.invalidateQueries(['blog-tags']); setForm({name:'',slug:'',description:'',meta_title:'',meta_description:''}); setEditing(null); toast.success('ذخیره شد');}}); const del=useMutation({mutationFn:(id)=>base44.entities.BlogTag.delete(id),onSuccess:()=>qc.invalidateQueries(['blog-tags'])}); return <div className='p-6' dir='rtl'><h1 className='text-2xl font-bold mb-6'>تگ‌های بلاگ</h1></div>; }
