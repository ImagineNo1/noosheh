'use client';

import { useMemo, useState } from 'react';
import { adminApi } from '../admin-api';
import { useEntityList } from '../_components/hooks';
import { Button, Card, Input, Label, Toggle } from '../_components/ui';
import type { PaymentGateway } from '../types';

const providers = [
  { provider: 'zarinpal', title: 'زرین پال', fields: ['merchant_id'] },
  { provider: 'zibal', title: 'زیبال', fields: ['merchant'] },
  { provider: 'idpay', title: 'آیدی پی', fields: ['api_key'] },
  { provider: 'payir', title: 'Pay.ir', fields: ['api_key'] },
  { provider: 'nextpay', title: 'نکست پی', fields: ['api_key'] },
  { provider: 'behpardakht_mellat', title: 'به پرداخت ملت', fields: ['terminal_id', 'username', 'password'] },
  { provider: 'parsian', title: 'پارسیان', fields: ['pin'] },
  { provider: 'saman', title: 'سامان', fields: ['terminal_id'] },
  { provider: 'manual_card', title: 'کارت به کارت', fields: ['card_number', 'card_owner', 'sheba', 'bank_name', 'instructions'] }
];

function makeDefault(provider: typeof providers[number], index: number): Omit<PaymentGateway, 'id'> {
  return {
    provider: provider.provider,
    title: provider.title,
    is_active: provider.provider === 'manual_card',
    is_sandbox: true,
    priority: (index + 1) * 10,
    credentials: {},
    description: provider.provider === 'manual_card' ? 'پرداخت کارت به کارت با بررسی مدیر' : 'برای فعال سازی، credential رسمی و تست verify لازم است.'
  };
}

export default function PaymentGatewaysPage() {
  const { data, reload, setData } = useEntityList<PaymentGateway>('PaymentGateway', 'priority', 100);
  const [saving, setSaving] = useState<string | null>(null);
  const gateways = useMemo(() => providers.map((provider, index) => {
    return data.find((gateway) => gateway.provider === provider.provider) || { ...makeDefault(provider, index), id: `new-${provider.provider}` };
  }), [data]);

  const updateLocal = (provider: string, patch: Partial<PaymentGateway>) => {
    setData((current) => {
      const existing = current.find((gateway) => gateway.provider === provider);
      if (existing) return current.map((gateway) => gateway.provider === provider ? { ...gateway, ...patch } : gateway);
      const meta = providers.find((item) => item.provider === provider) || providers[0];
      return [...current, { ...makeDefault(meta, providers.indexOf(meta)), id: `new-${provider}`, ...patch }];
    });
  };

  const save = async (gateway: PaymentGateway) => {
    setSaving(gateway.provider);
    const { id, created_date, updated_date, ...payload } = gateway;
    if (id.startsWith('new-')) await adminApi.create<PaymentGateway>('PaymentGateway', payload);
    else await adminApi.update<PaymentGateway>('PaymentGateway', id, payload);
    await reload();
    setSaving(null);
  };

  return (
    <div className="admin-page" dir="rtl">
      <div className="admin-page-header">
        <div>
          <h1 className="admin-title">مدیریت درگاه های پرداخت</h1>
          <p className="admin-muted">پرداخت موفق فقط بعد از verify سرور ثبت می شود. درگاه های آنلاین تا زمان تکمیل credential و اعتبارسنجی رسمی، پرداخت جعلی نمی سازند.</p>
        </div>
      </div>

      <div className="admin-grid cards-2">
        {gateways.map((gateway, index) => {
          const meta = providers.find((item) => item.provider === gateway.provider) || providers[index];
          const credentials = gateway.credentials || {};
          return (
            <Card key={gateway.provider} className="admin-card-body">
              <div className="admin-actions-row">
                <div>
                  <h3>{gateway.title || meta.title}</h3>
                  <p className="admin-muted">{gateway.provider === 'manual_card' ? 'پرداخت دستی با تایید مدیر' : 'درگاه آنلاین نیازمند credential و verify رسمی'}</p>
                </div>
                <span className={`admin-badge ${gateway.is_active ? 'success' : 'warning'}`}>{gateway.is_active ? 'فعال' : 'غیرفعال'}</span>
              </div>

              <div className="admin-form-grid">
                <div><Label>عنوان نمایشی</Label><Input value={gateway.title || ''} onChange={(event) => updateLocal(gateway.provider, { title: event.target.value })} /></div>
                <div><Label>اولویت</Label><Input type="number" dir="ltr" value={gateway.priority || 0} onChange={(event) => updateLocal(gateway.provider, { priority: Number(event.target.value) })} /></div>
                <div className="admin-inline"><Toggle checked={gateway.is_active !== false} onChange={(value) => updateLocal(gateway.provider, { is_active: value })} /><Label>فعال</Label></div>
                <div className="admin-inline"><Toggle checked={gateway.is_sandbox !== false} onChange={(value) => updateLocal(gateway.provider, { is_sandbox: value })} /><Label>Sandbox</Label></div>
              </div>

              <div className="admin-form-grid">
                {meta.fields.map((field) => (
                  <div key={field}>
                    <Label>{field}</Label>
                    <Input
                      dir={field === 'instructions' ? 'rtl' : 'ltr'}
                      type={field === 'instructions' ? 'text' : 'password'}
                      value={String(credentials[field] || '')}
                      onChange={(event) => updateLocal(gateway.provider, { credentials: { ...credentials, [field]: event.target.value } })}
                      placeholder={field}
                    />
                  </div>
                ))}
              </div>

              <div><Label>توضیحات داخلی</Label><Input value={gateway.description || ''} onChange={(event) => updateLocal(gateway.provider, { description: event.target.value })} /></div>

              <div className="admin-actions-row">
                <span className="admin-muted small">{gateway.provider === 'manual_card' ? 'قابل استفاده برای پرداخت دستی' : 'برای پرداخت زنده باید adapter رسمی تکمیل شود'}</span>
                <Button className="primary" disabled={saving === gateway.provider} onClick={() => save(gateway)}>{saving === gateway.provider ? 'در حال ذخیره...' : 'ذخیره'}</Button>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
