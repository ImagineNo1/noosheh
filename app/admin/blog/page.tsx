'use client';
import Link from 'next/link';
import { useEntityList } from '../_components/hooks';
import type { BlogPost, BlogComment } from '../types';

export default function BlogDashboard() {
  const { data: posts } = useEntityList<BlogPost>('BlogPost', '-updated_date', 200);
  const { data: comments } = useEntityList<BlogComment>('BlogComment', '-created_date', 200);
  const published = posts.filter((p) => p.status === 'published').length;
  const drafts = posts.filter((p) => p.status === 'draft').length;
  const pending = comments.filter((c) => c.status === 'pending').length;
  return <div className='admin-page'><h1 className='admin-title mb-4'>داشبورد بلاگ</h1><div className='admin-grid cards-3'>{[['کل مقالات',posts.length],['منتشرشده',published],['پیش‌نویس',drafts],['کامنت معلق',pending]].map(([l,v])=><div key={String(l)} className='admin-card p-4'><div className='text-sm text-muted-foreground'>{l}</div><div className='text-2xl font-bold'>{v}</div></div>)}</div><div className='mt-6 flex gap-3'><Link href='/admin/blog/posts' className='admin-btn'>پست‌ها</Link><Link href='/admin/blog/categories' className='admin-btn'>دسته‌ها</Link><Link href='/admin/blog/comments' className='admin-btn'>کامنت‌ها</Link></div></div>;
}
