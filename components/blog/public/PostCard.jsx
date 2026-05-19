import React from 'react';
import { Link } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { Clock, Eye, MessageSquare, User } from 'lucide-react';
import { formatDate } from '@/lib/blogUtils';

export default function PostCard({ post, categories = [] }) {
  const postCategories = (post.categories || [])
    .map(cid => categories.find(c => c.id === cid))
    .filter(Boolean);

  return (
    <Link to={`/blog/${post.slug}`} className="group block">
      <article className="bg-card rounded-xl border overflow-hidden hover:shadow-lg transition-all duration-300 h-full flex flex-col">
        {post.featured_image ? (
          <div className="aspect-video overflow-hidden">
            <img
              src={post.featured_image}
              alt={post.featured_image_alt || post.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              loading="lazy"
            />
          </div>
        ) : (
          <div className="aspect-video bg-gradient-to-bl from-primary/10 to-primary/5 flex items-center justify-center">
            <span className="text-4xl opacity-30">📝</span>
          </div>
        )}

        <div className="p-5 flex-1 flex flex-col">
          {postCategories.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-3">
              {postCategories.slice(0, 2).map(cat => (
                <Badge
                  key={cat.id}
                  variant="secondary"
                  className="text-xs"
                  style={cat.color ? { backgroundColor: cat.color + '20', color: cat.color } : {}}
                >
                  {cat.name}
                </Badge>
              ))}
            </div>
          )}

          <h2 className="text-lg font-bold mb-2 group-hover:text-primary transition-colors line-clamp-2">
            {post.title}
          </h2>

          {post.excerpt && (
            <p className="text-sm text-muted-foreground line-clamp-2 mb-4 flex-1">
              {post.excerpt}
            </p>
          )}

          <div className="flex items-center gap-4 text-xs text-muted-foreground mt-auto pt-3 border-t">
            {post.author_name && (
              <span className="flex items-center gap-1">
                <User className="w-3 h-3" />
                {post.author_name}
              </span>
            )}
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {formatDate(post.publish_at || post.created_date)}
            </span>
            {post.reading_time && (
              <span>{post.reading_time} دقیقه مطالعه</span>
            )}
            {(post.views_count || 0) > 0 && (
              <span className="flex items-center gap-1">
                <Eye className="w-3 h-3" />
                {post.views_count.toLocaleString('fa-IR')}
              </span>
            )}
          </div>
        </div>
      </article>
    </Link>
  );
}
