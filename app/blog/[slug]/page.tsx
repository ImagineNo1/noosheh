export const revalidate = 300;

import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import CommentsSection from '@/components/blog/CommentsSection';
import type { Metadata } from 'next';
import { getCachedSiteSettings, listCachedEntity } from '@/lib/public-data';
import { generateSeoMetadata } from '@/lib/seo/seo-core';
import JsonLd from '@/components/seo/JsonLd';
import { blogPostingSchema, breadcrumbSchema } from '@/lib/seo/schema';
import { formatBlogDate, getBlogImage, getPostCategory, getReadingTime } from '@/components/blog/blog-utils';

function stripHtml(value = '') {
  return value.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
}

function getHeadings(content = '') {
  return Array.from(content.matchAll(/<h([23])[^>]*>(.*?)<\/h\1>/gi)).slice(0, 6).map((match, index) => ({
    id: `section-${index + 1}`,
    level: Number(match[1]),
    text: stripHtml(match[2])
  }));
}

function contentWithHeadingIds(content = '') {
  let index = 0;
  return content.replace(/<h([23])([^>]*)>/gi, (match, level, attrs) => {
    if (/\sid=/.test(attrs)) return match;
    index += 1;
    return `<h${level}${attrs} id="section-${index}">`;
  });
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const [settings, posts] = await Promise.all([getCachedSiteSettings(), listCachedEntity('blog_posts', '-created_date').catch(() => [] as any[])]);
  const siteUrl = settings.site_url || process.env.NEXT_PUBLIC_SITE_URL;
  const siteName = settings.site_title || 'Noosheh';
  const post = posts.find((p: any) => p.slug === params.slug && p.status === 'published');
  if (!post) return generateSeoMetadata({ title: 'مقاله پیدا نشد', description: 'مقاله موردنظر یافت نشد.', path: `/blog/${params.slug}`, siteUrl, siteName, robots: { index: false, follow: false } });
  return generateSeoMetadata({
    title: post.seo_title || post.title,
    description: post.excerpt || post.seo_description || settings.site_tagline || '',
    path: `/blog/${post.slug}`,
    siteUrl,
    siteName,
    defaultOgImage: post.og_image || post.cover_image,
    og: { type: 'article', image: post.og_image || post.cover_image },
    twitter: { image: post.og_image || post.cover_image }
  });
}

export default async function BlogPostPage({ params }: { params: { slug: string } }) {
  const [settings, posts] = await Promise.all([getCachedSiteSettings(), listCachedEntity('blog_posts', '-created_date').catch(() => [] as any[])]);
  const post = posts.find((p: any) => p.slug === params.slug && p.status === 'published' && !p.deleted_at);
  if (!post) return notFound();

  const related = posts.filter((p: any) => p.status === 'published' && !p.deleted_at && p.category === post.category && p.slug !== post.slug).slice(0, 3);
  const fallbackRelated = posts.filter((p: any) => p.status === 'published' && !p.deleted_at && p.slug !== post.slug).slice(0, 3);
  const relatedPosts = related.length ? related : fallbackRelated;
  const siteUrl = settings.site_url || process.env.NEXT_PUBLIC_SITE_URL;
  const headings = getHeadings(post.content || '');
  const articleHtml = contentWithHeadingIds(post.content || '');
  const heroImage = getBlogImage(post, 0);
  const category = getPostCategory(post);
  const readingTime = getReadingTime(post);

  return (
    <div className="min-h-screen bg-[#fbf6f0] text-[#3a211d]">
      <JsonLd id={`schema-blogposting-${post.id}`} data={blogPostingSchema({ siteUrl, post })} />
      <JsonLd id={`schema-breadcrumb-blog-${post.id}`} data={breadcrumbSchema({ siteUrl, items: [{ name: 'خانه', path: '/' }, { name: 'بلاگ', path: '/blog' }, { name: post.title, path: `/blog/${post.slug}` }] })} />

      <article dir="rtl">
        <header className="relative overflow-hidden border-b border-[#eaded5] bg-[#fff8f3]">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_82%_14%,rgba(151,15,53,0.10),transparent_24rem),radial-gradient(circle_at_12%_72%,rgba(234,222,213,0.9),transparent_26rem),linear-gradient(180deg,#fffaf6_0%,#fbf1ea_100%)]" />
          <div className="relative mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:py-16">
            <nav className="flex flex-wrap items-center justify-center gap-2 text-xs font-bold text-[#7d6660] sm:justify-start">
              <Link href="/" className="hover:text-[#970f35]">خانه</Link><span className="text-[#cdb8ac]">‹</span>
              <Link href="/blog" className="hover:text-[#970f35]">مجله نوشه</Link><span className="text-[#cdb8ac]">‹</span>
              <span className="text-[#970f35]">{category}</span>
            </nav>
            <div className="mx-auto mt-10 max-w-4xl text-center">
              <span className="inline-flex rounded-full border border-[#eaded5] bg-white/80 px-4 py-2 text-xs font-black text-[#970f35] shadow-sm">{category}</span>
              <h1 className="mt-6 text-4xl font-black leading-[1.35] text-[#2d1b18] sm:text-5xl lg:text-6xl">{post.title}</h1>
              {post.excerpt && <p className="mx-auto mt-6 max-w-2xl text-base leading-9 text-[#7d6660] sm:text-lg">{post.excerpt}</p>}
              <div className="mt-7 flex flex-wrap items-center justify-center gap-3 text-xs font-bold text-[#6f5a54] sm:text-sm">
                <span>نویسنده: {post.author_name || 'تیم نوشه'}</span><span className="text-[#cdb8ac]">•</span>
                <span>{formatBlogDate(post.publish_at || post.created_date)}</span><span className="text-[#cdb8ac]">•</span>
                <span>{readingTime}</span><span className="text-[#cdb8ac]">•</span>
                <span>{Number(post.view_count || 0).toLocaleString('fa-IR')} بازدید</span>
              </div>
            </div>
          </div>
        </header>

        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:py-12">
          <div className="relative overflow-hidden rounded-[2rem] border border-[#eaded5] bg-[#f7eee8] shadow-[0_30px_90px_rgba(74,36,31,0.12)]">
            <Image src={heroImage} alt={post.title} width={1440} height={820} priority unoptimized className="h-[18rem] w-full object-cover sm:h-[30rem] lg:h-[40rem]" />
          </div>
        </div>

        <div className="mx-auto grid max-w-7xl gap-8 px-4 pb-16 sm:px-6 lg:grid-cols-[18rem_minmax(0,46rem)_18rem] lg:items-start lg:pb-24">
          <aside className="order-2 space-y-4 lg:order-1 lg:sticky lg:top-8">
            <div className="rounded-[1.5rem] border border-[#eaded5] bg-[#fffaf5] p-5 shadow-[0_18px_55px_rgba(74,36,31,0.06)]">
              <h2 className="text-lg font-black text-[#2d1b18]">فهرست مطالب</h2>
              {headings.length > 0 ? <ol className="mt-4 space-y-3 text-sm leading-7 text-[#6f5a54]">{headings.map((heading, index) => <li key={heading.id} className={heading.level === 3 ? 'pr-4' : ''}><a href={`#${heading.id}`} className="transition hover:text-[#970f35]">{(index + 1).toLocaleString('fa-IR')}. {heading.text}</a></li>)}</ol> : <p className="mt-3 text-sm leading-7 text-[#8c766d]">این مقاله تیتر میانی ندارد.</p>}
            </div>
            {relatedPosts.length > 0 && <div className="rounded-[1.5rem] border border-[#eaded5] bg-[#fffaf5] p-5 shadow-[0_18px_55px_rgba(74,36,31,0.06)]"><h2 className="text-lg font-black text-[#2d1b18]">مقالات مرتبط</h2><div className="mt-4 space-y-4">{relatedPosts.slice(0, 2).map((item: any, index: number) => <Link key={item.id || item.slug} href={`/blog/${item.slug}`} className="grid grid-cols-[4.5rem_1fr] gap-3"><Image src={getBlogImage(item, index + 1)} alt={item.title} width={120} height={92} unoptimized className="h-20 w-full rounded-xl object-cover" /><span><span className="block text-[11px] font-black text-[#970f35]">{getPostCategory(item)}</span><span className="mt-1 line-clamp-2 text-sm font-black leading-6 text-[#3a211d]">{item.title}</span><span className="mt-1 block text-xs text-[#9b857b]">{getReadingTime(item)}</span></span></Link>)}</div></div>}
          </aside>

          <main className="order-1 lg:order-2">
            <div className="rounded-[1.8rem] border border-[#eaded5] bg-[#fffdf9] px-5 py-8 shadow-[0_24px_70px_rgba(74,36,31,0.07)] sm:px-8 lg:px-10">
              <div className="max-w-none text-[1.05rem] leading-9 text-[#4a241f] [&_a]:font-bold [&_a]:text-[#970f35] [&_blockquote]:my-8 [&_blockquote]:rounded-2xl [&_blockquote]:border-r-4 [&_blockquote]:border-[#970f35] [&_blockquote]:bg-[#f8eee8] [&_blockquote]:p-5 [&_blockquote]:text-xl [&_blockquote]:font-bold [&_blockquote]:leading-10 [&_h2]:mb-4 [&_h2]:mt-12 [&_h2]:text-3xl [&_h2]:font-black [&_h2]:leading-[1.45] [&_h2]:text-[#2d1b18] [&_h3]:mb-3 [&_h3]:mt-9 [&_h3]:text-2xl [&_h3]:font-black [&_h3]:text-[#2d1b18] [&_li]:mb-2 [&_ol]:my-6 [&_ol]:list-decimal [&_ol]:pr-6 [&_p]:mb-6 [&_ul]:my-6 [&_ul]:list-disc [&_ul]:pr-6" dangerouslySetInnerHTML={{ __html: articleHtml }} />
            </div>

            <section className="mt-8 rounded-[1.8rem] border border-[#eaded5] bg-[#fffaf5] p-6 shadow-[0_18px_55px_rgba(74,36,31,0.06)]">
              <p className="text-xs font-black tracking-[0.2em] text-[#970f35]">AUTHOR</p>
              <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-center">
                <div className="grid h-16 w-16 place-items-center rounded-full bg-[#970f35] text-xl font-black text-white">ن</div>
                <div><h2 className="text-xl font-black text-[#2d1b18]">{post.author_name || 'تیم نویسندگان نوشه'}</h2><p className="mt-2 text-sm leading-7 text-[#7d6660]">روایت‌های تحریریه نوشه درباره انتخاب آگاهانه، راحتی روزمره و زیبایی مینیمال در دنیای لباس زیر زنانه.</p></div>
              </div>
            </section>

            <section className="mt-8 overflow-hidden rounded-[1.8rem] border border-[#eaded5] bg-[#fffaf5] p-6 shadow-[0_18px_55px_rgba(74,36,31,0.06)]">
              <div className="absolute" />
              <p className="text-xs font-black tracking-[0.2em] text-[#970f35]">NOOSHEH LETTER</p>
              <h2 className="mt-3 text-2xl font-black leading-[1.5] text-[#2d1b18]">عضویت در نامه خصوصی نوشه</h2>
              <p className="mt-2 text-sm leading-7 text-[#7d6660]">ترندها، راهنماهای سایز و مقاله‌های تازه را با لحنی آرام و مجله‌ای دریافت کنید.</p>
              <form className="mt-5 flex flex-col gap-3 rounded-full border border-[#eaded5] bg-white p-2 sm:flex-row">
                <input type="email" placeholder="ایمیل شما" className="min-h-12 flex-1 rounded-full bg-transparent px-4 text-sm outline-none placeholder:text-[#b09b92]" />
                <button type="button" className="min-h-12 rounded-full bg-[#970f35] px-6 text-sm font-black text-white hover:bg-[#7d0b2b]">عضویت</button>
              </form>
            </section>

            <CommentsSection postId={post.id} allowComments={post.allow_comments !== false} />
          </main>

          <aside className="order-3 hidden space-y-4 lg:block lg:sticky lg:top-8">
            <div className="rounded-[1.5rem] border border-[#eaded5] bg-[#fffaf5] p-5 text-sm leading-7 text-[#7d6660] shadow-[0_18px_55px_rgba(74,36,31,0.06)]">
              <p className="font-black text-[#2d1b18]">مجله نوشه</p>
              <p className="mt-2">تجربه‌ای الهام‌گرفته از ژورنال‌های مد برای خواندن آرام‌تر و انتخاب دقیق‌تر.</p>
            </div>
          </aside>
        </div>
      </article>
    </div>
  );
}
