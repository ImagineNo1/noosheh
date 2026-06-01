'use client';

import { useEffect, useState } from 'react';

type RedirectRow = { id: string; from_path: string; to_path: string; status_code: number; is_active?: boolean; hit_count?: number };

export default function RedirectsPage() {
  const [rows, setRows] = useState<RedirectRow[]>([]);
  const [form, setForm] = useState({ fromPath: '', toPath: '', statusCode: 301 });
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const getAuthHeaders = () => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('noosheh-admin-token') || '' : '';
    return token ? ({ Authorization: `Bearer ${token}` } as Record<string, string>) : ({} as Record<string, string>);
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
      setForm({ fromPath: '', toPath: '', statusCode: 301 });
      await load();
    } catch (err: any) {
      setError(err?.message || 'خطا در ثبت ریدایرکت');
    } finally {
      setSaving(false);
    }
  };

  return <div className='space-y-4'>
    <h1 className='text-lg font-bold'>Redirect Manager</h1>
    {error && <p className='rounded border border-destructive/30 bg-destructive/10 p-2 text-sm text-destructive'>{error}</p>}
    <div className='grid gap-2 sm:grid-cols-4'>
      <input className='rounded border p-2' placeholder='/old-path' value={form.fromPath} onChange={(e) => setForm((f) => ({ ...f, fromPath: e.target.value }))} />
      <input className='rounded border p-2' placeholder='/new-path' value={form.toPath} onChange={(e) => setForm((f) => ({ ...f, toPath: e.target.value }))} />
      <select className='rounded border p-2' value={form.statusCode} onChange={(e) => setForm((f) => ({ ...f, statusCode: Number(e.target.value) }))}><option value={301}>301</option><option value={302}>302</option><option value={307}>307</option><option value={308}>308</option><option value={410}>410</option></select>
      <button disabled={saving} className='rounded bg-primary px-3 py-2 text-primary-foreground disabled:opacity-60' onClick={createRedirect}>{saving ? '...' : 'افزودن'}</button>
    </div>
    <div className='overflow-auto rounded border'>
      <table className='w-full text-sm'>
        <thead><tr className='bg-secondary/40 text-right'><th className='p-2'>From</th><th className='p-2'>To</th><th className='p-2'>Code</th><th className='p-2'>Hits</th></tr></thead>
        <tbody>{rows.map((r) => <tr key={r.id} className='border-t'><td className='p-2' dir='ltr'>{r.from_path}</td><td className='p-2' dir='ltr'>{r.to_path}</td><td className='p-2'>{r.status_code}</td><td className='p-2'>{r.hit_count || 0}</td></tr>)}</tbody>
      </table>
    </div>
  </div>;
}
