'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import type { Order } from '@/app/admin/types';
import { storeApi } from '@/lib/store-api';
import { getStoredUser } from '@/lib/user-auth';

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]); const [loading, setLoading] = useState(true);
  useEffect(() => { const email = getStoredUser()?.email; storeApi.orders().then((data) => setOrders(data.filter((x) => x.customer_email === email))).finally(() => setLoading(false)); }, []);
  if (loading) return <div className="admin-card">در حال بارگذاری...</div>;
  if (!orders.length) return <div className="admin-card">سفارشی ثبت نشده است.</div>;
  return <div className="admin-card"><table className="admin-table"><thead><tr><th>شماره</th><th>تاریخ</th><th>وضعیت</th><th>مبلغ</th><th>جزئیات</th></tr></thead><tbody>{orders.map((o) => <tr key={o.id}><td>{o.order_number}</td><td>{o.created_date?.slice(0,10)}</td><td>{o.status}</td><td>{(o.total_amount || 0).toLocaleString('fa-IR')}</td><td><Link href={`/account/orders/${o.id}`}>مشاهده</Link></td></tr>)}</tbody></table></div>;
}
