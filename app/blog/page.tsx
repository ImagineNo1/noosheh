'use client';
import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';

type Post = any;

export default function BlogPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const PER_PAGE = 9;

  useEffect(() => {
    fetch('/api/blog/posts?filter=' + encodeURIComponent(JSON.stringify({ status: 'published', is_deleted: false })) + '&sort=-publish_at&limit=100')
      .then((r) => r.json())
      .then(setPosts)
      .catch(() => setPosts([]));
  }, []);

  const filtered = useMemo(() => posts.filter((p) => !search || p.title?.toLowerCase().includes(search.toLowerCase()) || p.excerpt?.toLowerCase().includes(search.toLowerCase())), [posts, search]);
  const totalPages = Math.ceil(filtered.length / PER_PAGE);
  const paginated = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  return <div className='container mx-auto px-4 py-10' dir='rtl'><h1 className='text-3xl font-bold mb-6'>مجله نوشه</h1><input className='border rounded p-2 mb-6 w-full max-w-md' placeholder='جستجو...' value={search} onChange={(e)=>{setSearch(e.target.value);setPage(1);}}/>
  <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>{paginated.map((p)=><Link key={p.id} href={`/blog/${p.slug}`} className='border rounded-lg p-4 hover:shadow'><h3 className='font-bold mb-2'>{p.title}</h3><p className='text-sm text-muted-foreground line-clamp-2'>{p.excerpt}</p></Link>)}</div>
  {totalPages>1&&<div className='flex gap-2 mt-6'>{Array.from({length:totalPages},(_,i)=><button key={i} className='px-3 py-1 border rounded' onClick={()=>setPage(i+1)}>{i+1}</button>)}</div>}
  </div>;
}
