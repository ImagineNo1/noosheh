import React, { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Search, MoreHorizontal, Pencil, Copy, Trash2, Eye, Send, FileX } from 'lucide-react';
import { getStatusLabel, getStatusColor, formatDate } from '@/lib/blogUtils';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/components/ui/use-toast';

const POSTS_PER_PAGE = 15;

export default function BlogPosts() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState([]);
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: posts = [], isLoading } = useQuery({
    queryKey: ['blog-posts'],
    queryFn: () => base44.entities.BlogPost.list('-created_date', 500),
  });

  const { data: categories = [] } = useQuery({
    queryKey: ['blog-categories'],
    queryFn: () => base44.entities.BlogCategory.list(),
  });

  const updatePost = useMutation({
    mutationFn: ({ id, data }) => base44.entities.BlogPost.update(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['blog-posts'] }),
  });

  const deletePost = useMutation({
    mutationFn: (id) => base44.entities.BlogPost.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['blog-posts'] }),
  });

  const filteredPosts = useMemo(() => {
    return posts.filter(post => {
      if (statusFilter !== 'all' && post.status !== statusFilter) return false;
      if (categoryFilter !== 'all' && !(post.categories || []).includes(categoryFilter)) return false;
      if (search && !post.title?.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    });
  }, [posts, statusFilter, categoryFilter, search]);

  const totalPages = Math.ceil(filteredPosts.length / POSTS_PER_PAGE);
  const paginatedPosts = filteredPosts.slice((page - 1) * POSTS_PER_PAGE, page * POSTS_PER_PAGE);

  const handleSelectAll = (checked) => setSelected(checked ? paginatedPosts.map(p => p.id) : []);
  const handleSelect = (id, checked) => setSelected(prev => checked ? [...prev, id] : prev.filter(i => i !== id));

  const handleBulkAction = async (action) => {
    for (const id of selected) {
      if (action === 'delete') await deletePost.mutateAsync(id);
      else if (action === 'publish') await updatePost.mutateAsync({ id, data: { status: 'published' } });
      else if (action === 'draft') await updatePost.mutateAsync({ id, data: { status: 'draft' } });
      else if (action === 'trash') await updatePost.mutateAsync({ id, data: { status: 'trash' } });
    }
    setSelected([]);
    toast({ title: 'عملیات انجام شد' });
  };

  const handleDuplicate = async (post) => {
    await base44.entities.BlogPost.create({ ...post, id: undefined, created_date: undefined, updated_date: undefined, title: post.title + ' (کپی)', slug: post.slug + '-copy-' + Date.now(), status: 'draft', views_count: 0, comments_count: 0 });
    queryClient.invalidateQueries({ queryKey: ['blog-posts'] });
    toast({ title: 'نوشته کپی شد' });
  };

  const getCategoryName = (id) => categories.find(c => c.id === id)?.name || '';

  if (isLoading) return <div className="space-y-4"><h1 className="text-2xl font-bold">نوشته‌ها</h1></div>;

  return <div className="space-y-4">...</div>;
}
