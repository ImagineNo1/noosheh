'use client';
import { useEffect, useState } from 'react';
import { adminApi } from '@/app/admin/admin-api';
import { useRouter } from 'next/navigation';
import SeoTab from '@/components/seo/SeoTab';

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <label className='block space-y-1.5 text-sm font-medium'><span>{label}</span>{children}</label>;
}

const editorActions: Array<{ label: string; title: string; command: string; value?: string }> = [
  { label: 'B', title: 'Bold', command: 'bold' },
  { label: 'I', title: 'Italic', command: 'italic' },
  { label: 'U', title: 'Underline', command: 'underline' },
  { label: '• لیست', title: 'Bullet List', command: 'insertUnorderedList' },
  { label: '1. لیست', title: 'Numbered List', command: 'insertOrderedList' },
  { label: 'نقل‌قول', title: 'Quote', command: 'formatBlock', value: 'blockquote' },
  { label: 'H2', title: 'Heading 2', command: 'formatBlock', value: 'h2' },
  { label: 'H3', title: 'Heading 3', command: 'formatBlock', value: 'h3' }
];

export default function BlogEditor({ id }: { id?: string }) {
  const isEditing = !!id; const router = useRouter();
  const [form, setForm] = useState<any>({ title:'', slug:'', excerpt:'', content:'', cover_image:'', category:'', tags:[], status:'draft', author_name:'' });
  const [tagInput, setTagInput] = useState(''); const [categories, setCategories] = useState<any[]>([]);
  useEffect(() => { adminApi.list<any>('BlogCategory').then(setCategories); if (id) adminApi.list<any>('BlogPost').then((rows)=>{ const p=rows.find((x)=>x.id===id); if(p) setForm({...form,...p}); }); }, [id]);
  const save = async () => { const slug = form.slug || form.title.replace(/\s+/g,'-'); if (isEditing) await adminApi.update('BlogPost', id!, { ...form, slug }); else await adminApi.create('BlogPost', { ...form, slug }); router.push('/admin/blog'); };
  const execEditor = (command: string, value?: string) => {
    document.execCommand(command, false, value);
  };

  return <div className="p-6 sm:p-8 max-w-6xl" dir="rtl"><div className="flex items-center justify-between mb-6"><h1 className="text-xl font-extrabold">{isEditing?'ویرایش مقاله':'مقاله جدید'}</h1><button onClick={save} className="px-4 py-2 rounded-lg bg-primary text-primary-foreground">ذخیره</button></div><div className="grid grid-cols-1 lg:grid-cols-5 gap-6"><div className="lg:col-span-3 space-y-4"><Field label='عنوان مقاله'><input className="w-full border rounded-lg px-3 py-2" placeholder="عنوان" value={form.title} onChange={(e)=>setForm({...form,title:e.target.value})}/></Field><Field label='نامک (Slug)'><input className="w-full border rounded-lg px-3 py-2" placeholder="example-post-slug" dir='ltr' value={form.slug || ''} onChange={(e)=>setForm({...form,slug:e.target.value})}/></Field><Field label='خلاصه مقاله'><textarea className="w-full border rounded-lg px-3 py-2 min-h-24" placeholder="خلاصه" value={form.excerpt} onChange={(e)=>setForm({...form,excerpt:e.target.value})}/></Field><Field label='بدنه و متن اصلی مقاله'><div className='rounded-lg border'><div className='flex flex-wrap gap-2 border-b p-2 bg-muted/30'>{editorActions.map((action) => <button key={action.title} type='button' className='rounded border bg-background px-2 py-1 text-xs' onClick={() => execEditor(action.command, action.value)}>{action.label}</button>)}<button type='button' className='rounded border bg-background px-2 py-1 text-xs' onClick={() => { const url = window.prompt('لینک را وارد کنید'); if (url) execEditor('createLink', url); }}>لینک</button><button type='button' className='rounded border bg-background px-2 py-1 text-xs' onClick={() => execEditor('removeFormat')}>پاک‌سازی فرمت</button></div><div className="w-full px-3 py-2 min-h-72 focus:outline-none" contentEditable suppressContentEditableWarning onInput={(e)=>setForm({...form,content:(e.currentTarget as HTMLDivElement).innerHTML})} dangerouslySetInnerHTML={{ __html: form.content || '' }} /></div><p className='text-xs text-muted-foreground'>می‌توانید مثل ورد متن را بولد، لیست‌دار، تیتر و لینک‌دار کنید.</p></Field></div><div className="lg:col-span-2 space-y-4"><Field label='تصویر شاخص (URL)'><input className="w-full border rounded-lg px-3 py-2" placeholder="https://..." dir='ltr' value={form.cover_image} onChange={(e)=>setForm({...form,cover_image:e.target.value})}/></Field><Field label='دسته‌بندی'><select className="w-full border rounded-lg px-3 py-2" value={form.category} onChange={(e)=>setForm({...form,category:e.target.value})}><option value="">انتخاب دسته</option>{categories.map(c=><option key={c.id} value={c.name}>{c.name}</option>)}</select></Field><Field label='نام نویسنده'><input className="w-full border rounded-lg px-3 py-2" value={form.author_name || ''} onChange={(e)=>setForm({...form,author_name:e.target.value})} placeholder='مثال: تیم نوشه' /></Field><Field label='برچسب‌ها'><div className="flex gap-2"><input className="w-full border rounded-lg px-3 py-2" value={tagInput} onChange={(e)=>setTagInput(e.target.value)} placeholder="برچسب"/><button type='button' onClick={()=>{if(tagInput.trim()) {setForm({...form,tags:[...form.tags, tagInput.trim()]});setTagInput('');}}} className="px-3 rounded bg-secondary">+</button></div></Field><div className="flex flex-wrap gap-2">{form.tags.map((t:string)=><button type='button' key={t} onClick={()=>setForm({...form,tags:form.tags.filter((x:string)=>x!==t)})} className="px-2 py-1 bg-secondary rounded-full text-xs">{t} ×</button>)}</div>{isEditing && id ? <SeoTab entity={form} entityType='blog_post' entityId={id} /> : <div className='rounded border p-3 text-sm text-muted-foreground'>پس از ذخیره مقاله، پنل SEO فعال می‌شود.</div>}</div></div></div>;
}
