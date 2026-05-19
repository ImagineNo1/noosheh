'use client';
import { useEffect, useState } from 'react';
import { adminApi } from '../admin-api';
import { Button, Card, Input, Label, Textarea } from '../_components/ui';

type Redirect = { id: string; fromPath: string; toPath?: string; statusCode: number; isActive: boolean; hitCount?: number };
type NotFound = { id: string; path: string; hitCount: number; resolved: boolean; lastSeenAt?: string };

export default function SeoAdminPage() {
  const [redirects, setRedirects] = useState<Redirect[]>([]);
  const [notFound, setNotFound] = useState<NotFound[]>([]);
  const [settings, setSettings] = useState<any>({});
  const [fromPath, setFromPath] = useState('');
  const [toPath, setToPath] = useState('');
  const [statusCode, setStatusCode] = useState('301');

  const load = async () => {
    const [r, n, s] = await Promise.all([
      adminApi.list<any>('Product' as any).then(() => fetch('/api/admin/seo/redirects').then((res) => res.json())),
      fetch('/api/admin/seo/404', { headers: { Authorization: `Bearer ${localStorage.getItem('noosheh-admin-token') || ''}` } }).then((res) => res.json()),
      fetch('/api/admin/seo/settings', { headers: { Authorization: `Bearer ${localStorage.getItem('noosheh-admin-token') || ''}` } }).then((res) => res.json()).catch(() => ({}))
    ]);
    setRedirects(r || []); setNotFound(n || []); setSettings(s || {});
  };
  useEffect(() => { void load(); }, []);

  const createRedirect = async () => {
    await fetch('/api/admin/seo/redirects', { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('noosheh-admin-token') || ''}` }, body: JSON.stringify({ fromPath, toPath, statusCode: Number(statusCode), isActive: true }) });
    setFromPath(''); setToPath(''); setStatusCode('301'); await load();
  };

  const saveSettings = async () => {
    await fetch('/api/admin/seo/settings', { method: 'PATCH', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('noosheh-admin-token') || ''}` }, body: JSON.stringify(settings) });
    await load();
  };

  return <div className="admin-page space-y-4"><div className="admin-page-header"><h1 className="admin-title">SEO Dashboard</h1></div>
    <Card><div className="admin-card-header"><h2>SEO Settings</h2></div><div className="admin-form-grid"><div><Label>Site Name</Label><Input value={settings.siteName || ''} onChange={(e) => setSettings((c: any) => ({ ...c, siteName: e.target.value }))} /></div><div><Label>Default Meta Title</Label><Input value={settings.defaultMetaTitle || ''} onChange={(e) => setSettings((c: any) => ({ ...c, defaultMetaTitle: e.target.value }))} /></div><div className="md:col-span-2"><Label>Default Meta Description</Label><Textarea value={settings.defaultMetaDescription || ''} onChange={(e) => setSettings((c: any) => ({ ...c, defaultMetaDescription: e.target.value }))} className="short" /></div></div><div className="admin-dialog-footer"><Button className="primary" onClick={saveSettings}>ذخیره</Button></div></Card>
    <Card><div className="admin-card-header"><h2>Redirect Manager</h2></div><div className="admin-form-grid"><div><Label>fromPath</Label><Input value={fromPath} onChange={(e) => setFromPath(e.target.value)} dir="ltr" /></div><div><Label>toPath</Label><Input value={toPath} onChange={(e) => setToPath(e.target.value)} dir="ltr" /></div><div><Label>code</Label><Input value={statusCode} onChange={(e) => setStatusCode(e.target.value)} dir="ltr" /></div></div><div className="admin-dialog-footer"><Button className="primary" onClick={createRedirect}>افزودن</Button></div></Card>
    <Card><div className="admin-card-header"><h2>404 Monitor</h2></div><div className="admin-table-wrap"><table className="admin-table"><thead><tr><th>path</th><th>hits</th><th>resolved</th></tr></thead><tbody>{notFound.map((n) => <tr key={n.id}><td dir="ltr">{n.path}</td><td>{n.hitCount}</td><td>{n.resolved ? 'yes' : 'no'}</td></tr>)}</tbody></table></div></Card>
    <Card><div className="admin-card-header"><h2>Redirects</h2></div><div className="admin-table-wrap"><table className="admin-table"><thead><tr><th>from</th><th>to</th><th>code</th></tr></thead><tbody>{redirects.map((r) => <tr key={r.id}><td dir="ltr">{r.fromPath}</td><td dir="ltr">{r.toPath || '-'}</td><td>{r.statusCode}</td></tr>)}</tbody></table></div></Card>
  </div>;
}
