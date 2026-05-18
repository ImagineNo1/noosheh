'use client';

import { useMemo, useState } from 'react';
import { adminApi } from '../admin-api';
import { Button, Card, EmptyState, Select } from '../_components/ui';
import { formatDate, useEntityList } from '../_components/hooks';
import type { Review } from '../types';

const statusMap: Record<string, { label: string; cls: string }> = {
  pending: { label: 'در انتظار', cls: 'warning' }, approved: { label: 'تایید شده', cls: 'success' }, rejected: { label: 'رد شده', cls: 'danger' }
};
function Stars({ rating = 0 }: { rating?: number }) { return <span className="admin-price">{[1,2,3,4,5].map((star) => star <= rating ? '★' : '☆').join('')}</span>; }

export default function ReviewListPage() {
  const { data: reviews, isLoading, reload } = useEntityList<Review>('Review', '-created_date', 100);
  const [statusFilter, setStatusFilter] = useState('all');
  const filtered = useMemo(() => statusFilter === 'all' ? reviews : reviews.filter((review) => review.status === statusFilter), [reviews, statusFilter]);
  const updateStatus = async (id: string, status: string) => { await adminApi.update<Review>('Review', id, { status }); await reload(); };
  const remove = async (id: string) => { await adminApi.delete('Review', id); await reload(); };

  return <div className="admin-page"><div className="admin-page-header"><h1 className="admin-title">مدیریت نظرات</h1><Select value={statusFilter} onChange={setStatusFilter}><option value="all">همه</option><option value="pending">در انتظار</option><option value="approved">تایید شده</option><option value="rejected">رد شده</option></Select></div>{isLoading ? <Card><div className="pad-lg">در حال بارگذاری...</div></Card> : filtered.length === 0 ? <EmptyState icon="☷" text="نظری یافت نشد" /> : <div className="admin-grid">{filtered.map((review) => { const status = statusMap[review.status || 'pending'] || statusMap.pending; return <Card key={review.id}><div className="admin-card-body"><div className="admin-page-header"><div><div className="admin-inline"><b>{review.user_name || review.user_email || 'ناشناس'}</b><span className={`admin-badge ${status.cls}`}>{status.label}</span>{review.is_verified_purchase && <span className="admin-badge success">خریدار</span>}</div><Stars rating={review.rating} /></div><span className="admin-muted small">{formatDate(review.created_date)}</span></div><div className="admin-muted small">{review.purchased_color && <span>رنگ: {review.purchased_color} </span>}{review.purchased_size && <span>سایز: {review.purchased_size} </span>}{review.purchased_cup && <span>کاپ: {review.purchased_cup}</span>}</div><p>{review.comment || '—'}</p><div className="admin-actions-row">{review.status !== 'approved' && <Button className="outline" onClick={() => updateStatus(review.id, 'approved')}>✓ تایید</Button>}{review.status !== 'rejected' && <Button className="outline" onClick={() => updateStatus(review.id, 'rejected')}>× رد</Button>}<Button className="danger" onClick={() => remove(review.id)}>🗑 حذف</Button></div></div></Card>; })}</div>}</div>;
}
