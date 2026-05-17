'use client';

import Link from 'next/link';
import { createContext, useContext, useState, type ReactNode } from 'react';
import type { Product } from '@/app/admin/types';

type CompareContextValue = {
  compareList: Product[];
  addToCompare: (product: Product) => void;
  removeFromCompare: (id: string) => void;
  clearCompare: () => void;
  isInCompare: (id: string) => boolean;
  showModal: boolean;
  setShowModal: (show: boolean) => void;
};

const CompareContext = createContext<CompareContextValue | null>(null);

export function CompareProvider({ children }: { children: ReactNode }) {
  const [compareList, setCompareList] = useState<Product[]>([]);
  const [showModal, setShowModal] = useState(false);

  const addToCompare = (product: Product) => {
    setCompareList((current) => {
      if (current.find((item) => item.id === product.id)) return current;
      if (current.length >= 3) return [...current.slice(1), product];
      return [...current, product];
    });
  };
  const removeFromCompare = (id: string) => setCompareList((current) => current.filter((item) => item.id !== id));
  const clearCompare = () => setCompareList([]);
  const isInCompare = (id: string) => compareList.some((item) => item.id === id);

  return (
    <CompareContext.Provider value={{ compareList, addToCompare, removeFromCompare, clearCompare, isInCompare, showModal, setShowModal }}>
      {children}
      {compareList.length > 0 && <CompareBar />}
      {showModal && <CompareModal />}
    </CompareContext.Provider>
  );
}

export const useCompare = () => useContext(CompareContext);

function CompareBar() {
  const compare = useContext(CompareContext)!;
  return (
    <div className="store-compare-bar" dir="rtl">
      <div className="store-container">
        <strong>▥ مقایسه ({compare.compareList.length}/۳)</strong>
        <div className="store-compare-items">
          {compare.compareList.map((product) => (
            <div key={product.id}>
              {product.images?.[0] && <img src={product.images[0]} alt={product.title} />}
              <span>{product.title}</span>
              <button onClick={() => compare.removeFromCompare(product.id)}>×</button>
            </div>
          ))}
        </div>
        <button onClick={() => compare.setShowModal(true)} disabled={compare.compareList.length < 2} className="store-primary-btn small">مقایسه کن</button>
        <button onClick={compare.clearCompare} className="store-outline-btn">پاک کن</button>
      </div>
    </div>
  );
}

const fields: Array<{ key: keyof Product; label: string; render?: (product: Product) => ReactNode }> = [
  { key: 'price', label: 'قیمت', render: (p) => `${(p.discount_price || p.price).toLocaleString('fa-IR')} تومان` },
  { key: 'brand', label: 'برند' },
  { key: 'material', label: 'جنس پارچه' },
  { key: 'sizes', label: 'سایزها', render: (p) => p.sizes?.join('، ') || '—' },
  { key: 'colors', label: 'رنگ‌ها', render: (p) => p.colors?.join('، ') || '—' },
  { key: 'cup_size', label: 'سایز کاپ' },
  { key: 'stock', label: 'موجودی', render: (p) => p.stock && p.stock > 0 ? `${p.stock.toLocaleString('fa-IR')} عدد` : 'ناموجود' },
  { key: 'is_featured', label: 'محصول ویژه', render: (p) => p.is_featured ? '✓' : '—' }
];

function CompareModal() {
  const compare = useContext(CompareContext)!;
  return (
    <div className="store-modal-backdrop" onClick={() => compare.setShowModal(false)}>
      <div className="store-compare-modal" onClick={(event) => event.stopPropagation()} dir="rtl">
        <header><h2>▥ مقایسه محصولات</h2><button onClick={() => compare.setShowModal(false)}>×</button></header>
        <div className="store-compare-table" style={{ ['--cols' as string]: compare.compareList.length }}>
          <div />
          {compare.compareList.map((product) => (
            <Link href={`/product/${product.id}`} key={product.id} onClick={() => compare.setShowModal(false)}>
              {product.images?.[0] ? <img src={product.images[0]} alt={product.title} /> : <span />}
              <b>{product.title}</b>
            </Link>
          ))}
          {fields.map((field) => (
            <div className="store-compare-row" key={field.label}>
              <strong>{field.label}</strong>
              {compare.compareList.map((product) => <span key={product.id}>{field.render ? field.render(product) : String(product[field.key] || '—')}</span>)}
            </div>
          ))}
        </div>
        <footer><button className="store-outline-btn" onClick={compare.clearCompare}>پاک کردن لیست</button><button className="store-primary-btn" onClick={() => compare.setShowModal(false)}>بستن</button></footer>
      </div>
    </div>
  );
}
