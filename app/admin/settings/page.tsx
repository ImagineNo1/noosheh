'use client';

import { useEffect, useMemo, useState } from 'react';
import { adminApi } from '../admin-api';
import { useEntityList } from '../_components/hooks';
import { Card, Input, Label } from '../_components/ui';
import type { SiteSetting } from '../types';

const settingsConfig = [
  { key: 'hero_banner', label: 'بنر اصلی صفحه اول', type: 'image' },
  { key: 'logo', label: 'لوگو سایت', type: 'image' },
  { key: 'phone', label: 'شماره تلفن مشاوره', type: 'text' },
  { key: 'free_shipping_min', label: 'حداقل مبلغ ارسال رایگان (تومان)', type: 'text' },
  { key: 'instagram', label: 'لینک اینستاگرام', type: 'text' },
  { key: 'telegram', label: 'لینک تلگرام', type: 'text' },
  { key: 'about_text', label: 'متن درباره ما', type: 'text' }
];

export default function SiteSettings() {
  const { data: settings, reload } = useEntityList<SiteSetting>('SiteSettings');
  const [uploading, setUploading] = useState<Record<string, boolean>>({});
  const [values, setValues] = useState<Record<string, SiteSetting>>({});

  const settingsMap = useMemo(() => Object.fromEntries(settings.map((setting) => [setting.key, setting])), [settings]);

  useEffect(() => setValues(settingsMap), [settingsMap]);

  const saveSetting = async (key: string, value: string, type: string) => {
    const existing = values[key];
    const saved = existing?.id
      ? await adminApi.update<SiteSetting>('SiteSettings', existing.id, { value, type })
      : await adminApi.create<SiteSetting>('SiteSettings', { key, value, type });
    setValues((current) => ({ ...current, [key]: saved }));
    await reload();
  };

  const handleImageUpload = async (key: string, event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setUploading((current) => ({ ...current, [key]: true }));
    const { file_url } = await adminApi.upload(file);
    await saveSetting(key, file_url, 'image');
    setUploading((current) => ({ ...current, [key]: false }));
  };

  return (
    <div className="admin-page">
      <h1 className="admin-title">تنظیمات سایت</h1>
      <p className="admin-muted">از اینجا می‌توانید تصاویر و تنظیمات سایت را مدیریت کنید.</p>

      <div className="admin-grid cards-2">
        {settingsConfig.map((config) => (
          <Card key={config.key}>
            <div className="admin-card-header compact"><h2>{config.label}</h2></div>
            {config.type === 'image' ? (
              <div className="admin-settings-image">
                {values[config.key]?.value && <div className="admin-media aspect-video"><img src={values[config.key].value} alt={config.label} /></div>}
                <label className="admin-upload-button dashed">↥ {uploading[config.key] ? 'در حال آپلود...' : 'آپلود تصویر'}<input type="file" accept="image/*,image/gif" hidden disabled={uploading[config.key]} onChange={(event) => handleImageUpload(config.key, event)} /></label>
              </div>
            ) : (
              <div><Label>{config.label}</Label><Input defaultValue={values[config.key]?.value || ''} onBlur={(event) => saveSetting(config.key, event.target.value, 'text')} dir={['instagram', 'telegram'].includes(config.key) ? 'ltr' : 'rtl'} /></div>
            )}
          </Card>
        ))}
      </div>
    </div>
  );
}
