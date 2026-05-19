import React, { useState, useMemo } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Check, X, AlertTriangle, Trash2 } from 'lucide-react';
import { getCommentStatusLabel, getCommentStatusColor, formatDateTime } from '@/lib/blogUtils';
import { useToast } from '@/components/ui/use-toast';
import { Skeleton } from '@/components/ui/skeleton';

export default function BlogComments() {
  const [statusFilter, setStatusFilter] = useState('all');
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: comments = [], isLoading } = useQuery({
    queryKey: ['blog-comments'],
    queryFn: () => base44.entities.BlogComment.list('-created_date', 500),
  });

  const filtered = useMemo(() => {
    if (statusFilter === 'all') return comments;
    return comments.filter(c => c.status === statusFilter);
  }, [comments, statusFilter]);

  const handleStatusChange = async (id, status) => {
    await base44.entities.BlogComment.update(id, { status });
    queryClient.invalidateQueries({ queryKey: ['blog-comments'] });
    toast({ title: `نظر ${getCommentStatusLabel(status)} شد` });
  };

  const handleDelete = async (id) => {
    if (!confirm('آیا از حذف دائمی این نظر مطمئنید؟')) return;
    await base44.entities.BlogComment.delete(id);
    queryClient.invalidateQueries({ queryKey: ['blog-comments'] });
    toast({ title: 'نظر حذف شد' });
  };

  const pendingCount = comments.filter(c => c.status === 'pending').length;

  if (isLoading) {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-bold">نظرات</h1>
        {[1,2,3,4].map(i => <Skeleton key={i} className="h-16 rounded-lg" />)}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold">نظرات</h1>
          {pendingCount > 0 && (
            <Badge className="bg-yellow-100 text-yellow-800">{pendingCount} در انتظار</Badge>
          )}
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="وضعیت" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">همه</SelectItem>
            <SelectItem value="pending">در انتظار</SelectItem>
            <SelectItem value="approved">تایید‌شده</SelectItem>
            <SelectItem value="rejected">رد‌شده</SelectItem>
            <SelectItem value="spam">اسپم</SelectItem>
            <SelectItem value="trash">زباله‌دان</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Card className="overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>نویسنده</TableHead>
              <TableHead>نظر</TableHead>
              <TableHead className="hidden md:table-cell">نوشته</TableHead>
              <TableHead>وضعیت</TableHead>
              <TableHead className="hidden md:table-cell">تاریخ</TableHead>
              <TableHead className="w-36">عملیات</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-12 text-muted-foreground">
                  نظری یافت نشد
                </TableCell>
              </TableRow>
            ) : (
              filtered.map(comment => (
                <TableRow key={comment.id}>
                  <TableCell>
                    <div>
                      <p className="font-medium text-sm">{comment.author_name}</p>
                      <p className="text-xs text-muted-foreground" dir="ltr">{comment.author_email}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <p className="text-sm line-clamp-2 max-w-[300px]">{comment.content}</p>
                  </TableCell>
                  <TableCell className="hidden md:table-cell text-sm text-muted-foreground">
                    {comment.post_title || '-'}
                  </TableCell>
                  <TableCell>
                    <Badge className={`${getCommentStatusColor(comment.status)} text-xs`}>
                      {getCommentStatusLabel(comment.status)}
                    </Badge>
                  </TableCell>
                  <TableCell className="hidden md:table-cell text-xs text-muted-foreground">
                    {formatDateTime(comment.created_date)}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      {comment.status !== 'approved' && (
                        <Button variant="ghost" size="icon" className="h-7 w-7 text-green-600" title="تایید"
                          onClick={() => handleStatusChange(comment.id, 'approved')}>
                          <Check className="w-4 h-4" />
                        </Button>
                      )}
                      {comment.status !== 'rejected' && (
                        <Button variant="ghost" size="icon" className="h-7 w-7 text-red-600" title="رد"
                          onClick={() => handleStatusChange(comment.id, 'rejected')}>
                          <X className="w-4 h-4" />
                        </Button>
                      )}
                      {comment.status !== 'spam' && (
                        <Button variant="ghost" size="icon" className="h-7 w-7 text-orange-600" title="اسپم"
                          onClick={() => handleStatusChange(comment.id, 'spam')}>
                          <AlertTriangle className="w-3 h-3" />
                        </Button>
                      )}
                      <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" title="حذف"
                        onClick={() => handleDelete(comment.id)}>
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
