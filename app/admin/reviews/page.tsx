'use client';

import { useMemo, useState } from 'react';
import { adminApi } from '../admin-api';
import { Button, Card, EmptyState, Input, Select } from '../_components/ui';
import { formatDate, useEntityList } from '../_components/hooks';
import type { Product, Review } from '../types';

const statusMap: Record<string, { label: string; cls: string }> = {
  pending: { label: 'در انتظار تایید', cls: 'warning' },
  approved: { label: 'تایید شده', cls: 'success' },
  rejected: { label: 'رد شده', cls: 'danger' }
};

function Stars({ rating = 0 }: { rating?: number }) {
  return <span className="admin-review-stars" aria-label={`${rating} ستاره`}>{[1, 2, 3, 4, 5].map((star) => star <= rating ? '★' : '☆').join('')}</span>;
}

const imageUrl = (product?: Product) => product?.images?.[0] || product?.cover_image || '';

export default function ReviewListPage() {
  const { data: reviews, isLoading, reload } = useEntityList<Review>('Review', '-created_date', 100);
  const { data: products } = useEntityList<Product>('Product', '-created_date', 300);
  const [statusFilter, setStatusFilter] = useState('all');
  const [query, setQuery] = useState('');

  const productById = useMemo(() => new Map(products.map((product) => [product.id, product])), [products]);
  const stats = useMemo(() => {
    const approved = reviews.filter((review) => review.status === 'approved').length;
    const pending = reviews.filter((review) => !review.status || review.status === 'pending').length;
    const avg = reviews.length ? reviews.reduce((sum, review) => sum + Number(review.rating || 0), 0) / reviews.length : 0;
    return { total: reviews.length, approved, pending, avg };
  }, [reviews]);
  const filtered = useMemo(() => reviews.filter((review) => {
    if (statusFilter !== 'all' && (review.status || 'pending') !== statusFilter) return false;
    const product = productById.get(review.product_id);
    const haystack = [review.user_name, review.user_email, review.comment, product?.title, product?.category].join(' ').toLowerCase();
    return !query.trim() || haystack.includes(query.trim().toLowerCase());
  }), [productById, query, reviews, statusFilter]);

  const updateStatus = async (id: string, status: string) => { await adminApi.update<Review>('Review', id, { status }); await reload(); };
  const remove = async (id: string) => { await adminApi.delete('Review', id); await reload(); };

  return <div className="admin-page admin-reviews-page">
    <div className="admin-page-header admin-reviews-heading">
      <div>
        <h1 className="admin-title">مدیریت نظرات</h1>
        <p className="admin-muted small">نظرات و بازخوردهای مشتریان درباره محصولات فروشگاه را دقیق و قابل تشخیص مدیریت کنید.</p>
      </div>
      <span className="admin-heading-icon">☷</span>
    </div>

    <div className="admin-review-stats">
      <Card><div><span>کل نظرات</span><strong>{stats.total.toLocaleString('fa-IR')}</strong><small>عدد</small></div><i className="pink">💬</i></Card>
      <Card><div><span>در انتظار تایید</span><strong>{stats.pending.toLocaleString('fa-IR')}</strong><small>عدد</small></div><i className="amber">◷</i></Card>
      <Card><div><span>نظرات تایید شده</span><strong>{stats.approved.toLocaleString('fa-IR')}</strong><small>عدد</small></div><i className="green">✓</i></Card>
      <Card><div><span>میانگین امتیاز</span><strong>{stats.avg.toLocaleString('fa-IR', { maximumFractionDigits: 1 })}</strong><Stars rating={Math.round(stats.avg)} /></div><i className="gold">☆</i></Card>
    </div>

    <Card className="admin-review-filters">
      <Input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="جستجو در نام مشتری، محصول یا متن نظر..." />
      <Select value={statusFilter} onChange={setStatusFilter}><option value="all">همه</option><option value="pending">در انتظار</option><option value="approved">تایید شده</option><option value="rejected">رد شده</option></Select>
    </Card>

    {isLoading ? <Card><div className="pad-lg">در حال بارگذاری...</div></Card> : filtered.length === 0 ? <EmptyState icon="☷" text="نظری یافت نشد" /> : <Card className="admin-review-list-card">
      <div className="admin-review-list">
        {filtered.map((review) => {
          const status = statusMap[review.status || 'pending'] || statusMap.pending;
          const product = productById.get(review.product_id);
          const preview = imageUrl(product);
          return <article key={review.id} className="admin-review-row">
            <div className="admin-review-customer">
              <strong>{review.user_name || review.user_email || 'ناشناس'}</strong>
              {review.is_verified_purchase && <span className="admin-badge success">خریدار تایید شده</span>}
              <Stars rating={review.rating} />
            </div>
            <div className="admin-review-product">
              {preview ? <img src={preview} alt="" /> : <span>▣</span>}
              <div><strong>{product?.title || 'محصول نامشخص'}</strong><small>{product?.category || 'بدون دسته‌بندی'}</small></div>
            </div>
            <div className="admin-review-comment">
              <p>{review.comment || '—'}</p>
              <small>{review.purchased_color && <span>رنگ: {review.purchased_color} </span>}{review.purchased_size && <span>سایز: {review.purchased_size} </span>}{review.purchased_cup && <span>کاپ: {review.purchased_cup} </span>} | {formatDate(review.created_date)}</small>
            </div>
            <div className="admin-review-actions">
              <span className={`admin-badge ${status.cls}`}>{status.label}</span>
              {review.status !== 'approved' && <Button className="outline" onClick={() => updateStatus(review.id, 'approved')}>✓ تایید</Button>}
              {review.status !== 'rejected' && <Button className="outline" onClick={() => updateStatus(review.id, 'rejected')}>× رد</Button>}
              <Button className="danger" onClick={() => remove(review.id)}>حذف</Button>
            </div>
          </article>;
        })}
      </div>
    </Card>}
  </div>;
}
