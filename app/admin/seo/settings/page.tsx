'use client';

import { useEffect, useState } from 'react';
import { useEntityList } from '../../_components/hooks';
import { adminApi } from '../../admin-api';
import { AssistantPage, Card, CardTitle, GooglePreview, SeoSettings, SocialPreview, normalizeSiteUrl, toFa } from '../SeoAssistantUI';

const initialForm: SeoSettings = {
  site_name: '',
  site_description: '',
  site_url: '',
  default_og_image: '',
  title_separator: '|',
  robots_txt: ''
};

type SettingsField = {
  key: keyof SeoSettings;
  label: string;
  helper: string;
  example: string;
  max?: number;
  dir?: 'ltr';
  multiline?: boolean;
};

const fields: SettingsField[] = [
  { key: 'site_name', label: 'نام سایت', helper: 'نامی که کنار عنوان محصولات و صفحات دیده می‌شود.', example: 'نوشه', max: 35 },
  { key: 'site_url', label: 'آدرس سایت', helper: 'آدرس اصلی فروشگاه، بهتر است با https شروع شود.', example: 'https://noosheh.com', dir: 'ltr' },
  { key: 'site_description', label: 'توضیحات سایت', helper: 'یک معرفی کوتاه و انسانی برای فروشگاه بنویسید.', example: 'لباس زیر و پوشاک زنانه شیک، راحت و باکیفیت.', max: 160, multiline: true },
  { key: 'default_og_image', label: 'تصویر پیش‌فرض OG', helper: 'اگر صفحه‌ای تصویر اختصاصی نداشت، این تصویر هنگام اشتراک‌گذاری استفاده می‌شود.', example: 'https://noosheh.com/og-default.jpg', dir: 'ltr' },
  { key: 'title_separator', label: 'جداکننده عنوان', helper: 'بین نام صفحه و نام فروشگاه قرار می‌گیرد.', example: '|', max: 3 }
];

export default function SeoSettingsPage() {
  const { data, reload } = useEntityList<SeoSettings>('SeoSettings');
  const [form, setForm] = useState<SeoSettings>(initialForm);
  const [message, setMessage] = useState('');

  useEffect(() => { if (data[0]) setForm((current) => ({ ...current, ...data[0] })); }, [data]);

  const setField = (key: keyof SeoSettings, value: string) => setForm((current) => ({ ...current, [key]: value }));
  const save = async () => {
    setMessage('');
    if (data[0]?.id) await adminApi.update('SeoSettings', data[0].id, form);
    else await adminApi.create('SeoSettings', form);
    await reload();
    setMessage('تنظیمات پایه سئو ذخیره شد.');
  };

  const previewTitle = form.site_name ? `${form.site_name} ${form.title_separator || '|'} لباس زیر زنانه شیک و راحت` : 'نوشه | لباس زیر زنانه شیک و راحت';
  const previewDescription = form.site_description || initialForm.site_description;
  const previewUrl = normalizeSiteUrl(form.site_url);

  const aside = (
    <div className="seo-sticky-preview">
      <GooglePreview title={previewTitle} url={previewUrl} description={previewDescription} />
      <SocialPreview title={previewTitle} description={previewDescription} image={form.default_og_image} />
    </div>
  );

  return (
    <AssistantPage title="تنظیمات پایه SEO" description="اطلاعات اصلی سایت را طوری تنظیم کنید که در گوگل و شبکه‌های اجتماعی واضح و زیبا دیده شود." aside={aside}>
      <Card>
        <CardTitle title="اطلاعات سایت" subtitle="این بخش، پایه عنوان‌ها، توضیحات و پیش‌نمایش لینک‌های فروشگاه است." />
        <div className="seo-form-grid">
          {fields.map((field) => {
            const value = String(form[field.key] || '');
            const invalidUrl = field.key === 'site_url' && value.length > 0 && !/^https?:\/\//.test(value);
            const isLong = Boolean(field.max && value.length > field.max);
            return (
              <label key={field.key} className="seo-field">
                <span>{field.label}</span>
                <small>{field.helper}</small>
                {field.multiline ? (
                  <textarea value={value} onChange={(event) => setField(field.key, event.target.value)} placeholder={field.example} maxLength={field.max ? field.max + 30 : undefined} />
                ) : (
                  <input value={value} onChange={(event) => setField(field.key, event.target.value)} placeholder={field.example} dir={field.dir} maxLength={field.max ? field.max + 10 : undefined} />
                )}
                <em className={invalidUrl || isLong ? 'error' : ''}>
                  {field.max ? `${toFa(value.length)} / ${toFa(field.max)} کاراکتر` : invalidUrl ? 'آدرس باید با http یا https شروع شود.' : `مثال: ${field.example}`}
                </em>
              </label>
            );
          })}
        </div>
      </Card>

      <Card>
        <CardTitle title="Robots.txt" subtitle="برای ویرایش کامل قواعد Robots از صفحه اختصاصی Robots هم می‌توانید استفاده کنید." />
        <label className="seo-field">
          <span>متن Robots</span>
          <small>اگر مطمئن نیستید، مقدار پیش‌فرض را نگه دارید.</small>
          <textarea dir="ltr" value={form.robots_txt || ''} onChange={(event) => setField('robots_txt', event.target.value)} placeholder={'User-agent: *\nAllow: /\nDisallow: /admin\nDisallow: /api'} />
        </label>
      </Card>

      <div className="seo-save-row">
        {message && <span>{message}</span>}
        <button type="button" className="seo-button" onClick={save}>ذخیره تنظیمات</button>
      </div>
    </AssistantPage>
  );
}
