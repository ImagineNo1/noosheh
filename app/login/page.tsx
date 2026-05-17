'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FormEvent, useEffect, useState } from 'react';
import { getStoredUser, setUserSession } from '@/lib/user-auth';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const [redirect, setRedirect] = useState('/account');

  useEffect(() => {
    const q = new URLSearchParams(window.location.search).get('redirect');
    if (q) setRedirect(q);
    if (getStoredUser()) router.replace(q || '/account');
  }, [router]);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    if (!email.trim() || password.length < 6) return setError('ایمیل/شماره و رمز عبور معتبر وارد کنید.');
    setLoading(true);
    try {
      const res = await fetch('/api/auth', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ mode: 'login', email, password }) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setUserSession(data.token, data.user);
      router.replace(redirect);
    } catch (err) { setError(err instanceof Error ? err.message : 'خطا در ورود'); } finally { setLoading(false); }
  };

  return <main className="admin-auth-screen" dir="rtl"><form className="admin-auth-card" onSubmit={submit}><h1>ورود کاربر</h1><input placeholder="ایمیل یا شماره" value={email} onChange={(e) => setEmail(e.target.value)} /><input type="password" placeholder="رمز عبور" value={password} onChange={(e) => setPassword(e.target.value)} />{error && <span>{error}</span>}<button className="admin-btn primary" disabled={loading}>{loading ? 'در حال ورود...' : 'ورود'}</button><Link href="/signup">حساب ندارید؟ ثبت‌نام</Link></form></main>;
}
