import BlogHeader from '@/components/blog/BlogHeader';
import BlogPageClient from './BlogPageClient';
import { listEntity } from '@/lib/admin-store';
export const dynamic = 'force-dynamic';
export default async function BlogPage(){ const [posts,categories]=await Promise.all([listEntity('blog_posts','-created_date'), listEntity('blog_categories','-created_date')]); return <div className='min-h-screen bg-[#f5f6f8]'><BlogHeader title='بلاگ نوشه' /><BlogPageClient posts={posts.filter((p:any)=>p.status==='published'&&!p.deleted_at)} categories={categories} /></div>; }
