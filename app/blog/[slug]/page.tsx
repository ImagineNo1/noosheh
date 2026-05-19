'use client';
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
export default function BlogPostPage(){ const params=useParams<{slug:string}>(); const slug=params?.slug||''; const [post,setPost]=useState<any>(null);
useEffect(()=>{ if(!slug) return; fetch('/api/blog/posts?filter='+encodeURIComponent(JSON.stringify({slug,is_deleted:false}))).then(r=>r.json()).then(d=>setPost(d?.[0]||null));},[slug]);
if(!post) return <div className='container mx-auto p-8' dir='rtl'>در حال بارگذاری...</div>;
return <div className='container mx-auto p-8' dir='rtl'><h1 className='text-3xl font-bold mb-4'>{post.title}</h1><div dangerouslySetInnerHTML={{__html:post.content||''}} /></div>; }
