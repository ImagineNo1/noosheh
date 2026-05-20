import Link from "next/link";
import { notFound } from "next/navigation";
import BlogHeader from "@/components/blog/BlogHeader";
import { blogPosts } from "@/lib/blog-data";

export default function BlogPostPage({ params }: { params: { slug: string } }) {
  const post = blogPosts.find((p) => p.slug === params.slug);
  if (!post) return notFound();
  const related = blogPosts.filter((p) => p.category === post.category && p.slug !== post.slug).slice(0, 3);

  return (
    <div className="min-h-screen bg-slate-50">
      <BlogHeader title={post.title} breadcrumbs={[{ label: post.title }]} />
      <article className="max-w-4xl mx-auto px-4 sm:px-6 py-8" dir="rtl">
        <div className="text-sm text-slate-500 mb-4">{new Date(post.createdDate).toLocaleDateString("fa-IR")} • {post.viewCount} بازدید</div>
        <h1 className="text-3xl font-extrabold mb-6">{post.title}</h1>
        <div className="prose prose-slate max-w-none" dangerouslySetInnerHTML={{ __html: post.content }} />
        <div className="mt-10"><Link href="/blog" className="text-emerald-700">← بازگشت به بلاگ</Link></div>
        {related.length > 0 && <div className="mt-12"><h3 className="font-bold mb-3">مقالات مرتبط</h3><div className="space-y-2">{related.map((r)=><Link key={r.id} href={`/blog/${r.slug}`} className="block hover:text-emerald-700">{r.title}</Link>)}</div></div>}
      </article>
    </div>
  );
}
