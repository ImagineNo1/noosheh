'use client';

import { useMemo, useState } from 'react';
import { adminApi } from '../admin-api';
import { formatDate, useEntityList } from '../_components/hooks';
import { Button, Card, EmptyState, Input, Label, Select } from '../_components/ui';
import type { ProductAttribute } from '../types';

const typeLabels: Record<string, string> = { size: 'سایزها', color: 'رنگ‌ها', cup: 'کاپ‌ها' };
const typeExamples: Record<string, string> = { size: 'S, M, L, XL', color: 'قرمز، مشکی، سفید، آبی', cup: 'A, B, C, D' };

export default function AttributesPage() {
  const { data: attributes, isLoading, reload } = useEntityList<ProductAttribute>('ProductAttribute', 'type', 300);
  const [form, setForm] = useState({ id: '', type: 'size', name: '', value: '' });
  const [saving, setSaving] = useState(false);
  const grouped = useMemo(() => ({
    size: attributes.filter((item) => item.type === 'size'),
    color: attributes.filter((item) => item.type === 'color'),
    cup: attributes.filter((item) => item.type === 'cup')
  }), [attributes]);

  const reset = () => setForm({ id: '', type: 'size', name: '', value: '' });
  const save = async () => {
    if (!form.name.trim()) return;
    setSaving(true);
    const payload = { type: form.type, name: form.name.trim(), value: (form.value || form.name).trim() };
    if (form.id) await adminApi.update<ProductAttribute>('ProductAttribute', form.id, payload);
    else await adminApi.create<ProductAttribute>('ProductAttribute', payload);
    await reload();
    reset();
    setSaving(false);
  };
  const remove = async (id: string) => { await adminApi.delete('ProductAttribute', id); await reload(); };

  return (
    <div className="admin-page">
      <div className="admin-page-header"><div><h1 className="admin-title">پیش‌فرض‌ها / مدیریت ویژگی‌ها</h1><p className="admin-muted">رنگ‌ها، سایزها و کاپ‌ها را یک بار تعریف کنید تا در ساخت محصول از آن‌ها انتخاب شود.</p></div></div>
      <Card><div className="admin-card-body">
        <div className="admin-form-grid">
          <div><Label>نوع ویژگی</Label><Select value={form.type} onChange={(type) => setForm((current) => ({ ...current, type }))}>{Object.entries(typeLabels).map(([key, label]) => <option key={key} value={key}>{label}</option>)}</Select></div>
          <div><Label>نام</Label><Input value={form.name} onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))} placeholder={typeExamples[form.type]} /></div>
          <div><Label>مقدار ذخیره‌شده</Label><Input value={form.value} onChange={(event) => setForm((current) => ({ ...current, value: event.target.value }))} placeholder="اگر خالی باشد برابر نام ذخیره می‌شود" /></div>
        </div>
        <div className="admin-actions-row"><Button className="primary" onClick={save} disabled={saving || !form.name.trim()}>{form.id ? 'ذخیره ویرایش' : 'افزودن پیش‌فرض'}</Button>{form.id && <Button className="outline" onClick={reset}>انصراف از ویرایش</Button>}</div>
      </div></Card>
      {isLoading ? <div className="admin-list-skeleton"><div /></div> : attributes.length === 0 ? <EmptyState icon="☷" text="هنوز پیش‌فرضی تعریف نشده است" /> : (
        <div className="admin-grid cards-3">
          {Object.entries(grouped).map(([type, items]) => (
            <Card key={type}><div className="admin-card-header compact"><h2>{typeLabels[type]}</h2></div><div className="admin-card-body manager-list">
              {items.map((item) => <div key={item.id} className="manager-item"><div className="manager-row between"><div><strong>{item.name}</strong><p className="admin-muted small">{item.value || item.name} • {formatDate(item.created_date)}</p></div><div className="admin-actions-row"><Button className="ghost" onClick={() => setForm({ id: item.id, type: item.type, name: item.name, value: item.value || item.name })}>✎</Button><Button className="ghost danger" onClick={() => remove(item.id)}>🗑</Button></div></div></div>)}
              {items.length === 0 && <p className="admin-muted small">موردی ثبت نشده است.</p>}
            </div></Card>
          ))}
        </div>
      )}
    </div>
  );
}
