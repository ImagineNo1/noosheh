'use client';

import Link from 'next/link';
import { useEntityList, formatDate } from '../_components/hooks';

export default function AdminBlogDashboard() {
  const { data: posts, isLoading } = useEntityList<any>('BlogPost', '-created_date');
  const { data: categories } = useEntityList<any>('BlogCategory');

  const publishedCount = posts.filter((p) => p.status === 'published').length;
  const draftCount = posts.filter((p) => p.status === 'draft').length;

  const stats = [
    { label: 'مقالات', value: posts.length, icon: '📝', color: 'bg-primary/10 text-primary' },
    { label: 'منتشر شده', value: publishedCount, icon: '👁', color: 'bg-green-50 text-green-600' },
    { label: 'پیش‌نویس', value: draftCount, icon: '💬', color: 'bg-amber-50 text-amber-600' },
    { label: 'دسته‌بندی‌ها', value: categories.length, icon: '📁', color: 'bg-blue-50 text-blue-600' }
  ];

  return (
    <div className='p-6 sm:p-8' dir='rtl'>
      <div className='flex items-center justify-between mb-8'>
        <div>
          <h1 className='text-2xl font-extrabold'>داشبورد بلاگ</h1>
          <p className='text-sm text-muted-foreground mt-1'>مدیریت تمام مقالات و محتوا</p>
        </div>
        <Link href='/admin/blog/new' className='px-4 py-2 rounded-lg bg-primary text-primary-foreground'>+ مقاله جدید</Link>
      </div>

      <div className='grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8'>
        {stats.map((stat) => (
          <div key={stat.label} className='bg-card rounded-2xl border border-border/60 p-5 flex items-center gap-4'>
            <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${stat.color}`}>{stat.icon}</div>
            <div><p className='text-2xl font-extrabold'>{stat.value}</p><p className='text-xs text-muted-foreground'>{stat.label}</p></div>
          </div>
        ))}
      </div>

      <div className='bg-card rounded-2xl border border-border/60 overflow-hidden'>
        <div className='p-5 border-b border-border/40'><h2 className='font-bold'>آخرین مقالات</h2></div>
        <table className='w-full text-sm'>
          <thead><tr className='bg-muted/30'><th className='text-right p-3'>عنوان</th><th className='text-right p-3'>دسته‌بندی</th><th className='text-right p-3'>وضعیت</th><th className='text-right p-3'>بازدید</th><th className='text-right p-3'>تاریخ</th><th className='text-right p-3'>عملیات</th></tr></thead>
          <tbody>
            {isLoading ? (
              <tr><td colSpan={6} className='p-8 text-center text-muted-foreground'>در حال بارگذاری...</td></tr>
            ) : posts.map((post) => (
              <tr key={post.id} className='hover:bg-muted/20 border-t'>
                <td className='p-3 font-medium max-w-[220px] truncate'>{post.title}</td>
                <td className='p-3'>{post.category ? <span className='text-xs bg-secondary rounded-full px-2 py-1'>{post.category}</span> : <span className='text-muted-foreground text-xs'>—</span>}</td>
                <td className='p-3'><span className={`text-xs rounded-full px-2 py-1 ${post.status === 'published' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-amber-50 text-amber-700 border border-amber-200'}`}>{post.status === 'published' ? 'منتشر شده' : 'پیش‌نویس'}</span></td>
                <td className='p-3'>{post.view_count || 0}</td>
                <td className='p-3 text-muted-foreground'>{formatDate(post.created_date)}</td>
                <td className='p-3'><div className='flex items-center gap-1'><Link href={`/admin/blog/edit/${post.id}`} className='h-8 px-2 rounded hover:bg-secondary'>✎</Link><Link href={`/blog/${post.slug || post.id}`} target='_blank' className='h-8 px-2 rounded hover:bg-secondary'>👁</Link></div></td>
              </tr>
            ))}
          </tbody>
        </table>
        {!isLoading && posts.length === 0 && <div className='text-center py-12 text-muted-foreground'>هنوز مقاله‌ای ایجاد نشده</div>}
      </div>
    </div>
  );
}
