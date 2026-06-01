'use client';

import Link from 'next/link';
import type { ReactNode } from 'react';

export type SeoMetaRow = {
  id?: string;
  entity_type?: string;
  entity_id?: string;
  meta_title?: string;
  meta_description?: string;
  canonical_url?: string;
  og_title?: string;
  og_description?: string;
  og_image?: string;
  robots_index?: boolean;
  seo_score?: number;
  seo_warnings?: string[];
  seo_suggestions?: string[];
};

export type SeoSettings = {
  id?: string;
  site_name?: string;
  site_description?: string;
  site_url?: string;
  default_og_image?: string;
  title_separator?: string;
  robots_txt?: string;
};

export function toFa(value: number | string) {
  if (typeof value === 'number') return value.toLocaleString('fa-IR');
  return value.replace(/\d/g, (digit) => Number(digit).toLocaleString('fa-IR'));
}

export function scoreStatus(score: number) {
  if (score >= 80) return { label: 'خوب', tone: 'good' as const, text: 'عملکرد سئوی فروشگاه شما مناسب است.' };
  if (score >= 55) return { label: 'نیاز به بررسی', tone: 'warn' as const, text: 'چند بخش ساده می‌تواند دیده‌شدن فروشگاه را بهتر کند.' };
  return { label: 'مشکل جدی', tone: 'bad' as const, text: 'چند ایراد مهم مانع نمایش بهتر صفحات در گوگل شده است.' };
}

export function entityLabel(type?: string) {
  const labels: Record<string, string> = {
    product: 'محصول',
    category: 'دسته‌بندی',
    brand: 'برند',
    page: 'صفحه',
    home: 'خانه',
    blog_post: 'مقاله بلاگ',
    blog_category: 'دسته بلاگ',
    blog_tag: 'برچسب بلاگ',
    blog_page: 'صفحه بلاگ'
  };
  return labels[type || ''] || 'صفحه';
}

export function mainProblem(row: SeoMetaRow) {
  if (!row.meta_title) return 'عنوان صفحه وارد نشده است';
  if (!row.meta_description) return 'توضیحات کوتاه برای گوگل ندارد';
  if (!row.og_image) return 'تصویر اشتراک‌گذاری تنظیم نشده است';
  if (!row.canonical_url) return 'آدرس اصلی صفحه مشخص نیست';
  if (row.robots_index === false) return 'این صفحه از گوگل پنهان شده است';
  return row.seo_warnings?.[0] || 'مورد مهمی دیده نشد';
}

export function normalizeSiteUrl(value?: string) {
  return String(value || 'https://noosheh.com').trim().replace(/\/$/, '') || 'https://noosheh.com';
}

export function AssistantPage({ title, description, children, aside }: { title: string; description: string; children: ReactNode; aside?: ReactNode }) {
  return (
    <div className="seo-assistant" dir="rtl">
      <div className="seo-page-head">
        <div>
          <h1>{title}</h1>
          <p>{description}</p>
        </div>
        <span className="seo-head-pill">راهنمای سئو فروشگاه</span>
      </div>
      {aside ? <div className="seo-two-column"><main>{children}</main><aside>{aside}</aside></div> : children}
    </div>
  );
}

export function Card({ className = '', children }: { className?: string; children: ReactNode }) {
  return <section className={`seo-card ${className}`}>{children}</section>;
}

export function CardTitle({ title, subtitle, action }: { title: string; subtitle?: string; action?: ReactNode }) {
  return (
    <div className="seo-card-title">
      <div>
        <h2>{title}</h2>
        {subtitle && <p>{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}

export function Badge({ tone = 'neutral', children }: { tone?: 'good' | 'warn' | 'bad' | 'neutral' | 'blush'; children: ReactNode }) {
  return <span className={`seo-badge ${tone}`}>{children}</span>;
}

export function ProgressBar({ value, tone = 'good' }: { value: number; tone?: 'good' | 'warn' | 'bad' }) {
  return <span className={`seo-progress ${tone}`}><i style={{ width: `${Math.max(4, Math.min(100, value))}%` }} /></span>;
}

export function ActionLink({ href, children, variant = 'primary' }: { href: string; children: ReactNode; variant?: 'primary' | 'soft' }) {
  return <Link className={`seo-action ${variant}`} href={href}>{children}</Link>;
}

export function GooglePreview({ title, url, description }: { title?: string; url?: string; description?: string }) {
  return (
    <Card className="seo-preview-card">
      <CardTitle title="پیش‌نمایش در گوگل" subtitle="تقریبا همان چیزی که مشتری در نتیجه جست‌وجو می‌بیند." />
      <div className="seo-google-preview">
        <span dir="ltr">{url || 'https://noosheh.com'}</span>
        <h3>{title || 'لباس زیر زنانه شیک و راحت | نوشه'}</h3>
        <p>{description || 'فروشگاه آنلاین پوشاک زنانه با انتخاب‌های لطیف، باکیفیت و مناسب استفاده روزمره.'}</p>
      </div>
    </Card>
  );
}

export function SocialPreview({ title, description, image }: { title?: string; description?: string; image?: string }) {
  return (
    <Card className="seo-preview-card">
      <CardTitle title="پیش‌نمایش شبکه‌های اجتماعی" subtitle="برای وقتی لینک فروشگاه در تلگرام، واتساپ یا شبکه‌های اجتماعی فرستاده می‌شود." />
      <div className="seo-social-preview">
        <div className="seo-social-image">
          {image ? <img src={image} alt="" /> : <div className="seo-social-placeholder">NOOSHEH</div>}
        </div>
        <div>
          <span>noosheh.com</span>
          <h3>{title || 'نوشه | لباس زیر زنانه شیک و راحت'}</h3>
          <p>{description || 'محصولات راحت، ظریف و باکیفیت برای انتخاب روزانه و خرید مطمئن.'}</p>
        </div>
      </div>
    </Card>
  );
}
