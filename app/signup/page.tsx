'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FormEvent, useEffect, useState } from 'react';
import { getStoredUser, setUserSession } from '@/lib/user-auth';

export default function SignupPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => { if (getStoredUser()) router.replace('/account'); }, [router]);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setError('');
    if (!name.trim()) return setError('نام را وارد کنید.');
    if (!email.trim()) return setError('ایمیل یا شماره موبایل را وارد کنید.');
    if (password.length < 6) return setError('رمز عبور حداقل ۶ کاراکتر باشد.');
    if (password !== confirm) return setError('تکرار رمز عبور یکسان نیست.');
    setLoading(true);
    try {
      const response = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mode: 'register', name, email, password })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'خطا در ثبت‌نام');
      setUserSession(data.token, data.user);
      router.replace('/account');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'خطا در ثبت‌نام');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-primary/10 via-background to-primary/5 px-4 py-10" dir="rtl">
      <section className="mx-auto grid min-h-[calc(100vh-5rem)] max-w-5xl items-center gap-8 md:grid-cols-[1fr_420px]">
        <div className="hidden md:block">
          <div className="inline-flex rounded-full bg-primary/10 px-4 py-2 text-sm font-medium text-primary">N♥OSHEH</div>
          <h1 className="mt-6 text-4xl font-bold leading-tight">حساب نوشه خودت را بساز.</h1>
          <p className="mt-4 max-w-md text-muted-foreground">با ثبت‌نام، سفارش‌ها، علاقه‌مندی‌ها و آدرس‌های خود را سریع‌تر مدیریت کنید.</p>
        </div>

        <form onSubmit={submit} className="rounded-3xl border border-border bg-card p-6 shadow-xl shadow-primary/5 md:p-8">
          <div className="mb-8 text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-2xl text-primary">＋</div>
            <h2 className="text-2xl font-bold">ایجاد حساب کاربری</h2>
            <p className="mt-1 text-sm text-muted-foreground">برای شروع خرید، اطلاعات خود را وارد کنید</p>
          </div>

          {error && <div className="mb-4 rounded-xl bg-destructive/10 p-3 text-sm text-destructive">{error}</div>}

          <div className="space-y-4">
            <label className="block space-y-2"><span className="text-sm font-medium">نام</span><input className="h-12 w-full rounded-xl border border-input bg-background px-4 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20" type="text" autoComplete="name" value={name} onChange={(event) => setName(event.target.value)} placeholder="نام شما" required /></label>
            <label className="block space-y-2"><span className="text-sm font-medium">ایمیل یا شماره موبایل</span><div className="relative"><span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">✉</span><input className="h-12 w-full rounded-xl border border-input bg-background px-10 text-left dir-ltr outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20" type="text" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@example.com" required /></div></label>
            <label className="block space-y-2"><span className="text-sm font-medium">رمز عبور</span><div className="relative"><span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">🔒</span><input className="h-12 w-full rounded-xl border border-input bg-background px-10 text-left dir-ltr outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20" type="password" autoComplete="new-password" value={password} onChange={(event) => setPassword(event.target.value)} placeholder="••••••••" required /></div></label>
            <label className="block space-y-2"><span className="text-sm font-medium">تکرار رمز عبور</span><div className="relative"><span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">🔒</span><input className="h-12 w-full rounded-xl border border-input bg-background px-10 text-left dir-ltr outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20" type="password" autoComplete="new-password" value={confirm} onChange={(event) => setConfirm(event.target.value)} placeholder="••••••••" required /></div></label>
          </div>

          <button className="mt-6 h-12 w-full rounded-xl bg-primary font-bold text-primary-foreground transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-60" disabled={loading}>{loading ? 'در حال ثبت‌نام...' : 'ایجاد حساب'}</button>
          <p className="mt-6 text-center text-sm text-muted-foreground">حساب دارید؟ <Link href="/login" className="font-medium text-primary hover:underline">وارد شوید</Link></p>
        </form>
      </section>
    </main>
  );
}
