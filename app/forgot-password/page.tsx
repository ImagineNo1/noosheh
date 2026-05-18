'use client';

import Link from 'next/link';
import { FormEvent, useState } from 'react';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [resetUrl, setResetUrl] = useState('');

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setLoading(true);
    try {
      const response = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mode: 'reset_request', email })
      });
      const data = await response.json().catch(() => ({}));
      if (response.ok && data.reset_url) setResetUrl(data.reset_url);
    } finally {
      setLoading(false);
      setSent(true);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-primary/10 via-background to-primary/5 px-4 py-10" dir="rtl">
      <section className="mx-auto flex min-h-[calc(100vh-5rem)] max-w-md items-center">
        <div className="w-full rounded-3xl border border-border bg-card p-6 shadow-xl shadow-primary/5 md:p-8">
          <div className="mb-8 text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-2xl text-primary">✉</div>
            <h1 className="text-2xl font-bold">بازیابی رمز عبور</h1>
            <p className="mt-1 text-sm text-muted-foreground">ایمیل یا شماره موبایل حساب خود را وارد کنید</p>
          </div>

          {sent ? (
            <div className="space-y-5 text-center">
              <p className="rounded-xl bg-primary/10 p-4 text-sm leading-7 text-foreground">اگر حسابی با این مشخصات وجود داشته باشد، راهنمای بازیابی رمز عبور برای شما ارسال می‌شود.</p>
              {resetUrl && <Link href={resetUrl} className="inline-flex rounded-full bg-primary px-5 py-2.5 text-sm font-bold text-primary-foreground">تنظیم رمز جدید</Link>}
              <div><Link href="/login" className="inline-flex font-medium text-primary hover:underline">بازگشت به ورود ←</Link></div>
            </div>
          ) : (
            <form onSubmit={submit} className="space-y-4">
              <label className="block space-y-2">
                <span className="text-sm font-medium">ایمیل یا شماره موبایل</span>
                <div className="relative">
                  <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">✉</span>
                  <input className="h-12 w-full rounded-xl border border-input bg-background px-10 text-left dir-ltr outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20" type="text" autoComplete="email" autoFocus value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@example.com" required />
                </div>
              </label>
              <button className="h-12 w-full rounded-xl bg-primary font-bold text-primary-foreground transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-60" disabled={loading}>{loading ? 'در حال ارسال...' : 'ارسال لینک بازیابی'}</button>
              <p className="text-center text-sm"><Link href="/login" className="font-medium text-primary hover:underline">بازگشت به ورود ←</Link></p>
            </form>
          )}
        </div>
      </section>
    </main>
  );
}
