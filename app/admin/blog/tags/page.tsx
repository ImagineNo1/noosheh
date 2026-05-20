'use client';

import { useEffect, useState } from 'react';
import SeoTab from '@/components/seo/SeoTab';

export default function TagsPage() {
  const [rows, setRows] = useState<any[]>([]);
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [editing, setEditing] = useState<any | null>(null);
  const token = typeof window !== 'undefined' ? localStorage.getItem('noosheh-admin-token') || '' : '';

  const load = () => fetch('/api/admin/blog/tags', { headers: { Authorization: `Bearer ${token}` } }).then((r) => r.json()).then(setRows);
  useEffect(() => { load(); }, []);

  const add = async () => {
    await fetch('/api/admin/blog/tags', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ name, slug })
    });
    setName('');
    setSlug('');
    load();
  };

  return <div className='admin-page' dir='rtl'>
    <h1 className='admin-title'>Tags</h1>
    <div className='admin-card p-4 flex gap-2'>
      <input className='admin-input' value={name} onChange={(e) => setName(e.target.value)} placeholder='name' />
      <input className='admin-input' value={slug} onChange={(e) => setSlug(e.target.value)} placeholder='slug' />
      <button className='admin-btn primary' onClick={add}>add</button>
    </div>
    <div className='admin-card p-4 space-y-3'>
      {rows.map((r) => <div key={r.id} className='flex items-center justify-between rounded border p-2'><span>{r.name}</span><button className='admin-btn' onClick={() => setEditing(r)}>SEO</button></div>)}
      {editing ? <SeoTab entity={editing} entityType='blog_tag' entityId={editing.id} /> : null}
    </div>
  </div>;
}
