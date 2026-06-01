import Image from 'next/image';
import Link from 'next/link';
import { formatBlogDate, getBlogImage, getPostCategory, getReadingTime } from './blog-utils';

export default function BlogCard({ post, index = 0 }: { post: any; index?: number }) {
  const image = getBlogImage(post, index);
  return (
    <Link href={`/blog/${post.slug}`} className="group block h-full">
      <article className="flex h-full flex-col overflow-hidden rounded-[1.75rem] border border-[#eaded5] bg-[#fffaf5] shadow-[0_18px_45px_rgba(74,36,31,0.05)] transition duration-500 hover:-translate-y-1 hover:shadow-[0_28px_70px_rgba(74,36,31,0.12)]" dir="rtl">
        <div className="relative aspect-[4/3] overflow-hidden bg-[#f2ded5]">
          <Image src={image} alt={post.title || 'مقاله نوشه'} fill sizes="(min-width: 1024px) 30vw, (min-width: 640px) 45vw, 92vw" className="object-cover transition duration-700 group-hover:scale-105" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#4a241f]/25 via-transparent to-transparent opacity-70" />
          <span className="absolute right-4 top-4 rounded-full bg-[#fffaf5]/90 px-3 py-1 text-[11px] font-bold text-[#970f35] backdrop-blur">{getPostCategory(post)}</span>
        </div>
        <div className="flex flex-1 flex-col p-5 sm:p-6">
          <div className="mb-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-[12px] font-semibold text-[#7d6660]">
            <span>{formatBlogDate(post.created_date)}</span>
            <span className="h-1 w-1 rounded-full bg-[#d8c7bd]" />
            <span>{getReadingTime(post)}</span>
          </div>
          <h3 className="line-clamp-2 text-xl font-black leading-[1.65] text-[#4a241f] transition group-hover:text-[#970f35] sm:text-2xl">{post.title}</h3>
          <p className="mt-3 line-clamp-3 text-sm leading-8 text-[#7d6660]">{post.excerpt || 'روایتی کوتاه از انتخاب‌های روزمره، راحتی و زیبایی در سبک زندگی نوشه.'}</p>
          <div className="mt-auto flex items-center justify-between pt-6 text-sm font-extrabold text-[#970f35]">
            <span>خواندن مقاله</span>
            <span className="transition group-hover:-translate-x-1">←</span>
          </div>
        </div>
      </article>
    </Link>
  );
}
