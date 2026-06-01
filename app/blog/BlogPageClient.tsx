'use client';
import Image from 'next/image';
import Link from 'next/link';
import { useMemo, useState } from 'react';
import BlogCard from '@/components/blog/BlogCard';
import BlogSidebar from '@/components/blog/BlogSidebar';
import { formatBlogDate, getBlogImage, getPostCategory, getReadingTime } from '@/components/blog/blog-utils';

function FeaturedArticle({ post, index = 0, large = false }: { post: any; index?: number; large?: boolean }) {
  const image = getBlogImage(post, index);
  return (
    <Link href={`/blog/${post.slug}`} className="group block h-full">
      <article className={`h-full overflow-hidden rounded-[2rem] border border-[#eaded5] bg-[#fffaf5] shadow-[0_24px_80px_rgba(74,36,31,0.09)] transition duration-500 hover:-translate-y-1 hover:shadow-[0_34px_95px_rgba(74,36,31,0.13)] ${large ? 'lg:grid lg:grid-cols-[1.08fr_0.92fr]' : ''}`} dir="rtl">
        <div className={`relative overflow-hidden bg-[#f2ded5] ${large ? 'aspect-[1.12/1] lg:aspect-auto lg:min-h-[34rem]' : 'aspect-[1.75/1] min-h-[14rem]'}`}>
          <Image src={image} alt={post.title || 'مقاله منتخب نوشه'} fill sizes={large ? '(min-width: 1024px) 50vw, 92vw' : '(min-width: 1024px) 31vw, 92vw'} className="object-cover transition duration-700 group-hover:scale-105" priority={large} />
          <div className="absolute inset-0 bg-gradient-to-t from-[#4a241f]/20 via-transparent to-transparent" />
          <span className="absolute right-5 top-5 rounded-full bg-[#fffaf5]/92 px-3 py-1 text-[11px] font-extrabold text-[#970f35] shadow-sm backdrop-blur">{getPostCategory(post)}</span>
        </div>
        <div className={`flex h-full flex-col justify-center p-6 ${large ? 'sm:p-9' : ''}`}>
          <div className="mb-4 flex flex-wrap items-center gap-3 text-xs font-bold text-[#7d6660]">
            <span>{formatBlogDate(post.created_date)}</span>
            <span className="h-1 w-1 rounded-full bg-[#d8c7bd]" />
            <span>{getReadingTime(post)}</span>
          </div>
          <h2 className={`${large ? 'text-3xl sm:text-4xl' : 'text-xl sm:text-2xl'} font-black leading-[1.65] text-[#4a241f] transition group-hover:text-[#970f35]`}>{post.title}</h2>
          <p className={`${large ? 'line-clamp-4' : 'line-clamp-2'} mt-4 text-sm leading-8 text-[#7d6660]`}>{post.excerpt || 'مقاله‌ای منتخب از تحریریه نوشه برای تجربه‌ای نزدیک‌تر به زیبایی، راحتی و انتخاب‌های زنانه.'}</p>
          <span className="mt-7 inline-flex w-fit items-center gap-2 border-b border-[#970f35]/35 pb-1 text-sm font-extrabold text-[#970f35]">مطالعه در مجله <span className="transition group-hover:-translate-x-1">←</span></span>
        </div>
      </article>
    </Link>
  );
}

function EmptyState() {
  return (
    <div className="rounded-[2rem] border border-[#eaded5] bg-[#fffaf5] p-10 text-center shadow-[0_18px_55px_rgba(74,36,31,0.055)]" dir="rtl">
      <p className="mx-auto mb-5 h-12 w-12 rounded-full bg-[#f2ded5]" />
      <h3 className="text-2xl font-black text-[#4a241f]">مقاله‌ای با این انتخاب پیدا نشد</h3>
      <p className="mx-auto mt-3 max-w-md text-sm leading-7 text-[#7d6660]">عبارت جستجو یا دسته‌بندی را تغییر دهید تا پیشنهادهای بیشتری از مجله نوشه ببینید.</p>
    </div>
  );
}

export default function BlogPageClient({ posts, categories }: { posts: any[]; categories: any[] }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const tags = useMemo(() => Array.from(new Set(posts.flatMap((post) => post.tags || []))), [posts]);
  const popularPosts = useMemo(() => [...posts].sort((a, b) => (b.view_count || 0) - (a.view_count || 0)).slice(0, 5), [posts]);
  const featuredPosts = useMemo(() => posts.slice(0, 3), [posts]);
  const filtered = useMemo(() => posts.filter((post) => (!searchQuery || post.title?.includes(searchQuery) || post.excerpt?.includes(searchQuery)) && (!selectedCategory || post.category === selectedCategory)), [posts, searchQuery, selectedCategory]);
  const shouldSeparateFeatured = featuredPosts.length >= 3 && filtered.length > 3 && !searchQuery && !selectedCategory;
  const latestPosts = filtered.slice(shouldSeparateFeatured ? 3 : 0);

  return (
    <div className="bg-[#fbf6f0] text-[#4a241f]">
      <section className="relative mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:py-20" dir="rtl">
        <div className="pointer-events-none absolute inset-x-4 top-10 h-72 rounded-[3rem] bg-[radial-gradient(circle_at_80%_20%,rgba(151,15,53,0.08),transparent_22rem),radial-gradient(circle_at_10%_70%,rgba(234,222,213,0.8),transparent_24rem)]" />
        <div className="relative">
          {featuredPosts.length > 0 && !searchQuery && !selectedCategory && (
            <div className="mb-20">
              <div className="mb-8 flex flex-col gap-3 text-center sm:items-center">
                <p className="text-xs font-extrabold tracking-[0.24em] text-[#970f35]">FEATURED STORIES</p>
                <h2 className="text-3xl font-black text-[#4a241f] sm:text-4xl">پرونده‌های منتخب نوشه</h2>
                <p className="max-w-xl text-sm leading-8 text-[#7d6660]">سه روایت تازه برای انتخاب آگاهانه‌تر؛ از ترندهای لباس زیر تا راهنماهای سایز و مراقبت.</p>
              </div>
              <div className="grid gap-5 lg:grid-cols-[1.35fr_0.85fr]">
                <FeaturedArticle post={featuredPosts[0]} index={0} large />
                <div className="grid gap-5">
                  {featuredPosts.slice(1, 3).map((post, index) => <FeaturedArticle key={post.id || post.slug} post={post} index={index + 1} />)}
                </div>
              </div>
            </div>
          )}

          <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_20rem] lg:items-start">
            <main>
              <div className="mb-8 flex flex-col gap-3 text-center sm:items-center lg:text-right lg:items-start">
                <p className="text-xs font-extrabold tracking-[0.24em] text-[#970f35]">LATEST ARTICLES</p>
                <div className="flex w-full flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                  <h2 className="text-3xl font-black text-[#4a241f] sm:text-4xl">آخرین مقاله‌ها</h2>
                  <p className="text-sm font-bold text-[#7d6660]">{filtered.length.toLocaleString('fa-IR')} مقاله</p>
                </div>
              </div>
              {latestPosts.length > 0 ? <div className="grid grid-cols-1 gap-7 sm:grid-cols-2 xl:grid-cols-3">{latestPosts.map((post, index) => <BlogCard key={post.id || post.slug} post={post} index={index + 3} />)}</div> : <EmptyState />}
            </main>
            <aside className="lg:sticky lg:top-8">
              <BlogSidebar categories={categories} recentPosts={popularPosts} tags={tags} postCount={posts.length} searchQuery={searchQuery} onSearchChange={setSearchQuery} selectedCategory={selectedCategory} onCategoryChange={setSelectedCategory} />
            </aside>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-16 sm:px-6 lg:pb-24" dir="rtl">
        <div className="relative overflow-hidden rounded-[2rem] border border-[#eaded5] bg-[#fffaf5] px-6 py-10 shadow-[0_28px_90px_rgba(74,36,31,0.10)] sm:px-10 lg:grid lg:grid-cols-[1fr_0.85fr] lg:items-center lg:gap-10">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_12%_20%,rgba(151,15,53,0.10),transparent_19rem),linear-gradient(90deg,#fffaf5,#fbf1ea)]" />
          <div className="relative">
            <p className="text-xs font-extrabold tracking-[0.24em] text-[#970f35]">NOOSHEH LETTER</p>
            <h2 className="mt-4 text-3xl font-black leading-[1.45] text-[#4a241f] sm:text-4xl">نامه‌ای آرام از دنیای زیبایی و راحتی</h2>
            <p className="mt-4 max-w-2xl text-sm leading-8 text-[#7d6660] sm:text-base">راهنماهای سایز، انتخاب‌های فصلی و داستان‌های الهام‌بخش نوشه را مثل یک مجله خصوصی در ایمیل خود دریافت کنید.</p>
          </div>
          <form className="relative mt-8 flex flex-col gap-3 rounded-full border border-[#eaded5] bg-white p-2 shadow-inner sm:flex-row lg:mt-0">
            <input className="min-h-12 flex-1 rounded-full bg-transparent px-4 text-sm text-[#4a241f] outline-none placeholder:text-[#aa958b]" placeholder="ایمیل شما" type="email" />
            <button className="min-h-12 rounded-full bg-[#970f35] px-6 text-sm font-black text-white transition hover:bg-[#7d0b2b]" type="button">عضویت در مجله</button>
          </form>
        </div>
      </section>

      <footer className="border-t border-[#eaded5] bg-[#fffaf5]" dir="rtl">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-8 text-sm text-[#7d6660] sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <div>
            <p className="text-lg font-black text-[#4a241f]">بلاگ نوشه</p>
            <p className="mt-1">مجله‌ای برای زیبایی، راحتی و اعتماد به نفس.</p>
          </div>
          <div className="flex gap-4 font-bold">
            <Link href="/" className="transition hover:text-[#970f35]">فروشگاه</Link>
            <Link href="/faq" className="transition hover:text-[#970f35]">راهنما</Link>
            <Link href="/contact" className="transition hover:text-[#970f35]">تماس</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
