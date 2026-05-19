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

  const counts = {
    all: comments.length,
    pending: comments.filter(c => c.status === 'pending').length,
    approved: comments.filter(c => c.status === 'approved').length,
    spam: comments.filter(c => c.status === 'spam').length,
  };

  const filtered = comments.filter(c => !search || c.content?.includes(search) || c.author_name?.includes(search));

  return (
    <div className="p-6" dir="rtl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">دیدگاه‌ها</h1>
          {counts.pending > 0 && <p className="text-sm text-yellow-600 mt-1">{counts.pending} دیدگاه در انتظار تایید</p>}
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {[['all', 'همه', ''], ['pending', 'در انتظار', 'text-yellow-600'], ['approved', 'تایید شده', 'text-green-600'], ['spam', 'اسپم', 'text-red-600']].map(([key, label, color]) => (
          <button
            key={key}
            onClick={() => setStatusFilter(key)}
            className={`p-4 border rounded-xl text-right transition-colors ${statusFilter === key ? 'border-primary bg-primary/5' : 'border-border/50 hover:border-primary/50'}`}
          >
            <div className={`text-2xl font-bold ${color}`}>{comments.filter(c => key === 'all' || c.status === key).length}</div>
            <div className="text-sm text-muted-foreground">{label}</div>
          </button>
        ))}
      </div>

      <div className="relative mb-4 max-w-sm">
        <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input placeholder="جستجو..." value={search} onChange={e => setSearch(e.target.value)} className="pr-9" />
      </div>

      <div className="border border-border/50 rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-secondary/50">
            <tr>
              <th className="p-3 text-right">نویسنده</th>
              <th className="p-3 text-right">دیدگاه</th>
              <th className="p-3 text-center">مقاله</th>
              <th className="p-3 text-center">وضعیت</th>
              <th className="p-3 text-center">تاریخ</th>
              <th className="p-3 text-center">عملیات</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/30">
            {isLoading ? (
              <tr><td colSpan={6} className="p-6 text-center text-muted-foreground">در حال بارگذاری...</td></tr>
            ) : filtered.length === 0 ? (
              <tr><td colSpan={6} className="p-12 text-center text-muted-foreground">دیدگاهی یافت نشد</td></tr>
            ) : filtered.map(comment => (
              <tr key={comment.id} className={`hover:bg-secondary/20 transition-colors ${comment.status === 'pending' ? 'bg-yellow-50/50' : ''}`}>
                <td className="p-3"><div className="font-medium text-xs">{comment.author_name}</div><div className="text-xs text-muted-foreground">{comment.author_email}</div></td>
                <td className="p-3 max-w-xs"><p className="text-xs line-clamp-2 text-muted-foreground">{comment.content}</p>{comment.parent_id && <Badge variant="outline" className="text-[10px] mt-1">پاسخ</Badge>}</td>
                <td className="p-3 text-center"><a href={`/blog/${comment.post_slug}`} target="_blank" rel="noreferrer" className="text-xs text-primary hover:underline">{comment.post_slug}</a></td>
                <td className="p-3 text-center"><span className={`text-xs px-2 py-0.5 rounded-full ${STATUS_COLORS[comment.status]}`}>{STATUS_LABELS[comment.status]}</span></td>
                <td className="p-3 text-center text-xs text-muted-foreground">{new Date(comment.created_date).toLocaleDateString('fa-IR')}</td>
                <td className="p-3"><div className="flex gap-1 justify-center">{comment.status !== 'approved' && <Button variant="ghost" size="icon" className="h-7 w-7 text-green-600" title="تایید" onClick={() => updateStatus.mutate({ id: comment.id, status: 'approved' })}><Check className="w-3.5 h-3.5" /></Button>}{comment.status !== 'spam' && <Button variant="ghost" size="icon" className="h-7 w-7 text-yellow-600" title="اسپم" onClick={() => updateStatus.mutate({ id: comment.id, status: 'spam' })}><AlertTriangle className="w-3.5 h-3.5" /></Button>}{comment.status !== 'trash' && <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground" title="سطل زباله" onClick={() => updateStatus.mutate({ id: comment.id, status: 'trash' })}><X className="w-3.5 h-3.5" /></Button>}<Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" title="حذف دائم" onClick={() => del.mutate(comment.id)}><Trash2 className="w-3.5 h-3.5" /></Button></div></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
