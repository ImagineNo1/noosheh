'use client';

import { useEffect, useMemo, useState } from 'react';
import { adminApi } from '@/app/admin/admin-api';
import SeoScoreBadge from './SeoScoreBadge';
import { analyzeSeoContent } from '@/lib/seo/seoHelpers';

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return <div className='space-y-1.5'><label className='block text-sm font-semibold'>{label}</label>{hint ? <p className='text-xs text-muted-foreground'>{hint}</p> : null}{children}</div>;
}

export default function SeoTab({ entity, entityType, entityId }: { entity: any; entityType: string; entityId: string }) {
  const [list, setList] = useState<any[]>([]);
  const [siteUrl, setSiteUrl] = useState('');
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<any>({ meta_title: '', meta_description: '', focus_keyword: '', canonical_url: '', robots_index: true, robots_follow: true, custom_schema: '' });
  const existing = useMemo(() => list.find((x) => x.entity_type === entityType && x.entity_id === entityId), [list, entityType, entityId]);
  const analysis = useMemo(() => analyzeSeoContent({ entity, seoMeta: form, entityType }), [entity, form, entityType]);

  useEffect(() => {
    adminApi.list<any>('SeoMeta', '-created_date', 500).then(setList).catch(() => setList([]));
    adminApi.list<any>('SeoSettings', '-updated_date', 1).then((settings) => setSiteUrl(String(settings?.[0]?.site_url || '').replace(/\/$/, ''))).catch(() => setSiteUrl(''));
  }, []);
  useEffect(() => { if (existing) setForm((f: any) => ({ ...f, ...existing })); }, [existing]);

  const seoTitle = form.meta_title || entity?.title || entity?.name || 'عنوان صفحه';
  const seoDescription = form.meta_description || entity?.short_description || entity?.description || 'توضیحات متا اینجا نمایش داده می‌شود.';
  const canonicalBase = siteUrl || (typeof window !== 'undefined' ? window.location.origin : '');
  const canonical = form.canonical_url || (canonicalBase ? `${canonicalBase}/${entityType}/${entityId}` : `/${entityType}/${entityId}`);

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

  return <section className='space-y-4 rounded-2xl border bg-card p-4'>
    <header className='flex flex-wrap items-start justify-between gap-3 border-b pb-3'>
      <div>
        <h3 className='text-base font-bold'>تنظیمات SEO</h3>
        <p className='text-xs text-muted-foreground'>بهینه‌سازی موتورهای جستجو برای این محتوا</p>
      </div>
      <div className='flex items-center gap-2'><SeoScoreBadge score={analysis.seoScore} size='sm' /><SeoScoreBadge score={analysis.readabilityScore} size='sm' /></div>
    </header>

    <div className='rounded-xl border p-3'>
      <h4 className='mb-2 text-sm font-bold'>پیش‌نمایش در گوگل</h4>
      <p className='truncate text-xs text-emerald-700' dir='ltr'>{canonical}</p>
      <p className='truncate text-base font-bold text-blue-700'>{seoTitle}</p>
      <p className='line-clamp-2 text-sm text-muted-foreground'>{seoDescription}</p>
    </div>

    <div className='grid gap-3 sm:grid-cols-2'>
      <Field label='عنوان SEO' hint='پیشنهادی: 30 تا 60 کاراکتر'>
        <input className='w-full rounded-lg border p-2' value={form.meta_title || ''} onChange={(e) => setForm((f: any) => ({ ...f, meta_title: e.target.value }))} />
        <p className='text-xs text-amber-600'>{(form.meta_title || '').length}/60</p>
      </Field>
      <Field label='کلمه کلیدی اصلی' hint='یک عبارت کوتاه و هدفمند'>
        <input className='w-full rounded-lg border p-2' value={form.focus_keyword || ''} onChange={(e) => setForm((f: any) => ({ ...f, focus_keyword: e.target.value }))} />
      </Field>
      <Field label='توضیحات متا' hint='پیشنهادی: 120 تا 160 کاراکتر'>
        <textarea className='w-full rounded-lg border p-2 text-sm min-h-24' value={form.meta_description || ''} onChange={(e) => setForm((f: any) => ({ ...f, meta_description: e.target.value }))} />
        <p className='text-xs text-amber-600'>{(form.meta_description || '').length}/160</p>
      </Field>
      <Field label='Canonical URL' hint='آدرس اصلی همین صفحه برای جلوگیری از محتوای تکراری. بهتر است با دامنه اصلی سایت شما شروع شود.'>
        <input className='w-full rounded-lg border p-2' dir='ltr' value={form.canonical_url || ''} onChange={(e) => setForm((f: any) => ({ ...f, canonical_url: e.target.value }))} />
      </Field>
    </div>

    <div className='grid gap-3 sm:grid-cols-2'>
      <Field label='OG Title' hint='عنوانی که هنگام اشتراک‌گذاری لینک در شبکه‌های اجتماعی نمایش داده می‌شود.'><input className='w-full rounded-lg border p-2' value={form.og_title || ''} onChange={(e) => setForm((f: any) => ({ ...f, og_title: e.target.value }))} /></Field>
      <Field label='OG Image URL' hint='لینک تصویر شاخص برای اشتراک‌گذاری (ترجیحاً افقی و باکیفیت).'><input className='w-full rounded-lg border p-2' dir='ltr' value={form.og_image || ''} onChange={(e) => setForm((f: any) => ({ ...f, og_image: e.target.value }))} /></Field>
      <Field label='OG Description' hint='خلاصه کوتاه محتوا که زیر عنوان در پیش‌نمایش شبکه اجتماعی می‌آید.'><textarea className='w-full rounded-lg border p-2 text-sm min-h-20' value={form.og_description || ''} onChange={(e) => setForm((f: any) => ({ ...f, og_description: e.target.value }))} /></Field>
      <Field label='Twitter Title' hint='عنوان مخصوص پیش‌نمایش لینک در توییتر/X.'><input className='w-full rounded-lg border p-2' value={form.twitter_title || ''} onChange={(e) => setForm((f: any) => ({ ...f, twitter_title: e.target.value }))} /></Field>
      <Field label='Twitter Image URL' hint='تصویر مخصوص کارت توییتر/X (در صورت خالی بودن، معمولاً OG Image استفاده می‌شود).'><input className='w-full rounded-lg border p-2' dir='ltr' value={form.twitter_image || ''} onChange={(e) => setForm((f: any) => ({ ...f, twitter_image: e.target.value }))} /></Field>
      <Field label='Twitter Description' hint='توضیح کوتاه برای کارت توییتر/X.'><textarea className='w-full rounded-lg border p-2 text-sm min-h-20' value={form.twitter_description || ''} onChange={(e) => setForm((f: any) => ({ ...f, twitter_description: e.target.value }))} /></Field>
    </div>

    <div className='rounded-xl border p-3'>
      <h4 className='mb-2 text-sm font-bold'>تنظیمات ایندکس</h4>
      <div className='grid gap-2 sm:grid-cols-2'>
        <label className='inline-flex items-center gap-2 text-sm'><input type='checkbox' checked={form.robots_index !== false} onChange={(e) => setForm((f: any) => ({ ...f, robots_index: e.target.checked }))} /> index <span className='text-xs text-muted-foreground'>اجازه نمایش صفحه در نتایج گوگل.</span></label>
        <label className='inline-flex items-center gap-2 text-sm'><input type='checkbox' checked={form.robots_follow !== false} onChange={(e) => setForm((f: any) => ({ ...f, robots_follow: e.target.checked }))} /> follow <span className='text-xs text-muted-foreground'>اجازه دنبال‌کردن لینک‌های داخل صفحه توسط موتور جستجو.</span></label>
      </div>
    </div>

    <Field label='Custom JSON-LD' hint='اسکیما ساختاریافته سفارشی برای درک بهتر محتوا توسط موتورهای جستجو (فرمت JSON معتبر).'>
      <textarea className='w-full rounded-lg border p-2 text-sm min-h-28' dir='ltr' value={form.custom_schema || ''} onChange={(e) => setForm((f: any) => ({ ...f, custom_schema: e.target.value }))} />
    </Field>

    <div className='rounded-xl border p-3 text-sm'>
      <h4 className='mb-2 font-bold'>هشدارها و پیشنهادها</h4>
      <ul className='list-disc space-y-1 pr-5 text-muted-foreground'>
        {analysis.suggestions.slice(0, 6).map((s: any, i: number) => <li key={i}>{s.text}</li>)}
      </ul>
    </div>

    <div className='flex justify-end'>
      <button onClick={onSave} className='rounded-lg bg-primary px-4 py-2 text-sm text-primary-foreground'>{saving ? 'در حال ذخیره...' : 'ذخیره تنظیمات SEO'}</button>
    </div>
  </section>;
}
