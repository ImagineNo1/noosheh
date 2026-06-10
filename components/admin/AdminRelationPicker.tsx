'use client';

import { useMemo, useState } from 'react';
import { Card, Input, Label } from '@/app/admin/_components/ui';
import type { Product } from '@/app/admin/types';

type RelationType = 'similar' | 'complete';

const normalizeText = (value?: string) => (value || '').trim().toLowerCase();
const intersectionCount = (first: string[] = [], second: string[] = []) => {
  const secondSet = new Set(second.map(normalizeText).filter(Boolean));
  return first.map(normalizeText).filter((item) => item && secondSet.has(item)).length;
};

function relationScore(product: Product, contextProduct?: Product, relationType?: RelationType) {
  if (!contextProduct) return 0;
  if (relationType === 'complete') {
    return intersectionCount(product.tags, contextProduct.tags) * 3 + intersectionCount(product.features, contextProduct.features) * 2 + intersectionCount(product.badges, contextProduct.badges);
  }
  if (relationType === 'similar') {
    return Number(Boolean(product.collection && normalizeText(product.collection) === normalizeText(contextProduct.collection))) * 3 +
      Number(Boolean(product.category && normalizeText(product.category) === normalizeText(contextProduct.category))) * 2 +
      Number(Boolean(product.brand && normalizeText(product.brand) === normalizeText(contextProduct.brand)));
  }
  return 0;
}

export default function AdminRelationPicker({
  selectedIds = [],
  excludeId,
  products = [],
  onChange,
  label,
  contextProduct,
  relationType
}: {
  selectedIds?: string[];
  excludeId?: string;
  products?: Product[];
  onChange: (ids: string[]) => void;
  label: string;
  contextProduct?: Product;
  relationType?: RelationType;
}) {
  const [search, setSearch] = useState('');

  const sortedProducts = useMemo(() => [...products].sort((first, second) => {
    const scoreDiff = relationScore(second, contextProduct, relationType) - relationScore(first, contextProduct, relationType);
    if (scoreDiff) return scoreDiff;
    return (first.title || '').localeCompare(second.title || '', 'fa');
  }), [products, contextProduct, relationType]);

  const selectedProducts = sortedProducts.filter((product) => selectedIds.includes(product.id));
  const availableProducts = useMemo(() => {
    const query = search.trim().toLowerCase();
    return sortedProducts
      .filter((product) => product.id !== excludeId)
      .filter((product) => !selectedIds.includes(product.id))
      .filter((product) => !query || product.title.toLowerCase().includes(query) || product.code?.toLowerCase().includes(query))
      .slice(0, 10);
  }, [sortedProducts, excludeId, selectedIds, search]);

  const addProduct = (id: string) => {
    if (!selectedIds.includes(id)) onChange([...selectedIds, id]);
    setSearch('');
  };

  const removeProduct = (id: string) => onChange(selectedIds.filter((selectedId) => selectedId !== id));

  return (
    <Card>
      <div className="admin-card-header compact">
        <h2>{label}</h2>
      </div>
      <div className="admin-card-body manager-list">
        <div className="relation-chip-list">
          {selectedProducts.map((product) => (
            <span key={product.id} className="relation-chip">
              {product.images?.[0] ? <img src={product.images[0]} alt="" /> : '▣'}
              <b>{product.title}</b>
              <button type="button" onClick={() => removeProduct(product.id)} aria-label={`حذف ${product.title}`}>×</button>
            </span>
          ))}
          {selectedProducts.length === 0 && <p className="admin-muted small">هنوز محصولی انتخاب نشده است؛ در صفحه محصول پیشنهادهای خودکار نمایش داده می‌شوند.</p>}
        </div>

        <div>
          <Label>جستجو و افزودن</Label>
          <Input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="نام یا کد محصول..." />
        </div>

        <div className="relation-results">
          {availableProducts.map((product) => (
            <button key={product.id} type="button" onClick={() => addProduct(product.id)}>
              {product.images?.[0] ? <img src={product.images[0]} alt="" /> : <span>▣</span>}
              <span>{product.title}</span>
            </button>
          ))}
          {availableProducts.length === 0 && search && <p className="admin-muted small center">محصولی یافت نشد</p>}
        </div>

        <div>
          <Label>شناسه‌های انتخاب‌شده</Label>
          <Input
            value={selectedIds.join(', ')}
            onChange={(event) => onChange(event.target.value.split(',').map((item) => item.trim()).filter(Boolean))}
            dir="ltr"
          />
        </div>
      </div>
    </Card>
  );
}
