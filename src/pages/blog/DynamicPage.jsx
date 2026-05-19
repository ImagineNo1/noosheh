import React, { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import Breadcrumb from '@/components/blog/public/Breadcrumb';
import { sanitizeHtml, formatDate } from '@/lib/blogUtils';
import { Skeleton } from '@/components/ui/skeleton';

export default function DynamicPage() {
  if (typeof window === 'undefined') return null;

  const slug = window.location.pathname.split('/page/')[1];

  const { data: pages = [], isLoading } = useQuery({
    queryKey: ['blog-pages'],
    queryFn: () => base44.entities.BlogPage.list(),
  });

  const page = useMemo(() => pages.find(p => p.slug === slug && p.status === 'published'), [pages, slug]);

  if (isLoading) {
    return (
      <div dir="rtl" className="max-w-4xl mx-auto px-4 py-8">
        <Skeleton className="h-10 w-1/2 mb-4" />
        <div className="space-y-3">{[1,2,3,4,5].map(i => <Skeleton key={i} className="h-4 w-full" />)}</div>
      </div>
    );
  }

  if (!page) {
    return (
      <div dir="rtl" className="max-w-4xl mx-auto px-4 py-20 text-center">
        <h1 className="text-2xl font-bold mb-2">صفحه یافت نشد</h1>
        <Button asChild><Link to="/">بازگشت به خانه</Link></Button>
      </div>
    );
  }

  return (
    <div dir="rtl" className="min-h-screen bg-background">
      <div className={page.template === 'full_width' ? '' : 'max-w-4xl mx-auto px-4 py-8'}>
        <Breadcrumb items={[{ label: page.title }]} />
        <h1 className="text-3xl md:text-4xl font-bold mb-6">{page.title}</h1>
        <div className="blog-content prose prose-lg max-w-none" dangerouslySetInnerHTML={{ __html: sanitizeHtml(page.content) }} />
      </div>
    </div>
  );
}
