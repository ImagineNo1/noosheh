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

export default function AdminBlogPosts() { return <div className="p-6" dir="rtl">Posts</div>; }
