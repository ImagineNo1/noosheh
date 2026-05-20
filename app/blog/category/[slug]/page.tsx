import Link from 'next/link';
import { listEntity } from '@/lib/admin-store';
import BlogHeader from '@/components/blog/BlogHeader';
import BlogCard from '@/components/blog/BlogCard';
import type { Metadata } from 'next';
import { getSiteSettings } from '@/lib/site-settings';
import { generateSeoMetadata } from '@/lib/seo/seo-core';
import JsonLd from '@/components/seo/JsonLd';
import { breadcrumbSchema, collectionPageSchema } from '@/lib/seo/schema';

export const dynamic = 'force-dynamic';


export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const [settings, categories] = await Promise.all([getSiteSettings(), listEntity('blog_categories', '-created_date')]);
  const siteUrl = settings.site_url || process.env.NEXT_PUBLIC_SITE_URL || 'https://example.com';
  const siteName = settings.site_title || 'Noosheh';
  const category = categories.find((c: any) => c.slug === params.slug);
  const categoryName = category?.name || params.slug;
  return generateSeoMetadata({ title: `دسته‌بندی ${categoryName}`, description: `آرشیو مقالات دسته‌بندی ${categoryName} در ${siteName}` , path: `/blog/category/${params.slug}`, siteUrl, siteName });
}

export default async function CategoryArchive({ params }: { params: { slug: string } }) {
  const [settings, categories, posts] = await Promise.all([getSiteSettings(), listEntity('blog_categories', '-created_date'), listEntity('blog_posts', '-created_date')]);
  const category = categories.find((c: any) => c.slug === params.slug);
  const rows = posts.filter((p: any) => p.status === 'published' && p.category === category?.name);
  const siteUrl = settings.site_url || process.env.NEXT_PUBLIC_SITE_URL || 'https://example.com';
  return <div className='min-h-screen bg-background'><JsonLd id={`schema-collection-${params.slug}`} data={collectionPageSchema({ siteUrl, name: category?.name || 'دسته‌بندی بلاگ', path: `/blog/category/${params.slug}` })} /><JsonLd id={`schema-breadcrumb-category-${params.slug}`} data={breadcrumbSchema({ siteUrl, items: [{ name: 'خانه', path: '/' }, { name: 'بلاگ', path: '/blog' }, { name: category?.name || params.slug, path: `/blog/category/${params.slug}` }] })} /><BlogHeader title={category?.name || 'دسته‌بندی'} breadcrumbs={[{ label: category?.name || params.slug }]} /><div className='max-w-7xl mx-auto px-4 py-8'>{rows.length===0?<div className='text-center py-20'>مقاله‌ای در این دسته‌بندی نیست.</div>:<div className='grid grid-cols-1 sm:grid-cols-2 gap-6'>{rows.map((p:any,i:number)=><BlogCard key={p.id} post={p} />)}</div>}<div className='mt-8'><Link href='/blog' className='text-primary'>بازگشت به بلاگ</Link></div></div></div>;
}
