'use client';

import { FormEvent, useEffect, useMemo, useState } from 'react';
import { getStoredUser } from '@/lib/user-auth';

type Review = { id: string; product_id: string; user_email?: string; user_name?: string; author_name?: string; rating: number; comment: string; status?: string; created_date: string };

function StarRating({ value, onChange, readonly = false }: { value: number; onChange?: (value: number) => void; readonly?: boolean }) {
  const [hovered, setHovered] = useState(0);
  return <div className="store-stars">{[1, 2, 3, 4, 5].map((item) => <button key={item} type="button" onClick={() => !readonly && onChange?.(item)} onMouseEnter={() => !readonly && setHovered(item)} onMouseLeave={() => !readonly && setHovered(0)} className={item <= (hovered || value) ? 'active' : ''}>★</button>)}</div>;
}

export default function ProductReviews({ productId }: { productId: string }) {
  const user = getStoredUser();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [form, setForm] = useState({ author_name: user?.name || '', rating: 5, comment: '' });
  const [submitted, setSubmitted] = useState(false);

  const loadReviews = () => fetch('/api/admin/entities/Review?sort=-created_date&limit=200', { cache: 'no-store' })
    .then((response) => response.ok ? response.json() : [])
    .then((data: Review[]) => setReviews(data.filter((review) => review.product_id === productId && (review.status === 'approved' || review.user_email === user?.email))))
    .catch(() => setReviews([]));

  useEffect(() => { loadReviews(); }, [productId, user?.email]);

  const visibleReviews = reviews.filter((review) => review.status === 'approved');
  const avgRating = useMemo(() => visibleReviews.length ? (visibleReviews.reduce((sum, review) => sum + review.rating, 0) / visibleReviews.length).toFixed(1) : null, [visibleReviews]);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!form.author_name || !form.comment) return;
    await fetch('/api/admin/entities/Review', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ product_id: productId, user_email: user?.email || '', user_name: form.author_name, author_name: form.author_name, rating: form.rating, comment: form.comment, status: 'pending' })
    });
    setForm({ author_name: user?.name || '', rating: 5, comment: '' });
    setSubmitted(true);
    loadReviews();
  };

  return (
    <div className="store-reviews">
      {visibleReviews.length > 0 && <section className="store-review-summary"><div><strong>{avgRating}</strong><StarRating value={Math.round(Number(avgRating))} readonly /><small>{visibleReviews.length.toLocaleString('fa-IR')} نظر</small></div><div>{[5, 4, 3, 2, 1].map((star) => { const count = visibleReviews.filter((review) => review.rating === star).length; const pct = visibleReviews.length ? (count / visibleReviews.length) * 100 : 0; return <p key={star}><span>{star} ★</span><b><i style={{ width: `${pct}%` }} /></b><small>{count}</small></p>; })}</div></section>}
      {visibleReviews.length === 0 ? <p className="store-review-empty">هنوز نظر تاییدشده‌ای ثبت نشده. اول نفر باش!</p> : <div className="store-review-list">{visibleReviews.map((review) => <article key={review.id}><header><div><b>{review.user_name || review.author_name}</b><StarRating value={review.rating} readonly /></div><time>{new Date(review.created_date).toLocaleDateString('fa-IR')}</time></header><p>{review.comment}</p></article>)}</div>}
      <section className="store-review-form"><h4>نظر خود را ثبت کنید</h4>{submitted ? <div className="store-review-submitted"><p>نظر شما ثبت شد و پس از تایید نمایش داده می‌شود. ✓</p><button onClick={() => setSubmitted(false)}>ثبت نظر جدید</button></div> : <form onSubmit={handleSubmit}><label>نام شما<input value={form.author_name} onChange={(event) => setForm((current) => ({ ...current, author_name: event.target.value }))} required /></label><label>امتیاز شما<StarRating value={form.rating} onChange={(rating) => setForm((current) => ({ ...current, rating }))} /></label><label>نظر شما<textarea value={form.comment} onChange={(event) => setForm((current) => ({ ...current, comment: event.target.value }))} required /></label><button className="store-primary-btn full">ثبت نظر</button></form>}</section>
    </div>
  );
}
