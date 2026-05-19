import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatDate } from '@/lib/blogUtils';

export default function Sidebar({ categories = [], tags = [], popularPosts = [] }) {
  return (
    <aside className="space-y-6">
      {categories.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">دسته‌بندی‌ها</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {categories.map(cat => (
                <Link key={cat.id} to={`/blog/category/${cat.slug}`} className="flex items-center justify-between p-2 rounded-lg hover:bg-accent transition-colors text-sm">
                  <div className="flex items-center gap-2">
                    {cat.color && <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: cat.color }} />}
                    <span>{cat.name}</span>
                  </div>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {tags.length > 0 && (
        <Card>
          <CardHeader className="pb-3"><CardTitle className="text-base">تگ‌ها</CardTitle></CardHeader>
          <CardContent><div className="flex flex-wrap gap-2">{tags.map(tag => <Link key={tag.id} to={`/blog/tag/${tag.slug}`}><Badge variant="outline" className="hover:bg-accent cursor-pointer">{tag.name}</Badge></Link>)}</div></CardContent>
        </Card>
      )}

      {popularPosts.length > 0 && (
        <Card>
          <CardHeader className="pb-3"><CardTitle className="text-base">پربازدیدترین‌ها</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-3">
              {popularPosts.map(post => (
                <Link key={post.id} to={`/blog/${post.slug}`} className="flex gap-3 p-2 rounded-lg hover:bg-accent transition-colors">
                  {post.featured_image && <img src={post.featured_image} alt={post.title} className="w-16 h-16 rounded-lg object-cover flex-shrink-0" />}
                  <div className="min-w-0"><p className="text-sm font-medium line-clamp-2">{post.title}</p><p className="text-xs text-muted-foreground mt-1">{formatDate(post.created_date)}</p></div>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </aside>
  );
}
