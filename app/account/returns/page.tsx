'use client';

import { FormEvent, useEffect, useState } from 'react';
import { accountApi } from '@/components/account/account-api';
import type { ReturnRequest } from '@/components/account/account-types';
import type { Order } from '@/app/admin/types';

const statusConfig: Record<string, { label: string; color: string }> = {
  submitted: { label: 'ثبت شده', color: 'bg-blue-100 text-blue-700' }, reviewing: { label: 'در بررسی', color: 'bg-amber-100 text-amber-700' }, approved: { label: 'تایید شده', color: 'bg-green-100 text-green-700' }, rejected: { label: 'رد شده', color: 'bg-red-100 text-red-700' }, refunded: { label: 'بازپرداخت شد', color: 'bg-teal-100 text-teal-700' }, exchanged: { label: 'تعویض شد', color: 'bg-purple-100 text-purple-700' }
};
const reasons = [{ value: 'defective', label: 'معیوب / خراب' }, { value: 'wrong_item', label: 'اشتباه ارسال شده' }, { value: 'size_issue', label: 'مشکل سایز' }, { value: 'changed_mind', label: 'تغییر نظر' }, { value: 'other', label: 'سایر' }];

export default function ReturnsPage() {
  const [returns, setReturns] = useState<ReturnRequest[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ order_id: '', product_name: '', reason: '', description: '' });
  const reload = () => Promise.all([accountApi.returns().then(setReturns), accountApi.orders().then((items) => setOrders(items.filter((order) => order.status === 'delivered')))]).finally(() => setLoading(false));
  useEffect(() => { reload().catch(() => { setReturns([]); setOrders([]); }); }, []);
  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (!form.order_id || !form.reason) return;
    setSaving(true);
    await accountApi.createReturn({ ...form, order_number: form.order_id.slice(-8).toUpperCase(), status: 'submitted' });
    setForm({ order_id: '', product_name: '', reason: '', description: '' });
    setShowForm(false);
    await reload();
    setSaving(false);
  };

  return <div className="max-w-2xl space-y-5"><div className="flex items-center justify-between"><div><h1 className="text-xl font-bold">مرجوعی و تعویض</h1><p className="mt-1 text-sm text-muted-foreground">درخواست‌های بازگشت کالا</p></div>{!showForm && <button className="store-primary-btn" onClick={() => setShowForm(true)}>＋ درخواست جدید</button>}</div>{showForm && <section className="rounded-xl border border-primary/30 bg-card p-5"><div className="mb-4 flex items-center justify-between"><h2 className="font-semibold">درخواست مرجوعی جدید</h2><button onClick={() => setShowForm(false)}>×</button></div><form onSubmit={submit} className="space-y-4"><label className="block space-y-1.5 text-sm">سفارش مربوطه *{orders.length > 0 ? <select className="admin-input" value={form.order_id} onChange={(event) => setForm((current) => ({ ...current, order_id: event.target.value }))}><option value="">انتخاب سفارش</option>{orders.map((order) => <option key={order.id} value={order.id}>#{order.order_number || order.id.slice(-8).toUpperCase()} - {(order.total_amount || 0).toLocaleString('fa-IR')} ریال</option>)}</select> : <input className="admin-input" value={form.order_id} onChange={(event) => setForm((current) => ({ ...current, order_id: event.target.value }))} placeholder="شناسه سفارش" />}</label><label className="block space-y-1.5 text-sm">نام محصول<input className="admin-input" value={form.product_name} onChange={(event) => setForm((current) => ({ ...current, product_name: event.target.value }))} /></label><label className="block space-y-1.5 text-sm">دلیل مرجوعی *<select className="admin-input" value={form.reason} onChange={(event) => setForm((current) => ({ ...current, reason: event.target.value }))}><option value="">انتخاب دلیل</option>{reasons.map((reason) => <option key={reason.value} value={reason.value}>{reason.label}</option>)}</select></label><label className="block space-y-1.5 text-sm">توضیحات<input className="admin-input" value={form.description} onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))} /></label><button className="store-primary-btn" disabled={saving}>{saving ? 'در حال ثبت...' : 'ثبت درخواست'}</button></form></section>}{loading ? <div className="store-account-panel">در حال بارگذاری...</div> : returns.length === 0 && !showForm ? <div className="rounded-xl border-2 border-dashed border-border py-16 text-center"><div className="mb-3 text-4xl opacity-30">↩</div><p className="mb-3 text-sm text-muted-foreground">درخواست مرجوعی ندارید</p><button className="store-primary-btn" onClick={() => setShowForm(true)}>ثبت درخواست</button></div> : <div className="space-y-3">{returns.map((request) => { const status = statusConfig[request.status || 'submitted'] || statusConfig.submitted; const reasonLabel = reasons.find((reason) => reason.value === request.reason)?.label || request.reason; return <section key={request.id} className="rounded-xl border border-border bg-card p-4"><div className="mb-1 flex items-center gap-2"><p className="text-sm font-medium">#{request.order_number || request.order_id.slice(-8).toUpperCase()}</p><span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${status.color}`}>{status.label}</span></div>{request.product_name && <p className="text-xs text-muted-foreground">محصول: {request.product_name}</p>}<p className="text-xs text-muted-foreground">دلیل: {reasonLabel}</p><p className="mt-1 text-[10px] text-muted-foreground">{request.created_date ? new Date(request.created_date).toLocaleDateString('fa-IR') : ''}</p></section>; })}</div>}</div>;
}
