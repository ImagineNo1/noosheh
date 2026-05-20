import BlogHeader from "@/components/blog/BlogHeader";
import BlogPageClient from "./BlogPageClient";
import { blogCategories, blogPosts } from "@/lib/blog-data";

export default function BlogPage() {
  return (
    <div className="min-h-screen bg-slate-50">
      <BlogHeader title="بلاگ نوشه" />
      <BlogPageClient posts={blogPosts} categories={blogCategories} />
    </div>
  );
}
