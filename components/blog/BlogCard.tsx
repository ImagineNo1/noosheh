import Link from "next/link";
import { BlogPost } from "@/lib/blog-data";

export default function BlogCard({ post }: { post: BlogPost }) {
  const formattedDate = new Date(post.createdDate).toLocaleDateString("fa-IR");

  return (
    <Link href={`/blog/${post.slug}`} className="block group">
      <div className="bg-white rounded-2xl overflow-hidden border border-slate-200 hover:border-emerald-300 transition-all hover:shadow-lg">
        <div className="aspect-[16/9] bg-slate-100 flex items-center justify-center text-4xl">📝</div>
        <div className="p-5" dir="rtl">
          <span className="inline-block mb-3 text-xs bg-slate-100 px-2 py-1 rounded-full">{post.category}</span>
          <h3 className="font-bold text-lg mb-2 group-hover:text-emerald-700 line-clamp-2">{post.title}</h3>
          <p className="text-slate-600 text-sm line-clamp-2 mb-4">{post.excerpt}</p>
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>{formattedDate}</span><span>{post.viewCount} بازدید</span>
          </div>
        </div>
      </div>
    </Link>
  );
}
