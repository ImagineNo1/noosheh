'use client';

import Link from 'next/link';
import { useState } from 'react';

export default function DiscountBanner() {
  const [visible, setVisible] = useState(true);
  if (!visible) return null;
  return (
    <div className="store-discount-banner" dir="rtl">
      <span>🏷</span>
      <p>🎉 تخفیف ویژه تا <strong>۳۰٪</strong> روی محصولات منتخب! <Link href="/category/all">همین حالا خرید کن</Link></p>
      <button onClick={() => setVisible(false)} aria-label="بستن بنر">×</button>
    </div>
  );
}
