'use client';

import { useState } from 'react';
import type { Product } from '@/app/admin/types';
import ProductReviews from '@/components/store/ProductReviews';

const tabConfig = [
  { key: 'details', label: 'Product Details' },
  { key: 'size_fit', label: 'Size & Fit' },
  { key: 'fabric_care', label: 'Fabric & Care' },
  { key: 'shipping_returns', label: 'Shipping & Returns' },
  { key: 'reviews', label: 'Reviews' }
] as const;

export default function ProductTabs({ product }: { product: Product }) {
  const [activeTab, setActiveTab] = useState<string>('details');
  const content: Record<string, string> = {
    details: product.details || product.description || 'توضیحاتی برای این محصول ثبت نشده است.',
    size_fit: product.size_fit || 'راهنمای سایز به‌زودی اضافه می‌شود.',
    fabric_care: product.fabric_care || product.material || product.wash_instructions || '—',
    shipping_returns: product.shipping_returns || 'ارسال سریع و امکان تعویض تا ۷ روز.'
  };

  return (
    <section className="mt-16 rounded-2xl border border-border bg-card" id="size-guide">
      <div className="flex gap-0 overflow-x-auto border-b border-border px-3 pt-3">
        {tabConfig.map((tab) => <button key={tab.key} type="button" onClick={() => setActiveTab(tab.key)} className={`whitespace-nowrap border-b-2 px-4 pb-3 pt-1 text-sm font-medium transition ${activeTab === tab.key ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'}`}>{tab.label}</button>)}
      </div>
      <div className="p-5 text-sm leading-8 text-muted-foreground">
        {activeTab === 'reviews' ? <ProductReviews productId={product.id} /> : <div className="whitespace-pre-line">{content[activeTab]}</div>}
      </div>
    </section>
  );
}
