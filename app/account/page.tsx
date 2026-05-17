'use client';
import { useEffect, useState } from 'react';
import { storeApi } from '@/lib/store-api';
import { getStoredUser } from '@/lib/user-auth';
import type { Order } from '@/app/admin/types';

export default function AccountPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  useEffect(() => { const email = getStoredUser()?.email; storeApi.orders().then((data) => setOrders(data.filter((x) => x.customer_email === email))).catch(() => setOrders([])); }, []);
  return <section className="admin-grid cards-3"><article className="admin-card"><h3>تعداد سفارش</h3><b>{orders.length.toLocaleString('fa-IR')}</b></article><article className="admin-card"><h3>آخرین وضعیت</h3><b>{orders[0]?.status || '—'}</b></article><article className="admin-card"><h3>مبلغ کل</h3><b>{orders.reduce((s, o) => s + (o.total_amount || 0), 0).toLocaleString('fa-IR')} تومان</b></article></section>;
}
