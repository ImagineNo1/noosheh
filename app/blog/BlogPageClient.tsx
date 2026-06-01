'use client';
import { useMemo, useState } from 'react';
import BlogCard from '@/components/blog/BlogCard';
import BlogSidebar from '@/components/blog/BlogSidebar';

export default function BlogPageClient({ posts, categories }: { posts: any[]; categories: any[] }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const tags = useMemo(() => Array.from(new Set(posts.flatMap((p) => p.tags || []))), [posts]);
  const popularPosts = useMemo(() => [...posts].sort((a,b)=>(b.view_count||0)-(a.view_count||0)).slice(0, 5), [posts]);
  const filtered = useMemo(() => posts.filter((p) => (!searchQuery || p.title?.includes(searchQuery) || p.excerpt?.includes(searchQuery)) && (!selectedCategory || p.category===selectedCategory)), [posts,searchQuery,selectedCategory]);
  return <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8"><div className="flex flex-col lg:flex-row-reverse gap-6"><aside className="w-full lg:w-80"><BlogSidebar categories={categories} recentPosts={popularPosts} tags={tags} searchQuery={searchQuery} onSearchChange={setSearchQuery} selectedCategory={selectedCategory} onCategoryChange={setSelectedCategory} /></aside><main className="flex-1"><div className="grid grid-cols-1 sm:grid-cols-2 gap-6">{filtered.map((p,i)=><BlogCard key={p.id} post={p} />)}</div></main></div></div>;
}
