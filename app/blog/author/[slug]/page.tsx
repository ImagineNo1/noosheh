import Link from 'next/link';
import { listEntity } from '@/lib/admin-store';
import BlogHeader from '@/components/blog/BlogHeader';
import BlogCard from '@/components/blog/BlogCard';
import { safeDecodeURIComponent } from '@/lib/utils';

export const dynamic = 'force-dynamic';

export default async function AuthorArchive({ params }: { params: { slug: string } }) {
  const posts = await listEntity('blog_posts', '-created_date');
  const authorName = safeDecodeURIComponent(params.slug).replace(/-/g, ' ');
  const rows = posts.filter((p: any) => p.status === 'published' && (p.author_name || '').toLowerCase().replace(/\s+/g, '-') === params.slug);
  return <div className='min-h-screen bg-background'><BlogHeader title={`نویسنده: ${authorName}`} breadcrumbs={[{ label: authorName }]} /><div className='max-w-7xl mx-auto px-4 py-8'>{rows.length===0?<div className='text-center py-20'>مقاله‌ای برای این نویسنده نیست.</div>:<div className='grid grid-cols-1 sm:grid-cols-2 gap-6'>{rows.map((p:any,i:number)=><BlogCard key={p.id} post={p} />)}</div>}<div className='mt-8'><Link href='/blog' className='text-primary'>بازگشت به بلاگ</Link></div></div></div>;
}
