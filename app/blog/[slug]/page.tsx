import Link from 'next/link';
import { notFound } from 'next/navigation';

async function getPosts() {
  const res = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL || ''}/api/admin/entities/BlogPost?sort=-publish_at&limit=200`, { cache: 'no-store' });
  return (await res.json() || []).filter((p: any) => p.status === 'published' && !p.is_deleted);
}

export default async function BlogPostPage({ params }: { params: { slug: string } }) {
  const posts = await getPosts();
  const post = posts.find((p: any) => p.slug === params.slug);
  if (!post) notFound();
  const idx = posts.findIndex((p: any) => p.id === post.id);
  return <main dir='rtl' className='container mx-auto px-4 py-8'>
    <div className='text-xs text-muted-foreground mb-3'><Link href='/'>خانه</Link> / <Link href='/blog'>بلاگ</Link> / {post.title}</div>
    <h1 className='text-4xl font-black'>{post.title}</h1>
    <p className='mt-3 text-muted-foreground'>{post.excerpt}</p>
    {post.featured_image && <img src={post.featured_image} className='w-full max-w-4xl mt-6 rounded-2xl' alt=''/>}
    <article className='prose mt-8 max-w-none' dangerouslySetInnerHTML={{ __html: post.content || '' }} />
    <div className='mt-8 flex gap-4'>{posts[idx+1] && <Link href={`/blog/${posts[idx+1].slug}`}>مقاله بعدی</Link>}{posts[idx-1] && <Link href={`/blog/${posts[idx-1].slug}`}>مقاله قبلی</Link>}</div>
  </main>;
}
