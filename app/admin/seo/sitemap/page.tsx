'use client';

import { useMemo, useState } from 'react';
import { useEntityList } from '../../_components/hooks';
import { AssistantPage, Badge, Card, CardTitle, normalizeSiteUrl, toFa } from '../SeoAssistantUI';

export default function SitemapPage() {
  const { data: products = [] } = useEntityList<any>('Product');
  const { data: categories = [] } = useEntityList<any>('Category');
  const { data: posts = [] } = useEntityList<any>('BlogPost');
  const { data: settings = [] } = useEntityList<any>('SeoSettings');
  const [copied, setCopied] = useState(false);

  const siteUrl = normalizeSiteUrl(settings[0]?.site_url);
  const sitemapUrl = `${siteUrl}/sitemap.xml`;
  const counts = useMemo(() => {
    const pages = 4;
    return [
      ['Products', products.length],
      ['Categories', categories.length],
      ['Blog posts', posts.length],
      ['Pages', pages],
      ['Total URLs', products.length + categories.length + posts.length + pages]
    ];
  }, [categories.length, posts.length, products.length]);

  const copy = async () => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      await navigator.clipboard.writeText(sitemapUrl);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    }
  };

  return (
    <AssistantPage title="نقشه سایت (Sitemap)" description="Sitemap فهرست صفحه‌های مهم فروشگاه است و به گوگل کمک می‌کند محصولات، دسته‌ها و مقالات را بهتر پیدا کند.">
      <Card>
        <CardTitle title="آدرس نقشه سایت شما" subtitle="این لینک را در Google Search Console ثبت کنید." />
        <div className="seo-url-box">
          <code dir="ltr">{sitemapUrl}</code>
          <button type="button" onClick={copy}>{copied ? 'کپی شد' : 'Copy'}</button>
          <a href="/sitemap.xml" target="_blank" rel="noreferrer">Open</a>
        </div>
      </Card>

      <div className="seo-kpi-grid">
        {counts.map(([label, value]) => <Card key={String(label)} className="seo-kpi-card"><span>{label}</span><strong>{toFa(Number(value))}</strong></Card>)}
      </div>

      <Card>
        <CardTitle title="وضعیت قابل ایندکس بودن" subtitle="فقط صفحه‌های عمومی و قابل نمایش باید وارد Sitemap شوند." />
        <div className="seo-status-stack">
          <p><Badge tone="good">Safe</Badge>محصولات منتشرشده وارد نقشه سایت می‌شوند.</p>
          <p><Badge tone="good">Safe</Badge>دسته‌بندی‌ها و مقالات عمومی قابل ارسال به گوگل هستند.</p>
          <p><Badge tone="warn">Review</Badge>بعد از تغییرهای بزرگ در محصولات، Sitemap را دوباره در Search Console بررسی کنید.</p>
        </div>
      </Card>

      <Card>
        <CardTitle title="راهنمای ارسال" subtitle="مسیر پیشنهادی برای معرفی نقشه سایت به گوگل." />
        <ol className="seo-steps">
          <li>وارد Google Search Console شوید.</li>
          <li>دامنه فروشگاه را انتخاب کنید.</li>
          <li>در بخش Sitemaps، آدرس بالا را وارد کنید.</li>
          <li>بعد از ارسال، وضعیت پردازش را بررسی کنید.</li>
        </ol>
      </Card>
    </AssistantPage>
  );
}
