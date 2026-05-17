'use client';

import Link from 'next/link';
import { FormEvent, useState } from 'react';
import StoreHeader from '@/components/store/StoreHeader';
import { useCart } from '@/lib/cart-context';
import { storeApi } from '@/lib/store-api';

const provinces = ['تهران', 'اصفهان', 'فارس', 'خراسان رضوی', 'آذربایجان شرقی', 'مازندران', 'گیلان', 'کرمان', 'خوزستان', 'البرز', 'قم', 'سمنان', 'یزد', 'هرمزگان', 'بوشهر', 'سایر'];
const steps = ['سبد خرید', 'خرید و تسویه حساب', 'کارورد'];
const formatPrice = (price: number) => price.toLocaleString('fa-IR') + ' تومان';

export default function Checkout() {
  const { items, totalPrice, clearCart } = useCart();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [form, setForm] = useState({ customer_name: '', customer_family: '', customer_phone: '', customer_email: '', province: '', city: '', address: '', postal_code: '', notes: '' });
  const handleChange = (field: string, value: string) => setForm((current) => ({ ...current, [field]: value }));

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setIsSubmitting(true);
    await storeApi.createOrder({ ...form, order_number: `NP-${Date.now().toString(36).toUpperCase()}`, items, total_amount: totalPrice, status: 'pending', payment_status: 'unpaid' });
    clearCart();
    setOrderSuccess(true);
    setIsSubmitting(false);
  };

  if (orderSuccess) return <div className="store-page" dir="rtl"><StoreHeader /><div className="store-success-card"><div>✓</div><h2>سفارش شما ثبت شد!</h2><p>سفارش شما با موفقیت ثبت شده. تمامی سفارشات پس از پرداخت در بازه سه روزه ارسال می‌شود.</p><Link href="/" className="store-primary-btn">بازگشت به فروشگاه</Link></div></div>;
  if (!items.length) return <div className="store-page" dir="rtl"><StoreHeader /><div className="store-empty">🛍<p>سبد خرید شما خالی است</p><Link href="/" className="store-primary-btn">بازگشت به فروشگاه</Link></div></div>;

  return (
    <div className="store-page muted" dir="rtl">
      <StoreHeader />
      <div className="store-checkout-head"><div className="store-container"><h1>پرداخت</h1><Link href="/" className="store-logo">N<span>♥</span>OSHEH</Link></div></div>
      <div className="store-checkout-steps"><div className="store-container">{steps.map((step, i) => <div key={step} className={i <= 1 ? 'active' : ''}><span>{i + 1}</span>{step}</div>)}</div></div>
      <main className="store-container store-checkout-grid">
        <form onSubmit={handleSubmit} className="store-checkout-form">
          <section className="store-panel"><h2>جزئیات صورتحساب</h2><div className="store-form-grid">
            <label>نام *<input required value={form.customer_name} onChange={(e) => handleChange('customer_name', e.target.value)} /></label>
            <label>نام خانوادگی *<input required value={form.customer_family} onChange={(e) => handleChange('customer_family', e.target.value)} /></label>
            <label>تلفن *<input required dir="ltr" type="tel" value={form.customer_phone} onChange={(e) => handleChange('customer_phone', e.target.value)} /></label>
            <label>آدرس ایمیل *<input required dir="ltr" type="email" value={form.customer_email} onChange={(e) => handleChange('customer_email', e.target.value)} /></label>
            <label>استان *<select required value={form.province} onChange={(e) => handleChange('province', e.target.value)}><option value="">یک گزینه انتخاب بفرمایید</option>{provinces.map((province) => <option key={province} value={province}>{province}</option>)}</select></label>
            <label>شهر *<input required value={form.city} onChange={(e) => handleChange('city', e.target.value)} /></label>
            <label className="wide">آدرس خیابان *<input required value={form.address} onChange={(e) => handleChange('address', e.target.value)} /></label>
            <label>کدپستی *<input required dir="ltr" value={form.postal_code} onChange={(e) => handleChange('postal_code', e.target.value)} /></label>
            <label className="wide">توضیحات سفارش<textarea value={form.notes} onChange={(e) => handleChange('notes', e.target.value)} placeholder="یادداشت‌ها درباره سفارش شما..." /></label>
          </div></section>
          <button className="store-primary-btn big full" disabled={isSubmitting}>🔒 {isSubmitting ? 'در حال ثبت سفارش...' : 'ثبت سفارش'}</button>
        </form>
        <aside className="store-checkout-summary"><section className="store-panel"><h2>سفارش شما</h2>{items.map((item) => <div className="store-summary-item" key={item.key}>{item.image && <img src={item.image} alt={item.title} />}<div><p>{item.title}</p><small>{item.quantity} عدد{item.size && ` - سایز ${item.size}`}</small></div><b>{formatPrice(item.price * item.quantity)}</b></div>)}<div className="store-summary-total"><span>مجموع:</span><b>{formatPrice(totalPrice)}</b></div></section><div className="store-note">کاربر گرامی: تمامی سفارشات ما پس از پرداخت در بازه سه روزه ارسال می‌گردد.</div></aside>
      </main>
    </div>
  );
}
