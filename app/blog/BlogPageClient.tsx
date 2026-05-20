"use client";

import { useMemo, useState } from "react";
import BlogCard from "@/components/blog/BlogCard";
import BlogSidebar from "@/components/blog/BlogSidebar";
import type { BlogPost } from "@/lib/blog-data";

export default function BlogPageClient({ posts, categories }: { posts: BlogPost[]; categories: string[] }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const tags = useMemo(() => Array.from(new Set(posts.flatMap((p) => p.tags))), [posts]);
  const popularPosts = useMemo(() => [...posts].sort((a, b) => b.viewCount - a.viewCount).slice(0, 5), [posts]);
  const filteredPosts = useMemo(() => posts.filter((post) => {
    const q = searchQuery.trim();
    const matchesSearch = !q || post.title.includes(q) || post.excerpt.includes(q);
    const matchesCategory = !selectedCategory || post.category === selectedCategory;
    return matchesSearch && matchesCategory;
  }), [posts, searchQuery, selectedCategory]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      <div className="flex flex-col lg:flex-row-reverse gap-8">
        <aside className="w-full lg:w-72"><BlogSidebar categories={categories} popularTitles={popularPosts.map(({slug,title})=>({slug,title}))} tags={tags} searchQuery={searchQuery} onSearchChange={setSearchQuery} selectedCategory={selectedCategory} onCategoryChange={setSelectedCategory} /></aside>
        <main className="flex-1">
          {filteredPosts.length === 0 ? <div className="text-center py-20" dir="rtl">مقاله‌ای یافت نشد.</div> : <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">{filteredPosts.map((post)=><BlogCard key={post.id} post={post} />)}</div>}
        </main>
      </div>
    </div>
  );
}
