'use client';

import { useEffect, useMemo, useState } from 'react';
import { adminApi } from '@/app/admin/admin-api';
import SeoScoreBadge from './SeoScoreBadge';
import { analyzeSeoContent } from '@/lib/seo/seoHelpers';

export default function SeoTab({ entity, entityType, entityId }: { entity: any; entityType: string; entityId: string }) {
  const [list, setList] = useState<any[]>([]);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<any>({ meta_title: '', meta_description: '', focus_keyword: '', canonical_url: '', robots_index: true, robots_follow: true, custom_schema: '' });
  const existing = useMemo(() => list.find((x) => x.entity_type === entityType && x.entity_id === entityId), [list, entityType, entityId]);
  const analysis = useMemo(() => analyzeSeoContent({ entity, seoMeta: form, entityType }), [entity, form, entityType]);

  useEffect(() => { adminApi.list<any>('SeoMeta', '-created_date', 500).then(setList).catch(() => setList([])); }, []);
  useEffect(() => { if (existing) setForm((f: any) => ({ ...f, ...existing })); }, [existing]);

  const onSave = async () => {
    if (form.custom_schema) { try { JSON.parse(form.custom_schema); } catch { return alert('JSON-LD نامعتبر است'); } }
    setSaving(true);
    const payload = { ...form, entity_type: entityType, entity_id: entityId, seo_score: analysis.seoScore };
    try {
      if (existing?.id) await adminApi.update('SeoMeta', existing.id, payload); else await adminApi.create('SeoMeta', payload);
      const next = await adminApi.list<any>('SeoMeta', '-created_date', 500);
      setList(next);
      alert('SEO ذخیره شد');
    } finally { setSaving(false); }
  };

  return <div className='space-y-3 rounded-xl border border-border p-3'>
    <div className='flex items-center justify-between gap-3'>
      <div className='flex items-center gap-3'><SeoScoreBadge score={analysis.seoScore} size='sm' /><SeoScoreBadge score={analysis.readabilityScore} size='sm' /></div>
      <button onClick={onSave} className='rounded bg-primary px-3 py-1.5 text-sm text-primary-foreground'>{saving ? '...' : 'ذخیره SEO'}</button>
    </div>
    <input className='w-full rounded border p-2' placeholder='meta_title' value={form.meta_title || ''} onChange={(e) => setForm((f: any) => ({ ...f, meta_title: e.target.value }))} />
    <textarea className='w-full rounded border p-2 text-sm' placeholder='meta_description' value={form.meta_description || ''} onChange={(e) => setForm((f: any) => ({ ...f, meta_description: e.target.value }))} />
    <input className='w-full rounded border p-2' placeholder='focus_keyword' value={form.focus_keyword || ''} onChange={(e) => setForm((f: any) => ({ ...f, focus_keyword: e.target.value }))} />
    <input className='w-full rounded border p-2' placeholder='canonical_url' dir='ltr' value={form.canonical_url || ''} onChange={(e) => setForm((f: any) => ({ ...f, canonical_url: e.target.value }))} />
    <div className='grid gap-2 sm:grid-cols-2'>
      <input className='w-full rounded border p-2' placeholder='og_title' value={form.og_title || ''} onChange={(e) => setForm((f: any) => ({ ...f, og_title: e.target.value }))} />
      <input className='w-full rounded border p-2' placeholder='og_image' dir='ltr' value={form.og_image || ''} onChange={(e) => setForm((f: any) => ({ ...f, og_image: e.target.value }))} />
      <textarea className='w-full rounded border p-2 text-sm sm:col-span-2' placeholder='og_description' value={form.og_description || ''} onChange={(e) => setForm((f: any) => ({ ...f, og_description: e.target.value }))} />
      <input className='w-full rounded border p-2' placeholder='twitter_title' value={form.twitter_title || ''} onChange={(e) => setForm((f: any) => ({ ...f, twitter_title: e.target.value }))} />
      <input className='w-full rounded border p-2' placeholder='twitter_image' dir='ltr' value={form.twitter_image || ''} onChange={(e) => setForm((f: any) => ({ ...f, twitter_image: e.target.value }))} />
      <textarea className='w-full rounded border p-2 text-sm sm:col-span-2' placeholder='twitter_description' value={form.twitter_description || ''} onChange={(e) => setForm((f: any) => ({ ...f, twitter_description: e.target.value }))} />
    </div>
    <div className='grid gap-2 sm:grid-cols-2'>
      <label className='inline-flex items-center gap-2 text-sm'><input type='checkbox' checked={form.robots_index !== false} onChange={(e) => setForm((f: any) => ({ ...f, robots_index: e.target.checked }))} /> index</label>
      <label className='inline-flex items-center gap-2 text-sm'><input type='checkbox' checked={form.robots_follow !== false} onChange={(e) => setForm((f: any) => ({ ...f, robots_follow: e.target.checked }))} /> follow</label>
    </div>
    <div className='rounded-md bg-secondary/30 p-2 text-xs'>
      <p>طول title: {(form.meta_title || '').length} / 60</p>
      <p>طول description: {(form.meta_description || '').length} / 160</p>
      {!(form.focus_keyword || '').trim() && <p className='text-amber-600'>focus keyword خالی است.</p>}
    </div>
    <textarea className='w-full rounded border p-2 text-sm' placeholder='custom_schema (JSON-LD)' dir='ltr' value={form.custom_schema || ''} onChange={(e) => setForm((f: any) => ({ ...f, custom_schema: e.target.value }))} />
  </div>;
}
