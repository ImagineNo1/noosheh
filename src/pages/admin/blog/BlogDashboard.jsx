import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Link } from 'react-router-dom';
import { FileText, Tag, Folder, MessageCircle, Eye, Plus, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function BlogDashboard() {
  const { data: posts = [] } = useQuery({ queryKey: ['admin-blog-posts'], queryFn: () => base44.entities.BlogPost.filter({ is_deleted: false }, '-updated_date', 200) });
  const { data: cats = [] } = useQuery({ queryKey: ['blog-categories'], queryFn: () => base44.entities.BlogCategory.list() });
  const { data: tags = [] } = useQuery({ queryKey: ['blog-tags'], queryFn: () => base44.entities.BlogTag.list() });
  const { data: comments = [] } = useQuery({ queryKey: ['admin-comments', 'all'], queryFn: () => base44.entities.BlogComment.list('-created_date', 50) });

  const published = posts.filter(p => p.status === 'published').length;
  const drafts = posts.filter(p => p.status === 'draft').length;
  const pending = comments.filter(c => c.status === 'pending').length;
  const totalViews = posts.reduce((s, p) => s + (p.views_count || 0), 0);
  const recentPosts = [...posts].slice(0, 5);

  return (
    <div className="p-6" dir="rtl">
      <div className="flex items-center justify-between mb-6"><h1 className="text-2xl font-bold">داشبورد بلاگ</h1><Link to="/admin/blog/posts/new"><Button className="bg-primary hover:bg-primary/90 gap-2"><Plus className="w-4 h-4" />مقاله جدید</Button></Link></div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">{[{ label: 'کل مقالات', value: posts.length, icon: FileText, color: 'text-blue-600', bg: 'bg-blue-50' }, { label: 'منتشرشده', value: published, icon: TrendingUp, color: 'text-green-600', bg: 'bg-green-50' }, { label: 'کل بازدید', value: totalViews.toLocaleString('fa-IR'), icon: Eye, color: 'text-purple-600', bg: 'bg-purple-50' }, { label: 'دیدگاه معلق', value: pending, icon: MessageCircle, color: 'text-yellow-600', bg: 'bg-yellow-50' }].map(stat => <div key={stat.label} className="border border-border/50 rounded-xl p-5"><div className={`w-10 h-10 rounded-xl ${stat.bg} flex items-center justify-center mb-3`}><stat.icon className={`w-5 h-5 ${stat.color}`} /></div><div className="text-2xl font-bold">{stat.value}</div><div className="text-sm text-muted-foreground">{stat.label}</div></div>)}</div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 border border-border/50 rounded-xl p-5"><div className="flex items-center justify-between mb-4"><h2 className="font-bold">آخرین مقالات</h2><Link to="/admin/blog/posts" className="text-sm text-primary hover:underline">مشاهده همه</Link></div><div className="space-y-3">{recentPosts.map(post => <div key={post.id} className="flex items-center gap-3">{post.featured_image && <img src={post.featured_image} className="w-10 h-10 object-cover rounded-lg flex-shrink-0" alt="" />}<div className="flex-1 min-w-0"><Link to={`/admin/blog/posts/${post.id}`} className="text-sm font-medium hover:text-primary line-clamp-1">{post.title}</Link><div className="text-xs text-muted-foreground">{post.author_name} • {new Date(post.updated_date).toLocaleDateString('fa-IR')}</div></div><span className={`text-xs px-2 py-0.5 rounded-full flex-shrink-0 ${post.status === 'published' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>{post.status === 'published' ? 'منتشر' : 'پیش‌نویس'}</span></div>)}{posts.length === 0 && <p className="text-muted-foreground text-sm text-center py-6">هنوز مقاله‌ای ثبت نشده</p>}</div></div>
        <div className="space-y-4"><div className="border border-border/50 rounded-xl p-5"><h2 className="font-bold mb-4">دسترسی سریع</h2><div className="space-y-2">{[{ to: '/admin/blog/posts/new', icon: Plus, label: 'مقاله جدید' }, { to: '/admin/blog/categories', icon: Folder, label: `دسته‌بندی‌ها (${cats.length})` }, { to: '/admin/blog/tags', icon: Tag, label: `تگ‌ها (${tags.length})` }, { to: '/admin/blog/comments', icon: MessageCircle, label: `دیدگاه‌ها ${pending > 0 ? `(${pending} معلق)` : ''}` }].map(item => <Link key={item.to} to={item.to} className="flex items-center gap-2 p-2.5 rounded-lg hover:bg-secondary transition-colors text-sm"><item.icon className="w-4 h-4 text-primary" />{item.label}{item.to === '/admin/blog/comments' && pending > 0 && <span className="mr-auto bg-primary text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">{pending}</span>}</Link>)}</div></div><div className="border border-border/50 rounded-xl p-5"><h2 className="font-bold mb-3 text-sm">وضعیت مقالات</h2><div className="space-y-2">{[{ label: 'پیش‌نویس', count: drafts, color: 'bg-yellow-400' }, { label: 'منتشرشده', count: published, color: 'bg-green-400' }, { label: 'بایگانی', count: posts.filter(p => p.status === 'archived').length, color: 'bg-gray-400' }].map(s => <div key={s.label} className="flex items-center gap-3"><span className={`w-2.5 h-2.5 rounded-full ${s.color}`} /><span className="text-sm flex-1">{s.label}</span><span className="text-sm font-medium">{s.count}</span></div>)}</div></div></div>
      </div>
    </div>
  );
}
