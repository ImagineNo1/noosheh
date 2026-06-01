import Link from 'next/link';

export default function BlogHeader({ title, breadcrumbs = [] }: { title?: string; breadcrumbs?: { label: string }[] }) {
  return (
    <div className='bg-gradient-to-l from-rose-50 via-slate-50 to-white border-b border-slate-200'>
      <div className='max-w-7xl mx-auto px-4 sm:px-6 py-10' dir='rtl'>
        <div className='flex items-center gap-2 text-sm text-slate-500 mb-3'>
          <Link href='/' className='hover:text-rose-500'>⌂ خانه</Link>
          <span>‹</span>
          <Link href='/blog' className='hover:text-rose-500'>بلاگ</Link>
          {breadcrumbs.map((b, i) => <span key={i} className='flex items-center gap-2'><span>‹</span><span className={i===breadcrumbs.length-1?'text-slate-900':''}>{b.label}</span></span>)}
        </div>
        <div className='flex items-center gap-3'>
          <h1 className='text-4xl font-extrabold text-slate-900'>{title || 'بلاگ نوشه'}</h1>
          <span className='w-10 h-10 rounded-xl bg-rose-100 text-rose-500 flex items-center justify-center'>📖</span>
        </div>
        <p className='text-sm text-slate-500 mt-1'>آخرین مقالات و آموزش‌ها</p>
      </div>
    </div>
  );
}
