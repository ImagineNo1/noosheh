'use client';

import { useEffect, useMemo, useState } from 'react';
import { ActionLink, AssistantPage, Badge, Card, CardTitle, toFa } from '../SeoAssistantUI';

type NotFoundRow = { id: string; path: string; hit_count?: number; referrer?: string; resolved?: boolean; last_seen_at?: string };

export default function NotFoundPage() {
  const [rows, setRows] = useState<NotFoundRow[]>([]);
  const [error, setError] = useState('');

  const getAuthHeaders = () => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('noosheh-admin-token') || '' : '';
    return token ? ({ Authorization: `Bearer ${token}` } as Record<string, string>) : {};
  };

  const load = async () => {
    try {
      setError('');
      const res = await fetch('/api/admin/seo/404?resolved=false', { cache: 'no-store', headers: getAuthHeaders() });
      const data = await res.json().catch(() => null);
      if (!res.ok) throw new Error(data?.error || 'خطا در دریافت گزارش ۴۰۴');
      setRows(Array.isArray(data) ? data : []);
    } catch (err: any) {
      setRows([]);
      setError(err?.message || 'خطای ناشناخته');
    }
  };

  useEffect(() => { load(); }, []);

  const resolve = async (id: string) => {
    try {
      setError('');
      const res = await fetch(`/api/admin/seo/404/${id}/resolve`, { method: 'PATCH', headers: { 'content-type': 'application/json', ...getAuthHeaders() }, body: '{}' });
      const data = await res.json().catch(() => null);
      if (!res.ok) throw new Error(data?.error || 'ثبت وضعیت انجام نشد');
      await load();
    } catch (err: any) {
      setError(err?.message || 'خطا در ثبت وضعیت ۴۰۴');
    }
  };

  const topRows = useMemo(() => [...rows].sort((a, b) => Number(b.hit_count || 0) - Number(a.hit_count || 0)).slice(0, 3), [rows]);

  return (
    <AssistantPage title="مانیتور ۴۰۴" description="۴۰۴ یعنی کاربر یا گوگل وارد صفحه‌ای شده که دیگر وجود ندارد. اینجا مسیرهای شکسته را به زبان ساده مدیریت می‌کنید.">
      {error && <div className="seo-error">{error}</div>}

      <div className="seo-kpi-grid compact">
        {(topRows.length ? topRows : [{ id: 'empty', path: 'مسیری ثبت نشده', hit_count: 0 }]).map((row) => (
          <Card key={row.id} className="seo-kpi-card">
            <span dir="ltr">{row.path}</span>
            <strong>{toFa(Number(row.hit_count || 0))}</strong>
            <small>بازدید ناموفق</small>
          </Card>
        ))}
      </div>

      <Card>
        <CardTitle title="مسیرهای شکسته" subtitle="مسیرهایی که بهتر است به صفحه درست منتقل شوند یا به عنوان حل‌شده علامت بخورند." action={<ActionLink href="/admin/seo/redirects" variant="soft">ساخت ریدایرکت</ActionLink>} />
        <div className="seo-table-wrap">
          <table className="seo-table">
            <thead><tr><th>URL</th><th>Hits</th><th>Referrer</th><th>Last Seen</th><th>Status</th><th>Actions</th></tr></thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.id}>
                  <td dir="ltr">{row.path}</td>
                  <td>{toFa(Number(row.hit_count || 0))}</td>
                  <td dir="ltr">{row.referrer || '-'}</td>
                  <td>{row.last_seen_at ? new Date(row.last_seen_at).toLocaleDateString('fa-IR') : '-'}</td>
                  <td><Badge tone={row.resolved ? 'good' : 'warn'}>{row.resolved ? 'Resolved' : 'نیاز به بررسی'}</Badge></td>
                  <td><div className="seo-row-actions"><a href="/admin/seo/redirects">Create Redirect</a><button type="button">Ignore</button><button type="button" onClick={() => resolve(row.id)}>Resolved</button></div></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </AssistantPage>
  );
}
