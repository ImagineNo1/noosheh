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
  const { data: comments = [], isLoading } = useQuery({ queryKey: ['admin-comments', statusFilter], queryFn: () => statusFilter === 'all' ? base44.entities.BlogComment.list('-created_date', 200) : base44.entities.BlogComment.filter({ status: statusFilter }, '-created_date', 200) });
  const updateStatus = useMutation({ mutationFn: ({ id, status }) => base44.entities.BlogComment.update(id, { status }), onSuccess: () => { qc.invalidateQueries(['admin-comments']); toast.success('وضعیت به‌روز شد'); } });
  const del = useMutation({ mutationFn: (id) => base44.entities.BlogComment.delete(id), onSuccess: () => { qc.invalidateQueries(['admin-comments']); toast.success('دیدگاه حذف شد'); } });
  const counts = { pending: comments.filter(c => c.status === 'pending').length };
  const filtered = comments.filter(c => !search || c.content?.includes(search) || c.author_name?.includes(search));
  return <div className="p-6" dir="rtl"><h1 className="text-2xl font-bold mb-6">دیدگاه‌ها</h1><div className="relative mb-4 max-w-sm"><Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" /><Input placeholder="جستجو..." value={search} onChange={e => setSearch(e.target.value)} className="pr-9" /></div><div className="border border-border/50 rounded-xl overflow-hidden"><table className="w-full text-sm"><thead className="bg-secondary/50"><tr><th className="p-3 text-right">نویسنده</th><th className="p-3 text-right">دیدگاه</th><th className="p-3 text-center">وضعیت</th><th className="p-3 text-center">عملیات</th></tr></thead><tbody className="divide-y divide-border/30">{isLoading ? (<tr><td colSpan={4} className="p-6 text-center text-muted-foreground">در حال بارگذاری...</td></tr>) : filtered.map(comment => (<tr key={comment.id}><td className="p-3 text-xs">{comment.author_name}</td><td className="p-3 text-xs">{comment.content}</td><td className="p-3 text-center"><span className={`text-xs px-2 py-0.5 rounded-full ${STATUS_COLORS[comment.status]}`}>{STATUS_LABELS[comment.status]}</span></td><td className="p-3"><div className="flex gap-1 justify-center">{comment.status !== 'approved' && <Button variant="ghost" size="icon" onClick={() => updateStatus.mutate({ id: comment.id, status: 'approved' })}><Check className="w-3.5 h-3.5" /></Button>}<Button variant="ghost" size="icon" onClick={() => updateStatus.mutate({ id: comment.id, status: 'spam' })}><AlertTriangle className="w-3.5 h-3.5" /></Button><Button variant="ghost" size="icon" onClick={() => updateStatus.mutate({ id: comment.id, status: 'trash' })}><X className="w-3.5 h-3.5" /></Button><Button variant="ghost" size="icon" onClick={() => del.mutate(comment.id)}><Trash2 className="w-3.5 h-3.5" /></Button></div></td></tr>))}</tbody></table></div></div>;
}
