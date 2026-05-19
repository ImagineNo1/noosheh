import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Link } from 'react-router-dom';
import { ChevronLeft, Folder } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export default function BlogCategory() {
  const slug = window.location.pathname.split('/blog/category/')[1];
  const [page, setPage] = useState(1);
  const PER_PAGE = 9;

  const { data: categories = [] } = useQuery({ queryKey: ['blog-categories'], queryFn: () => base44.entities.BlogCategory.filter({ is_active: true }) });
  const category = categories.find(c => c.slug === slug);
  const { data: posts = [], isLoading } = useQuery({ queryKey: ['blog-posts-category', slug], queryFn: () => base44.entities.BlogPost.filter({ status: 'published', is_deleted: false }, '-publish_at', 100), enabled: !!slug });

  const filtered = posts.filter(p => p.categories?.includes(slug));
  const totalPages = Math.ceil(filtered.length / PER_PAGE);
  const paginated = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  return (
    <div className="bg-white min-h-screen" dir="rtl">
      <div className="bg-gradient-to-l from-primary/10 to-accent/10 py-12 px-4"><div className="container mx-auto"><div className="flex items-center gap-1 text-xs text-muted-foreground mb-4"><Link to="/" className="hover:text-primary">خانه</Link><ChevronLeft className="w-3 h-3" /><Link to="/blog" className="hover:text-primary">بلاگ</Link><ChevronLeft className="w-3 h-3" /><span>{category?.name || slug}</span></div><div className="flex items-center gap-3"><div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ backgroundColor: category?.color || '#e91e8c20' }}><Folder className="w-6 h-6" style={{ color: category?.color || '#e91e8c' }} /></div><div><h1 className="text-2xl font-bold">{category?.name || slug}</h1>{category?.description && <p className="text-muted-foreground text-sm mt-1">{category.description}</p>}</div><Badge variant="secondary" className="mr-auto">{filtered.length} مقاله</Badge></div></div></div>
      <div className="container mx-auto px-4 py-10">{isLoading ? <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">{Array(6).fill(0).map((_, i) => <div key={i} className="h-64 bg-secondary animate-pulse rounded-xl" />)}</div> : paginated.length === 0 ? <div className="text-center py-16 text-muted-foreground">مقاله‌ای در این دسته‌بندی یافت نشد</div> : <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">{paginated.map(post => <Link key={post.id} to={`/blog/${post.slug}`} className="group block border border-border/50 rounded-xl overflow-hidden hover:shadow-lg transition-shadow"><div className="aspect-video overflow-hidden bg-secondary/30">{post.featured_image ? <img src={post.featured_image} alt={post.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" /> : <div className="w-full h-full flex items-center justify-center text-muted-foreground text-sm">بدون تصویر</div>}</div><div className="p-4"><h3 className="font-bold text-sm leading-6 mb-2 line-clamp-2 group-hover:text-primary transition-colors">{post.title}</h3><p className="text-xs text-muted-foreground line-clamp-2">{post.excerpt}</p>{post.publish_at && <p className="text-xs text-muted-foreground mt-2">{new Date(post.publish_at).toLocaleDateString('fa-IR')}</p>}</div></Link>)}</div>}{totalPages > 1 && <div className="flex justify-center gap-2 mt-10">{Array.from({ length: totalPages }, (_, i) => <button key={i} onClick={() => setPage(i + 1)} className={`w-9 h-9 rounded-lg text-sm font-medium transition-colors ${page === i + 1 ? 'bg-primary text-white' : 'bg-secondary hover:bg-primary/10'}`}>{i + 1}</button>)}</div>}</div>
    </div>
  );
}
