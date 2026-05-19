import Link from 'next/link';

export default async function BlogCategoryPage({ params }: { params: { slug: string } }) {
  const [postsRes, catsRes] = await Promise.all([
    fetch(`${process.env.NEXT_PUBLIC_SITE_URL || ''}/api/admin/entities/BlogPost?sort=-publish_at&limit=200`, { cache: 'no-store' }),
    fetch(`${process.env.NEXT_PUBLIC_SITE_URL || ''}/api/admin/entities/BlogCategory?limit=100`, { cache: 'no-store' })
  ]);
  const posts = (await postsRes.json() || []).filter((p: any) => p.status === 'published' && !p.is_deleted && (p.categories || []).includes(params.slug));
  const cat = (await catsRes.json() || []).find((c: any) => c.slug === params.slug);
  return <main dir='rtl' className='container mx-auto px-4 py-8'><h1 className='text-3xl font-bold mb-6'>{cat?.name || params.slug}</h1><div className='grid md:grid-cols-3 gap-4'>{posts.map((p:any)=><Link key={p.id} href={`/blog/${p.slug}`} className='border rounded p-3'>{p.title}</Link>)}</div></main>;
}
