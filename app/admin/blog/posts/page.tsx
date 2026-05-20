'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { adminApi } from '@/app/admin/admin-api';

export default function PostsPage() {
  const [rows, setRows] = useState<any[]>([]);
  const [q, setQ] = useState('');
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (q) params.set('q', q);
    if (status) params.set('status', status);
    const res = await fetch(`/api/admin/blog/posts?${params.toString()}`, { headers: { Authorization: `Bearer ${localStorage.getItem('noosheh-admin-token') || ''}` } });
    const data = await res.json();
    setRows(data.items || []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const stats = useMemo(() => ({ total: rows.length, published: rows.filter(r=>r.status==='published').length, draft: rows.filter(r=>r.status==='draft').length }), [rows]);

  const doAction = async (id: string, action: 'publish'|'draft'|'duplicate'|'delete') => {
    if (action === 'delete') await fetch(`/api/admin/blog/posts/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${localStorage.getItem('noosheh-admin-token') || ''}` } });
    else await fetch(`/api/admin/blog/posts/${id}/${action}`, { method: 'POST', headers: { Authorization: `Bearer ${localStorage.getItem('noosheh-admin-token') || ''}` } });
    load();
  };

  return <div className='admin-page' dir='rtl'>
    <div className='admin-page-header'><div><h1 className='admin-title'>Posts</h1><p className='admin-muted small'>مدیریت کامل نوشته‌ها</p></div><Link href='/admin/blog/new' className='px-3 py-2 rounded bg-primary text-primary-foreground text-sm'>+ Add New</Link></div>
    <div className='admin-stats-grid'><div className='admin-card p-4'>کل: {stats.total}</div><div className='admin-card p-4'>منتشر: {stats.published}</div><div className='admin-card p-4'>پیش‌نویس: {stats.draft}</div></div>
    <div className='admin-card p-4 mb-4 flex gap-2'><input className='admin-input' placeholder='جستجو عنوان/خلاصه' value={q} onChange={e=>setQ(e.target.value)} /><select className='admin-input' value={status} onChange={e=>setStatus(e.target.value)}><option value=''>همه وضعیت‌ها</option><option value='published'>published</option><option value='draft'>draft</option><option value='archived'>archived</option></select><button className='admin-btn primary' onClick={load}>فیلتر</button></div>
    <div className='admin-card'><div className='admin-table-wrap'><table className='admin-table'><thead><tr><th>title</th><th>author</th><th>status</th><th>views</th><th>updated</th><th>actions</th></tr></thead><tbody>{loading?<tr><td colSpan={6}>Loading...</td></tr>:rows.map(r=><tr key={r.id}><td>{r.title}</td><td>{r.author_name||'—'}</td><td>{r.status}</td><td>{r.view_count||0}</td><td>{new Date(r.updated_date||r.created_date).toLocaleDateString('fa-IR')}</td><td className='flex gap-1'><Link href={`/admin/blog/edit/${r.id}`} className='admin-btn'>edit</Link><button className='admin-btn' onClick={()=>doAction(r.id,'duplicate')}>duplicate</button><button className='admin-btn' onClick={()=>doAction(r.id,'publish')}>publish</button><button className='admin-btn' onClick={()=>doAction(r.id,'draft')}>draft</button><button className='admin-btn' onClick={()=>doAction(r.id,'delete')}>delete</button></td></tr>)}</tbody></table></div></div>
  </div>;
}
