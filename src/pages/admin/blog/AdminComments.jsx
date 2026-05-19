import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Check, X, AlertTriangle, Trash2, Search } from 'lucide-react';

const STATUS_LABELS = { pending: 'در انتظار', approved: 'تایید شده', spam: 'اسپم', trash: 'سطل زباله' };
const STATUS_COLORS = { pending: 'bg-yellow-100 text-yellow-800', approved: 'bg-green-100 text-green-800', spam: 'bg-red-100 text-red-800', trash: 'bg-gray-100 text-gray-800' };

export default function AdminComments() {
  const qc = useQueryClient();
  const [statusFilter, setStatusFilter] = useState('all');
  const [search, setSearch] = useState('');
  const { data: comments = [], isLoading } = useQuery({
    queryKey: ['admin-comments', statusFilter],
    queryFn: () => statusFilter === 'all' ? base44.entities.BlogComment.list('-created_date', 200) : base44.entities.BlogComment.filter({ status: statusFilter }, '-created_date', 200),
  });

  const updateStatus = useMutation({
    mutationFn: ({ id, status }) => base44.entities.BlogComment.update(id, { status }),
    onSuccess: () => { qc.invalidateQueries(['admin-comments']); toast.success('وضعیت به‌روز شد'); },
  });

  const del = useMutation({
    mutationFn: (id) => base44.entities.BlogComment.delete(id),
    onSuccess: () => { qc.invalidateQueries(['admin-comments']); toast.success('دیدگاه حذف شد'); },
  });

  const filtered = comments.filter(c => !search || c.content?.includes(search) || c.author_name?.includes(search));

  return <div className="p-6" dir="rtl">...</div>;
}
