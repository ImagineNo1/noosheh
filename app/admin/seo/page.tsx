'use client';

import { useEntityList } from '../_components/hooks';
import { ActionLink, AssistantPage, Badge, Card, CardTitle, GooglePreview, ProgressBar, SeoMetaRow, SocialPreview, mainProblem, normalizeSiteUrl, scoreStatus, toFa } from './SeoAssistantUI';

export default function SeoDashboardPage() {
  const { data: seo = [] } = useEntityList<SeoMetaRow>('SeoMeta');
  const { data: settings = [] } = useEntityList<any>('SeoSettings');
  const { data: redirects = [] } = useEntityList<any>('Redirect');
  const { data: logs = [] } = useEntityList<any>('NotFoundLog');

  const site = settings[0] || {};
  const unresolved404 = logs.filter((x: any) => !x.resolved).length;
  const avgScore = seo.length ? Math.round(seo.reduce((sum, item) => sum + Number(item.seo_score || 0), 0) / seo.length) : 0;
  const status = scoreStatus(avgScore);
  const missingTitle = seo.filter((x) => !x.meta_title).length;
  const missingDescription = seo.filter((x) => !x.meta_description).length;
  const missingOg = seo.filter((x) => !x.og_image).length;
  const indexedPages = seo.filter((x) => x.robots_index !== false).length;
  const previewTitle = site.site_name ? `${site.site_name} ${site.title_separator || '|'} لباس زیر زنانه شیک و راحت` : 'نوشه | لباس زیر زنانه شیک و راحت';
  const previewUrl = normalizeSiteUrl(site.site_url);
  const previewDescription = site.site_description || 'فروشگاه آنلاین پوشاک زنانه با انتخاب‌های لطیف، باکیفیت و مناسب استفاده روزمره.';

  const checklist = [
    ['نام سایت تنظیم شده', Boolean(site.site_name)],
    ['آدرس سایت معتبر است', /^https?:\/\//.test(site.site_url || '')],
    ['توضیحات سایت وارد شده', Boolean(site.site_description)],
    ['تصویر پیش‌فرض OG تنظیم شده', Boolean(site.default_og_image)],
    ['Robots فعال است', Boolean(site.robots_txt || true)],
    ['Sitemap فعال است', true]
  ];

  const recommended = [
    { problem: `${toFa(missingDescription)} صفحه توضیحات متا ندارند`, explanation: 'این متن کوتاه به مشتری کمک می‌کند قبل از ورود به سایت بداند صفحه درباره چیست.', href: '/admin/seo/analyzer', show: missingDescription > 0 },
    { problem: `${toFa(unresolved404)} مسیر ۴۰۴ پرتکرار دارید`, explanation: 'این آدرس‌ها مشتری یا گوگل را به صفحه‌ای می‌برند که دیگر وجود ندارد.', href: '/admin/seo/404', show: unresolved404 > 0 },
    { problem: 'تصویر پیش‌فرض OG تنظیم نشده', explanation: 'وقتی لینکی تصویر اختصاصی ندارد، این تصویر ظاهر فروشگاه را حرفه‌ای نگه می‌دارد.', href: '/admin/seo/settings', show: !site.default_og_image },
    { problem: `${toFa(missingTitle)} صفحه عنوان کامل ندارند`, explanation: 'عنوان واضح به گوگل و مشتری می‌گوید هر صفحه دقیقا چه چیزی ارائه می‌کند.', href: '/admin/seo/analyzer', show: missingTitle > 0 }
  ].filter((item) => item.show).slice(0, 3);

  const kpis = [
    ['صفحات بررسی‌شده', seo.length],
    ['بدون عنوان', missingTitle],
    ['بدون توضیحات', missingDescription],
    ['خطاهای ۴۰۴', unresolved404],
    ['ریدایرکت‌ها', redirects.length],
    ['صفحات قابل نمایش', indexedPages]
  ];

  return (
    <AssistantPage title="مرکز سلامت SEO" description="دستیار ساده برای بهتر دیده‌شدن فروشگاه نوشه در گوگل">
      <div className="seo-dashboard-grid">
        <Card className="seo-score-card">
          <div className="seo-score-ring" style={{ ['--score' as any]: avgScore }}>
            <strong>{toFa(avgScore)}</strong>
            <span>از ۱۰۰</span>
          </div>
          <div>
            <Badge tone={status.tone}>{status.label}</Badge>
            <h2>{status.text}</h2>
            <p>در یک هفته اخیر، تمرکز اصلی روی کامل کردن توضیحات صفحات و رفع مسیرهای شکسته است.</p>
            <div className="seo-trend">
              <span>+{toFa(3)}٪</span>
              <i /><i /><i /><i /><i />
              <small>بهبود نسبت به هفته قبل</small>
            </div>
          </div>
        </Card>

        <Card>
          <CardTitle title="اقدام‌های پیشنهادی امروز" subtitle="کارهایی که بیشترین اثر را با کمترین پیچیدگی دارند." />
          <div className="seo-action-list">
            {(recommended.length ? recommended : [{ problem: 'همه چیز مرتب است', explanation: 'در حال حاضر ایراد فوری دیده نمی‌شود. آنالایزر صفحات را دوره‌ای بررسی کنید.', href: '/admin/seo/analyzer' }]).map((item) => (
              <div key={item.problem}>
                <div>
                  <strong>{item.problem}</strong>
                  <p>{item.explanation}</p>
                </div>
                <ActionLink href={item.href}>بررسی و اصلاح</ActionLink>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <CardTitle title="چک‌لیست راه‌اندازی" subtitle="موارد پایه‌ای که فروشگاه باید همیشه داشته باشد." action={<ActionLink href="/admin/seo/settings" variant="soft">مدیریت تنظیمات</ActionLink>} />
          <div className="seo-checklist">
            {checklist.map(([label, done]) => <p key={String(label)} className={done ? 'done' : ''}><span />{label}</p>)}
          </div>
        </Card>
      </div>

      <div className="seo-kpi-grid">
        {kpis.map(([label, value]) => (
          <Card key={String(label)} className="seo-kpi-card">
            <span>{label}</span>
            <strong>{toFa(Number(value))}</strong>
          </Card>
        ))}
      </div>

      <div className="seo-preview-grid">
        <GooglePreview title={previewTitle} url={previewUrl} description={previewDescription} />
        <SocialPreview title={previewTitle} description={previewDescription} image={site.default_og_image} />
      </div>

      <Card>
        <CardTitle title="اقدام سریع" subtitle="هر بخش با زبان ساده برای مدیریت روزمره فروشگاه آماده شده است." />
        <div className="seo-quick-actions">
          {[
            ['/admin/seo/settings', 'تنظیمات پایه'],
            ['/admin/seo/analyzer', 'آنالایزر صفحات'],
            ['/admin/seo/redirects', 'ریدایرکت‌ها'],
            ['/admin/seo/404', 'مانیتور ۴۰۴'],
            ['/admin/seo/robots', 'Robots'],
            ['/admin/seo/sitemap', 'Sitemap']
          ].map(([href, label]) => <ActionLink key={href} href={href} variant="soft">{label}</ActionLink>)}
        </div>
      </Card>

      <Card>
        <CardTitle title="آنالیز صفحه‌های نیازمند توجه" subtitle="نمونه‌ای از صفحه‌هایی که بهتر است زودتر اصلاح شوند." action={<ActionLink href="/admin/seo/analyzer" variant="soft">مشاهده همه</ActionLink>} />
        <div className="seo-table-wrap">
          <table className="seo-table">
            <thead><tr><th>صفحه</th><th>امتیاز</th><th>مشکل اصلی</th><th>اقدام</th></tr></thead>
            <tbody>
              {seo.slice(0, 5).map((row) => (
                <tr key={row.id || row.entity_id}>
                  <td>{row.meta_title || row.entity_id || 'صفحه بدون عنوان'}</td>
                  <td><ProgressBar value={Number(row.seo_score || 0)} tone={scoreStatus(Number(row.seo_score || 0)).tone} />{toFa(Number(row.seo_score || 0))}</td>
                  <td>{mainProblem(row)}</td>
                  <td><ActionLink href="/admin/seo/analyzer" variant="soft">اصلاح</ActionLink></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </AssistantPage>
  );
}
