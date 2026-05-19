import React, { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import BlogHeader from '@/components/blog/public/BlogHeader';
import PostCard from '@/components/blog/public/PostCard';
import Sidebar from '@/components/blog/public/Sidebar';
import { Skeleton } from '@/components/ui/skeleton';

const POSTS_PER_PAGE = 9;

export default function BlogList() {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  const { data: posts = [], isLoading } = useQuery({
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

  const filtered = useMemo(() => {
    if (!search) return posts;
    return posts.filter(p =>
      p.title?.toLowerCase().includes(search.toLowerCase()) ||
      p.excerpt?.toLowerCase().includes(search.toLowerCase())
    );
  }, [posts, search]);

  const totalPages = Math.ceil(filtered.length / POSTS_PER_PAGE);
  const paginatedPosts = filtered.slice((page - 1) * POSTS_PER_PAGE, page * POSTS_PER_PAGE);
  const popularPosts = [...posts].sort((a, b) => (b.views_count || 0) - (a.views_count || 0)).slice(0, 5);

  return (
    <div dir="rtl" className="min-h-screen bg-background">
      <BlogHeader searchQuery={search} onSearchChange={(v) => { setSearch(v); setPage(1); }} />

      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[1,2,3,4,5,6].map(i => (
                  <div key={i} className="space-y-3">
                    <Skeleton className="aspect-video rounded-xl" />
                    <Skeleton className="h-6 w-3/4" />
                    <Skeleton className="h-4 w-full" />
                  </div>
                ))}
              </div>
            ) : paginatedPosts.length === 0 ? (
              <div className="text-center py-20">
                <p className="text-4xl mb-4">📝</p>
                <p className="text-lg text-muted-foreground">
                  {search ? 'مقاله‌ای با این عبارت یافت نشد' : 'هنوز مقاله‌ای منتشر نشده'}
                </p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {paginatedPosts.map(post => (
                    <PostCard key={post.id} post={post} categories={categories} />
                  ))}
                </div>

                {totalPages > 1 && (
                  <div className="flex items-center justify-center gap-2 mt-10">
                    <Button
                      variant="outline"
                      onClick={() => setPage(p => Math.max(1, p - 1))}
                      disabled={page === 1}
                    >
                      قبلی
                    </Button>
                    <span className="text-sm text-muted-foreground px-4">
                      صفحه {page.toLocaleString('fa-IR')} از {totalPages.toLocaleString('fa-IR')}
                    </span>
                    <Button
                      variant="outline"
                      onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                      disabled={page === totalPages}
                    >
                      بعدی
                    </Button>
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
