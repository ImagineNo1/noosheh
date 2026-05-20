import Link from "next/link";

type Crumb = { label: string };

export default function BlogHeader({ title, breadcrumbs = [] }: { title?: string; breadcrumbs?: Crumb[] }) {
  return (
    <div className="bg-gradient-to-l from-emerald-100/60 via-slate-100/70 to-transparent border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-12" dir="rtl">
        <div className="flex items-center gap-2 text-sm text-slate-500 mb-3">
          <Link href="/" className="hover:text-emerald-700">خانه</Link>
          <span>‹</span>
          <Link href="/blog" className="hover:text-emerald-700">بلاگ</Link>
          {breadcrumbs.map((crumb, i) => (
            <span key={i} className={i === breadcrumbs.length - 1 ? "text-slate-900" : ""}>‹ {crumb.label}</span>
          ))}
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">{title || "بلاگ نوشه"}</h1>
        <p className="text-sm text-slate-500 mt-1">آخرین مقالات و آموزش‌ها</p>
      </div>
    </div>
  );
}
