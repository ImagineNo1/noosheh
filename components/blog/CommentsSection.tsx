'use client';
import { useEffect, useState } from 'react';

export default function CommentsSection({ postId, allowComments = true }: { postId: string; allowComments?: boolean }) {
  const [rows, setRows] = useState<any[]>([]);
  const [form, setForm] = useState({ author_name: '', author_email: '', content: '' });
  const [loading, setLoading] = useState(false);
  const load = async () => {
    const r = await fetch(`/api/blog/comments/${postId}`, { cache: 'no-store' });
    setRows(await r.json());
  };
  useEffect(() => { load(); }, [postId]);
  const submit = async () => {
    setLoading(true);
    const r = await fetch('/api/blog/comments', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...form, post_id: postId }) });
    setLoading(false);
    if (r.ok) { setForm({ author_name: '', author_email: '', content: '' }); alert('دیدگاه ثبت شد و پس از تایید نمایش داده می‌شود.'); }
  };
  return <section className='mt-12' dir='rtl'><h3 className='text-xl font-bold mb-4'>دیدگاه‌ها ({rows.length})</h3><div className='space-y-3 mb-6'>{rows.length===0?<p className='text-sm text-muted-foreground'>هنوز دیدگاهی ثبت نشده.</p>:rows.map(c=><div key={c.id} className='bg-card border border-border rounded-xl p-3'><p className='text-sm font-semibold'>{c.author_name}</p><p className='text-sm mt-1'>{c.content}</p></div>)}</div>{allowComments && <div className='bg-card border border-border rounded-xl p-4 space-y-2'><input className='w-full border rounded px-3 py-2' placeholder='نام' value={form.author_name} onChange={e=>setForm({...form,author_name:e.target.value})}/><input className='w-full border rounded px-3 py-2' placeholder='ایمیل' value={form.author_email} onChange={e=>setForm({...form,author_email:e.target.value})}/><textarea className='w-full border rounded px-3 py-2 min-h-24' placeholder='متن دیدگاه' value={form.content} onChange={e=>setForm({...form,content:e.target.value})}/><button disabled={loading} onClick={submit} className='px-4 py-2 rounded bg-primary text-primary-foreground'>{loading?'در حال ارسال...':'ارسال دیدگاه'}</button></div>}</section>;
}
