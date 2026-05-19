import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Link } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
export default function BlogDashboard(){ const {data:posts=[]}=useQuery({queryKey:['admin-blog-posts'],queryFn:()=>base44.entities.BlogPost.filter({is_deleted:false},'-updated_date',200)}); return <div className='p-6' dir='rtl'><div className='flex items-center justify-between mb-6'><h1 className='text-2xl font-bold'>داشبورد بلاگ</h1><Link to='/admin/blog/posts/new'><Button className='bg-primary hover:bg-primary/90 gap-2'><Plus className='w-4 h-4'/>مقاله جدید</Button></Link></div><p>{posts.length} مقاله</p></div>; }
