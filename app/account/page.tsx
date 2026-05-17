'use client';
import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import type { Order } from '@/app/admin/types';
import { accountApi } from '@/components/account/account-api';

export default function AccountPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  useEffect(() => { accountApi.orders().then(setOrders).catch(() => setOrders([])); }, []);
  const total = useMemo(() => orders.reduce((s, o) => s + (o.total_amount || 0), 0), [orders]);
  return <section className="store-account-content"><div className="store-account-cards"><article><h3>تعداد سفارش</h3><b>{orders.length.toLocaleString('fa-IR')}</b></article><article><h3>آخرین وضعیت</h3><b>{orders[0]?.status || '—'}</b></article><article><h3>مبلغ کل</h3><b>{total.toLocaleString('fa-IR')} تومان</b></article></div><div className="store-account-panel"><div className="head"><h3>سفارش‌های اخیر</h3><Link href="/account/orders">مشاهده همه</Link></div>{orders.slice(0,3).map((o)=><div key={o.id} className="row"><span>#{o.order_number}</span><small>{o.created_date?.slice(0,10)}</small><b>{(o.total_amount||0).toLocaleString('fa-IR')} تومان</b></div>)}</div></section>;
}
