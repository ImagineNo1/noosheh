'use client';
import { FormEvent, useState } from 'react';
import { getStoredUser, setUserSession, getUserToken } from '@/lib/user-auth';

export default function ProfilePage() {
  const user = getStoredUser();
  const [name, setName] = useState(user?.name || '');
  const onSave = (e: FormEvent) => { e.preventDefault(); if (!user) return; setUserSession(getUserToken(), { ...user, name }); };
  return <form className="admin-card" onSubmit={onSave}><h2>پروفایل</h2><input value={name} onChange={(e) => setName(e.target.value)} /><input value={user?.email || ''} readOnly /><button className="admin-btn primary">ذخیره</button></form>;
}
