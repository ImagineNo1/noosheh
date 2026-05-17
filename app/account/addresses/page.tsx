'use client';
import { useEffect, useState } from 'react';
import { accountApi } from '@/components/account/account-api';
import type { Address } from '@/components/account/account-types';

export default function AddressesPage() {
  const [items, setItems] = useState<Address[]>([]); const [text, setText] = useState('');
  useEffect(()=>{ accountApi.addresses().then(setItems).catch(()=>setItems([])); },[]);
  const add = async () => { if (!text.trim()) return; const created = await accountApi.addAddress({ label:'آدرس', text }); setItems((c)=>[created,...c]); setText(''); };
  return <div className="store-account-panel form"><h2>آدرس‌های من</h2><div className="inline"><input value={text} onChange={(e)=>setText(e.target.value)} placeholder="آدرس جدید" /><button className="store-outline-btn" onClick={add}>افزودن آدرس</button></div>{!items.length ? <p>آدرسی ثبت نشده است.</p> : items.map((a)=><div key={a.id} className="row"><span>{a.text}</span></div>)}</div>;
}
