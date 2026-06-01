'use client';

import Link from 'next/link';
import { FormEvent, useState } from 'react';
import StoreHeader from '@/components/store/StoreHeader';
import { storeApi } from '@/lib/store-api';
import type { Order } from '@/app/admin/types';

const steps = [
  { key: 'pending', label: 'ثبت سفارش', icon: '◷' },
  { key: 'processing', label: 'در حال پردازش', icon: '▣' },
  { key: 'shipped', label: 'ارسال شده', icon: '▸' },
  { key: 'delivered', label: 'تحویل داده شده', icon: '✓' }
];
const statusLabels: Record<string, { label: string; cls: string }> = {
  pending: { label: 'در انتظار تایید', cls: 'warning' }, processing: { label: 'در حال پردازش', cls: 'info' }, shipped: { label: 'ارسال شده', cls: 'purple' }, delivered: { label: 'تحویل داده شده', cls: 'success' }, cancelled: { label: 'لغو شده', cls: 'danger' }
};
const paymentLabels: Record<string, string> = { unpaid: 'پرداخت نشده', paid: 'پرداخت شده', refunded: 'بازگشت وجه' };
const formatPrice = (price?: number) => (price || 0).toLocaleString('fa-IR') + ' ریال';

function Tracker({ status }: { status: string }) {
  if (status === 'cancelled') return <div className="store-cancelled">✕ این سفارش لغو شده است</div>;
  const current = Math.max(0, steps.findIndex((step) => step.key === status));
  return <div className="store-tracker"><div className="store-tracker-line"><span style={{ width: `${(current / (steps.length - 1)) * 100}%` }} /></div>{steps.map((step, index) => <div key={step.key} className={index <= current ? 'done' : ''}><b>{step.icon}</b><span>{step.label}</span></div>)}</div>;
}

export default function OrderTracking() {
  const [orderNumber, setOrderNumber] = useState('');
  const [phone, setPhone] = useState('');
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(false);
  const [notFound, setNotFound] = useState(false);

  const handleSearch = async (event: FormEvent) => {
    event.preventDefault();
    setLoading(true); setNotFound(false); setOrder(null);
    const orders = await storeApi.orders();
    const found = orders.find((item) => item.order_number === orderNumber && (!phone || item.customer_phone === phone));
    if (found) setOrder(found); else setNotFound(true);
    setLoading(false);
  };

  const statusInfo = order ? statusLabels[order.status] : null;
  return (
    <div className="store-page" dir="rtl"><StoreHeader />
      <div className="store-container store-breadcrumb"><Link href="/">خانه</Link><span>‹</span><b>پیگیری سفارش</b></div>
      <section className="store-gradient-hero center"><div className="store-container"><div className="store-hero-icon">▣</div><h1>پیگیری سفارش</h1><p>شماره سفارش خود را وارد کنید تا وضعیت خریدتان را مشاهده کنید</p></div></section>
      <main className="store-container store-narrow">
        <section className="store-panel"><form onSubmit={handleSearch} className="store-simple-form"><label>شماره سفارش *<input value={orderNumber} onChange={(e) => setOrderNumber(e.target.value)} placeholder="مثال: NP-123456" required /></label><label>شماره موبایل (اختیاری)<input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="۰۹۱۲۳۴۵۶۷۸۹" /></label><button className="store-primary-btn full" disabled={loading}>⌕ {loading ? 'در حال جستجو...' : 'پیگیری سفارش'}</button></form></section>
        {notFound && <div className="store-empty bordered">✕<h2>سفارشی یافت نشد</h2><p>لطفاً شماره سفارش را بررسی کنید</p></div>}
        {order && <div className="store-order-result"><section className="store-panel"><div className="store-order-head"><div><p>شماره سفارش</p><h2>{order.order_number}</h2></div><span className={`store-status ${statusInfo?.cls}`}>{statusInfo?.label}</span></div><Tracker status={order.status} /><div className="store-order-info"><div><p>نام مشتری</p><b>{order.customer_name} {order.customer_family}</b></div><div><p>وضعیت پرداخت</p><b>{paymentLabels[order.payment_status]}</b></div>{order.tracking_code && <div className="wide"><p>کد رهگیری پستی</p><b className="primary">{order.tracking_code}</b></div>}{order.address && <div className="wide">⌖ {order.province}، {order.city}، {order.address}</div>}</div></section><section className="store-panel flush"><h3>اقلام سفارش</h3>{order.items?.map((item, i) => <div className="store-order-line" key={i}>{item.image && <img src={item.image} alt={item.title} />}<div><p>{item.title}</p><small>{item.size && `سایز: ${item.size} `}{item.color && `رنگ: ${item.color} `}تعداد: {item.quantity}</small></div><b>{formatPrice(item.price)}</b></div>)}<div className="store-summary-total"><span>جمع کل</span><b>{formatPrice(order.total_amount)}</b></div></section>{order.notes && <section className="store-note"><b>یادداشت سفارش:</b><p>{order.notes}</p></section>}</div>}
      </main>
    </div>
  );
}
