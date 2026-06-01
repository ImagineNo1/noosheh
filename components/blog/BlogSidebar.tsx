'use client';
import Link from 'next/link';
import { formatBlogDate } from './blog-utils';

export default function BlogSidebar({ categories = [], recentPosts = [], tags = [], postCount = 0, searchQuery, onSearchChange, selectedCategory, onCategoryChange }: any) {
  return (
    <div className="space-y-5" dir="rtl">
      <section className="rounded-[1.35rem] border border-[#eaded5] bg-[#fffaf5]/95 p-5 shadow-[0_18px_55px_rgba(74,36,31,0.055)]">
        <p className="text-[11px] font-extrabold tracking-[0.2em] text-[#970f35]">جستجو در مجله</p>
        <label className="mt-4 block rounded-full border border-[#eaded5] bg-white px-4 py-3 transition focus-within:border-[#970f35]/50 focus-within:shadow-[0_0_0_4px_rgba(151,15,53,0.06)]">
          <input className="w-full bg-transparent text-sm text-[#4a241f] outline-none placeholder:text-[#aa958b]" placeholder="موضوع، راهنما یا ترند..." value={searchQuery} onChange={(event) => onSearchChange(event.target.value)} />
        </label>
      </section>

      <section className="rounded-[1.35rem] border border-[#eaded5] bg-[#fffaf5]/95 p-5 shadow-[0_18px_55px_rgba(74,36,31,0.055)]">
        <div className="mb-4 flex items-end justify-between gap-3">
          <h3 className="text-base font-black text-[#4a241f]">دسته‌بندی‌ها</h3>
          <span className="h-px flex-1 bg-[#eaded5]" />
        </div>
        <div className="space-y-2">
          <button onClick={() => onCategoryChange(null)} className={`flex w-full items-center justify-between rounded-full px-4 py-3 text-right text-sm font-extrabold transition ${!selectedCategory ? 'bg-[#970f35] text-white shadow-[0_14px_30px_rgba(151,15,53,0.18)]' : 'bg-white text-[#4a241f] hover:bg-[#f7ece5]'}`}>
            <span>همه مقاله‌ها</span><span>{postCount.toLocaleString('fa-IR')}</span>
          </button>
          {categories.map((category: any) => (
            <button key={category.id || category.name} onClick={() => onCategoryChange(category.name)} className={`flex w-full items-center justify-between rounded-full px-4 py-3 text-right text-sm font-bold transition ${selectedCategory === category.name ? 'bg-[#970f35] text-white shadow-[0_14px_30px_rgba(151,15,53,0.18)]' : 'bg-white text-[#4a241f] hover:bg-[#f7ece5]'}`}>
              <span>{category.name}</span><span>←</span>
            </button>
          ))}
        </div>
      </section>

      <section className="rounded-[1.35rem] border border-[#eaded5] bg-[#fffaf5]/95 p-5 shadow-[0_18px_55px_rgba(74,36,31,0.055)]">
        <div className="mb-5 flex items-end justify-between gap-3">
          <h3 className="text-base font-black text-[#4a241f]">محبوب‌ترین‌ها</h3>
          <span className="h-px flex-1 bg-[#eaded5]" />
        </div>
        <div className="space-y-4">
          {recentPosts.map((post: any, index: number) => (
            <Link href={`/blog/${post.slug}`} key={post.id || post.slug} className="group grid grid-cols-[2rem_1fr] gap-3 border-b border-[#eaded5] pb-4 last:border-0 last:pb-0">
              <span className="grid h-8 w-8 place-items-center rounded-full bg-[#f2ded5] text-sm font-black text-[#970f35]">{(index + 1).toLocaleString('fa-IR')}</span>
              <span>
                <span className="line-clamp-2 text-sm font-extrabold leading-7 text-[#4a241f] transition group-hover:text-[#970f35]">{post.title}</span>
                <span className="mt-1 block text-xs font-semibold text-[#8d7770]">{formatBlogDate(post.created_date)}</span>
              </span>
            </Link>
          ))}
          {recentPosts.length === 0 && <p className="text-sm leading-7 text-[#7d6660]">به‌زودی مقاله‌های محبوب اینجا نمایش داده می‌شوند.</p>}
        </div>
      </section>

      <section className="rounded-[1.35rem] border border-[#eaded5] bg-[#fffaf5]/95 p-5 shadow-[0_18px_55px_rgba(74,36,31,0.055)]">
        <div className="mb-4 flex items-end justify-between gap-3">
          <h3 className="text-base font-black text-[#4a241f]">برچسب‌های الهام‌بخش</h3>
          <span className="h-px flex-1 bg-[#eaded5]" />
        </div>
        <div className="flex flex-wrap gap-2">
          {tags.slice(0, 14).map((tag: string) => <span key={tag} className="rounded-full bg-[#f7ece5] px-3 py-2 text-xs font-bold text-[#970f35]">#{tag}</span>)}
          {tags.length === 0 && <span className="rounded-full bg-[#f7ece5] px-3 py-2 text-xs font-bold text-[#970f35]">#نوشه</span>}
        </div>
      </section>
    </div>
  );
}
