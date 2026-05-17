'use client';
import { useState } from 'react';

type Address = { id: string; label: string; text: string };
export default function AddressesPage() {
  const [items, setItems] = useState<Address[]>([]);
  const [text, setText] = useState('');
  return <div className="admin-card"><h2>آدرس‌ها</h2><div style={{ display: 'flex', gap: 8 }}><input value={text} onChange={(e) => setText(e.target.value)} placeholder="آدرس جدید" /><button className="admin-btn" onClick={() => { if (!text.trim()) return; setItems([{ id: crypto.randomUUID(), label: 'آدرس', text }, ...items]); setText(''); }}>افزودن</button></div>{!items.length ? <p>آدرسی ثبت نشده.</p> : <ul>{items.map((a) => <li key={a.id}>{a.text}</li>)}</ul>}</div>;
}
