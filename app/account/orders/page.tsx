'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import type { Order } from '@/app/admin/types';
import { accountApi } from '@/components/account/account-api';

const filters = [
  { key: 'all', label: 'همه' }, { key: 'pending', label: 'در انتظار پرداخت' }, { key: 'processing', label: 'در حال پردازش' }, { key: 'shipped', label: 'ارسال‌شده' }, { key: 'delivered', label: 'تحویل‌شده' }, { key: 'cancelled', label: 'لغوشده' }
];
const badge: Record<string, string> = { pending: 'bg-amber-100 text-amber-700', processing: 'bg-blue-100 text-blue-700', shipped: 'bg-purple-100 text-purple-700', delivered: 'bg-green-100 text-green-700', cancelled: 'bg-red-100 text-red-700' };

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [status, setStatus] = useState('all');
  const [search, setSearch] = useState('');
  useEffect(() => { accountApi.orders().then(setOrders).catch(() => setOrders([])).finally(() => setIsLoading(false)); }, []);
  const filtered = useMemo(() => orders.filter((order) => (status === 'all' || order.status === status) && (!search || `${order.order_number || order.id}`.toLowerCase().includes(search.toLowerCase()))), [orders, status, search]);
  const label = (value: string) => filters.find((item) => item.key === value)?.label || value;

  return <div className="space-y-5"><div><h1 className="text-xl font-bold">سفارش‌های من</h1><p className="mt-1 text-sm text-muted-foreground">تاریخچه و وضعیت سفارش‌های شما</p></div><div className="flex flex-col gap-3 sm:flex-row"><input className="admin-input max-w-xs" placeholder="جستجو با شماره سفارش..." value={search} onChange={(e) => setSearch(e.target.value)} /><div className="flex flex-wrap gap-2">{filters.map((item) => <button key={item.key} onClick={() => setStatus(item.key)} className={`rounded-full border px-3 py-1.5 text-xs transition ${status === item.key ? 'border-primary bg-primary text-primary-foreground' : 'border-border text-muted-foreground hover:bg-secondary'}`}>{item.label}</button>)}</div></div><section className="hidden overflow-hidden rounded-xl border border-border bg-card md:block"><table className="w-full text-sm"><thead><tr className="border-b bg-secondary/40"><th className="p-3 text-right">شماره سفارش</th><th className="p-3 text-right">تاریخ</th><th className="p-3 text-right">وضعیت</th><th className="p-3 text-right">تعداد آیتم</th><th className="p-3 text-right">مبلغ کل</th><th className="p-3" /></tr></thead><tbody>{isLoading ? [1,2,3].map((i) => <tr key={i}><td className="p-3" colSpan={6}>در حال بارگذاری...</td></tr>) : filtered.length === 0 ? <tr><td colSpan={6} className="p-10 text-center text-muted-foreground">سفارشی یافت نشد</td></tr> : filtered.map((order) => <tr key={order.id} className="border-b hover:bg-secondary/30"><td className="p-3 font-mono text-xs">#{order.order_number || order.id.slice(-8).toUpperCase()}</td><td className="p-3 text-muted-foreground">{order.created_date ? new Date(order.created_date).toLocaleDateString('fa-IR') : '—'}</td><td className="p-3"><span className={`rounded-full px-2.5 py-1 text-xs font-medium ${badge[order.status] || 'bg-secondary'}`}>{label(order.status)}</span></td><td className="p-3 text-center">{order.items?.length || 0}</td><td className="p-3 font-medium">{(order.total_amount || 0).toLocaleString('fa-IR')} ت</td><td className="p-3"><Link href={`/account/orders/${order.id}`} className="text-xs text-primary hover:underline">جزئیات ‹</Link></td></tr>)}</tbody></table></section><div className="space-y-3 md:hidden">{isLoading ? <div className="store-account-panel">در حال بارگذاری...</div> : filtered.length === 0 ? <div className="py-16 text-center text-sm text-muted-foreground">سفارشی یافت نشد</div> : filtered.map((order) => <Link key={order.id} href={`/account/orders/${order.id}`}><section className="rounded-xl border border-border bg-card p-4"><div className="flex items-center justify-between"><div><p className="font-mono text-xs font-medium">#{order.order_number || order.id.slice(-8).toUpperCase()}</p><p className="mt-0.5 text-[10px] text-muted-foreground">{(order.total_amount || 0).toLocaleString('fa-IR')} تومان</p></div><span className={`rounded-full px-2 py-1 text-[10px] font-medium ${badge[order.status] || 'bg-secondary'}`}>{label(order.status)}</span></div></section></Link>)}</div></div>;
}
