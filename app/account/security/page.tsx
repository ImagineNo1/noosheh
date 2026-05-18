'use client';

import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';
import { accountApi } from '@/components/account/account-api';
import { clearUserSession } from '@/lib/user-auth';

function strength(password: string) {
  if (!password) return null;
  if (password.length < 6) return { label: 'خیلی کوتاه', color: 'bg-red-500', width: '25%' };
  if (password.length < 8) return { label: 'ضعیف', color: 'bg-orange-500', width: '50%' };
  if (/[A-Z]/.test(password) && /[0-9]/.test(password)) return { label: 'قوی', color: 'bg-green-500', width: '100%' };
  return { label: 'متوسط', color: 'bg-amber-500', width: '75%' };
}

function PasswordInput({ label, value, onChange, placeholder }: { label: string; value: string; onChange: (value: string) => void; placeholder: string }) {
  const [show, setShow] = useState(false);
  return <label className="block space-y-1.5 text-sm">{label}<div className="relative"><input className="admin-input pl-10" type={show ? 'text' : 'password'} value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} /><button type="button" onClick={() => setShow(!show)} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">{show ? '🙈' : '👁'}</button></div></label>;
}

export default function SecurityPage() {
  const router = useRouter();
  const [form, setForm] = useState({ current: '', newPass: '', confirm: '' });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const meter = strength(form.newPass);
  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setMessage('');
    if (!form.current || !form.newPass || !form.confirm) return setMessage('همه فیلدها را پر کنید');
    if (form.newPass !== form.confirm) return setMessage('رمز عبور جدید و تکرار آن یکسان نیستند');
    if (form.newPass.length < 8) return setMessage('رمز عبور باید حداقل ۸ کاراکتر باشد');
    setLoading(true);
    try {
      await accountApi.changePassword({ current: form.current, newPassword: form.newPass });
      setForm({ current: '', newPass: '', confirm: '' });
      setMessage('رمز عبور با موفقیت تغییر کرد');
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'خطا در تغییر رمز عبور');
    } finally {
      setLoading(false);
    }
  };
  const logout = () => { clearUserSession(); router.replace('/'); };

  return <div className="max-w-xl space-y-6"><div><h1 className="text-xl font-bold">امنیت حساب</h1><p className="mt-1 text-sm text-muted-foreground">رمز عبور و تنظیمات امنیتی</p></div><section className="rounded-xl border border-border bg-card p-5"><h2 className="mb-4 font-semibold">🛡 تغییر رمز عبور</h2><form onSubmit={submit} className="space-y-4"><PasswordInput label="رمز عبور فعلی" value={form.current} onChange={(value) => setForm((current) => ({ ...current, current: value }))} placeholder="رمز عبور فعلی" /><PasswordInput label="رمز عبور جدید" value={form.newPass} onChange={(value) => setForm((current) => ({ ...current, newPass: value }))} placeholder="حداقل ۸ کاراکتر" />{meter && <div className="space-y-1"><div className="h-1.5 overflow-hidden rounded-full bg-secondary"><div className={`h-full rounded-full ${meter.color}`} style={{ width: meter.width }} /></div><p className="text-xs text-muted-foreground">قدرت رمز: {meter.label}</p></div>}<PasswordInput label="تکرار رمز عبور جدید" value={form.confirm} onChange={(value) => setForm((current) => ({ ...current, confirm: value }))} placeholder="تکرار رمز عبور جدید" />{message && <p className="rounded-lg bg-primary/5 p-3 text-xs text-primary">{message}</p>}<button className="store-primary-btn" disabled={loading}>{loading ? 'در حال تغییر...' : 'تغییر رمز عبور'}</button></form></section><section className="rounded-xl border border-border bg-card p-5"><h2 className="mb-1 text-sm font-semibold text-destructive">⎋ خروج از حساب</h2><p className="mb-4 text-xs text-muted-foreground">از حساب کاربری خود خارج شوید.</p><button className="admin-btn primary danger-fill" onClick={logout}>خروج از حساب</button></section></div>;
}
