'use client';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import type { Order } from '@/app/admin/types';
import { storeApi } from '@/lib/store-api';

export default function OrderDetailsPage() {
  const params = useParams<{ id: string }>();
  const [order, setOrder] = useState<Order | null>(null);
  useEffect(() => { storeApi.orders().then((orders) => setOrder(orders.find((x) => x.id === params.id) || null)); }, [params.id]);
  if (!order) return <div className="admin-card">سفارش پیدا نشد.</div>;
  return <div className="admin-card"><h2>سفارش {order.order_number}</h2><p>وضعیت: {order.status}</p><p>مبلغ: {(order.total_amount || 0).toLocaleString('fa-IR')} تومان</p><ul>{order.items?.map((item, i) => <li key={i}>{item.title} × {item.quantity}</li>)}</ul></div>;
}
