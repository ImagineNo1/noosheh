'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { storeApi } from '@/lib/store-api';

const footerLinks = {
  customer: [
    { label: 'پرسش های متداول', href: '/faq' },
    { label: 'رویه بازگرداندن کالا', href: '/faq' },
    { label: 'شرایط و قوانین', href: '/faq' },
    { label: 'تماس با ما', href: '/contact' }
  ],
  guide: [
    { label: 'راهنمای سایز', href: '/faq' },
    { label: 'راهنمای انتخاب سوتین', href: '/blog' },
    { label: 'راهنمای شست وشو', href: '/blog' }
  ],
  categories: [
    { label: 'لباس زیر', href: '/category/lingerie' },
    { label: 'لباس خواب', href: '/category/sleepwear' },
    { label: 'ست زنانه', href: '/category/sets' },
    { label: 'خانگی و راحتی', href: '/category/lounge' },
    { label: 'جوراب و لگ', href: '/category/socks' },
    { label: 'اکسسوری', href: '/category/accessories' }
  ]
};

function SocialIcon({ name }: { name: 'instagram' | 'telegram' | 'whatsapp' }) {
  if (name === 'telegram') return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M21.6 4.4 18.3 20c-.2 1-.8 1.2-1.6.7l-5-3.7-2.4 2.3c-.3.3-.5.5-1 .5l.4-5.1 9.3-8.4c.4-.4-.1-.6-.6-.2L5.8 13.3.8 11.7c-1-.3-1-1 .2-1.5L20.2 2.8c.9-.3 1.7.2 1.4 1.6Z" /></svg>;
  if (name === 'whatsapp') return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M19.1 5A9.8 9.8 0 0 0 3.7 16.8L2.4 22l5.3-1.4A9.8 9.8 0 0 0 19.1 5Zm-7.3 15a8 8 0 0 1-4.1-1.1l-.3-.2-3.1.8.8-3-.2-.3A8.1 8.1 0 1 1 11.8 20Zm4.5-6.1c-.2-.1-1.5-.7-1.7-.8-.2-.1-.4-.1-.6.1l-.8 1c-.1.2-.3.2-.5.1a6.6 6.6 0 0 1-3.3-2.9c-.2-.3 0-.4.1-.6l.4-.5c.1-.2.2-.3.3-.5.1-.2 0-.4 0-.5l-.8-1.9c-.2-.5-.4-.4-.6-.4h-.5c-.2 0-.5.1-.7.3-.2.2-.9.8-.9 2s.9 2.3 1 2.5c.1.2 1.8 2.8 4.4 3.9.6.3 1.1.4 1.5.5.6.2 1.2.1 1.6.1.5-.1 1.5-.6 1.7-1.2.2-.6.2-1.1.1-1.2l-.5-.3Z" /></svg>;
  return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7.8 2h8.4A5.8 5.8 0 0 1 22 7.8v8.4a5.8 5.8 0 0 1-5.8 5.8H7.8A5.8 5.8 0 0 1 2 16.2V7.8A5.8 5.8 0 0 1 7.8 2Zm0 2A3.8 3.8 0 0 0 4 7.8v8.4A3.8 3.8 0 0 0 7.8 20h8.4a3.8 3.8 0 0 0 3.8-3.8V7.8A3.8 3.8 0 0 0 16.2 4H7.8Zm4.2 3.3a4.7 4.7 0 1 1 0 9.4 4.7 4.7 0 0 1 0-9.4Zm0 2a2.7 2.7 0 1 0 0 5.4 2.7 2.7 0 0 0 0-5.4Zm5-1.4a1.1 1.1 0 1 1 0 2.2 1.1 1.1 0 0 1 0-2.2Z" /></svg>;
}

export default function Footer() {
  const [siteTitle, setSiteTitle] = useState('Noosheh');
  const [siteTagline, setSiteTagline] = useState('نوشه، بوتیکی برای زنانی که به زیبایی، راحتی و اعتماد به نفس خود اهمیت می دهند.');
  const [phone, setPhone] = useState('۰۲۱-۹۱۰۹۰۰۹۹');
  const [email, setEmail] = useState('info@noosheh.com');
  const [copyrightText, setCopyrightText] = useState('کلیه حقوق این وب سایت متعلق به نوشه است.');
  const [socials, setSocials] = useState({ instagram: '#', telegram: '#', whatsapp: '#' });

  useEffect(() => {
    storeApi.settings().then((items) => {
      const map = Object.fromEntries(items.map((item) => [item.key, item.value]));
      if (map.site_title) setSiteTitle(map.site_title);
      if (map.site_tagline) setSiteTagline(map.site_tagline);
      if (map.phone) setPhone(map.phone);
      if (map.site_email) setEmail(map.site_email);
      if (map.footer_copyright) setCopyrightText(map.footer_copyright);
      setSocials({
        instagram: map.instagram_url || '#',
        telegram: map.telegram_url || '#',
        whatsapp: map.whatsapp_url || '#'
      });
    }).catch(() => {});
  }, []);

  const socialItems = [
    { key: 'instagram' as const, label: 'اینستاگرام', href: socials.instagram },
    { key: 'telegram' as const, label: 'تلگرام', href: socials.telegram },
    { key: 'whatsapp' as const, label: 'واتساپ', href: socials.whatsapp }
  ].filter((item) => item.href);

  return (
    <footer className="store-ref-footer" dir="rtl">
      <div className="store-ref-footer-main">
        <div className="store-ref-footer-brand">
          <h2>{siteTitle}</h2>
          <p>{siteTagline}</p>
          <div className="store-ref-socials">
            {socialItems.map((item) => (
              <a key={item.key} href={item.href} aria-label={item.label}>
                <SocialIcon name={item.key} />
              </a>
            ))}
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

        <nav aria-label="دسته بندی ها">
          <h3>دسته بندی ها</h3>
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
