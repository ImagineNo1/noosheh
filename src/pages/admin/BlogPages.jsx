import React, { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Plus, MoreHorizontal, Pencil, Eye, Trash2 } from 'lucide-react';
import { getStatusLabel, getStatusColor, formatDate } from '@/lib/blogUtils';
import { useToast } from '@/components/ui/use-toast';
import { Skeleton } from '@/components/ui/skeleton';

export default function BlogPages() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: pages = [], isLoading } = useQuery({
    queryKey: ['blog-pages'],
    queryFn: () => base44.entities.BlogPage.list('-created_date', 200),
  });

  const handleDelete = async (id) => {
    if (!confirm('آیا از حذف این صفحه مطمئنید؟')) return;
    await base44.entities.BlogPage.delete(id);
    queryClient.invalidateQueries({ queryKey: ['blog-pages'] });
    toast({ title: 'صفحه حذف شد' });
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-bold">صفحات</h1>
        {[1,2,3].map(i => <Skeleton key={i} className="h-16 rounded-lg" />)}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">صفحات</h1>
        <Button asChild>
          <Link to="/admin/blog/pages/new">
            <Plus className="w-4 h-4 ml-2" />
            صفحه جدید
          </Link>
        </Button>
      </div>

      <Card className="overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>عنوان</TableHead>
              <TableHead>اسلاگ</TableHead>
              <TableHead className="hidden md:table-cell">قالب</TableHead>
              <TableHead>وضعیت</TableHead>
              <TableHead className="hidden md:table-cell">تاریخ</TableHead>
              <TableHead className="w-12"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {pages.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-12 text-muted-foreground">
                  هنوز صفحه‌ای ایجاد نشده
                </TableCell>
              </TableRow>
            ) : (
              pages.map(page => (
                <TableRow key={page.id}>
                  <TableCell className="font-medium">{page.title}</TableCell>
                  <TableCell className="text-sm text-muted-foreground" dir="ltr">{page.slug}</TableCell>
                  <TableCell className="hidden md:table-cell text-sm">{page.template || 'default'}</TableCell>
                  <TableCell>
                    <Badge className={`${getStatusColor(page.status)} text-xs`}>
                      {getStatusLabel(page.status)}
                    </Badge>
                  </TableCell>
                  <TableCell className="hidden md:table-cell text-sm text-muted-foreground">
                    {formatDate(page.created_date)}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="start">
                        <DropdownMenuItem onClick={() => navigate(`/admin/blog/pages/${page.id}/edit`)}>
                          <Pencil className="w-4 h-4 ml-2" /> ویرایش
                        </DropdownMenuItem>
                        {page.status === 'published' && (
                          <DropdownMenuItem onClick={() => navigate(`/page/${page.slug}`)}>
                            <Eye className="w-4 h-4 ml-2" /> مشاهده
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuItem className="text-destructive" onClick={() => handleDelete(page.id)}>
                          <Trash2 className="w-4 h-4 ml-2" /> حذف
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
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
