'use client';

import { FormEvent, useEffect, useState } from 'react';
import { accountApi } from '@/components/account/account-api';

export default function ProfilePage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [createdDate, setCreatedDate] = useState('');
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => { accountApi.profile().then((profile) => { setName(profile.name || ''); setEmail(profile.email || ''); setCreatedDate(profile.created_date || ''); }); }, []);
  const onSave = async (event: FormEvent) => {
    event.preventDefault();
    if (!name.trim()) return setMessage('نام نمی‌تواند خالی باشد');
    setSaving(true);
    try {
      const profile = await accountApi.updateProfile({ name });
      setName(profile.name || '');
      setMessage('اطلاعات با موفقیت ذخیره شد');
    } catch {
      setMessage('خطا در ذخیره اطلاعات');
    } finally {
      setSaving(false);
    }
  };
  const joinDate = createdDate ? new Date(createdDate).toLocaleDateString('fa-IR', { year: 'numeric', month: 'long', day: 'numeric' }) : null;

  return <div className="max-w-xl space-y-6"><div><h1 className="text-xl font-bold">پروفایل</h1><p className="mt-1 text-sm text-muted-foreground">اطلاعات شخصی خود را مدیریت کنید</p></div><section className="flex items-center gap-4 rounded-xl border border-border bg-card p-5"><div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-primary/15 text-2xl font-bold text-primary">{(name || 'K').charAt(0)}</div><div><p className="font-semibold">{name || '---'}</p><p className="text-sm text-muted-foreground">{email}</p>{joinDate && <p className="mt-1 text-xs text-muted-foreground">عضویت از {joinDate}</p>}</div></section><form className="rounded-xl border border-border bg-card p-5" onSubmit={onSave}><h2 className="mb-4 font-semibold">☻ ویرایش اطلاعات</h2><div className="space-y-4"><label className="block space-y-1.5 text-sm">نام و نام خانوادگی<input className="admin-input" value={name} onChange={(event) => setName(event.target.value)} placeholder="نام و نام خانوادگی" /></label><label className="block space-y-1.5 text-sm">ایمیل<input className="admin-input bg-secondary/50 text-muted-foreground" value={email} disabled /><span className="block text-xs text-muted-foreground">ایمیل قابل تغییر نیست</span></label>{message && <p className="text-sm text-primary">{message}</p>}<button className="store-primary-btn" disabled={saving}>{saving ? 'در حال ذخیره...' : 'ذخیره تغییرات'}</button></div></form></div>;
}
