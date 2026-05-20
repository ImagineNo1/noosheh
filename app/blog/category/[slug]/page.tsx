import Link from 'next/link';
import { listEntity } from '@/lib/admin-store';
import BlogHeader from '@/components/blog/BlogHeader';
import BlogCard from '@/components/blog/BlogCard';

export const dynamic = 'force-dynamic';

export default async function CategoryArchive({ params }: { params: { slug: string } }) {
  const [categories, posts] = await Promise.all([listEntity('blog_categories', '-created_date'), listEntity('blog_posts', '-created_date')]);
  const category = categories.find((c: any) => c.slug === params.slug);
  const rows = posts.filter((p: any) => p.status === 'published' && p.category === category?.name);
  return <div className='min-h-screen bg-background'><BlogHeader title={category?.name || 'دسته‌بندی'} breadcrumbs={[{ label: category?.name || params.slug }]} /><div className='max-w-7xl mx-auto px-4 py-8'>{rows.length===0?<div className='text-center py-20'>مقاله‌ای در این دسته‌بندی نیست.</div>:<div className='grid grid-cols-1 sm:grid-cols-2 gap-6'>{rows.map((p:any,i:number)=><BlogCard key={p.id} post={p} />)}</div>}<div className='mt-8'><Link href='/blog' className='text-primary'>بازگشت به بلاگ</Link></div></div></div>;
}
