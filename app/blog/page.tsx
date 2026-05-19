import Link from 'next/link';
import StoreHeader from '@/components/store/StoreHeader';
import Footer from '@/components/store/Footer';

async function getData() {
  const [postsRes, catsRes, tagsRes] = await Promise.all([
    fetch(`${process.env.NEXT_PUBLIC_SITE_URL || ''}/api/admin/entities/BlogPost?sort=-publish_at&limit=100`, { cache: 'no-store' }),
    fetch(`${process.env.NEXT_PUBLIC_SITE_URL || ''}/api/admin/entities/BlogCategory?sort=name&limit=100`, { cache: 'no-store' }),
    fetch(`${process.env.NEXT_PUBLIC_SITE_URL || ''}/api/admin/entities/BlogTag?sort=name&limit=100`, { cache: 'no-store' })
  ]);
  const [posts, categories, tags] = await Promise.all([postsRes.json(), catsRes.json(), tagsRes.json()]);
  return { posts: (posts || []).filter((p: any) => p.status === 'published' && !p.is_deleted), categories: categories || [], tags: tags || [] };
}

export default async function BlogPage() {
  const { posts, categories, tags } = await getData();
  const featured = posts.find((p: any) => p.is_featured) || posts[0];
  return <main dir="rtl"><StoreHeader /><div className="bg-gradient-to-l from-primary/10 to-accent/10 py-14"><div className="container mx-auto px-4"><h1 className="text-4xl font-black">مجله نوشه</h1></div></div>
    <div className="container mx-auto px-4 py-10 grid lg:grid-cols-[1fr_280px] gap-8">
      <section>
        {featured && <Link href={`/blog/${featured.slug}`} className="block border rounded-2xl overflow-hidden mb-8">{featured.featured_image && <img src={featured.featured_image} alt="" className="w-full aspect-video object-cover" />}<div className="p-5"><h2 className="text-2xl font-bold">{featured.title}</h2><p className="text-muted-foreground mt-2">{featured.excerpt}</p></div></Link>}
        <div className="grid md:grid-cols-2 gap-4">{posts.map((p: any) => <Link key={p.id} href={`/blog/${p.slug}`} className="border rounded-xl overflow-hidden">{p.featured_image && <img src={p.featured_image} className="w-full aspect-video object-cover" alt="" />}<div className="p-4"><h3 className="font-bold line-clamp-2">{p.title}</h3><div className="mt-2 text-xs text-muted-foreground flex gap-3"><span>📅 {p.publish_at ? new Date(p.publish_at).toLocaleDateString('fa-IR') : '-'}</span><span>👁 {p.views_count || 0}</span></div></div></Link>)}</div>
      </section>
      <aside className="space-y-4"><div className="border rounded-xl p-4"><h3 className="font-bold mb-3">دسته‌بندی‌ها</h3>{categories.map((c: any) => <Link key={c.id} href={`/blog/category/${c.slug}`} className="block text-sm py-1">{c.name}</Link>)}</div><div className="border rounded-xl p-4"><h3 className="font-bold mb-3">تگ‌ها</h3><div className="flex flex-wrap gap-2">{tags.map((t: any) => <Link key={t.id} href={`/blog/tag/${t.slug}`} className="text-xs bg-secondary px-2 py-1 rounded">#{t.name}</Link>)}</div></div></aside>
    </div><Footer /></main>;
}
