import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="mt-20 bg-foreground text-background" dir="rtl">
      <div className="mx-auto max-w-7xl px-4 py-12">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-3">
          <div>
            <h3 className="mb-4 text-lg font-bold">N<span className="text-primary">♥</span>OSHEH</h3>
            <p className="text-sm leading-relaxed text-background/60">فروشگاه آنلاین لباس و پوشاک زنانه با بهترین کیفیت و قیمت مناسب</p>
          </div>
          <div>
            <h4 className="mb-4 text-sm font-semibold">دسترسی سریع</h4>
            <nav className="flex flex-col gap-2">
              <Link href="/" className="text-sm text-background/60 transition-colors hover:text-primary">خانه</Link>
              <Link href="/category/all" className="text-sm text-background/60 transition-colors hover:text-primary">دسته‌بندی‌ها</Link>
              <Link href="/faq" className="text-sm text-background/60 transition-colors hover:text-primary">سوالات متداول</Link>
              <Link href="/contact" className="text-sm text-background/60 transition-colors hover:text-primary">تماس با ما</Link>
            </nav>
          </div>
          <div>
            <h4 className="mb-4 text-sm font-semibold">ارتباط با ما</h4>
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-2 text-sm text-background/60"><span>☎</span><span dir="ltr">۰۹۱۲۳۴۵۶۷۸۹</span></div>
              <div className="flex items-center gap-2 text-sm text-background/60"><span>✉</span><span>info@noosheh.com</span></div>
            </div>
          </div>
        </div>
        <div className="mt-10 border-t border-background/10 pt-6 text-center text-xs text-background/40">© ۱۴۰۴ نوشه. تمامی حقوق محفوظ است.</div>
      </div>
    </footer>
  );
}
