import BlogHeader from '@/components/blog/BlogHeader';
import BlogPageClient from './BlogPageClient';
import { listEntity } from '@/lib/admin-store';
import type { Metadata } from 'next';
import { getSiteSettings } from '@/lib/site-settings';
import { generateSeoMetadata } from '@/lib/seo/seo-core';
export const dynamic = 'force-dynamic';

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSiteSettings();
  const siteUrl = settings.site_url || process.env.NEXT_PUBLIC_SITE_URL || 'https://example.com';
  const siteName = settings.site_title || 'Noosheh';
  return generateSeoMetadata({
    title: `بلاگ ${siteName}`,
    description: settings.site_tagline || 'آخرین مقالات، راهنماها و نکات تخصصی فروشگاه.',
    path: '/blog',
    siteUrl,
    siteName
  });
}
export default async function BlogPage(){ const [posts,categories]=await Promise.all([listEntity('blog_posts','-created_date'), listEntity('blog_categories','-created_date')]); return <div className='min-h-screen bg-[#f5f6f8]'><BlogHeader title='بلاگ نوشه' /><BlogPageClient posts={posts.filter((p:any)=>p.status==='published'&&!p.deleted_at)} categories={categories} /></div>; }
