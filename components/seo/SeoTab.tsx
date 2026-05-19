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
  </div>;
}
