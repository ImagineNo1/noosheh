'use client';

import { useEffect, useState } from 'react';

type RedirectRow = { id: string; from_path: string; to_path: string; status_code: number; is_active?: boolean; hit_count?: number };

export default function RedirectsPage() {
  const [rows, setRows] = useState<RedirectRow[]>([]);
  const [form, setForm] = useState({ fromPath: '', toPath: '', statusCode: 301 });

  const load = async () => setRows(await fetch('/api/admin/seo/redirects').then((r) => r.json()));
  useEffect(() => { load(); }, []);

  const createRedirect = async () => {
    await fetch('/api/admin/seo/redirects', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(form) });
    setForm({ fromPath: '', toPath: '', statusCode: 301 });
    await load();
  };

  return <div className='space-y-4'>
    <h1 className='text-lg font-bold'>Redirect Manager</h1>
    <div className='grid gap-2 sm:grid-cols-4'>
      <input className='rounded border p-2' placeholder='/old-path' value={form.fromPath} onChange={(e) => setForm((f) => ({ ...f, fromPath: e.target.value }))} />
      <input className='rounded border p-2' placeholder='/new-path' value={form.toPath} onChange={(e) => setForm((f) => ({ ...f, toPath: e.target.value }))} />
      <select className='rounded border p-2' value={form.statusCode} onChange={(e) => setForm((f) => ({ ...f, statusCode: Number(e.target.value) }))}><option value={301}>301</option><option value={302}>302</option><option value={307}>307</option><option value={308}>308</option><option value={410}>410</option></select>
      <button className='rounded bg-primary px-3 py-2 text-primary-foreground' onClick={createRedirect}>افزودن</button>
    </div>
    <div className='overflow-auto rounded border'>
      <table className='w-full text-sm'>
        <thead><tr className='bg-secondary/40 text-right'><th className='p-2'>From</th><th className='p-2'>To</th><th className='p-2'>Code</th><th className='p-2'>Hits</th></tr></thead>
        <tbody>{rows.map((r) => <tr key={r.id} className='border-t'><td className='p-2' dir='ltr'>{r.from_path}</td><td className='p-2' dir='ltr'>{r.to_path}</td><td className='p-2'>{r.status_code}</td><td className='p-2'>{r.hit_count || 0}</td></tr>)}</tbody>
      </table>
    </div>
  </div>;
}
