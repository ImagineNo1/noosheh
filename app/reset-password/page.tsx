'use client';

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { FormEvent, Suspense, useState } from 'react';

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const resetToken = searchParams?.get('token') || '';
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setError('');
    if (newPassword.length < 6) return setError('رمز عبور حداقل ۶ کاراکتر باشد.');
    if (newPassword !== confirmPassword) return setError('تکرار رمز عبور یکسان نیست.');
    setLoading(true);
    try {
      const response = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mode: 'reset_password', resetToken, newPassword })
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error || 'خطا در تغییر رمز عبور');
      router.replace('/login');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'خطا در تغییر رمز عبور');
    } finally {
      setLoading(false);
    }
  };

  if (!resetToken) {
    return <main className="min-h-screen bg-gradient-to-br from-primary/10 via-background to-primary/5 px-4 py-10" dir="rtl"><section className="mx-auto flex min-h-[calc(100vh-5rem)] max-w-md items-center"><div className="w-full rounded-3xl border border-border bg-card p-8 text-center shadow-xl shadow-primary/5"><div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-destructive/10 text-2xl text-destructive">!</div><h1 className="text-2xl font-bold">لینک نامعتبر است</h1><p className="mt-2 text-sm text-muted-foreground">لینک بازیابی رمز عبور ناقص یا نامعتبر است.</p><Link href="/forgot-password" className="mt-6 inline-flex rounded-full bg-primary px-5 py-2.5 text-sm font-bold text-primary-foreground">درخواست لینک جدید</Link></div></section></main>;
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-primary/10 via-background to-primary/5 px-4 py-10" dir="rtl">
      <section className="mx-auto flex min-h-[calc(100vh-5rem)] max-w-md items-center">
        <form onSubmit={submit} className="w-full rounded-3xl border border-border bg-card p-6 shadow-xl shadow-primary/5 md:p-8">
          <div className="mb-8 text-center"><div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-2xl text-primary">🔒</div><h1 className="text-2xl font-bold">رمز عبور جدید</h1><p className="mt-1 text-sm text-muted-foreground">رمز جدید خود را وارد کنید</p></div>
          {error && <div className="mb-4 rounded-xl bg-destructive/10 p-3 text-sm text-destructive">{error}</div>}
          <div className="space-y-4">
            <label className="block space-y-2"><span className="text-sm font-medium">رمز عبور جدید</span><input className="h-12 w-full rounded-xl border border-input bg-background px-4 text-left dir-ltr outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20" type="password" autoComplete="new-password" autoFocus value={newPassword} onChange={(event) => setNewPassword(event.target.value)} placeholder="••••••••" required /></label>
            <label className="block space-y-2"><span className="text-sm font-medium">تکرار رمز عبور</span><input className="h-12 w-full rounded-xl border border-input bg-background px-4 text-left dir-ltr outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20" type="password" autoComplete="new-password" value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} placeholder="••••••••" required /></label>
          </div>
          <button className="mt-6 h-12 w-full rounded-xl bg-primary font-bold text-primary-foreground transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-60" disabled={loading}>{loading ? 'در حال ذخیره...' : 'تغییر رمز عبور'}</button>
        </form>
      </section>
    </main>
  );
}


export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<main className="min-h-screen bg-gradient-to-br from-primary/10 via-background to-primary/5 px-4 py-10" dir="rtl"><section className="mx-auto flex min-h-[calc(100vh-5rem)] max-w-md items-center"><div className="h-64 w-full animate-pulse rounded-3xl bg-secondary" /></section></main>}>
      <ResetPasswordForm />
    </Suspense>
  );
}
