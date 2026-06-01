import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { getCachedSiteSettings, listCachedEntity } from '@/lib/public-data';
import { generateSeoMetadata } from '@/lib/seo/seo-core';

export const revalidate = 300;

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const [settings, pages] = await Promise.all([getCachedSiteSettings(), listCachedEntity('blog_pages', '-created_date').catch(() => [] as any[])]);
  const siteUrl = settings.site_url || process.env.NEXT_PUBLIC_SITE_URL;
  const siteName = settings.site_title || 'Noosheh';
  const page = pages.find((p: any) => p.slug === params.slug && p.status === 'published');
  if (!page) return generateSeoMetadata({ title: 'صفحه پیدا نشد', description: 'صفحه موردنظر یافت نشد.', path: `/pages/${params.slug}`, siteUrl, siteName, robots: { index: false, follow: false } });
  return generateSeoMetadata({
    title: page.seo_title || page.title,
    description: page.excerpt || settings.site_tagline || '',
    path: `/pages/${page.slug}`,
    siteUrl,
    siteName,
    robots: { index: page.status === 'published', follow: true }
  });
}

export default async function DynamicPage({ params }: { params: { slug: string } }) {
  const pages = await listCachedEntity('blog_pages', '-created_date').catch(() => [] as any[]);
  const page = pages.find((p:any)=>p.slug===params.slug && p.status==='published');
  if (!page) return notFound();
  return <article className='max-w-4xl mx-auto px-4 py-12' dir='rtl'><h1 className='text-3xl font-extrabold mb-6'>{page.title}</h1><div className='blog-content' dangerouslySetInnerHTML={{__html: page.content}} /></article>;
}
