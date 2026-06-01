'use client';

import { FormEvent, useEffect, useState } from 'react';
import { accountApi } from '@/components/account/account-api';
import type { Address } from '@/components/account/account-types';

const emptyForm: Omit<Address, 'id'> = { full_name: '', phone: '', province: '', city: '', address: '', postal_code: '', unit: '', notes: '' };

function AddressForm({ initial, loading, onSave, onCancel }: { initial?: Address | null; loading?: boolean; onSave: (data: Omit<Address, 'id'>) => void; onCancel: () => void }) {
  const [form, setForm] = useState<Omit<Address, 'id'>>({ ...emptyForm, ...(initial || {}) });
  const set = (key: keyof Omit<Address, 'id'>, value: string) => setForm((current) => ({ ...current, [key]: value }));
  const submit = (event: FormEvent) => {
    event.preventDefault();
    if (!form.full_name || !form.phone || !form.city || !form.address) return;
    onSave(form);
  };
  return <form onSubmit={submit} className="space-y-4 p-5"><div className="grid grid-cols-1 gap-4 sm:grid-cols-2"><label className="space-y-1.5 text-sm">نام گیرنده *<input className="admin-input" value={form.full_name || ''} onChange={(e) => set('full_name', e.target.value)} /></label><label className="space-y-1.5 text-sm">شماره تماس *<input className="admin-input" dir="ltr" value={form.phone || ''} onChange={(e) => set('phone', e.target.value)} /></label><label className="space-y-1.5 text-sm">استان<input className="admin-input" value={form.province || ''} onChange={(e) => set('province', e.target.value)} /></label><label className="space-y-1.5 text-sm">شهر *<input className="admin-input" value={form.city || ''} onChange={(e) => set('city', e.target.value)} /></label><label className="space-y-1.5 text-sm sm:col-span-2">آدرس کامل *<input className="admin-input" value={form.address || ''} onChange={(e) => set('address', e.target.value)} /></label><label className="space-y-1.5 text-sm">پلاک/واحد<input className="admin-input" value={form.unit || ''} onChange={(e) => set('unit', e.target.value)} /></label><label className="space-y-1.5 text-sm">کد پستی<input className="admin-input" dir="ltr" value={form.postal_code || ''} onChange={(e) => set('postal_code', e.target.value)} /></label><label className="space-y-1.5 text-sm sm:col-span-2">یادداشت ارسال<input className="admin-input" value={form.notes || ''} onChange={(e) => set('notes', e.target.value)} /></label></div><div className="flex gap-2"><button className="store-primary-btn" disabled={loading}>{loading ? 'در حال ذخیره...' : 'ذخیره آدرس'}</button><button type="button" className="store-outline-btn" onClick={onCancel}>انصراف</button></div></form>;
}

export default function AddressesPage() {
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editing, setEditing] = useState<'new' | Address | null>(null);
  const [deleteId, setDeleteId] = useState('');
  const [saving, setSaving] = useState(false);

  const reload = () => accountApi.addresses().then(setAddresses).finally(() => setIsLoading(false));
  useEffect(() => { reload().catch(() => setAddresses([])); }, []);

  const save = async (data: Omit<Address, 'id'>) => {
    setSaving(true);
    if (editing && editing !== 'new') await accountApi.updateAddress(editing.id, data);
    else await accountApi.addAddress(data);
    await reload();
    setEditing(null);
    setSaving(false);
  };
  const remove = async () => { if (!deleteId) return; await accountApi.deleteAddress(deleteId); setDeleteId(''); await reload(); };
  const setDefault = async (id: string) => { await accountApi.updateAddress(id, { is_default: true }); await reload(); };

  return <div className="max-w-2xl space-y-5"><div className="flex items-center justify-between"><div><h1 className="text-xl font-bold">آدرس‌ها</h1><p className="mt-1 text-sm text-muted-foreground">مدیریت آدرس‌های تحویل</p></div>{!editing && <button className="store-primary-btn" onClick={() => setEditing('new')}>＋ افزودن آدرس</button>}</div>{editing && <section className="rounded-xl border border-primary/30 bg-card"><div className="flex items-center justify-between px-5 pt-4"><h3 className="text-sm font-semibold">{editing === 'new' ? 'آدرس جدید' : 'ویرایش آدرس'}</h3><button onClick={() => setEditing(null)}>×</button></div><AddressForm initial={editing === 'new' ? null : editing} onSave={save} onCancel={() => setEditing(null)} loading={saving} /></section>}{isLoading ? <div className="store-account-panel">در حال بارگذاری...</div> : addresses.length === 0 && !editing ? <div className="rounded-xl border-2 border-dashed border-border py-16 text-center text-sm text-muted-foreground">هنوز آدرسی ثبت نکرده‌اید</div> : addresses.map((address) => <section key={address.id} className={`rounded-xl border bg-card p-4 ${address.is_default ? 'border-primary/40' : 'border-border'}`}><div className="flex items-start justify-between gap-3"><div><div className="mb-1 flex items-center gap-2"><b className="text-sm">{address.full_name || address.label || 'گیرنده'}</b>{address.is_default && <span className="rounded bg-primary/10 px-1.5 py-0.5 text-[10px] text-primary">پیش‌فرض</span>}</div><p className="text-xs text-muted-foreground">{address.city}، {address.address || address.text}{address.unit ? `، واحد ${address.unit}` : ''}</p><p className="mt-0.5 text-xs text-muted-foreground">{address.phone}</p></div><div className="flex gap-1"><button className="admin-btn ghost" onClick={() => !address.is_default && setDefault(address.id)} disabled={address.is_default}>☆</button><button className="admin-btn ghost" onClick={() => setEditing(address)}>✎</button><button className="admin-btn danger" onClick={() => setDeleteId(address.id)}>🗑</button></div></div></section>)}{deleteId && <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"><div className="w-full max-w-sm rounded-xl bg-card p-5"><h3 className="mb-2 font-semibold">حذف آدرس</h3><p className="mb-4 text-sm text-muted-foreground">آیا از حذف این آدرس اطمینان دارید؟</p><div className="flex gap-2"><button className="admin-btn primary danger-fill" onClick={remove}>حذف</button><button className="admin-btn outline" onClick={() => setDeleteId('')}>انصراف</button></div></div></div>}</div>;
}
