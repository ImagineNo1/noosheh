'use client';
import Link from 'next/link';

export default function BlogSidebar({ categories = [], recentPosts = [], tags = [], searchQuery, onSearchChange, selectedCategory, onCategoryChange }: any) {
  return <div className='space-y-5' dir='rtl'>
    <div className='bg-white rounded-2xl border border-slate-200 p-4'><h3 className='font-bold mb-3'>جستجو</h3><input className='w-full border rounded-lg px-3 py-2 text-sm bg-slate-50' placeholder='جستجو در مقالات...' value={searchQuery} onChange={e=>onSearchChange(e.target.value)} /></div>
    <div className='bg-white rounded-2xl border border-slate-200 p-4'><h3 className='font-bold mb-3'>دسته‌بندی‌ها</h3><div className='space-y-1'><button onClick={()=>onCategoryChange(null)} className={`w-full text-right px-3 py-2 rounded-lg ${!selectedCategory?'bg-rose-500 text-white':'hover:bg-slate-100'}`}>همه مقالات</button>{categories.map((c:any)=><button key={c.id} onClick={()=>onCategoryChange(c.name)} className={`w-full text-right px-3 py-2 rounded-lg ${selectedCategory===c.name?'bg-rose-500 text-white':'hover:bg-slate-100'}`}>{c.name}</button>)}</div></div>
    <div className='bg-white rounded-2xl border border-slate-200 p-4'><h3 className='font-bold mb-3'>محبوب‌ترین‌ها</h3><div className='space-y-2'>{recentPosts.map((p:any,i:number)=><Link href={`/blog/${p.slug}`} key={p.id} className='flex gap-2 text-sm'><span className='w-6 h-6 rounded-full bg-rose-100 text-rose-500 flex items-center justify-center'>{i+1}</span><span>{p.title}</span></Link>)}</div></div>
    <div className='bg-white rounded-2xl border border-slate-200 p-4'><h3 className='font-bold mb-3'>برچسب‌ها</h3><div className='flex flex-wrap gap-2'>{tags.map((t:string)=><span key={t} className='text-xs px-2 py-1 rounded-full bg-rose-50 text-rose-600'>{t}</span>)}</div></div>
  </div>;
}
