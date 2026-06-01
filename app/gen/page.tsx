'use client';

import { useState } from 'react';

type SeedResult = {
  message?: string;
  count?: number;
  counts?: Record<string, number>;
  error?: string;
};

export default function GeneratePage() {
  const [loading, setLoading] = useState<'products' | 'full' | null>(null);
  const [result, setResult] = useState<string>('');

  const generate = async (mode: 'products' | 'full') => {
    setLoading(mode);
    setResult('');
    try {
      const response = await fetch('/api/gen-products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mode, count: mode === 'full' ? 40 : 50 })
      });
      const data = await response.json() as SeedResult;
      if (!response.ok) throw new Error(data?.error || 'خطا در ساخت داده‌های فیک');
      if (data.count) {
        setResult(`✅ ${data.count.toLocaleString('fa-IR')} محصول کامل با SEO، رنگ، سایز، کاپ، واریانت و موجودی ساخته شد.`);
      } else {
        const counts = data.counts || {};
        setResult([
          '✅ دیتای کامل دمو ساخته شد:',
          `${(counts.products || 0).toLocaleString('fa-IR')} محصول کامل`,
          `${(counts.categories || 0).toLocaleString('fa-IR')} دسته‌بندی`,
          `${(counts.attributes || 0).toLocaleString('fa-IR')} پیش‌فرض محصول`,
          `${(counts.reviews || 0).toLocaleString('fa-IR')} نظر تاییدشده`,
          `${(counts.blog_posts || 0).toLocaleString('fa-IR')} مقاله بلاگ`,
          'و تنظیمات پایه سایت و SEO.'
        ].join(' '));
      }
    } catch (error) {
      setResult(`❌ ${error instanceof Error ? error.message : 'خطای ناشناخته'}`);
    } finally {
      setLoading(null);
    }
  };

  return (
    <main className="min-h-screen bg-[#fffaf5] px-6 py-16 text-[#3f241f]" dir="rtl">
      <section className="mx-auto max-w-3xl rounded-3xl border border-[#eaded5] bg-white/80 p-8 shadow-[0_24px_70px_rgba(74,36,31,0.08)]">
        <p className="mb-3 text-sm font-black text-[#970f35]">Noosheh Demo Generator</p>
        <h1 className="mb-4 text-3xl font-black">تولید دیتای فیک کامل برای فروشگاه</h1>
        <p className="mb-8 leading-8 text-[#7d6660]">
          این صفحه برای ساخت سریع یک فروشگاه نمایشی کامل است: محصول‌ها با همه فیلدهای مهم، SEO خودکار،
          چند رنگ، چند سایز، چند کاپ، واریانت و موجودی ساخته می‌شوند. حالت کامل، دیتای پنل ادمین مثل
          پیش‌فرض‌ها، دسته‌بندی‌ها، نظر محصول و بلاگ را هم اضافه می‌کند.
        </p>

        <div className="grid gap-4 md:grid-cols-2">
          <button
            type="button"
            onClick={() => generate('products')}
            disabled={Boolean(loading)}
            className="rounded-2xl bg-[#3f241f] px-5 py-4 text-right font-black text-white transition hover:bg-[#2f1a16] disabled:opacity-60"
          >
            {loading === 'products' ? 'در حال ساخت محصول‌ها...' : 'ساخت ۵۰ محصول کامل'}
            <span className="mt-2 block text-sm font-medium text-white/75">SEO، واریانت، رنگ، سایز، کاپ و موجودی</span>
          </button>

          <button
            type="button"
            onClick={() => generate('full')}
            disabled={Boolean(loading)}
            className="rounded-2xl bg-[#970f35] px-5 py-4 text-right font-black text-white transition hover:bg-[#7d0b2b] disabled:opacity-60"
          >
            {loading === 'full' ? 'در حال ساخت دیتای کامل...' : 'ساخت سایت کامل دمو'}
            <span className="mt-2 block text-sm font-medium text-white/75">محصول، دسته‌بندی، پیش‌فرض‌ها، نظر، بلاگ و تنظیمات SEO</span>
          </button>
        </div>

        {result && <p className="mt-6 rounded-2xl border border-[#eaded5] bg-[#fffaf5] p-4 text-sm leading-8">{result}</p>}

        <div className="mt-8 grid gap-3 text-sm leading-7 text-[#7d6660]">
          <p><b className="text-[#3f241f]">نکته:</b> داده‌ها فیک هستند ولی برای تست فروشگاه، فیلترها، SEO، سبد خرید، صفحه محصول، نظرات و بلاگ کامل‌تر از قبل ساخته می‌شوند.</p>
          <p><b className="text-[#3f241f]">SEO:</b> برای محصول‌ها، دسته‌ها و مقاله‌ها از همان سیستم فعلی متادیتا و تولید خودکار SEO استفاده می‌شود.</p>
        </div>
      </section>
    </main>
  );
}
