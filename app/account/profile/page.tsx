'use client';
import { FormEvent, useEffect, useState } from 'react';
import { accountApi } from '@/components/account/account-api';

export default function ProfilePage() {
  const [name, setName] = useState(''); const [email, setEmail] = useState(''); const [saving, setSaving] = useState(false);
  useEffect(()=>{ accountApi.profile().then((p)=>{setName(p.name||''); setEmail(p.email||'');}); },[]);
  const onSave = async (e: FormEvent) => { e.preventDefault(); setSaving(true); const p = await accountApi.updateProfile({ name }); setName(p.name||''); setSaving(false); };
  return <form className="store-account-panel form" onSubmit={onSave}><h2>پروفایل من</h2><input value={name} onChange={(e)=>setName(e.target.value)} placeholder="نام" /><input value={email} readOnly /><button className="store-primary-btn" disabled={saving}>{saving?'در حال ذخیره...':'ذخیره تغییرات'}</button></form>;
}
