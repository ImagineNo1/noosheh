'use client';

import Link from 'next/link';
import { useCart } from '@/lib/cart-context';

export default function StoreHeader() {
  const { items } = useCart();
  const count = items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <header className="store-header">
      <div className="store-topbar">ارسال برای سفارشات بالای ۱ میلیون و ۵۰۰ هزار تومان رایگان است.</div>
      <div className="store-nav store-container">
        <Link href="/" className="store-logo">N<span>♥</span>OSHEH</Link>
        <nav>
          <Link href="/category/all">محصولات</Link>
          <Link href="/order-tracking">پیگیری سفارش</Link>
          <Link href="/faq">سوالات متداول</Link>
          <Link href="/contact">تماس با ما</Link>
          <Link href="/admin">پنل مدیریت</Link>
        </nav>
        <Link href="/checkout" className="store-cart-link">سبد خرید <b>{count.toLocaleString('fa-IR')}</b></Link>
      </div>
    </header>
  );
}
