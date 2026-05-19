import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Link } from 'react-router-dom';
import { Plus, Search, Edit, Trash2, Eye, Copy, MoreVertical } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

const STATUS_LABELS = { draft: 'پیش‌نویس', published: 'منتشرشده', private: 'خصوصی', scheduled: 'زمان‌بندی‌شده', archived: 'بایگانی' };
const STATUS_COLORS = { draft: 'bg-yellow-100 text-yellow-800', published: 'bg-green-100 text-green-800', private: 'bg-gray-100 text-gray-800', scheduled: 'bg-blue-100 text-blue-800', archived: 'bg-red-100 text-red-800' };

export default function AdminBlogPosts() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selected, setSelected] = useState([]);
  const qc = useQueryClient();

  const { data: posts = [], isLoading } = useQuery({
    queryKey: ['admin-blog-posts'],
    queryFn: () => base44.entities.BlogPost.filter({ is_deleted: false }, '-updated_date', 200),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.BlogPost.update(id, { is_deleted: true }),
    onSuccess: () => { qc.invalidateQueries(['admin-blog-posts']); toast.success('مقاله حذف شد'); },
  });

  const updateStatus = useMutation({
    mutationFn: ({ id, status }) => base44.entities.BlogPost.update(id, { status }),
    onSuccess: () => { qc.invalidateQueries(['admin-blog-posts']); toast.success('وضعیت به‌روز شد'); },
  });

  const duplicate = useMutation({
    mutationFn: (post) => {
      const { id, created_date, updated_date, ...rest } = post;
      return base44.entities.BlogPost.create({ ...rest, title: rest.title + ' (کپی)', slug: rest.slug + '-copy-' + Date.now(), status: 'draft' });
    },
    onSuccess: () => { qc.invalidateQueries(['admin-blog-posts']); toast.success('مقاله کپی شد'); },
  });

  const bulkAction = async (action) => {
    for (const id of selected) {
      const post = posts.find((p) => p.id === id);
      if (!post) continue;
      if (action === 'delete') await base44.entities.BlogPost.update(id, { is_deleted: true });
      if (action === 'publish') await base44.entities.BlogPost.update(id, { status: 'published' });
      if (action === 'draft') await base44.entities.BlogPost.update(id, { status: 'draft' });
    }
    qc.invalidateQueries(['admin-blog-posts']);
    setSelected([]);
    toast.success('عملیات گروهی انجام شد');
  };

  const filtered = posts.filter((p) => {
    const matchSearch = !search || p.title?.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'all' || p.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const toggleSelect = (id) => setSelected((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]));
  const toggleAll = () => setSelected(selected.length === filtered.length ? [] : filtered.map((p) => p.id));

  return (
    <div className="p-6" dir="rtl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">مقالات بلاگ</h1>
          <p className="text-muted-foreground text-sm mt-1">{posts.length} مقاله</p>
        </div>
        <Link to="/admin/blog/posts/new">
          <Button className="bg-primary hover:bg-primary/90 gap-2"><Plus className="w-4 h-4" />مقاله جدید</Button>
        </Link>
      </div>

      <div className="flex flex-wrap gap-3 mb-6">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="جستجو..." value={search} onChange={(e) => setSearch(e.target.value)} className="pr-9" />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-40"><SelectValue placeholder="وضعیت" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">همه</SelectItem>
            {Object.entries(STATUS_LABELS).map(([v, l]) => <SelectItem key={v} value={v}>{l}</SelectItem>)}
          </SelectContent>
        </Select>
        {selected.length > 0 && (
          <div className="flex gap-2">
            <Button size="sm" variant="outline" onClick={() => bulkAction('publish')}>انتشار</Button>
            <Button size="sm" variant="outline" onClick={() => bulkAction('draft')}>پیش‌نویس</Button>
            <Button size="sm" variant="destructive" onClick={() => bulkAction('delete')}>حذف</Button>
          </div>
        )}
      </div>

      <div className="border border-border/50 rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-secondary/50">
            <tr>
              <th className="p-3 text-right w-10"><input type="checkbox" checked={selected.length === filtered.length && filtered.length > 0} onChange={toggleAll} className="rounded" /></th>
              <th className="p-3 text-right">عنوان</th>
              <th className="p-3 text-center hidden md:table-cell">وضعیت</th>
              <th className="p-3 text-center hidden lg:table-cell">نویسنده</th>
              <th className="p-3 text-center hidden lg:table-cell">بازدید</th>
              <th className="p-3 text-center hidden xl:table-cell">دیدگاه</th>
              <th className="p-3 text-center hidden xl:table-cell">تاریخ</th>
              <th className="p-3 text-center">عملیات</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/30">
            {isLoading ? (
              Array(5).fill(0).map((_, i) => (
                <tr key={i}><td colSpan={8} className="p-4"><div className="h-5 bg-secondary animate-pulse rounded" /></td></tr>
              ))
            ) : filtered.length === 0 ? (
              <tr><td colSpan={8} className="text-center py-12 text-muted-foreground">مقاله‌ای یافت نشد</td></tr>
            ) : filtered.map((post) => (
              <tr key={post.id} className="hover:bg-secondary/20 transition-colors">
                <td className="p-3"><input type="checkbox" checked={selected.includes(post.id)} onChange={() => toggleSelect(post.id)} className="rounded" /></td>
                <td className="p-3">
                  <div className="font-medium line-clamp-1">{post.title}</div>
                  {post.categories?.length > 0 && <div className="text-xs text-muted-foreground mt-0.5">{post.categories.join('، ')}</div>}
                </td>
                <td className="p-3 text-center hidden md:table-cell">
                  <span className={`text-xs px-2 py-1 rounded-full font-medium ${STATUS_COLORS[post.status]}`}>{STATUS_LABELS[post.status]}</span>
                </td>
                <td className="p-3 text-center text-xs text-muted-foreground hidden lg:table-cell">{post.author_name || '-'}</td>
                <td className="p-3 text-center text-xs hidden lg:table-cell">{post.views_count || 0}</td>
                <td className="p-3 text-center text-xs hidden xl:table-cell">{post.comments_count || 0}</td>
                <td className="p-3 text-center text-xs text-muted-foreground hidden xl:table-cell">
                  {post.publish_at ? new Date(post.publish_at).toLocaleDateString('fa-IR') : new Date(post.updated_date).toLocaleDateString('fa-IR')}
                </td>
                <td className="p-3">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8"><MoreVertical className="w-4 h-4" /></Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem asChild><Link to={`/admin/blog/posts/${post.id}`}><Edit className="w-4 h-4 ml-2" />ویرایش</Link></DropdownMenuItem>
                      <DropdownMenuItem asChild><Link to={`/blog/${post.slug}`} target="_blank"><Eye className="w-4 h-4 ml-2" />پیش‌نمایش</Link></DropdownMenuItem>
                      <DropdownMenuItem onClick={() => duplicate.mutate(post)}><Copy className="w-4 h-4 ml-2" />کپی</DropdownMenuItem>
                      {post.status !== 'published' && <DropdownMenuItem onClick={() => updateStatus.mutate({ id: post.id, status: 'published' })}>انتشار</DropdownMenuItem>}
                      {post.status === 'published' && <DropdownMenuItem onClick={() => updateStatus.mutate({ id: post.id, status: 'draft' })}>پیش‌نویس</DropdownMenuItem>}
                      <DropdownMenuItem className="text-destructive" onClick={() => deleteMutation.mutate(post.id)}><Trash2 className="w-4 h-4 ml-2" />حذف</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
