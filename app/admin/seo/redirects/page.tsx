'use client';

import { useEffect, useMemo, useState } from 'react';
import { AssistantPage, Badge, Card, CardTitle, toFa } from '../SeoAssistantUI';

type RedirectRow = { id: string; from_path: string; to_path: string; status_code: number; is_active?: boolean; hit_count?: number; notes?: string };

const redirectTypes = [
  { code: 301, title: '۳۰۱', label: 'انتقال دائمی', text: 'برای صفحه‌ای که برای همیشه به آدرس جدید منتقل شده است.' },
  { code: 302, title: '۳۰۲', label: 'انتقال موقت', text: 'برای تغییرهای کوتاه‌مدت، مثل کمپین یا توقف موقت یک صفحه.' },
  { code: 410, title: '۴۱۰', label: 'حذف دائمی', text: 'برای صفحه‌ای که عمدا حذف شده و جایگزین ندارد.' }
];

export default function RedirectsPage() {
  const [rows, setRows] = useState<RedirectRow[]>([]);
  const [form, setForm] = useState({ fromPath: '', toPath: '', statusCode: 301, notes: '' });
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const getAuthHeaders = () => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('noosheh-admin-token') || '' : '';
    return token ? ({ Authorization: `Bearer ${token}` } as Record<string, string>) : {};
  };

  const load = async () => {
    try {
      setError('');
      const res = await fetch('/api/admin/seo/redirects', { cache: 'no-store', headers: getAuthHeaders() });
      const data = await res.json().catch(() => null);
      if (!res.ok) throw new Error(data?.error || 'خطا در دریافت لیست ریدایرکت');
      setRows(Array.isArray(data) ? data : []);
    } catch (err: any) {
      setRows([]);
      setError(err?.message || 'خطای ناشناخته');
    }
  };

  useEffect(() => { load(); }, []);

  const createRedirect = async () => {
    try {
      setSaving(true);
      setError('');
      const res = await fetch('/api/admin/seo/redirects', { method: 'POST', headers: { 'content-type': 'application/json', ...getAuthHeaders() }, body: JSON.stringify(form) });
      const data = await res.json().catch(() => null);
      if (!res.ok) throw new Error(data?.error || 'ثبت ریدایرکت ناموفق بود');
      setForm({ fromPath: '', toPath: '', statusCode: 301, notes: '' });
      await load();
    } catch (err: any) {
      setError(err?.message || 'خطا در ثبت ریدایرکت');
    } finally {
      setSaving(false);
    }
  };

  const hits = useMemo(() => rows.reduce((sum, row) => sum + Number(row.hit_count || 0), 0), [rows]);

  return (
    <AssistantPage title="مدیریت ریدایرکت‌ها" description="وقتی آدرس صفحه‌ای عوض می‌شود، ریدایرکت مشتری و گوگل را به مسیر درست هدایت می‌کند.">
      {error && <div className="seo-error">{error}</div>}

      <div className="seo-info-grid">
        {redirectTypes.map((item) => (
          <Card key={item.code}>
            <strong className="seo-code">{item.title}</strong>
            <h2>{item.label}</h2>
            <p>{item.text}</p>
          </Card>
        ))}
      </div>

      <Card>
        <CardTitle title="ساخت ریدایرکت جدید" subtitle="آدرس قدیمی را به آدرس درست وصل کنید." />
        <div className="seo-form-grid redirect-form">
          <label className="seo-field"><span>Old URL</span><input dir="ltr" placeholder="/old-path" value={form.fromPath} onChange={(event) => setForm((current) => ({ ...current, fromPath: event.target.value }))} /></label>
          <label className="seo-field"><span>New URL</span><input dir="ltr" placeholder="/new-path" value={form.toPath} onChange={(event) => setForm((current) => ({ ...current, toPath: event.target.value }))} /></label>
          <label className="seo-field"><span>Type</span><select value={form.statusCode} onChange={(event) => setForm((current) => ({ ...current, statusCode: Number(event.target.value) }))}><option value={301}>301</option><option value={302}>302</option><option value={307}>307</option><option value={308}>308</option><option value={410}>410</option></select></label>
          <label className="seo-field"><span>Notes</span><input value={form.notes} onChange={(event) => setForm((current) => ({ ...current, notes: event.target.value }))} placeholder="مثلا تغییر آدرس دسته‌بندی" /></label>
        </div>
        <div className="seo-save-row"><button type="button" className="seo-button" disabled={saving} onClick={createRedirect}>{saving ? 'در حال ثبت...' : 'افزودن ریدایرکت'}</button></div>
      </Card>

      <div className="seo-kpi-grid compact">
        <Card className="seo-kpi-card"><span>کل ریدایرکت‌ها</span><strong>{toFa(rows.length)}</strong></Card>
        <Card className="seo-kpi-card"><span>فعال</span><strong>{toFa(rows.filter((row) => row.is_active !== false).length)}</strong></Card>
        <Card className="seo-kpi-card"><span>بازدید هدایت‌شده</span><strong>{toFa(hits)}</strong></Card>
      </div>

      <Card>
        <CardTitle title="لیست ریدایرکت‌ها" />
        <div className="seo-table-wrap">
          <table className="seo-table">
            <thead><tr><th>Old URL</th><th>New URL</th><th>Type</th><th>Hits</th><th>Status</th></tr></thead>
            <tbody>{rows.map((row) => <tr key={row.id}><td dir="ltr">{row.from_path}</td><td dir="ltr">{row.to_path}</td><td>{toFa(row.status_code)}</td><td>{toFa(Number(row.hit_count || 0))}</td><td><Badge tone={row.is_active === false ? 'neutral' : 'good'}>{row.is_active === false ? 'غیرفعال' : 'فعال'}</Badge></td></tr>)}</tbody>
          </table>
        </div>
      </Card>
    </AssistantPage>
  );
}
