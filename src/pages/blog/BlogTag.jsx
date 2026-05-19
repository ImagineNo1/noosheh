import React, { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import Breadcrumb from '@/components/blog/public/Breadcrumb';
import PostCard from '@/components/blog/public/PostCard';
import Sidebar from '@/components/blog/public/Sidebar';
import { Skeleton } from '@/components/ui/skeleton';
import { Link } from 'react-router-dom';

const POSTS_PER_PAGE = 9;

export default function BlogTag() {
  const slug = window.location.pathname.split('/blog/tag/')[1];
  const [page, setPage] = useState(1);

  const { data: posts = [], isLoading: loadingPosts } = useQuery({
    queryKey: ['public-blog-posts'],
    queryFn: () => base44.entities.BlogPost.filter({ status: 'published' }, '-created_date', 500),
  });

  const { data: categories = [] } = useQuery({
    queryKey: ['blog-categories'],
    queryFn: () => base44.entities.BlogCategory.list(),
  });

  const { data: tags = [] } = useQuery({
    queryKey: ['blog-tags'],
    queryFn: () => base44.entities.BlogTag.list(),
  });

  const tag = useMemo(() => tags.find(t => t.slug === slug), [tags, slug]);
  const tagPosts = useMemo(() => !tag ? [] : posts.filter(p => (p.tags || []).includes(tag.id)), [posts, tag]);
  const totalPages = Math.ceil(tagPosts.length / POSTS_PER_PAGE);
  const paginated = tagPosts.slice((page - 1) * POSTS_PER_PAGE, page * POSTS_PER_PAGE);
  const popularPosts = useMemo(() => [...posts].sort((a, b) => (b.views_count || 0) - (a.views_count || 0)).slice(0, 5), [posts]);

  if (!tag && !loadingPosts) return <div dir="rtl" className="max-w-4xl mx-auto px-4 py-20 text-center"><h1 className="text-2xl font-bold mb-2">تگ یافت نشد</h1></div>;

  return <div dir="rtl" className="min-h-screen bg-background"><Sidebar categories={categories} tags={tags} popularPosts={popularPosts} /></div>;
}
