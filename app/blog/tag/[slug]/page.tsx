'use client';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useEffect, useState } from 'react';
export default function BlogTagPage(){ const p=useParams<{slug:string}>(); const slug=p?.slug||''; const [posts,setPosts]=useState<any[]>([]);
useEffect(()=>{ fetch('/api/blog/posts?filter='+encodeURIComponent(JSON.stringify({status:'published',is_deleted:false}))+'&sort=-publish_at&limit=100').then(r=>r.json()).then((d)=>setPosts((d||[]).filter((x:any)=>x.tags?.includes(slug))));},[slug]);
return <div className='container mx-auto p-8' dir='rtl'><h1 className='text-2xl font-bold mb-4'>تگ: {slug}</h1>{posts.map(p=><Link key={p.id} href={`/blog/${p.slug}`} className='block py-2'>{p.title}</Link>)}</div>; }
