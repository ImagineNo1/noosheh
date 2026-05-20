import { notFound } from 'next/navigation';
import { listEntity } from '@/lib/admin-store';

export const dynamic = 'force-dynamic';

export default async function DynamicPage({ params }: { params: { slug: string } }) {
  const pages = await listEntity('blog_pages', '-created_date');
  const page = pages.find((p:any)=>p.slug===params.slug && p.status==='published');
  if (!page) return notFound();
  return <article className='max-w-4xl mx-auto px-4 py-12' dir='rtl'><h1 className='text-3xl font-extrabold mb-6'>{page.title}</h1><div className='blog-content' dangerouslySetInnerHTML={{__html: page.content}} /></article>;
}
