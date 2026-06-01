import Link from 'next/link';

export default function BlogHeader({ title, description, breadcrumbs = [] }: { title?: string; description?: string; breadcrumbs?: { label: string }[] }) {
  return (
    <section className="relative overflow-hidden border-b border-[#eaded5] bg-[#fff7f1]" dir="rtl">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_12%_10%,rgba(151,15,53,0.09),transparent_24rem),linear-gradient(120deg,rgba(255,250,245,0.95),rgba(242,222,213,0.58))]" />
      <div className="absolute -left-16 top-10 h-56 w-56 rounded-full bg-[#f2ded5]/70 blur-3xl" />
      <div className="relative mx-auto grid min-h-[22rem] max-w-7xl content-center px-4 py-16 sm:px-6 lg:py-20">
        <nav className="mb-8 flex items-center gap-2 text-sm font-semibold text-[#7d6660]">
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
        <div className="max-w-3xl">
          <span className="mb-5 inline-flex rounded-full border border-[#eaded5] bg-[#fffaf5]/75 px-4 py-2 text-xs font-extrabold tracking-[0.22em] text-[#970f35] shadow-sm">NOOSHEH EDITORIAL</span>
          <h1 className="text-4xl font-black leading-[1.35] text-[#4a241f] sm:text-5xl lg:text-6xl">{title || 'بلاگ نوشه'}</h1>
          <p className="mt-5 max-w-2xl text-base leading-9 text-[#7d6660] sm:text-lg">{description || 'روایت‌هایی آرام و الهام‌بخش از زیبایی، راحتی، انتخاب لباس زیر و سبک زندگی زنانه؛ با نگاه یک مجله مد لوکس.'}</p>
        </div>
      </div>
    </section>
  );
}
