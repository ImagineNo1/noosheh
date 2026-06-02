import Link from 'next/link';
import StoreHeader from '@/components/store/StoreHeader';

function resultCopy(status: string) {
  if (status === 'success' || status === 'verified') return {
    cls: 'success',
    icon: '✓',
    title: 'پرداخت با موفقیت تایید شد',
    text: 'پرداخت شما توسط سرور تایید شد و سفارش وارد مرحله پردازش شده است.'
  };
  if (status === 'manual_pending') return {
    cls: 'warning',
    icon: '…',
    title: 'سفارش در انتظار بررسی پرداخت است',
    text: 'سفارش شما ثبت شد. پس از کارت به کارت، اطلاعات پرداخت را برای پشتیبانی ارسال کنید تا مدیر تایید کند.'
  };
  if (status === 'redirect') return {
    cls: 'warning',
    icon: '↗',
    title: 'در انتظار انتقال به درگاه',
    text: 'اگر به درگاه منتقل نشدید، با پشتیبانی تماس بگیرید.'
  };
  return {
    cls: 'danger',
    icon: '!',
    title: 'پرداخت تایید نشد',
    text: 'پرداخت موفق یا قابل تایید نبود. هیچ سفارش پرداخت شده جعلی ثبت نشده است.'
  };
}

export default function PaymentResultPage({ searchParams }: { searchParams: { status?: string; order?: string; error?: string } }) {
  const status = searchParams.status || 'manual_pending';
  const order = searchParams.order || '';
  const error = searchParams.error || '';
  const copy = resultCopy(status);

  return (
    <div className="store-page store-checkout-page" dir="rtl">
      <StoreHeader />
      <main className="store-container store-narrow">
        <section className={`store-success-card premium ${copy.cls}`}>
          <div>{copy.icon}</div>
          <h1>{copy.title}</h1>
          <p>{copy.text}</p>
          {order ? <p><b>شماره سفارش:</b> <span dir="ltr">{order}</span></p> : null}
          {error ? <p className="store-form-error">{error}</p> : null}
          <div className="store-actions-row">
            <Link href="/order-tracking" className="store-primary-btn">پیگیری سفارش</Link>
            <Link href="/" className="store-secondary-btn">بازگشت به فروشگاه</Link>
          </div>
        </section>
      </main>
    </div>
  );
}
