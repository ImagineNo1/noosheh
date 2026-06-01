import BlogHeader from '@/components/blog/BlogHeader';
import BlogPageClient from './BlogPageClient';
import type { Metadata } from 'next';
import { getCachedSiteSettings, listCachedEntity } from '@/lib/public-data';
import { generateSeoMetadata } from '@/lib/seo/seo-core';
export const revalidate = 300;

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getCachedSiteSettings();
  const siteUrl = settings.site_url || process.env.NEXT_PUBLIC_SITE_URL;
  const siteName = settings.site_title || 'Noosheh';
  return generateSeoMetadata({
    title: `بلاگ ${siteName}`,
    description: settings.site_tagline || 'آخرین مقالات، راهنماها و نکات تخصصی فروشگاه.',
    path: '/blog',
    siteUrl,
    siteName
  });
}
export default async function BlogPage(){ const [posts,categories]=await Promise.all([listCachedEntity('blog_posts','-created_date').catch(() => [] as any[]), listCachedEntity('blog_categories','-created_date').catch(() => [] as any[])]); return <div className='min-h-screen bg-[#f5f6f8]'><BlogHeader title='بلاگ نوشه' /><BlogPageClient posts={posts.filter((p:any)=>p.status==='published'&&!p.deleted_at)} categories={categories} /></div>; }
