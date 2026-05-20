"use client";

type Props = {
  categories: string[];
  popularTitles: { slug: string; title: string }[];
  tags: string[];
  searchQuery: string;
  onSearchChange: (value: string) => void;
  selectedCategory: string | null;
  onCategoryChange: (category: string | null) => void;
};

import Link from "next/link";

export default function BlogSidebar(props: Props) {
  const { categories, popularTitles, tags, searchQuery, onSearchChange, selectedCategory, onCategoryChange } = props;
  return (
    <div className="space-y-6" dir="rtl">
      <div className="bg-white rounded-2xl border border-slate-200 p-5">
        <h3 className="font-bold mb-3">جستجو</h3>
        <input value={searchQuery} onChange={(e) => onSearchChange(e.target.value)} placeholder="جستجو..." className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" />
      </div>
      <div className="bg-white rounded-2xl border border-slate-200 p-5">
        <h3 className="font-bold mb-3">دسته‌بندی‌ها</h3>
        <div className="space-y-1">
          <button onClick={() => onCategoryChange(null)} className="w-full text-right px-3 py-2 rounded-lg hover:bg-slate-100">همه مقالات</button>
          {categories.map((cat) => <button key={cat} onClick={() => onCategoryChange(cat)} className={`w-full text-right px-3 py-2 rounded-lg ${selectedCategory===cat?"bg-emerald-600 text-white":"hover:bg-slate-100"}`}>{cat}</button>)}
        </div>
      </div>
      <div className="bg-white rounded-2xl border border-slate-200 p-5">
        <h3 className="font-bold mb-3">محبوب‌ترین‌ها</h3>
        <div className="space-y-2">{popularTitles.map((p,i)=><Link key={p.slug} href={`/blog/${p.slug}`} className="block text-sm hover:text-emerald-700">{i+1}. {p.title}</Link>)}</div>
      </div>
      <div className="bg-white rounded-2xl border border-slate-200 p-5">
        <h3 className="font-bold mb-3">برچسب‌ها</h3>
        <div className="flex flex-wrap gap-2">{tags.map((tag)=><span key={tag} className="text-xs rounded-full px-2 py-1 bg-slate-100">{tag}</span>)}</div>
      </div>
    </div>
  );
}
