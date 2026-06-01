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
      <article className={`relative h-full overflow-hidden rounded-[2rem] bg-[#ead7ca] shadow-[0_24px_70px_rgba(74,36,31,0.10)] ${large ? 'min-h-[34rem]' : 'min-h-[16rem]'}`} dir="rtl">
        <Image src={image} alt={post.title || 'مقاله منتخب نوشه'} fill sizes={large ? '(min-width: 1024px) 58vw, 92vw' : '(min-width: 1024px) 28vw, 92vw'} className="object-cover transition duration-700 group-hover:scale-105" priority={large} />
        <div className="absolute inset-0 bg-gradient-to-t from-[#2d1613]/85 via-[#4a241f]/25 to-transparent" />
        <div className={`absolute inset-x-0 bottom-0 p-6 text-white ${large ? 'sm:p-9' : ''}`}>
          <div className="mb-4 flex flex-wrap items-center gap-3 text-xs font-bold text-white/85">
            <span className="rounded-full bg-[#fffaf5] px-3 py-1 text-[#970f35]">{getPostCategory(post)}</span>
            <span>{formatBlogDate(post.created_date)}</span>
            <span>{getReadingTime(post)}</span>
          </div>
          <h2 className={`${large ? 'text-3xl sm:text-4xl' : 'text-xl sm:text-2xl'} font-black leading-[1.55]`}>{post.title}</h2>
          {large && <p className="mt-4 max-w-xl text-sm leading-8 text-white/82 sm:text-base">{post.excerpt || 'مقاله‌ای منتخب از تحریریه نوشه برای تجربه‌ای نزدیک‌تر به زیبایی، راحتی و انتخاب‌های زنانه.'}</p>}
          <span className="mt-5 inline-flex items-center gap-2 text-sm font-extrabold text-white">مطالعه در مجله <span className="transition group-hover:-translate-x-1">←</span></span>
        </div>
      </article>
    </Link>
  );
}

function EmptyState() {
  return (
    <div className="rounded-[2rem] border border-dashed border-[#d8c7bd] bg-[#fffaf5] p-10 text-center" dir="rtl">
      <h3 className="text-2xl font-black text-[#4a241f]">مقاله‌ای با این فیلتر پیدا نشد</h3>
      <p className="mt-3 text-sm leading-7 text-[#7d6660]">عبارت جستجو یا دسته‌بندی را تغییر دهید تا پیشنهادهای بیشتری از مجله نوشه ببینید.</p>
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
      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:py-20" dir="rtl">
        {featuredPosts.length > 0 && !searchQuery && !selectedCategory && (
          <div className="mb-20">
            <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-xs font-extrabold tracking-[0.24em] text-[#970f35]">FEATURED STORIES</p>
                <h2 className="mt-3 text-3xl font-black text-[#4a241f] sm:text-4xl">پرونده‌های منتخب نوشه</h2>
              </div>
              <p className="max-w-md text-sm leading-8 text-[#7d6660]">سه روایت تازه برای انتخاب آگاهانه‌تر؛ از ترندهای لباس زیر تا راهنماهای سایز و مراقبت.</p>
            </div>
            <div className="grid gap-5 lg:grid-cols-[1.35fr_0.85fr]">
              <FeaturedArticle post={featuredPosts[0]} index={0} large />
              <div className="grid gap-5">
                {featuredPosts.slice(1, 3).map((post, index) => <FeaturedArticle key={post.id || post.slug} post={post} index={index + 1} />)}
              </div>
            </div>
          </div>
        )}

        <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_21rem] lg:items-start">
          <main>
            <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-xs font-extrabold tracking-[0.24em] text-[#970f35]">LATEST ARTICLES</p>
                <h2 className="mt-3 text-3xl font-black text-[#4a241f] sm:text-4xl">آخرین مقاله‌ها</h2>
              </div>
              <p className="text-sm font-bold text-[#7d6660]">{filtered.length.toLocaleString('fa-IR')} مقاله</p>
            </div>
            {latestPosts.length > 0 ? <div className="grid grid-cols-1 gap-7 sm:grid-cols-2 xl:grid-cols-3">{latestPosts.map((post, index) => <BlogCard key={post.id || post.slug} post={post} index={index + 3} />)}</div> : <EmptyState />}
          </main>
          <aside className="lg:sticky lg:top-8">
            <BlogSidebar categories={categories} recentPosts={popularPosts} tags={tags} searchQuery={searchQuery} onSearchChange={setSearchQuery} selectedCategory={selectedCategory} onCategoryChange={setSelectedCategory} />
          </aside>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-16 sm:px-6 lg:pb-24" dir="rtl">
        <div className="relative overflow-hidden rounded-[2rem] bg-[#7d0b2b] px-6 py-10 text-white shadow-[0_28px_80px_rgba(74,36,31,0.16)] sm:px-10 lg:grid lg:grid-cols-[1fr_0.85fr] lg:items-center lg:gap-10">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_10%_20%,rgba(255,255,255,0.18),transparent_18rem),linear-gradient(90deg,#7d0b2b,#970f35)]" />
          <div className="relative">
            <p className="text-xs font-extrabold tracking-[0.24em] text-white/70">NOOSHEH LETTER</p>
            <h2 className="mt-4 text-3xl font-black leading-[1.45] sm:text-4xl">نامه‌ای آرام از دنیای زیبایی و راحتی</h2>
            <p className="mt-4 max-w-2xl text-sm leading-8 text-white/78 sm:text-base">راهنماهای سایز، انتخاب‌های فصلی و داستان‌های الهام‌بخش نوشه را مثل یک مجله خصوصی در ایمیل خود دریافت کنید.</p>
          </div>
          <form className="relative mt-8 flex flex-col gap-3 rounded-[1.5rem] bg-[#fffaf5] p-3 sm:flex-row lg:mt-0">
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
