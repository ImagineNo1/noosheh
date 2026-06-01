'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { storeApi } from '@/lib/store-api';

const footerLinks = {
  customer: [
    { label: 'پرسش‌های متداول', href: '/faq' },
    { label: 'رویه بازگرداندن کالا', href: '/faq' },
    { label: 'شرایط و قوانین', href: '/faq' },
    { label: 'تماس با ما', href: '/contact' }
  ],
  guide: [
    { label: 'راهنمای سایز', href: '/faq' },
    { label: 'راهنمای انتخاب سوتین', href: '/blog' },
    { label: 'راهنمای شست‌وشو', href: '/blog' }
  ],
  categories: [
    { label: 'لباس زیر', href: '/category/lingerie' },
    { label: 'لباس خواب', href: '/category/sleepwear' },
    { label: 'ست زنانه', href: '/category/sets' },
    { label: 'خالق و راحتی', href: '/category/lounge' },
    { label: 'جوراب و لگ', href: '/category/socks' },
    { label: 'اکسسوری', href: '/category/accessories' }
  ]
};

export default function Footer() {
  const [siteTitle, setSiteTitle] = useState('Noosheh');
  const [siteTagline, setSiteTagline] = useState('نوشه، بوتیکی برای زنان که به زیبایی، راحتی و اعتماد به نفس خود اهمیت می‌دهند.');
  const [phone, setPhone] = useState('۰۲۱-۹۱۰۹۰۰۹۹');
  const [email, setEmail] = useState('info@noosheh.com');
  const [copyrightText, setCopyrightText] = useState('کلیه حقوق این وب‌سایت متعلق به نوشه است.');

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
    <footer className="store-ref-footer" dir="rtl">
      <div className="store-ref-footer-main">
        <div className="store-ref-footer-brand">
          <h2>{siteTitle}</h2>
          <p>{siteTagline}</p>
          <div className="store-ref-socials">
            <a href="#" aria-label="اینستاگرام">Instagram</a>
            <a href="#" aria-label="تلگرام">Telegram</a>
            <a href="#" aria-label="واتساپ">WhatsApp</a>
          </div>
          <div className="store-ref-badges">
            <span>نماد اعتماد</span>
            <span>پرداخت امن</span>
          </div>
        </div>

        <nav aria-label="خدمات مشتریان">
          <h3>خدمات مشتریان</h3>
          {footerLinks.customer.map((link) => <Link key={link.href + link.label} href={link.href}>{link.label}</Link>)}
        </nav>

        <nav aria-label="راهنمای خرید">
          <h3>راهنمای خرید</h3>
          {footerLinks.guide.map((link) => <Link key={link.href + link.label} href={link.href}>{link.label}</Link>)}
        </nav>

        <nav aria-label="دسته‌بندی‌ها">
          <h3>دسته‌بندی‌ها</h3>
          {footerLinks.categories.map((link) => <Link key={link.href} href={link.href}>{link.label}</Link>)}
        </nav>

        <div className="store-ref-footer-contact">
          <h3>اطلاعات تماس</h3>
          <p dir="ltr">{phone}</p>
          <p>{email}</p>
          <p>تهران، مجموعه نوشه، طبقه ۱۲</p>
        </div>
      </div>
      <div className="store-ref-footer-bottom">{copyrightText}</div>
    </footer>
  );
}
