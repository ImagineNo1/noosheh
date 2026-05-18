'use client';

import { useEffect, useMemo, useState } from 'react';
import { adminApi } from '../admin-api';
import { useEntityList } from '../_components/hooks';
import { Button, Card, Input, Label } from '../_components/ui';
import type { SiteSetting } from '../types';

type SettingType = 'text' | 'image';

type FieldConfig = {
  key: string;
  label: string;
  type: SettingType;
  placeholder?: string;
  hint?: string;
  dir?: 'rtl' | 'ltr';
};

const imageFields: FieldConfig[] = [
  { key: 'logo', label: 'لوگو سایت', type: 'image', hint: 'در هدر سایت نمایش داده می‌شود' },
  { key: 'site_icon', label: 'آیکون سایت (Favicon)', type: 'image', hint: 'در تب مرورگر نمایش داده می‌شود' },
  { key: 'home_hero_rect_image', label: 'عکس مستطیلی هیرو صفحه اصلی', type: 'image', hint: 'در بخش هیرو صفحه اصلی نمایش داده می‌شود' },
  { key: 'home_hero_circle_image', label: 'عکس دایره‌ای هیرو صفحه اصلی', type: 'image', hint: 'عکس دایره‌ای روی کارت هیرو صفحه اصلی' }
];

const generalFields: FieldConfig[] = [
  { key: 'site_title', label: 'عنوان سایت', type: 'text', placeholder: 'مثلاً: نوشه — لباس زیر زنانه' },
  { key: 'site_tagline', label: 'شعار سایت (فوتر)', type: 'text', placeholder: 'مثلاً: راحتی و سبک‌پوشی' },
  { key: 'footer_copyright', label: 'متن کپی‌رایت فوتر', type: 'text', placeholder: '© ۱۴۰۴ نوشه. تمامی حقوق محفوظ است.' }
];

const contactFields: FieldConfig[] = [
  { key: 'phone', label: 'شماره تماس', type: 'text', placeholder: '۰۲۱-XXXX-XXXX', dir: 'ltr' },
  { key: 'site_email', label: 'ایمیل سایت', type: 'text', placeholder: 'info@noosheh.com', dir: 'ltr' },
  { key: 'instagram', label: 'لینک اینستاگرام', type: 'text', placeholder: 'https://instagram.com/noosheh', dir: 'ltr' }
];

const bannerFields: FieldConfig[] = [
  { key: 'promo_banner_text', label: 'متن نوار بالای سایت', type: 'text', placeholder: 'مثلاً: ارسال رایگان ... | تخفیف ویژه ...', hint: 'برای دو بخش بنر از | استفاده کنید. خالی بگذارید تا مخفی شود.' }
];

function Section({ title, description, children }: { title: string; description?: string; children: React.ReactNode }) {
  return (
    <Card className="p-0 overflow-hidden">
      <div className="border-b border-border/60 px-5 py-4">
        <h2 className="text-base font-semibold">{title}</h2>
        {description && <p className="mt-1 text-xs text-muted-foreground">{description}</p>}
      </div>
      <div className="space-y-4 px-5 py-5">{children}</div>
    </Card>
  );
}

function TextField({ config, value, onChange, onBlur }: { config: FieldConfig; value: string; onChange: (value: string) => void; onBlur: (value: string) => void }) {
  return (
    <div className="space-y-1.5">
      <Label>{config.label}</Label>
      <Input
        value={value}
        placeholder={config.placeholder}
        dir={config.dir || 'rtl'}
        onChange={(event) => onChange(event.target.value)}
        onBlur={(event) => onBlur(event.target.value)}
      />
      {config.hint && <p className="text-xs text-muted-foreground">{config.hint}</p>}
    </div>
  );
}

function ImageField({ config, value, uploading, onUpload }: { config: FieldConfig; value: string; uploading: boolean; onUpload: (file: File) => Promise<void> }) {
  return (
    <div className="space-y-2">
      <Label>{config.label}</Label>
      {config.hint && <p className="text-xs text-muted-foreground">{config.hint}</p>}
      <div className="rounded-xl border-2 border-dashed border-border bg-secondary/20 p-3">
        {value ? (
          <div className="flex items-center gap-3">
            <div className="h-16 w-16 overflow-hidden rounded-lg border border-border bg-white">
              <img src={value} alt={config.label} className="h-full w-full object-contain" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs text-muted-foreground">{value.split('/').pop()}</p>
              <p className="mt-0.5 text-xs text-green-600">آپلود شد</p>
            </div>
            <label className="cursor-pointer">
              <input type="file" hidden accept="image/*" disabled={uploading} onChange={(event) => event.target.files?.[0] && onUpload(event.target.files[0])} />
              <span className="admin-btn outline">{uploading ? 'در حال آپلود...' : 'تغییر'}</span>
            </label>
          </div>
        ) : (
          <label className="block cursor-pointer p-5 text-center">
            <input type="file" hidden accept="image/*" disabled={uploading} onChange={(event) => event.target.files?.[0] && onUpload(event.target.files[0])} />
            <p className="text-sm font-medium">{uploading ? 'در حال آپلود...' : 'آپلود تصویر'}</p>
          </label>
        )}
      </div>
    </div>
  );
}

export default function SiteSettings() {
  const { data: settings, isLoading, reload } = useEntityList<SiteSetting>('SiteSettings');
  const [values, setValues] = useState<Record<string, SiteSetting>>({});
  const [uploading, setUploading] = useState<Record<string, boolean>>({});
  const [savingAll, setSavingAll] = useState(false);

  const settingsMap = useMemo(() => Object.fromEntries(settings.map((item) => [item.key, item])), [settings]);
  useEffect(() => setValues(settingsMap), [settingsMap]);

  const allFields = [...imageFields, ...generalFields, ...contactFields, ...bannerFields];

  const upsert = async (key: string, value: string, type: SettingType) => {
    const existing = values[key];
    const saved = existing?.id
      ? await adminApi.update<SiteSetting>('SiteSettings', existing.id, { value, type })
      : await adminApi.create<SiteSetting>('SiteSettings', { key, value, type });
    setValues((current) => ({ ...current, [key]: saved }));
  };

  const saveAll = async () => {
    setSavingAll(true);
    try {
      for (const field of allFields) {
        const value = values[field.key]?.value || '';
        await upsert(field.key, value, field.type);
      }
      await reload();
    } finally {
      setSavingAll(false);
    }
  };

  const setFieldValue = (key: string, value: string, type: SettingType) => {
    setValues((current) => ({
      ...current,
      [key]: { ...(current[key] || { id: '', key, type }), value }
    }));
  };

  const handleImageUpload = async (key: string, file: File) => {
    setUploading((current) => ({ ...current, [key]: true }));
    try {
      const { file_url } = await adminApi.upload(file);
      setFieldValue(key, file_url, 'image');
      await upsert(key, file_url, 'image');
      await reload();
    } finally {
      setUploading((current) => ({ ...current, [key]: false }));
    }
  };

  return (
    <div className="mx-auto w-full max-w-4xl space-y-6 admin-page">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="admin-title">تنظیمات سایت</h1>
          <p className="admin-muted">تصاویر، اطلاعات تماس و محتوای ثابت سایت را مدیریت کنید.</p>
        </div>
        <Button className="primary" onClick={saveAll} disabled={savingAll || isLoading}>{savingAll ? 'در حال ذخیره...' : 'ذخیره تغییرات'}</Button>
      </div>

      {isLoading ? (
        <Card><div className="p-8 text-center admin-muted">در حال بارگذاری تنظیمات...</div></Card>
      ) : (
        <div className="space-y-5">
          <Section title="تصاویر سایت" description="لوگو و فاوآیکون برند">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {imageFields.map((field) => (
                <ImageField key={field.key} config={field} value={values[field.key]?.value || ''} uploading={!!uploading[field.key]} onUpload={(file) => handleImageUpload(field.key, file)} />
              ))}
            </div>
          </Section>

          <Section title="اطلاعات عمومی" description="عنوان و متن‌های ثابت سایت">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {generalFields.map((field) => (
                <TextField key={field.key} config={field} value={values[field.key]?.value || ''} onChange={(value) => setFieldValue(field.key, value, 'text')} onBlur={(value) => upsert(field.key, value, 'text')} />
              ))}
            </div>
          </Section>

          <Section title="اطلاعات تماس و شبکه‌های اجتماعی" description="شماره، ایمیل و اینستاگرام نمایش داده‌شده در سایت">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {contactFields.map((field) => (
                <TextField key={field.key} config={field} value={values[field.key]?.value || ''} onChange={(value) => setFieldValue(field.key, value, 'text')} onBlur={(value) => upsert(field.key, value, 'text')} />
              ))}
            </div>
          </Section>

          <Section title="بنر اطلاع‌رسانی" description="متن نوار بالای سایت">
            {bannerFields.map((field) => (
              <TextField key={field.key} config={field} value={values[field.key]?.value || ''} onChange={(value) => setFieldValue(field.key, value, 'text')} onBlur={(value) => upsert(field.key, value, 'text')} />
            ))}
          </Section>

          <div className="flex justify-end pb-8">
            <Button className="primary" onClick={saveAll} disabled={savingAll}>{savingAll ? 'در حال ذخیره...' : 'ذخیره تمام تغییرات'}</Button>
          </div>
        </div>
      )}
    </div>
  );
}
