export const dynamic = 'force-dynamic';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import BlogHeader from '@/components/blog/BlogHeader';
import { listEntity } from '@/lib/admin-store';

export default async function BlogPostPage({ params }: { params: { slug: string } }) {
  const posts = await listEntity('blog_posts', '-created_date');
  const post = posts.find((p: any) => p.slug === params.slug && p.status === 'published');
  if (!post) return notFound();
  const related = posts.filter((p: any) => p.category === post.category && p.slug !== post.slug).slice(0, 3);
  return (
    <div className="min-h-screen bg-[#f6f6f8]">
      <BlogHeader title={post.title} breadcrumbs={[{ label: post.title }]} />
      <article className="max-w-5xl mx-auto px-4 sm:px-6 py-8" dir="rtl">
        <div className="flex items-center justify-between text-sm text-slate-500 mb-5"><span>{new Date(post.created_date).toLocaleDateString('fa-IR')} • {post.view_count || 0} بازدید</span><span className="px-2 py-1 rounded-full bg-rose-100 text-rose-600 text-xs">{post.category}</span></div>
        {post.cover_image && <img src={post.cover_image} alt={post.title} className="w-full rounded-2xl mb-8 max-h-[520px] object-cover" />}
        <div className="prose prose-slate max-w-none" dangerouslySetInnerHTML={{ __html: post.content }} />
        <div className="mt-8"><Link href="/blog" className="text-rose-500">ادامه مطلب ←</Link></div>
        {related.length > 0 && <div className="mt-12"><h3 className="font-bold mb-4">مقالات مرتبط</h3><div className="grid sm:grid-cols-3 gap-4">{related.map((r:any)=><Link key={r.id} href={`/blog/${r.slug}`} className="p-3 bg-white border rounded-xl">{r.title}</Link>)}</div></div>}
      </article>
    </div>
  );
}
