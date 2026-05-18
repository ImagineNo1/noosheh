'use client';

import { useEffect, useMemo, useState } from 'react';
import { adminApi } from '../admin-api';
import { useEntityList } from '../_components/hooks';
import { Card, Input, Label } from '../_components/ui';
import type { SiteSetting } from '../types';

const settingsConfig = [
  { key: 'site_icon', label: 'آیکون سایت (favicon)', type: 'image' },
  { key: 'logo', label: 'لوگو سایت', type: 'image' },
  { key: 'site_title', label: 'عنوان سایت', type: 'text' },
  { key: 'site_tagline', label: 'شعار سایت (فوتر)', type: 'text' },
  { key: 'phone', label: 'شماره سایت', type: 'text' },
  { key: 'site_email', label: 'ایمیل سایت', type: 'text' },
  { key: 'instagram', label: 'لینک اینستاگرام', type: 'text' },
  { key: 'footer_copyright', label: 'متن کپی‌رایت فوتر', type: 'text' },
  { key: 'promo_banner_text', label: 'متن بنر بالای سایت', type: 'text' }
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
              <div><Label>{config.label}</Label><Input value={values[config.key]?.value || ''} onChange={(event) => setValues((current) => ({ ...current, [config.key]: { ...(current[config.key] || { id: '', key: config.key, type: 'text' }), value: event.target.value } }))} onBlur={(event) => saveSetting(config.key, event.target.value, 'text')} dir={['instagram', 'site_email'].includes(config.key) ? 'ltr' : 'rtl'} /></div>
            )}
          </Card>
        ))}
      </div>
    </div>
  );
}
