'use client';

import Link from 'next/link';
import { useEffect } from 'react';

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error('Route error boundary caught error:', error);
  }, [error]);

  return (
    <div className="store-page" dir="rtl">
      <div className="mx-auto max-w-2xl px-4 py-24 text-center">
        <h1 className="mb-3 text-2xl font-bold">مشکلی در بارگذاری صفحه پیش آمد</h1>
        <p className="mb-6 text-sm text-muted-foreground">لطفاً دوباره تلاش کنید. اگر مشکل ادامه داشت با پشتیبانی تماس بگیرید.</p>
        {error?.digest ? <p className="mb-6 text-xs text-muted-foreground">Error code: {error.digest}</p> : null}
        <div className="flex items-center justify-center gap-3">
          <button onClick={() => reset()} className="rounded-md bg-primary px-4 py-2 text-primary-foreground">تلاش مجدد</button>
          <Link href="/" className="rounded-md border px-4 py-2">بازگشت به خانه</Link>
        </div>
      </div>
    </div>
  );
}
