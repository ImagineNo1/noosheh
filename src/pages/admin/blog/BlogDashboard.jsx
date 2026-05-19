import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';

export default function BlogDashboard() {
  const { data: posts = [] } = useQuery({ queryKey: ['admin-blog-posts'], queryFn: () => base44.entities.BlogPost.filter({ is_deleted: false }, '-updated_date', 200) });
  return <div className="p-6" dir="rtl">...</div>;
}
