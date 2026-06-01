import Link from 'next/link';

export default function BlogHeader({ title, description, breadcrumbs = [] }: { title?: string; description?: string; breadcrumbs?: { label: string }[] }) {
  return (
    <section className="relative overflow-hidden border-b border-[#eaded5] bg-[#fff8f3]" dir="rtl">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_82%_12%,rgba(151,15,53,0.08),transparent_22rem),radial-gradient(circle_at_8%_70%,rgba(242,222,213,0.85),transparent_26rem),linear-gradient(180deg,#fffaf6_0%,#fbf1ea_100%)]" />
      <div className="absolute left-10 top-12 hidden h-28 w-28 rounded-full border border-[#eaded5] bg-[#fffaf5]/55 shadow-[0_24px_80px_rgba(74,36,31,0.08)] sm:block" />
      <div className="relative mx-auto grid min-h-[24rem] max-w-7xl content-center px-4 py-16 sm:px-6 lg:py-20">
        <nav className="mb-9 flex flex-wrap items-center justify-center gap-2 text-sm font-semibold text-[#7d6660]">
          <Link href="/" className="transition hover:text-[#970f35]">خانه</Link>
          <span className="text-[#cdb8ac]">‹</span>
          <Link href="/blog" className="transition hover:text-[#970f35]">بلاگ</Link>
          {breadcrumbs.map((breadcrumb, index) => (
            <span key={index} className="flex items-center gap-2">
              <span className="text-[#cdb8ac]">‹</span>
              <span className={index === breadcrumbs.length - 1 ? 'text-[#4a241f]' : ''}>{breadcrumb.label}</span>
            </span>
          ))}
        </nav>
        <div className="mx-auto max-w-3xl text-center">
          <span className="mb-5 inline-flex items-center gap-2 rounded-full border border-[#eaded5] bg-[#fffaf5]/80 px-4 py-2 text-xs font-extrabold tracking-[0.22em] text-[#970f35] shadow-sm">
            <span className="h-2 w-2 rounded-full bg-[#970f35]" />NOOSHEH EDITORIAL
          </span>
          <h1 className="text-4xl font-black leading-[1.35] text-[#4a241f] sm:text-5xl lg:text-6xl">{title || 'بلاگ نوشه'}</h1>
          <p className="mx-auto mt-5 max-w-2xl text-base leading-9 text-[#7d6660] sm:text-lg">{description || 'روایت‌هایی آرام و الهام‌بخش از زیبایی، راحتی، انتخاب لباس زیر و سبک زندگی زنانه؛ با نگاه یک مجله مد لوکس.'}</p>
        </div>
      </div>
    </section>
  );
}
