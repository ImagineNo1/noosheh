'use client';

import { useMemo, useState } from 'react';
import { adminApi } from '../admin-api';
import { formatDate, useEntityList } from '../_components/hooks';
import { Button, Card, EmptyState, Input } from '../_components/ui';
import type { ProductAttribute } from '../types';

const attributeGroups = [
  { type: 'brand', title: 'برند', icon: '✦', helper: 'نام برندهایی که در محصول انتخاب می‌شوند.', example: 'Noosheh' },
  { type: 'collection', title: 'کالکشن', icon: '◈', helper: 'فصل، کمپین یا مجموعه محصول.', example: 'بهاره' },
  { type: 'category', title: 'دسته‌بندی', icon: '▦', helper: 'دسته اصلی نمایش محصول.', example: 'لباس خواب' },
  { type: 'product_type', title: 'نوع محصول', icon: '◇', helper: 'مدل یا فرم محصول.', example: 'ست' },
  { type: 'tag', title: 'تگ', icon: '#', helper: 'برچسب‌های جستجو و پیشنهاددهی.', example: 'پرفروش' },
  { type: 'feature', title: 'ویژگی', icon: '✓', helper: 'مزیت‌های کوتاه محصول.', example: 'پارچه لطیف' },
  { type: 'badge', title: 'بج', icon: '★', helper: 'نشان‌های روی کارت محصول.', example: 'new' },
  { type: 'color', title: 'رنگ', icon: '●', helper: 'رنگ‌های قابل انتخاب.', example: 'مشکی' },
  { type: 'size', title: 'سایز', icon: '↔', helper: 'سایزهای استاندارد محصول.', example: 'M' },
  { type: 'cup', title: 'کاپ', icon: '◠', helper: 'کاپ‌های قابل انتخاب.', example: 'B' }
] as const;

const normalizeValue = (value: string) => value.trim();
const isSameAttribute = (item: ProductAttribute, type: string, value: string) => item.type === type && (item.value || item.name).trim().toLowerCase() === value.trim().toLowerCase();

type DraftMap = Record<string, string>;
type EditMap = Record<string, { name: string; value: string }>;

export default function AttributesPage() {
  const { data: attributes, isLoading, reload } = useEntityList<ProductAttribute>('ProductAttribute', 'type', 500);
  const [drafts, setDrafts] = useState<DraftMap>({});
  const [editing, setEditing] = useState<EditMap>({});
  const [busyId, setBusyId] = useState('');

  const grouped = useMemo(() => Object.fromEntries(attributeGroups.map((group) => [group.type, attributes.filter((item) => item.type === group.type)])), [attributes]);
  const totalCount = attributes.length;

  const setDraft = (type: string, value: string) => setDrafts((current) => ({ ...current, [type]: value }));
  const startEdit = (item: ProductAttribute) => setEditing((current) => ({ ...current, [item.id]: { name: item.name, value: item.value || item.name } }));
  const cancelEdit = (id: string) => setEditing((current) => { const next = { ...current }; delete next[id]; return next; });

  const createDefault = async (type: string) => {
    const nextValue = normalizeValue(drafts[type] || '');
    if (!nextValue || attributes.some((item) => isSameAttribute(item, type, nextValue))) return;
    setBusyId(`new-${type}`);
    await adminApi.create<ProductAttribute>('ProductAttribute', { type, name: nextValue, value: nextValue });
    setDraft(type, '');
    await reload();
    setBusyId('');
  };

  const updateDefault = async (item: ProductAttribute) => {
    const currentEdit = editing[item.id];
    if (!currentEdit?.name.trim()) return;
    setBusyId(item.id);
    const payload = { type: item.type, name: currentEdit.name.trim(), value: (currentEdit.value || currentEdit.name).trim() };
    await adminApi.update<ProductAttribute>('ProductAttribute', item.id, payload);
    cancelEdit(item.id);
    await reload();
    setBusyId('');
  };

  const removeDefault = async (id: string) => {
    setBusyId(id);
    await adminApi.delete('ProductAttribute', id);
    await reload();
    setBusyId('');
  };

  const handleDraftKeyDown = async (event: React.KeyboardEvent<HTMLInputElement>, type: string) => {
    if (event.key !== 'Enter' && event.key !== ' ') return;
    if (event.key === ' ' && (drafts[type] || '').trim().includes(' ')) return;
    if (!normalizeValue(drafts[type] || '')) return;
    event.preventDefault();
    await createDefault(type);
  };

  return (
    <div className="admin-page admin-defaults-page">
      <div className="admin-defaults-hero">
        <div>
          <span className="admin-kicker">Product Defaults</span>
          <h1 className="admin-title">پیش‌فرض‌های محصول</h1>
          <p className="admin-muted">تمام مقدارهای دراپ‌داونی محصول را همین‌جا مدیریت کنید؛ افزودن، حذف و ویرایش هر گروه در همان کارت انجام می‌شود.</p>
        </div>
        <div className="admin-defaults-summary">
          <strong>{totalCount.toLocaleString('fa-IR')}</strong>
          <span>پیش‌فرض فعال</span>
        </div>
      </div>

      {isLoading ? <div className="admin-list-skeleton"><div /></div> : totalCount === 0 ? <EmptyState icon="☷" text="هنوز پیش‌فرضی تعریف نشده است؛ از کارت‌های زیر اولین مقدار را اضافه کنید." /> : null}

      <div className="admin-defaults-grid">
        {attributeGroups.map((group) => {
          const items = grouped[group.type] || [];
          const draft = drafts[group.type] || '';
          const duplicate = Boolean(draft.trim() && attributes.some((item) => isSameAttribute(item, group.type, draft)));
          return (
            <Card key={group.type} className="admin-default-card">
              <div className="admin-default-card-head">
                <span>{group.icon}</span>
                <div>
                  <h2>{group.title}</h2>
                  <p>{group.helper}</p>
                </div>
                <b>{items.length.toLocaleString('fa-IR')}</b>
              </div>
              <div className="admin-default-add-row">
                <Input
                  value={draft}
                  onChange={(event) => setDraft(group.type, event.target.value)}
                  onKeyDown={(event) => handleDraftKeyDown(event, group.type)}
                  placeholder={`افزودن ${group.title} مثل ${group.example}`}
                />
                <Button className="primary" onClick={() => createDefault(group.type)} disabled={!draft.trim() || duplicate || busyId === `new-${group.type}`}>افزودن</Button>
              </div>
              {duplicate ? <small className="admin-default-warning">این مقدار قبلاً ثبت شده است.</small> : <small className="admin-muted small">با Enter یا Space هم می‌توانید مقدار را اضافه کنید.</small>}
              <div className="admin-default-items">
                {items.length ? items.map((item) => {
                  const edit = editing[item.id];
                  return (
                    <div key={item.id} className="admin-default-item">
                      {edit ? (
                        <div className="admin-default-edit">
                          <Input value={edit.name} onChange={(event) => setEditing((current) => ({ ...current, [item.id]: { ...edit, name: event.target.value } }))} placeholder="نام" />
                          <Input value={edit.value} onChange={(event) => setEditing((current) => ({ ...current, [item.id]: { ...edit, value: event.target.value } }))} placeholder="مقدار" />
                          <Button className="primary" onClick={() => updateDefault(item)} disabled={busyId === item.id || !edit.name.trim()}>ذخیره</Button>
                          <Button className="outline" onClick={() => cancelEdit(item.id)} disabled={busyId === item.id}>لغو</Button>
                        </div>
                      ) : (
                        <>
                          <div>
                            <strong>{item.name}</strong>
                            <p>{item.value || item.name} • {formatDate(item.created_date)}</p>
                          </div>
                          <div className="admin-default-actions">
                            <Button className="ghost" onClick={() => startEdit(item)} disabled={Boolean(busyId)}>✎</Button>
                            <Button className="ghost danger" onClick={() => removeDefault(item.id)} disabled={busyId === item.id}>🗑</Button>
                          </div>
                        </>
                      )}
                    </div>
                  );
                }) : <p className="admin-muted small center">موردی ثبت نشده است.</p>}
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
