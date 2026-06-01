'use client';

import Link from 'next/link';
import { FormEvent, useMemo, useState } from 'react';
import StoreHeader from '@/components/store/StoreHeader';
import { useCart } from '@/lib/cart-context';
import { storeApi } from '@/lib/store-api';

const provinces = ['تهران', 'اصفهان', 'فارس', 'خراسان رضوی', 'آذربایجان شرقی', 'مازندران', 'گیلان', 'کرمان', 'خوزستان', 'البرز', 'قم', 'سمنان', 'یزد', 'هرمزگان', 'بوشهر', 'سایر'];
const steps = ['اطلاعات تماس', 'آدرس ارسال', 'روش ارسال', 'روش پرداخت'];
const freeShippingThreshold = 5000000;
const formatPrice = (price: number) => `${price.toLocaleString('fa-IR')} تومان`;

function Icon({ name }: { name: 'lock' | 'gift' | 'truck' | 'headset' | 'arrow' }) {
  const paths = {
    lock: <><rect x="5" y="10" width="14" height="10" rx="2" /><path d="M8 10V7a4 4 0 0 1 8 0v3" /></>,
    gift: <><path d="M20 12v8H4v-8" /><path d="M2 7h20v5H2z" /><path d="M12 7v13" /></>,
    truck: <><path d="M3 7h11v9H3z" /><path d="M14 10h4l3 3v3h-7z" /><circle cx="7" cy="18" r="2" /><circle cx="18" cy="18" r="2" /></>,
    headset: <><path d="M4 13a8 8 0 0 1 16 0" /><path d="M4 13v4a2 2 0 0 0 2 2h2v-7H6a2 2 0 0 0-2 2Zm16 0v4a2 2 0 0 1-2 2h-2v-7h2a2 2 0 0 1 2 2Z" /></>,
    arrow: <path d="M15 6 9 12l6 6" />
  };
  return <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">{paths[name]}</svg>;
}

export default function Checkout() {
  const { items, totalPrice, clearCart } = useCart();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [error, setError] = useState('');
  const [shippingMethod, setShippingMethod] = useState<'standard' | 'express'>('standard');
  const [paymentMethod, setPaymentMethod] = useState<'online' | 'coordination'>('online');
  const [useLastAddress, setUseLastAddress] = useState(false);
  const [form, setForm] = useState({ customer_name: '', customer_family: '', customer_phone: '', customer_email: '', province: '', city: '', address: '', postal_code: '', notes: '' });
  const handleChange = (field: string, value: string) => setForm((current) => ({ ...current, [field]: value }));

  const originalTotal = items.reduce((sum, item) => sum + item.original_price * item.quantity, 0);
  const savedAmount = Math.max(0, originalTotal - totalPrice);
  const shippingCost = totalPrice >= freeShippingThreshold ? 0 : shippingMethod === 'express' ? 145000 : 85000;
  const payable = totalPrice + shippingCost;

  const trustItems = useMemo<Array<[string, string, 'lock' | 'gift' | 'truck' | 'headset']>>(() => [
    ['پرداخت امن', 'اطلاعات شما با بالاترین سطح امنیت محافظت می‌شود.', 'lock' as const],
    ['بسته‌بندی محرمانه', 'سفارش در بسته‌بندی شیک و بدون نام برند ارسال می‌شود.', 'gift' as const],
    ['تحویل سریع', 'ارسال سفارش در بازه کاری به سراسر ایران.', 'truck' as const],
    ['پشتیبانی در کنار شما', 'هر روز هفته پاسخگوی شما هستیم.', 'headset' as const]
  ], []);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError('');
    if (!form.customer_name.trim() || !form.customer_phone.trim() || !form.province.trim() || !form.city.trim() || !form.address.trim()) {
      setError('لطفا فیلدهای ضروری را کامل کنید.');
      return;
    }
    setIsSubmitting(true);
    await storeApi.createOrder({
      ...form,
      customer_name: `${form.customer_name} ${form.customer_family}`.trim(),
      order_number: `NP-${Date.now().toString(36).toUpperCase()}`,
      items,
      total_amount: payable,
      total: payable,
      status: 'pending',
      payment_status: 'unpaid',
      notes: [form.notes, `روش ارسال: ${shippingMethod === 'express' ? 'ارسال سریع' : 'ارسال استاندارد'}`, `روش پرداخت: ${paymentMethod === 'online' ? 'پرداخت آنلاین' : 'پرداخت پس از هماهنگی'}`].filter(Boolean).join('\n')
    });
    clearCart();
    setOrderSuccess(true);
    setIsSubmitting(false);
  };

  if (orderSuccess) return <div className="store-page store-checkout-page" dir="rtl"><StoreHeader /><div className="store-success-card premium"><div>✓</div><h2>سفارش شما ثبت شد</h2><p>سفارش با وضعیت در انتظار پرداخت ثبت شد. تیم نوشه برای تکمیل روند پرداخت و ارسال با شما هماهنگ می‌کند.</p><Link href="/" className="store-primary-btn">بازگشت به فروشگاه</Link></div></div>;
  if (!items.length) return <div className="store-page store-checkout-page" dir="rtl"><StoreHeader /><div className="store-empty premium"><h2>سبد خرید شما خالی است</h2><p>برای تکمیل خرید، ابتدا محصول موردنظرتان را به سبد اضافه کنید.</p><Link href="/category/all" className="store-primary-btn">مشاهده محصولات</Link></div></div>;

  return (
    <div className="store-page store-checkout-page" dir="rtl">
      <StoreHeader />
      <main className="store-container store-checkout-premium">
        <aside className="store-checkout-summary premium">
          <div className="store-checkout-summary-head">
            <h2>خلاصه سفارش</h2>
            <Link href="/category/all">ویرایش سبد</Link>
          </div>
          <div className="store-summary-items">
            {items.map((item) => (
              <article key={item.key}>
                {item.image && <img src={item.image} alt={item.title} />}
                <div>
                  <h3>{item.title}</h3>
                  <small>{[item.color && `رنگ: ${item.color}`, item.size && `سایز: ${item.size}`, item.cup && `کاپ: ${item.cup}`].filter(Boolean).join(' | ')}</small>
                  <span>{item.quantity.toLocaleString('fa-IR')} عدد</span>
                </div>
                <b>{formatPrice(item.price * item.quantity)}</b>
              </article>
            ))}
          </div>
          <div className="store-coupon-ui checkout">
            <input placeholder="کد تخفیف را وارد کنید" />
            <button type="button">اعمال</button>
          </div>
          <div className="store-cart-summary">
            <p><span>جمع جزئی</span><b>{formatPrice(originalTotal)}</b></p>
            {savedAmount > 0 ? <p className="save"><span>تخفیف</span><b>- {formatPrice(savedAmount)}</b></p> : null}
            <p><span>هزینه ارسال</span><b>{shippingCost === 0 ? 'رایگان' : formatPrice(shippingCost)}</b></p>
            <p className="payable"><span>مبلغ قابل پرداخت</span><b>{formatPrice(payable)}</b></p>
          </div>
          <div className="store-checkout-safe-note"><Icon name="lock" />اطلاعات شما امن و رمزگذاری شده است. پرداخت امن با کلیه کارت‌های عضو شتاب.</div>
        </aside>

        <section className="store-checkout-main">
          <div className="store-checkout-stepper">
            {steps.map((step, index) => <div key={step} className={index === 0 ? 'active' : ''}><span>{(index + 1).toLocaleString('fa-IR')}</span><b>{step}</b></div>)}
          </div>

          <form onSubmit={handleSubmit} className="store-checkout-form premium">
            <section>
              <h2>اطلاعات تماس</h2>
              <p>لطفا اطلاعات تماس خود را وارد کنید.</p>
              <div className="store-form-grid">
                <label>نام و نام خانوادگی *<input required value={form.customer_name} onChange={(e) => handleChange('customer_name', e.target.value)} placeholder="مثلا: سارا احمدی" /></label>
                <label>شماره موبایل *<input required dir="ltr" type="tel" value={form.customer_phone} onChange={(e) => handleChange('customer_phone', e.target.value)} placeholder="مثلا: 0912 123 4567" /></label>
                <label>ایمیل <input dir="ltr" type="email" value={form.customer_email} onChange={(e) => handleChange('customer_email', e.target.value)} placeholder="sara@email.com" /></label>
                <label className="checkbox"><input type="checkbox" checked={useLastAddress} onChange={(e) => setUseLastAddress(e.target.checked)} />استفاده از آخرین آدرس</label>
              </div>
            </section>

            <section>
              <h2>آدرس ارسال</h2>
              <div className="store-form-grid">
                <label>استان *<select required value={form.province} onChange={(e) => handleChange('province', e.target.value)}><option value="">انتخاب استان</option>{provinces.map((province) => <option key={province} value={province}>{province}</option>)}</select></label>
                <label>شهر *<input required value={form.city} onChange={(e) => handleChange('city', e.target.value)} /></label>
                <label className="wide">آدرس کامل *<input required value={form.address} onChange={(e) => handleChange('address', e.target.value)} /></label>
                <label>کد پستی<input dir="ltr" value={form.postal_code} onChange={(e) => handleChange('postal_code', e.target.value)} /></label>
                <label className="wide">یادداشت سفارش<textarea value={form.notes} onChange={(e) => handleChange('notes', e.target.value)} placeholder="توضیح برای ارسال یا بسته‌بندی..." /></label>
              </div>
            </section>

            <section>
              <h2>روش ارسال</h2>
              <div className="store-choice-row">
                <button type="button" className={shippingMethod === 'standard' ? 'active' : ''} onClick={() => setShippingMethod('standard')}><b>ارسال استاندارد</b><span>{totalPrice >= freeShippingThreshold ? 'رایگان' : formatPrice(85000)}</span></button>
                <button type="button" className={shippingMethod === 'express' ? 'active' : ''} onClick={() => setShippingMethod('express')}><b>ارسال سریع</b><span>{formatPrice(145000)}</span></button>
              </div>
            </section>

            <section>
              <h2>روش پرداخت</h2>
              <div className="store-choice-row">
                <button type="button" className={paymentMethod === 'online' ? 'active' : ''} onClick={() => setPaymentMethod('online')}><b>پرداخت آنلاین</b><span>ثبت سفارش با وضعیت در انتظار پرداخت</span></button>
                <button type="button" className={paymentMethod === 'coordination' ? 'active' : ''} onClick={() => setPaymentMethod('coordination')}><b>پرداخت پس از هماهنگی</b><span>هماهنگی توسط پشتیبانی</span></button>
              </div>
            </section>

            {error ? <p className="store-form-error">{error}</p> : null}
            <button className="store-primary-btn big checkout-submit" disabled={isSubmitting}>{isSubmitting ? 'در حال ثبت سفارش...' : 'ادامه و ثبت سفارش'}<Icon name="arrow" /></button>
          </form>

          <div className="store-checkout-trust">
            {trustItems.map(([title, text, icon]) => <article key={title}><Icon name={icon} /><b>{title}</b><span>{text}</span></article>)}
          </div>
          <p className="store-checkout-policies">با خیال راحت خرید کنید؛ رضایت و اعتماد شما اولویت ماست. <Link href="/faq">قوانین بازگشت کالا</Link> و <Link href="/pages/privacy">حریم خصوصی</Link></p>
        </section>
      </main>
    </div>
  );
}
