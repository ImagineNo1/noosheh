'use client';
import Link from 'next/link';

export default function BlogSidebar({ categories = [], recentPosts = [], tags = [], searchQuery, onSearchChange, selectedCategory, onCategoryChange }: any) {
  return (
    <div className="space-y-6" dir="rtl">
      <div className="bg-white rounded-2xl border border-slate-200 p-5"><h3 className="font-bold text-base mb-3">جستجو</h3><input placeholder="جستجو در مقالات..." value={searchQuery} onChange={(e) => onSearchChange(e.target.value)} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" /></div>
      <div className="bg-white rounded-2xl border border-slate-200 p-5"><h3 className="font-bold text-base mb-3">دسته‌بندی‌ها</h3><div className="space-y-1"><button onClick={() => onCategoryChange(null)} className={`w-full text-right px-3 py-2 rounded-lg text-sm ${!selectedCategory ? 'bg-rose-500 text-white':'hover:bg-slate-100'}`}>همه مقالات</button>{categories.map((cat:any)=><button key={cat.id || cat.name} onClick={() => onCategoryChange(cat.name)} className={`w-full text-right px-3 py-2 rounded-lg text-sm ${selectedCategory===cat.name ? 'bg-rose-500 text-white':'hover:bg-slate-100'}`}>{cat.name}</button>)}</div></div>
      <div className="bg-white rounded-2xl border border-slate-200 p-5"><h3 className="font-bold text-base mb-3">محبوب‌ترین‌ها</h3><div className="space-y-3">{recentPosts.map((post:any, i:number)=><Link key={post.id} href={`/blog/${post.slug}`} className="flex items-start gap-2"><span className="w-6 h-6 rounded-full bg-rose-100 text-rose-500 text-xs flex items-center justify-center">{i+1}</span><span className="text-sm">{post.title}</span></Link>)}</div></div>
      <div className="bg-white rounded-2xl border border-slate-200 p-5"><h3 className="font-bold text-base mb-3">برچسب‌ها</h3><div className="flex flex-wrap gap-2">{tags.map((tag:string)=><span key={tag} className="px-2 py-1 rounded-full bg-rose-50 text-rose-500 text-xs">{tag}</span>)}</div></div>
    </div>
  );
}
