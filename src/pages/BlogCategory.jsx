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

  const { data: categories = [] } = useQuery({
    queryKey: ['blog-categories'],
    queryFn: () => base44.entities.BlogCategory.filter({ is_active: true }),
  });
  const category = categories.find(c => c.slug === slug);

  const { data: posts = [], isLoading } = useQuery({
    queryKey: ['blog-posts-category', slug],
    queryFn: () => base44.entities.BlogPost.filter({ status: 'published', is_deleted: false }, '-publish_at', 100),
    enabled: !!slug,
  });

  const filtered = posts.filter(p => p.categories?.includes(slug));
  const totalPages = Math.ceil(filtered.length / PER_PAGE);
  const paginated = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  return <div />;
}
