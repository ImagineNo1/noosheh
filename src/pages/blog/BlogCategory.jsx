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

export default function BlogCategory() {
  const slug = window.location.pathname.split('/blog/category/')[1];
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

  const category = useMemo(() => categories.find(c => c.slug === slug), [categories, slug]);

  const categoryPosts = useMemo(() => {
    if (!category) return [];
    return posts.filter(p => (p.categories || []).includes(category.id));
  }, [posts, category]);

  const totalPages = Math.ceil(categoryPosts.length / POSTS_PER_PAGE);
  const paginated = categoryPosts.slice((page - 1) * POSTS_PER_PAGE, page * POSTS_PER_PAGE);

  const popularPosts = useMemo(() =>
    [...posts].sort((a, b) => (b.views_count || 0) - (a.views_count || 0)).slice(0, 5),
  [posts]);

  if (!category && !loadingPosts) {
    return (
      <div dir="rtl" className="max-w-4xl mx-auto px-4 py-20 text-center">
        <p className="text-6xl mb-4">📂</p>
        <h1 className="text-2xl font-bold mb-2">دسته‌بندی یافت نشد</h1>
        <Button asChild className="mt-4"><Link to="/blog">بازگشت به بلاگ</Link></Button>
      </div>
    );
  }

  return (
    <div dir="rtl" className="min-h-screen bg-background">
      <div className="bg-gradient-to-l from-primary/5 to-primary/10 border-b">
        <div className="max-w-6xl mx-auto px-4 py-12 text-center">
          <h1 className="text-3xl font-bold mb-2">دسته‌بندی: {category?.name}</h1>
          {category?.description && (
            <p className="text-muted-foreground max-w-lg mx-auto">{category.description}</p>
          )}
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        <Breadcrumb items={[
          { label: 'بلاگ', href: '/blog' },
          { label: category?.name || '' },
        ]} />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            {loadingPosts ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[1,2,3,4].map(i => <Skeleton key={i} className="aspect-video rounded-xl" />)}
              </div>
            ) : paginated.length === 0 ? (
              <div className="text-center py-20 text-muted-foreground">مقاله‌ای در این دسته‌بندی یافت نشد</div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {paginated.map(post => (
                    <PostCard key={post.id} post={post} categories={categories} />
                  ))}
                </div>
                {totalPages > 1 && (
                  <div className="flex items-center justify-center gap-2 mt-10">
                    <Button variant="outline" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>قبلی</Button>
                    <span className="text-sm text-muted-foreground px-4">صفحه {page.toLocaleString('fa-IR')} از {totalPages.toLocaleString('fa-IR')}</span>
                    <Button variant="outline" onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}>بعدی</Button>
                  </div>
                )}
              </>
            )}
          </div>
          <Sidebar categories={categories} tags={tags} popularPosts={popularPosts} />
        </div>
      </div>
    </div>
  );
}
