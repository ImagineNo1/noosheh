import Link from 'next/link';

export default function BlogCard({ post }: { post: any }) {
  const d = post.created_date ? new Date(post.created_date).toLocaleDateString('fa-IR') : '—';
  return (
    <Link href={`/blog/${post.slug}`} className='block group'>
      <article className='bg-white rounded-2xl border border-slate-200 overflow-hidden hover:shadow-md transition'>
        <div className='aspect-[16/9] bg-slate-100 overflow-hidden'>{post.cover_image ? <img src={post.cover_image} alt={post.title} className='w-full h-full object-cover group-hover:scale-105 transition duration-500' /> : <div className='w-full h-full flex items-center justify-center text-3xl'>📝</div>}</div>
        <div className='p-5' dir='rtl'>
          {post.category && <span className='text-[11px] px-2 py-1 rounded-full bg-rose-50 text-rose-600'>{post.category}</span>}
          <h3 className='font-extrabold text-2xl mt-3 mb-2 line-clamp-2'>{post.title}</h3>
          <p className='text-slate-500 text-sm line-clamp-2 mb-4'>{post.excerpt}</p>
          <div className='flex justify-between items-center text-xs text-slate-500'>
            <span className='text-rose-500'>ادامه مطلب ←</span>
            <span>{post.view_count || 0} 👁 • {d} 📅</span>
          </div>
        </div>
      </article>
    </Link>
  );
}
