'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { accountApi } from '@/components/account/account-api';
import type { AccountReview } from '@/components/account/account-types';

const statusConfig: Record<string, { label: string; cls: string; icon: string }> = {
  pending: { label: 'در انتظار تایید', cls: 'bg-amber-100 text-amber-700', icon: '◷' },
  approved: { label: 'تایید شده', cls: 'bg-green-100 text-green-700', icon: '✓' },
  rejected: { label: 'رد شده', cls: 'bg-red-100 text-red-700', icon: '×' }
};
function Stars({ rating = 0 }: { rating?: number }) { return <div className="flex gap-0.5">{[1,2,3,4,5].map((star) => <span key={star} className={star <= rating ? 'text-amber-400' : 'text-muted-foreground/30'}>★</span>)}</div>; }

export default function AccountReviewsPage() {
  const [reviews, setReviews] = useState<AccountReview[]>([]);
  const [loading, setLoading] = useState(true);
  const reload = () => accountApi.reviews().then(setReviews).catch(() => setReviews([])).finally(() => setLoading(false));
  useEffect(() => { reload(); }, []);
  const remove = async (id: string) => { await accountApi.deleteReview(id); await reload(); };
  return <div className="space-y-5"><div><h1 className="text-xl font-bold">نظرات من</h1><p className="mt-1 text-sm text-muted-foreground">نظراتی که برای محصولات ثبت کرده‌اید</p></div>{loading ? <div className="store-account-panel">در حال بارگذاری...</div> : reviews.length === 0 ? <div className="rounded-xl border-2 border-dashed border-border py-20 text-center"><div className="mb-4 text-4xl opacity-40">☷</div><p className="mb-3 text-muted-foreground">هنوز نظری ثبت نکرده‌اید</p><Link href="/" className="store-outline-btn">مشاهده محصولات</Link></div> : <div className="space-y-3">{reviews.map((review) => { const cfg = statusConfig[review.status || 'pending'] || statusConfig.pending; return <section key={review.id} className="rounded-xl border border-border bg-card p-4"><div className="flex items-start justify-between gap-3"><div className="min-w-0 flex-1"><div className="mb-1 flex flex-wrap items-center gap-2"><Stars rating={review.rating} /><span className={`flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium ${cfg.cls}`}>{cfg.icon} {cfg.label}</span><span className="text-[10px] text-muted-foreground">{review.created_date ? new Date(review.created_date).toLocaleDateString('fa-IR') : ''}</span></div>{review.comment && <p className="mt-1 text-sm leading-7 text-muted-foreground">{review.comment}</p>}<div className="mt-2 flex flex-wrap gap-3 text-[10px] text-muted-foreground">{review.purchased_color && <span>رنگ: {review.purchased_color}</span>}{review.purchased_size && <span>سایز: {review.purchased_size}</span>}{review.purchased_cup && <span>کاپ: {review.purchased_cup}</span>}</div>{review.admin_reply && <div className="mt-2 rounded-lg border border-primary/20 bg-primary/5 p-2"><p className="mb-0.5 text-xs font-medium text-primary">پاسخ فروشگاه:</p><p className="text-xs text-muted-foreground">{review.admin_reply}</p></div>}</div><div className="flex gap-1"><Link href={`/product/${review.product_id}`} className="admin-btn ghost" title="مشاهده محصول">↗</Link>{review.status === 'pending' && <button className="admin-btn danger" onClick={() => remove(review.id)}>🗑</button>}</div></div></section>; })}</div>}</div>;
}
