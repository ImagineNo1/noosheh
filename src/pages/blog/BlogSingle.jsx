import React, { useEffect, useMemo } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Link } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Clock, Eye, User, Calendar, ChevronLeft, ChevronRight, Share2, Copy } from 'lucide-react';
import Breadcrumb from '@/components/blog/public/Breadcrumb';
import Sidebar from '@/components/blog/public/Sidebar';
import CommentSection from '@/components/blog/public/CommentSection';
import PostCard from '@/components/blog/public/PostCard';
import { formatDate, sanitizeHtml } from '@/lib/blogUtils';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/components/ui/use-toast';

export default function BlogSingle() {
  const slug = window.location.pathname.split('/blog/')[1];
  const queryClient = useQueryClient();
  const { toast } = useToast();

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

  const post = useMemo(() => posts.find(p => p.slug === slug), [posts, slug]);

  // Increment view count
  useEffect(() => {
    if (post) {
      base44.entities.BlogPost.update(post.id, {
        views_count: (post.views_count || 0) + 1
      });
    }
  }, [post?.id]);

  const postCategories = useMemo(() => {
    if (!post) return [];
    return (post.categories || []).map(cid => categories.find(c => c.id === cid)).filter(Boolean);
  }, [post, categories]);

  const postTags = useMemo(() => {
    if (!post) return [];
    return (post.tags || []).map(tid => tags.find(t => t.id === tid)).filter(Boolean);
  }, [post, tags]);

  const relatedPosts = useMemo(() => {
    if (!post) return [];
    return posts.filter(p =>
      p.id !== post.id &&
      (p.categories || []).some(c => (post.categories || []).includes(c))
    ).slice(0, 3);
  }, [post, posts]);

  const postIndex = posts.findIndex(p => p.id === post?.id);
  const prevPost = postIndex < posts.length - 1 ? posts[postIndex + 1] : null;
  const nextPost = postIndex > 0 ? posts[postIndex - 1] : null;

  const popularPosts = useMemo(() =>
    [...posts].sort((a, b) => (b.views_count || 0) - (a.views_count || 0)).slice(0, 5),
  [posts]);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    toast({ title: 'لینک کپی شد' });
  };

  // Generate table of contents
  const toc = useMemo(() => {
    if (!post?.content) return [];
    const regex = /<h([2-3])[^>]*>(.*?)<\/h[2-3]>/gi;
    const headings = [];
    let match;
    while ((match = regex.exec(post.content)) !== null) {
      const text = match[2].replace(/<[^>]*>/g, '');
      headings.push({ level: parseInt(match[1]), text, id: text.replace(/\s+/g, '-') });
    }
    return headings;
  }, [post?.content]);

  if (isLoading) {
    return (
      <div dir="rtl" className="max-w-6xl mx-auto px-4 py-8">
        <Skeleton className="h-8 w-64 mb-4" />
        <Skeleton className="aspect-video rounded-xl mb-6" />
        <Skeleton className="h-10 w-3/4 mb-4" />
        <div className="space-y-3">
          {[1,2,3,4,5].map(i => <Skeleton key={i} className="h-4 w-full" />)}
        </div>
      </div>
    );
  }

  if (!post) {
    return (
      <div dir="rtl" className="max-w-4xl mx-auto px-4 py-20 text-center">
        <p className="text-6xl mb-4">🔍</p>
        <h1 className="text-2xl font-bold mb-2">مقاله یافت نشد</h1>
        <p className="text-muted-foreground mb-6">مقاله‌ای با این آدرس وجود ندارد یا حذف شده است.</p>
        <Button asChild>
          <Link to="/blog">بازگشت به بلاگ</Link>
        </Button>
      </div>
    );
  }

  return (
    <div dir="rtl" className="min-h-screen bg-background">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <Breadcrumb items={[
          { label: 'بلاگ', href: '/blog' },
          ...postCategories.slice(0, 1).map(c => ({ label: c.name, href: `/blog/category/${c.slug}` })),
          { label: post.title },
        ]} />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <article className="lg:col-span-2 space-y-6">
            {post.featured_image && (
              <div className="aspect-video rounded-xl overflow-hidden">
                <img src={post.featured_image} alt={post.featured_image_alt || post.title} className="w-full h-full object-cover" />
              </div>
            )}
            <h1 className="text-3xl md:text-4xl font-bold leading-tight">{post.title}</h1>
            <div className="blog-content prose prose-lg max-w-none" dangerouslySetInnerHTML={{ __html: sanitizeHtml(post.content) }} />
            <CommentSection postId={post.id} postTitle={post.title} allowComments={post.allow_comments !== false} />
          </article>
          <Sidebar categories={categories} tags={tags} popularPosts={popularPosts} />
        </div>
      </div>
    </div>
  );
}
