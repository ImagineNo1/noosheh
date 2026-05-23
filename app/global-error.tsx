'use client';

import Link from 'next/link';

export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <html lang="fa" dir="rtl">
      <body>
        <div className="mx-auto max-w-2xl px-4 py-24 text-center">
          <h1 className="mb-3 text-2xl font-bold">خطای غیرمنتظره در برنامه</h1>
          <p className="mb-6 text-sm text-slate-600">صفحه با خطای داخلی مواجه شد. لطفاً مجدداً تلاش کنید.</p>
          {error?.digest ? <p className="mb-6 text-xs text-slate-500">Error code: {error.digest}</p> : null}
          <div className="flex items-center justify-center gap-3">
            <button onClick={() => reset()} className="rounded-md bg-black px-4 py-2 text-white">تلاش مجدد</button>
            <Link href="/" className="rounded-md border px-4 py-2">خانه</Link>
          </div>
        </div>
      </body>
    </html>
  );
}
