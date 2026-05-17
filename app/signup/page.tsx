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
  const submit = async (e: FormEvent) => {
    e.preventDefault(); setError('');
    if (!name.trim()) return setError('نام را وارد کنید.');
    if (password.length < 6) return setError('رمز عبور حداقل ۶ کاراکتر باشد.');
    if (password !== confirm) return setError('تکرار رمز عبور یکسان نیست.');
    setLoading(true);
    try {
      const res = await fetch('/api/auth', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ mode: 'register', name, email, password }) });
      const data = await res.json(); if (!res.ok) throw new Error(data.error);
      setUserSession(data.token, data.user); router.replace('/account');
    } catch (err) { setError(err instanceof Error ? err.message : 'خطا در ثبت‌نام'); } finally { setLoading(false); }
  };
  return <main className="admin-auth-screen" dir="rtl"><form className="admin-auth-card" onSubmit={submit}><h1>ثبت‌نام</h1><input placeholder="نام" value={name} onChange={(e) => setName(e.target.value)} /><input placeholder="ایمیل یا شماره" value={email} onChange={(e) => setEmail(e.target.value)} /><input type="password" placeholder="رمز عبور" value={password} onChange={(e) => setPassword(e.target.value)} /><input type="password" placeholder="تکرار رمز عبور" value={confirm} onChange={(e) => setConfirm(e.target.value)} />{error && <span>{error}</span>}<button className="admin-btn primary" disabled={loading}>{loading ? 'در حال ثبت‌نام...' : 'ثبت‌نام'}</button><Link href="/login">حساب دارید؟ ورود</Link></form></main>;
}
