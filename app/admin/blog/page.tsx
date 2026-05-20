'use client';

import { useEntityList, formatDate } from '../_components/hooks';
import { Card } from '../_components/ui';

export default function AdminBlogPage() {
  const { data: posts } = useEntityList<any>('BlogPost', '-created_date');
  const { data: categories } = useEntityList<any>('BlogCategory');
  const published = posts.filter((p) => p.status === 'published').length;
  const draft = posts.filter((p) => p.status === 'draft').length;

  return (
    <div className="admin-page" dir="rtl">
      <div className="admin-page-header"><div><h1 className="admin-title">داشبورد بلاگ</h1><p className="admin-muted small">مدیریت مقالات و محتوا</p></div></div>
      <div className="admin-stats-grid">
        <Card><div className="admin-stat-card"><div><p>مقالات</p><strong>{posts.length.toLocaleString('fa-IR')}</strong></div><span className="admin-stat-icon pink">📝</span></div></Card>
        <Card><div className="admin-stat-card"><div><p>منتشر شده</p><strong>{published.toLocaleString('fa-IR')}</strong></div><span className="admin-stat-icon green">👁</span></div></Card>
        <Card><div className="admin-stat-card"><div><p>پیش‌نویس</p><strong>{draft.toLocaleString('fa-IR')}</strong></div><span className="admin-stat-icon orange">💬</span></div></Card>
        <Card><div className="admin-stat-card"><div><p>دسته‌بندی‌ها</p><strong>{categories.length.toLocaleString('fa-IR')}</strong></div><span className="admin-stat-icon blue">📁</span></div></Card>
      </div>
      <Card><div className="admin-card-header"><h2>آخرین مقالات</h2></div><div className="admin-table-wrap"><table className="admin-table"><thead><tr><th>عنوان</th><th>دسته‌بندی</th><th>وضعیت</th><th>بازدید</th><th>تاریخ</th></tr></thead><tbody>{posts.map((p)=><tr key={p.id}><td>{p.title}</td><td>{p.category || '—'}</td><td>{p.status==='published'?'منتشر شده':'پیش‌نویس'}</td><td>{(p.view_count || 0).toLocaleString('fa-IR')}</td><td>{formatDate(p.created_date)}</td></tr>)}</tbody></table></div></Card>
    </div>
  );
}
