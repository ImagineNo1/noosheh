import Link from 'next/link';
import BlogHeader from '@/components/blog/BlogHeader';
import BlogCard from '@/components/blog/BlogCard';
import { safeDecodeURIComponent } from '@/lib/utils';
import type { Metadata } from 'next';
import { getCachedSiteSettings, listCachedEntity } from '@/lib/public-data';
import { generateSeoMetadata } from '@/lib/seo/seo-core';
import JsonLd from '@/components/seo/JsonLd';
import { breadcrumbSchema, collectionPageSchema, itemListSchema } from '@/lib/seo/schema';

export const revalidate = 300;

function authorNameFromSlug(slug: string) {
  return safeDecodeURIComponent(slug).replace(/-/g, ' ');
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const settings = await getCachedSiteSettings();
  const siteUrl = settings.site_url || process.env.NEXT_PUBLIC_SITE_URL;
  const siteName = settings.site_title || 'Noosheh';
  const authorName = authorNameFromSlug(params.slug);
  return generateSeoMetadata({
    title: `نویسنده ${authorName}`,
    description: `آرشیو مقالات ${authorName} در ${siteName}.`,
    path: `/blog/author/${params.slug}`,
    siteUrl,
    siteName
  });
}

export default async function AuthorArchive({ params }: { params: { slug: string } }) {
  const [settings, posts] = await Promise.all([getCachedSiteSettings(), listCachedEntity('blog_posts', '-created_date').catch(() => [] as any[])]);
  const authorName = authorNameFromSlug(params.slug);
  const siteUrl = settings.site_url || process.env.NEXT_PUBLIC_SITE_URL;
  const rows = posts.filter((p: any) => p.status === 'published' && (p.author_name || '').toLowerCase().replace(/\s+/g, '-') === params.slug);
  return <div className='min-h-screen bg-background'><JsonLd id={`schema-collection-author-${params.slug}`} data={collectionPageSchema({ siteUrl, name: `نویسنده ${authorName}`, path: `/blog/author/${params.slug}` })} /><JsonLd id={`schema-breadcrumb-author-${params.slug}`} data={breadcrumbSchema({ siteUrl, items: [{ name: 'خانه', path: '/' }, { name: 'بلاگ', path: '/blog' }, { name: authorName, path: `/blog/author/${params.slug}` }] })} /><JsonLd id={`schema-itemlist-author-${params.slug}`} data={itemListSchema({ siteUrl, name: `فهرست مقالات ${authorName}`, path: `/blog/author/${params.slug}`, items: rows.slice(0, 20).map((p: any) => ({ name: p.title || p.slug, path: `/blog/${p.slug || p.id}` })) })} /><BlogHeader title={`نویسنده: ${authorName}`} breadcrumbs={[{ label: authorName }]} /><div className='max-w-7xl mx-auto px-4 py-8'>{rows.length===0?<div className='text-center py-20'>مقاله‌ای برای این نویسنده نیست.</div>:<div className='grid grid-cols-1 sm:grid-cols-2 gap-6'>{rows.map((p:any,i:number)=><BlogCard key={p.id} post={p} />)}</div>}<div className='mt-8'><Link href='/blog' className='text-primary'>بازگشت به بلاگ</Link></div></div></div>;
}
