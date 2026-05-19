import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Link } from 'react-router-dom';
import { Calendar, Clock, Eye, MessageCircle, Search, Tag, Folder } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';

export default function Blog() {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const PER_PAGE = 9;

  const { data: posts = [], isLoading } = useQuery({
    queryKey: ['blog-posts-public'],
    queryFn: () => base44.entities.BlogPost.filter({ status: 'published', is_deleted: false }, '-publish_at', 100),
  });

  const { data: categories = [] } = useQuery({
    queryKey: ['blog-categories'],
    queryFn: () => base44.entities.BlogCategory.filter({ is_active: true }),
  });

  const { data: tags = [] } = useQuery({
    queryKey: ['blog-tags'],
    queryFn: () => base44.entities.BlogTag.list(),
  });

  const filtered = posts.filter(
    (p) =>
      !search ||
      p.title?.toLowerCase().includes(search.toLowerCase()) ||
      p.excerpt?.toLowerCase().includes(search.toLowerCase())
  );

  const totalPages = Math.ceil(filtered.length / PER_PAGE);
  const paginated = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);
  const featured = posts.find((p) => p.is_featured);

  return (
    <div className="bg-white min-h-screen" dir="rtl">
      <div className="bg-gradient-to-l from-primary/10 to-accent/10 py-16 px-4">
        <div className="container mx-auto text-center">
          <h1 className="text-4xl font-bold mb-3">مجله نوشه</h1>
          <p className="text-muted-foreground text-lg mb-6">آخرین مقالات، راهنماها و الهام‌بخشی‌های مد</p>
          <div className="max-w-md mx-auto relative">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="جستجو در مقالات..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="pr-10 text-right"
            />
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        <div className="flex flex-col lg:flex-row gap-10">
          <div className="flex-1">
            {!search && featured && (
              <Link to={`/blog/${featured.slug}`} className="block mb-10 group">
                <div className="rounded-2xl overflow-hidden border border-border/50 hover:shadow-xl transition-shadow">
                  {featured.featured_image && (
                    <div className="aspect-video overflow-hidden">
                      <img
                        src={featured.featured_image}
                        alt={featured.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    </div>
                  )}
                  <div className="p-6">
                    <Badge className="bg-primary text-white mb-3">مقاله ویژه</Badge>
                    <h2 className="text-2xl font-bold mb-2 group-hover:text-primary transition-colors">{featured.title}</h2>
                    <p className="text-muted-foreground mb-4 line-clamp-2">{featured.excerpt}</p>
                    <PostMeta post={featured} />
                  </div>
                </div>
              </Link>
            )}

            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {Array(6)
                  .fill(0)
                  .map((_, i) => (
                    <div key={i} className="h-64 bg-secondary animate-pulse rounded-xl" />
                  ))}
              </div>
            ) : paginated.length === 0 ? (
              <div className="text-center py-16 text-muted-foreground">مقاله‌ای یافت نشد</div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {paginated.map((post) => (
                  <PostCard key={post.id} post={post} />
                ))}
              </div>
            )}
          </div>

          <aside className="w-full lg:w-72 space-y-6">...</aside>
        </div>
      </div>
    </div>
  );
}

function PostCard({ post }) {
  return <div />;
}

function PostMeta({ post, small }) {
  const size = small ? 'w-3 h-3' : 'w-4 h-4';
  const text = small ? 'text-xs' : 'text-sm';
  return (
    <div className={`flex items-center gap-3 text-muted-foreground ${text} flex-wrap`}>
      {post.author_name && <span className="flex items-center gap-1">{post.author_name}</span>}
      {post.publish_at && (
        <span className="flex items-center gap-1">
          <Calendar className={size} />
          {new Date(post.publish_at).toLocaleDateString('fa-IR')}
        </span>
      )}
      {post.reading_time > 0 && (
        <span className="flex items-center gap-1">
          <Clock className={size} />
          {post.reading_time} دقیقه
        </span>
      )}
      {post.views_count > 0 && (
        <span className="flex items-center gap-1">
          <Eye className={size} />
          {post.views_count}
        </span>
      )}
      {post.comments_count > 0 && (
        <span className="flex items-center gap-1">
          <MessageCircle className={size} />
          {post.comments_count}
        </span>
      )}
    </div>
  );
}
