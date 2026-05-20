'use client';

import Link from 'next/link';
import { useEntityList, formatDate } from '../_components/hooks';

export default function AdminBlogDashboard() {
  const { data: posts, isLoading } = useEntityList<any>('BlogPost', '-created_date');
  const { data: categories } = useEntityList<any>('BlogCategory');

  const publishedCount = posts.filter((p) => p.status === 'published').length;
  const draftCount = posts.filter((p) => p.status === 'draft').length;

  const stats = [
    { label: 'مقالات', value: posts.length, icon: '🧾', color: 'bg-rose-100 text-rose-600' },
    { label: 'منتشر شده', value: publishedCount, icon: '👁', color: 'bg-emerald-100 text-emerald-600' },
    { label: 'پیش‌نویس', value: draftCount, icon: '💬', color: 'bg-amber-100 text-amber-600' },
    { label: 'دسته‌بندی‌ها', value: categories.length, icon: '🗂', color: 'bg-blue-100 text-blue-600' }
  ];

  return (
    <div className='p-6 sm:p-8' dir='rtl'>
      <div className='flex items-center justify-between mb-8'>
        <div>
          <h1 className='text-3xl font-extrabold'>داشبورد بلاگ</h1>
          <p className='text-sm text-muted-foreground mt-1'>مدیریت تمام مقالات و محتوا</p>
        </div>
        <Link href='/admin/blog/new' className='px-4 py-2 rounded-xl bg-rose-500 hover:bg-rose-600 text-white font-semibold'>+ مقاله جدید</Link>
      </div>

      <div className='grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8'>
        {stats.map((stat) => (
          <div key={stat.label} className='bg-card rounded-2xl border border-border/60 p-5 flex items-center justify-between'>
            <div>
              <p className='text-3xl font-extrabold'>{stat.value}</p>
              <p className='text-xs text-muted-foreground mt-1'>{stat.label}</p>
            </div>
            <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${stat.color}`}>{stat.icon}</div>
          </div>
        ))}
      </div>

      <div className='bg-card rounded-2xl border border-border/60 overflow-hidden'>
        <div className='p-5 border-b border-border/40'><h2 className='font-bold text-lg'>آخرین مقالات</h2></div>
        <table className='w-full text-sm'>
          <thead><tr className='bg-muted/30'><th className='text-right p-3'>عنوان</th><th className='text-right p-3'>دسته‌بندی</th><th className='text-right p-3'>وضعیت</th><th className='text-right p-3'>بازدید</th><th className='text-right p-3'>تاریخ</th><th className='text-right p-3'>عملیات</th></tr></thead>
          <tbody>
            {isLoading ? (
              <tr><td colSpan={6} className='p-8 text-center text-muted-foreground'>در حال بارگذاری...</td></tr>
            ) : posts.map((post) => (
              <tr key={post.id} className='hover:bg-muted/20 border-t'>
                <td className='p-3 font-medium max-w-[260px] truncate'>{post.title}</td>
                <td className='p-3'>{post.category ? <span className='text-xs bg-rose-50 text-rose-600 rounded-full px-2 py-1'>{post.category}</span> : <span className='text-muted-foreground text-xs'>—</span>}</td>
                <td className='p-3'><span className={`text-xs rounded-full px-2 py-1 border ${post.status === 'published' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-amber-50 text-amber-700 border-amber-200'}`}>{post.status === 'published' ? 'منتشر شده' : 'پیش‌نویس'}</span></td>
                <td className='p-3'>{post.view_count || 0}</td>
                <td className='p-3 text-muted-foreground'>{formatDate(post.created_date)}</td>
                <td className='p-3'><div className='flex items-center gap-2'><Link href={`/admin/blog/edit/${post.id}`} className='text-slate-700'>✎</Link><Link href={`/blog/${post.slug || post.id}`} target='_blank' className='text-slate-700'>👁</Link></div></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
