'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { accountApi } from '@/components/account/account-api';
import type { WishlistItem } from '@/components/account/account-types';

export default function WishlistPage() {
  const [items, setItems] = useState<WishlistItem[]>([]);
  useEffect(()=>{ accountApi.wishlist().then(setItems).catch(()=>setItems([])); },[]);
  return <div className="store-account-panel">{items.length ? items.map((w)=><div className="row" key={w.id}><span>{w.product_id}</span><small>{w.added_date?.slice(0,10)}</small></div>) : <div className="store-empty bordered">محصول مورد علاقه‌ای ندارید.<Link href="/">رفتن به فروشگاه</Link></div>}</div>;
}
