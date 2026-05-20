import Link from 'next/link';
import { listEntity } from '@/lib/admin-store';
import BlogHeader from '@/components/blog/BlogHeader';
import BlogCard from '@/components/blog/BlogCard';
import type { Metadata } from 'next';
import { getSiteSettings } from '@/lib/site-settings';
import { generateSeoMetadata } from '@/lib/seo/seo-core';
import JsonLd from '@/components/seo/JsonLd';
import { breadcrumbSchema, collectionPageSchema, itemListSchema } from '@/lib/seo/schema';

export const dynamic = 'force-dynamic';


export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const settings = await getSiteSettings();
  const siteUrl = settings.site_url || process.env.NEXT_PUBLIC_SITE_URL || 'https://example.com';
  const siteName = settings.site_title || 'Noosheh';
  return generateSeoMetadata({ title: `برچسب ${params.slug}`, description: `آرشیو مقالات با برچسب ${params.slug} در ${siteName}` , path: `/blog/tag/${params.slug}`, siteUrl, siteName });
}

export default async function TagArchive({ params }: { params: { slug: string } }) {
  const [settings, posts] = await Promise.all([getSiteSettings(), listEntity('blog_posts', '-created_date')]);
  const rows = posts.filter((p: any) => p.status === 'published' && (p.tags || []).some((t: string) => t.replace(/\s+/g, '-').toLowerCase() === params.slug));
  const siteUrl = settings.site_url || process.env.NEXT_PUBLIC_SITE_URL || 'https://example.com';
  return <div className='min-h-screen bg-background'>
    <JsonLd id={`schema-collection-tag-${params.slug}`} data={collectionPageSchema({ siteUrl, name: `برچسب ${params.slug}`, path: `/blog/tag/${params.slug}` })} />
    <JsonLd id={`schema-breadcrumb-tag-${params.slug}`} data={breadcrumbSchema({ siteUrl, items: [{ name: 'خانه', path: '/' }, { name: 'بلاگ', path: '/blog' }, { name: params.slug, path: `/blog/tag/${params.slug}` }] })} />
    <JsonLd id={`schema-itemlist-tag-${params.slug}`} data={itemListSchema({ siteUrl, name: `فهرست مقالات ${params.slug}`, path: `/blog/tag/${params.slug}`, items: rows.slice(0, 20).map((p: any) => ({ name: p.title || p.slug, path: `/blog/${p.slug || p.id}` })) })} />
    <BlogHeader title={`برچسب: ${params.slug}`} breadcrumbs={[{ label: params.slug }]} /><div className='max-w-7xl mx-auto px-4 py-8'>{rows.length===0?<div className='text-center py-20'>مقاله‌ای با این برچسب نیست.</div>:<div className='grid grid-cols-1 sm:grid-cols-2 gap-6'>{rows.map((p:any,i:number)=><BlogCard key={p.id} post={p} />)}</div>}<div className='mt-8'><Link href='/blog' className='text-primary'>بازگشت به بلاگ</Link></div></div></div>;
}
