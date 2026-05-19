import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText, FolderOpen, Tag, MessageSquare, Eye, TrendingUp } from 'lucide-react';
import { Link } from 'react-router-dom';
import { formatDate, getStatusLabel, getStatusColor } from '@/lib/blogUtils';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';

function StatCard({ title, value, icon: Icon, color, link }) {
  const content = (
    <Card className="hover:shadow-md transition-shadow cursor-pointer">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">{title}</p>
            <p className="text-3xl font-bold mt-1">{value}</p>
          </div>
          <div className={`p-3 rounded-xl ${color}`}>
            <Icon className="w-5 h-5" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
  return link ? <Link to={link}>{content}</Link> : content;
}

export default function BlogDashboard() {
  const { data: posts = [], isLoading: loadingPosts } = useQuery({
    queryKey: ['blog-posts'],
    queryFn: () => base44.entities.BlogPost.list('-created_date', 100),
  });

  const { data: categories = [] } = useQuery({
    queryKey: ['blog-categories'],
    queryFn: () => base44.entities.BlogCategory.list(),
  });

  const { data: tags = [] } = useQuery({
    queryKey: ['blog-tags'],
    queryFn: () => base44.entities.BlogTag.list(),
  });

  const { data: comments = [] } = useQuery({
    queryKey: ['blog-comments'],
    queryFn: () => base44.entities.BlogComment.list('-created_date', 100),
  });

  const publishedPosts = posts.filter(p => p.status === 'published');
  const draftPosts = posts.filter(p => p.status === 'draft');
  const pendingComments = comments.filter(c => c.status === 'pending');
  const totalViews = posts.reduce((sum, p) => sum + (p.views_count || 0), 0);
  const recentPosts = posts.slice(0, 5);

  if (loadingPosts) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">داشبورد بلاگ</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1,2,3,4].map(i => <Skeleton key={i} className="h-28 rounded-xl" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">داشبورد بلاگ</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="نوشته‌ها"
          value={posts.filter(p => p.status !== 'trash').length}
          icon={FileText}
          color="bg-primary/10 text-primary"
          link="/admin/blog/posts"
        />
        <StatCard
          title="دسته‌بندی‌ها"
          value={categories.length}
          icon={FolderOpen}
          color="bg-blue-100 text-blue-600"
          link="/admin/blog/categories"
        />
        <StatCard
          title="نظرات در انتظار"
          value={pendingComments.length}
          icon={MessageSquare}
          color="bg-yellow-100 text-yellow-600"
          link="/admin/blog/comments"
        />
        <StatCard
          title="کل بازدیدها"
          value={totalViews.toLocaleString('fa-IR')}
          icon={Eye}
          color="bg-green-100 text-green-600"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">آخرین نوشته‌ها</CardTitle>
          </CardHeader>
          <CardContent>
            {recentPosts.length === 0 ? (
              <p className="text-muted-foreground text-sm text-center py-8">هنوز نوشته‌ای ثبت نشده</p>
            ) : (
              <div className="space-y-3">
                {recentPosts.map(post => (
                  <Link
                    key={post.id}
                    to={`/admin/blog/posts/${post.id}/edit`}
                    className="flex items-center justify-between p-3 rounded-lg hover:bg-accent transition-colors"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{post.title}</p>
                      <p className="text-xs text-muted-foreground mt-1">{formatDate(post.created_date)}</p>
                    </div>
                    <Badge className={`${getStatusColor(post.status)} text-xs mr-3`}>
                      {getStatusLabel(post.status)}
                    </Badge>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">آخرین نظرات</CardTitle>
          </CardHeader>
          <CardContent>
            {comments.length === 0 ? (
              <p className="text-muted-foreground text-sm text-center py-8">هنوز نظری ثبت نشده</p>
            ) : (
              <div className="space-y-3">
                {comments.slice(0, 5).map(comment => (
                  <div key={comment.id} className="p-3 rounded-lg bg-accent/50">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-medium text-sm">{comment.author_name}</span>
                      <Badge className={`${getStatusColor(comment.status === 'approved' ? 'published' : comment.status === 'pending' ? 'scheduled' : 'draft')} text-xs`}>
                        {comment.status === 'pending' ? 'در انتظار' : comment.status === 'approved' ? 'تایید' : comment.status}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-2">{comment.content}</p>
                    <p className="text-xs text-muted-foreground mt-1">در: {comment.post_title}</p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
