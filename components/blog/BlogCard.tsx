import Link from 'next/link';

export default function BlogCard({ post, index = 0 }: { post: any; index?: number }) {
  const formattedDate = post.created_date ? new Date(post.created_date).toLocaleDateString('fa-IR') : '';
  return (
    <Link href={`/blog/${post.slug}`} className="block group" style={{ animationDelay: `${index * 80}ms` }}>
      <div className="bg-card rounded-2xl overflow-hidden border border-border/60 hover:border-primary/30 transition-all duration-300 hover:shadow-lg hover:shadow-primary/5">
        <div className="aspect-[16/9] overflow-hidden bg-secondary">
          {post.cover_image ? <img src={post.cover_image} alt={post.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" /> : <div className="w-full h-full flex items-center justify-center text-2xl">📝</div>}
        </div>
        <div className="p-5" dir="rtl">
          {post.category && <span className="inline-block mb-3 text-xs font-medium bg-secondary px-2 py-1 rounded-full">{post.category}</span>}
          <h3 className="font-bold text-lg leading-relaxed mb-2 group-hover:text-primary transition-colors line-clamp-2">{post.title}</h3>
          {post.excerpt && <p className="text-muted-foreground text-sm leading-relaxed line-clamp-2 mb-4">{post.excerpt}</p>}
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1">📅{formattedDate}</span>
              <span className="flex items-center gap-1">👁{post.view_count || 0}</span>
            </div>
            <span className="flex items-center gap-1 text-primary font-medium">ادامه مطلب ←</span>
          </div>
        </div>
      </div>
    </Link>
  );
}
