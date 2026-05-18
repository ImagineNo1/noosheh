'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { storeApi } from '@/lib/store-api';

export default function Footer() {
  const [siteTitle, setSiteTitle] = useState('NOOSHEH');
  const [siteTagline, setSiteTagline] = useState('فروشگاه آنلاین لباس و پوشاک زنانه با بهترین کیفیت و قیمت مناسب');
  const [phone, setPhone] = useState('۰۹۱۲۳۴۵۶۷۸۹');
  const [email, setEmail] = useState('info@noosheh.com');
  const [copyrightText, setCopyrightText] = useState('© ۱۴۰۴ نوشه. تمامی حقوق محفوظ است.');

  useEffect(() => {
    storeApi.settings().then((items) => {
      const map = Object.fromEntries(items.map((item) => [item.key, item.value]));
      if (map.site_title) setSiteTitle(map.site_title);
      if (map.site_tagline) setSiteTagline(map.site_tagline);
      if (map.phone) setPhone(map.phone);
      if (map.site_email) setEmail(map.site_email);
      if (map.footer_copyright) setCopyrightText(map.footer_copyright);
    }).catch(() => {});
  }, []);

  return (
    <footer className="mt-20 bg-foreground text-background" dir="rtl">
      <div className="mx-auto max-w-7xl px-4 py-12">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-3">
          <div>
            <h3 className="mb-4 text-lg font-bold">{siteTitle}</h3>
            <p className="text-sm leading-relaxed text-background/60">{siteTagline}</p>
          </div>
          <div>
            <h4 className="mb-4 text-sm font-semibold">دسترسی سریع</h4>
            <nav className="flex flex-col gap-2">
              <Link href="/" className="text-sm text-background/60 transition-colors hover:text-primary">خانه</Link>
              <Link href="/category/all" className="text-sm text-background/60 transition-colors hover:text-primary">دسته‌بندی‌ها</Link>
              <Link href="/faq" className="text-sm text-background/60 transition-colors hover:text-primary">سوالات متداول</Link>
              <Link href="/contact" className="text-sm text-background/60 transition-colors hover:text-primary">تماس با ما</Link>
            </nav>
          </div>
          <div>
            <h4 className="mb-4 text-sm font-semibold">ارتباط با ما</h4>
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-2 text-sm text-background/60"><span>☎</span><span dir="ltr">{phone}</span></div>
              <div className="flex items-center gap-2 text-sm text-background/60"><span>✉</span><span>{email}</span></div>
            </div>
          </div>
        </div>
        <div className="mt-10 border-t border-background/10 pt-6 text-center text-xs text-background/40">{copyrightText}</div>
      </div>
    </footer>
  );
}
