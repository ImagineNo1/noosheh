'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';

const pageSize = 8;
const fallbackImage = '/store/noosheh-hero-editorial.png';

type BlogPost = {
  id: string;
  title?: string;
  slug?: string;
  excerpt?: string;
  category?: string;
  author_name?: string;
  status?: string;
  view_count?: number;
  cover_image?: string;
  created_date?: string;
  updated_date?: string;
  publish_at?: string;
};

type PostsResponse = {
  items?: BlogPost[];
  total?: number;
  page?: number;
  pageSize?: number;
};

function getToken() {
  return typeof window === 'undefined' ? '' : localStorage.getItem('noosheh-admin-token') || '';
}

function formatDate(value?: string) {
  if (!value) return '—';
  return new Date(value).toLocaleDateString('fa-IR', { year: 'numeric', month: '2-digit', day: '2-digit' });
}

function statusLabel(status?: string) {
  if (status === 'published') return 'منتشر شده';
  if (status === 'archived') return 'بایگانی';
  return 'پیش‌نویس';
}

function statusClass(status?: string) {
  if (status === 'published') return 'border-emerald-200 bg-emerald-50 text-emerald-700';
  if (status === 'archived') return 'border-stone-200 bg-stone-100 text-stone-600';
  return 'border-amber-200 bg-amber-50 text-amber-700';
}

function StatCard({ label, value, detail, icon }: { label: string; value: string | number; detail: string; icon: string }) {
  return (
    <div className="rounded-[1.4rem] border border-[#eaded5] bg-white/80 p-4 shadow-[0_18px_55px_rgba(74,36,31,0.06)] backdrop-blur">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-2xl font-black text-[#2d1b18]">{value}</p>
          <p className="mt-1 text-xs font-bold text-[#6f5a54]">{label}</p>
          <p className="mt-2 text-[11px] text-[#a08a80]">{detail}</p>
        </div>
        <span className="grid h-12 w-12 place-items-center rounded-2xl bg-[#970f35]/10 text-lg text-[#970f35]">{icon}</span>
      </div>
    </div>
  );
}

export default function PostsPage() {
  const [rows, setRows] = useState<BlogPost[]>([]);
  const [total, setTotal] = useState(0);
  const [q, setQ] = useState('');
  const [status, setStatus] = useState('');
  const [category, setCategory] = useState('');
  const [author, setAuthor] = useState('');
  const [publishDate, setPublishDate] = useState('');
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);

  const load = async (targetPage = page, filters = { q, status, category, author, publishDate }) => {
    setLoading(true);
    const params = new URLSearchParams({ page: String(targetPage), pageSize: String(pageSize), sort: '-created_date' });
    if (filters.q) params.set('q', filters.q);
    if (filters.status) params.set('status', filters.status);
    if (filters.category) params.set('category', filters.category);
    if (filters.author) params.set('author', filters.author);
    const res = await fetch(`/api/admin/blog/posts?${params.toString()}`, { headers: { Authorization: `Bearer ${getToken()}` } });
    const data = (await res.json()) as PostsResponse;
    const items = data.items || [];
    const dateFiltered = filters.publishDate ? items.filter((item) => (item.publish_at || item.created_date || '').startsWith(filters.publishDate)) : items;
    setRows(dateFiltered);
    setTotal(filters.publishDate ? dateFiltered.length : data.total || 0);
    setPage(targetPage);
    setLoading(false);
  };

  useEffect(() => { load(1); }, []);

  const facets = useMemo(() => {
    const categories = Array.from(new Set(rows.map((r) => r.category).filter(Boolean))) as string[];
    const authors = Array.from(new Set(rows.map((r) => r.author_name).filter(Boolean))) as string[];
    return { categories, authors };
  }, [rows]);

  const stats = useMemo(() => ({
    total,
    published: rows.filter((r) => r.status === 'published').length,
    draft: rows.filter((r) => r.status === 'draft').length,
    views: rows.reduce((sum, row) => sum + Number(row.view_count || 0), 0)
  }), [rows, total]);

  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  const doDelete = async (id: string) => {
    if (!window.confirm('این مقاله حذف شود؟')) return;
    await fetch(`/api/admin/blog/posts/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${getToken()}` } });
    load(page);
  };

  const clearFilters = () => {
    setQ('');
    setStatus('');
    setCategory('');
    setAuthor('');
    setPublishDate('');
    load(1, { q: '', status: '', category: '', author: '', publishDate: '' });
  };

  return (
    <div className="min-h-[calc(100vh-7rem)] rounded-[2rem] bg-[#fbf6f0] p-4 text-[#3a211d] sm:p-6" dir="rtl">
      <div className="relative overflow-hidden rounded-[2rem] border border-[#eaded5] bg-[#fffaf5] p-6 shadow-[0_28px_80px_rgba(74,36,31,0.08)]">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_16%_18%,rgba(151,15,53,0.10),transparent_18rem),radial-gradient(circle_at_86%_8%,rgba(234,222,213,0.75),transparent_20rem)]" />
        <div className="relative flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <span className="inline-flex rounded-full border border-[#eaded5] bg-white/70 px-4 py-2 text-xs font-black tracking-[0.18em] text-[#970f35]">NOOSHEH EDITORIAL CMS</span>
            <h1 className="mt-5 text-3xl font-black text-[#2d1b18] sm:text-4xl">مدیریت مقالات بلاگ</h1>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-[#7d6660]">انتشار، زمان‌بندی و کنترل محتوای مجله نوشه با تجربه‌ای تمیز، فارسی و مناسب یک برند مد لوکس.</p>
          </div>
          <div className="flex flex-col items-start gap-3 sm:flex-row sm:items-center">
            <div className="rounded-2xl border border-[#eaded5] bg-white/70 px-5 py-3 text-sm font-bold text-[#4a241f] shadow-sm">
              <span className="text-[#970f35]">{total.toLocaleString('fa-IR')}</span> مقاله
            </div>
            <Link href="/admin/blog/new" className="rounded-2xl bg-[#970f35] px-5 py-3 text-sm font-black text-white shadow-[0_16px_35px_rgba(151,15,53,0.24)] transition hover:bg-[#7d0b2b]">+ مقاله جدید</Link>
          </div>
        </div>
      </div>

      <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="کل مقالات" value={stats.total.toLocaleString('fa-IR')} detail="تمام نوشته‌های ثبت‌شده" icon="□" />
        <StatCard label="منتشر شده" value={stats.published.toLocaleString('fa-IR')} detail="در همین صفحه" icon="✓" />
        <StatCard label="پیش‌نویس" value={stats.draft.toLocaleString('fa-IR')} detail="نیازمند تکمیل تحریریه" icon="✎" />
        <StatCard label="بازدید" value={stats.views.toLocaleString('fa-IR')} detail="مجموع نتایج فعلی" icon="◉" />
      </div>

      <div className="mt-5 rounded-[1.6rem] border border-[#eaded5] bg-white/80 p-4 shadow-[0_18px_55px_rgba(74,36,31,0.05)]">
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-6">
          <input className="h-12 rounded-2xl border border-[#eaded5] bg-[#fffaf5] px-4 text-sm outline-none transition placeholder:text-[#b09b92] focus:border-[#970f35] focus:ring-4 focus:ring-[#970f35]/10 xl:col-span-2" placeholder="جستجو در عنوان یا خلاصه..." value={q} onChange={(e) => setQ(e.target.value)} />
          <select className="h-12 rounded-2xl border border-[#eaded5] bg-[#fffaf5] px-4 text-sm outline-none focus:border-[#970f35]" value={category} onChange={(e) => setCategory(e.target.value)}><option value="">همه دسته‌بندی‌ها</option>{facets.categories.map((item) => <option key={item} value={item}>{item}</option>)}</select>
          <select className="h-12 rounded-2xl border border-[#eaded5] bg-[#fffaf5] px-4 text-sm outline-none focus:border-[#970f35]" value={status} onChange={(e) => setStatus(e.target.value)}><option value="">همه وضعیت‌ها</option><option value="published">منتشر شده</option><option value="draft">پیش‌نویس</option><option value="archived">بایگانی</option></select>
          <select className="h-12 rounded-2xl border border-[#eaded5] bg-[#fffaf5] px-4 text-sm outline-none focus:border-[#970f35]" value={author} onChange={(e) => setAuthor(e.target.value)}><option value="">همه نویسندگان</option>{facets.authors.map((item) => <option key={item} value={item}>{item}</option>)}</select>
          <input className="h-12 rounded-2xl border border-[#eaded5] bg-[#fffaf5] px-4 text-sm outline-none focus:border-[#970f35]" type="date" value={publishDate} onChange={(e) => setPublishDate(e.target.value)} />
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          <button className="rounded-2xl bg-[#970f35] px-5 py-2.5 text-sm font-black text-white transition hover:bg-[#7d0b2b]" onClick={() => load(1)}>اعمال فیلتر</button>
          <button className="rounded-2xl border border-[#eaded5] bg-[#f7eee8] px-5 py-2.5 text-sm font-bold text-[#970f35] transition hover:bg-[#f1e3db]" onClick={clearFilters}>پاک کردن فیلترها</button>
        </div>
      </div>

      <div className="mt-5 overflow-hidden rounded-[1.6rem] border border-[#eaded5] bg-white/90 shadow-[0_24px_70px_rgba(74,36,31,0.07)]">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[980px] text-sm">
            <thead className="bg-[#fff7f1] text-xs font-black text-[#6f5a54]">
              <tr><th className="p-4 text-right">مقاله</th><th className="p-4 text-right">دسته‌بندی</th><th className="p-4 text-right">نویسنده</th><th className="p-4 text-right">بازدید</th><th className="p-4 text-right">وضعیت</th><th className="p-4 text-right">تاریخ انتشار</th><th className="p-4 text-right">عملیات</th></tr>
            </thead>
            <tbody>
              {loading ? Array.from({ length: 5 }).map((_, index) => (
                <tr key={index} className="border-t border-[#f0e4dc]"><td colSpan={7} className="p-4"><div className="h-14 animate-pulse rounded-2xl bg-[#f3e8e0]" /></td></tr>
              )) : rows.length === 0 ? (
                <tr><td colSpan={7} className="p-12 text-center"><div className="mx-auto max-w-sm"><div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-[#970f35]/10 text-[#970f35]">✦</div><h3 className="mt-4 text-lg font-black">مقاله‌ای پیدا نشد</h3><p className="mt-2 text-sm leading-7 text-[#7d6660]">فیلترها را تغییر دهید یا اولین مقاله مجله نوشه را ایجاد کنید.</p></div></td></tr>
              ) : rows.map((row, index) => (
                <tr key={row.id} className="border-t border-[#f0e4dc] transition hover:bg-[#fffaf5]">
                  <td className="p-4"><div className="flex items-center gap-3"><Image src={row.cover_image || fallbackImage} alt={row.title || 'مقاله نوشه'} width={74} height={54} unoptimized className="h-14 w-[74px] rounded-xl object-cover" /><div><p className="max-w-[320px] truncate font-black text-[#2d1b18]">{row.title || 'بدون عنوان'}</p><p className="mt-1 max-w-[320px] truncate text-xs text-[#9b857b]">{row.excerpt || `مقاله شماره ${(index + 1).toLocaleString('fa-IR')}`}</p></div></div></td>
                  <td className="p-4"><span className="rounded-full bg-[#f7e8ee] px-3 py-1 text-xs font-bold text-[#970f35]">{row.category || 'بدون دسته'}</span></td>
                  <td className="p-4 text-[#6f5a54]">{row.author_name || 'تیم نویسندگان'}</td>
                  <td className="p-4 font-bold text-[#4a241f]">{Number(row.view_count || 0).toLocaleString('fa-IR')}</td>
                  <td className="p-4"><span className={`rounded-full border px-3 py-1 text-xs font-black ${statusClass(row.status)}`}>{statusLabel(row.status)}</span></td>
                  <td className="p-4 text-[#6f5a54]">{formatDate(row.publish_at || row.created_date)}</td>
                  <td className="p-4"><div className="flex items-center gap-2"><Link href={`/blog/${row.slug || row.id}`} target="_blank" className="rounded-xl border border-[#eaded5] px-3 py-2 text-xs font-bold text-[#4a241f] hover:text-[#970f35]">مشاهده</Link><Link href={`/admin/blog/edit/${row.id}`} className="rounded-xl border border-[#eaded5] px-3 py-2 text-xs font-bold text-[#4a241f] hover:text-[#970f35]">ویرایش</Link><button onClick={() => doDelete(row.id)} className="rounded-xl bg-red-50 px-3 py-2 text-xs font-bold text-red-600 hover:bg-red-100">حذف</button></div></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="flex flex-col gap-3 border-t border-[#eaded5] bg-[#fffaf5] px-4 py-4 text-sm text-[#7d6660] sm:flex-row sm:items-center sm:justify-between">
          <span>نمایش صفحه {page.toLocaleString('fa-IR')} از {totalPages.toLocaleString('fa-IR')}</span>
          <div className="flex items-center gap-2"><button disabled={page <= 1} onClick={() => load(page - 1)} className="rounded-xl border border-[#eaded5] px-3 py-2 disabled:opacity-40">قبلی</button>{Array.from({ length: Math.min(totalPages, 4) }).map((_, index) => { const number = index + 1; return <button key={number} onClick={() => load(number)} className={`h-9 w-9 rounded-xl border text-sm font-bold ${page === number ? 'border-[#970f35] bg-[#970f35] text-white' : 'border-[#eaded5] bg-white text-[#4a241f]'}`}>{number.toLocaleString('fa-IR')}</button>; })}<button disabled={page >= totalPages} onClick={() => load(page + 1)} className="rounded-xl border border-[#eaded5] px-3 py-2 disabled:opacity-40">بعدی</button></div>
        </div>
      </div>
    </div>
  );
}
