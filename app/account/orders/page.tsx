'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import type { Order } from '@/app/admin/types';
import { accountApi } from '@/components/account/account-api';

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]); const [loading, setLoading] = useState(true);
  useEffect(() => { accountApi.orders().then(setOrders).finally(() => setLoading(false)); }, []);
  if (loading) return <div className="store-account-panel">در حال بارگذاری...</div>;
  if (!orders.length) return <div className="store-account-panel">سفارشی ثبت نشده است.</div>;
  return <div className="store-account-panel">{orders.map((o) => <div key={o.id} className="row"><span>#{o.order_number}</span><small>{o.status}</small><b>{(o.total_amount || 0).toLocaleString('fa-IR')} تومان</b><Link href={`/account/orders/${o.id}`}>جزئیات</Link></div>)}</div>;
}
