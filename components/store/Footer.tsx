import Link from 'next/link';

const features = [
  { icon: '🚚', title: 'ارسال رایگان', desc: 'بیشتر از ۱ میلیون و صد هزار تومان' },
  { icon: '↻', title: 'گارانتی برگشت وجه', desc: '۷ روز گارانتی بازگشت وجه' },
  { icon: '🛡', title: 'اصالت کالا', desc: 'تضمین اصالت کالا' },
  { icon: '💳', title: 'پرداخت آنلاین', desc: 'با تمامی درگاه‌های بانکی' }
];

export default function Footer() {
  return (
    <footer className="store-footer-new" dir="rtl">
      <div className="store-footer-features">
        <div className="store-container">
          {features.map((feature) => <div key={feature.title}><span>{feature.icon}</span><div><b>{feature.title}</b><p>{feature.desc}</p></div></div>)}
        </div>
      </div>
      <div className="store-footer-main">
        <div className="store-container">
          <section><h3>درباره ما</h3><p>نوشه پوش یکی از شرکت‌های پیشرو در تولید لباس زیر زنانه با بیش از ۱۲ سال سابقه در عرصه تولید لباس زیر است.</p></section>
          <section><h3>راهنمای فروشگاه</h3><Link href="/faq">نحوه ثبت سفارش</Link><Link href="/faq">رویه ارسال</Link><Link href="/faq">شرایط بازگشت</Link><Link href="/faq">سوالات متداول</Link></section>
          <section><h3>لینک‌های مفید</h3><Link href="/">خانه</Link><Link href="/category/all">محصولات</Link><Link href="/contact">تماس با ما</Link></section>
          <section><h3>نظر مشتریان</h3><div className="store-footer-review"><p>★★★★★</p><span>خرید آنلاین کار با نوشه‌پوش بی‌نظیره. محصولاتشون واقعاً باکیفیته.</span></div></section>
        </div>
        <p className="store-footer-copy">تمامی حقوق مادی و معنوی این سایت متعلق به نوشه‌پوش می‌باشد.</p>
      </div>
    </footer>
  );
}
