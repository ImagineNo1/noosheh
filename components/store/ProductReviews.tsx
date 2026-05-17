'use client';

import { FormEvent, useEffect, useMemo, useState } from 'react';

type Review = { id: string; product_id: string; author_name: string; rating: number; comment: string; created_date: string };

function StarRating({ value, onChange, readonly = false }: { value: number; onChange?: (value: number) => void; readonly?: boolean }) {
  const [hovered, setHovered] = useState(0);
  return <div className="store-stars">{[1, 2, 3, 4, 5].map((item) => <button key={item} type="button" onClick={() => !readonly && onChange?.(item)} onMouseEnter={() => !readonly && setHovered(item)} onMouseLeave={() => !readonly && setHovered(0)} className={item <= (hovered || value) ? 'active' : ''}>★</button>)}</div>;
}

export default function ProductReviews({ productId }: { productId: string }) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [form, setForm] = useState({ author_name: '', rating: 5, comment: '' });
  const [submitted, setSubmitted] = useState(false);
  const storageKey = `noosheh-reviews-${productId}`;

  useEffect(() => {
    try { setReviews(JSON.parse(window.localStorage.getItem(storageKey) || '[]')); } catch { setReviews([]); }
  }, [storageKey]);

  const avgRating = useMemo(() => reviews.length ? (reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length).toFixed(1) : null, [reviews]);

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    if (!form.author_name || !form.comment) return;
    const review = { ...form, product_id: productId, id: `${Date.now()}`, created_date: new Date().toISOString() };
    const next = [review, ...reviews];
    setReviews(next);
    window.localStorage.setItem(storageKey, JSON.stringify(next));
    setForm({ author_name: '', rating: 5, comment: '' });
    setSubmitted(true);
  };

  return (
    <div className="store-reviews">
      {reviews.length > 0 && <section className="store-review-summary"><div><strong>{avgRating}</strong><StarRating value={Math.round(Number(avgRating))} readonly /><small>{reviews.length.toLocaleString('fa-IR')} نظر</small></div><div>{[5, 4, 3, 2, 1].map((star) => { const count = reviews.filter((review) => review.rating === star).length; const pct = reviews.length ? (count / reviews.length) * 100 : 0; return <p key={star}><span>{star} ★</span><b><i style={{ width: `${pct}%` }} /></b><small>{count}</small></p>; })}</div></section>}
      {reviews.length === 0 ? <p className="store-review-empty">هنوز نظری ثبت نشده. اول نفر باش!</p> : <div className="store-review-list">{reviews.map((review) => <article key={review.id}><header><div><b>{review.author_name}</b><StarRating value={review.rating} readonly /></div><time>{new Date(review.created_date).toLocaleDateString('fa-IR')}</time></header><p>{review.comment}</p></article>)}</div>}
      <section className="store-review-form"><h4>نظر خود را ثبت کنید</h4>{submitted ? <div className="store-review-submitted"><p>نظر شما با موفقیت ثبت شد! ✓</p><button onClick={() => setSubmitted(false)}>ثبت نظر جدید</button></div> : <form onSubmit={handleSubmit}><label>نام شما<input value={form.author_name} onChange={(event) => setForm((current) => ({ ...current, author_name: event.target.value }))} required /></label><label>امتیاز شما<StarRating value={form.rating} onChange={(rating) => setForm((current) => ({ ...current, rating }))} /></label><label>نظر شما<textarea value={form.comment} onChange={(event) => setForm((current) => ({ ...current, comment: event.target.value }))} required /></label><button className="store-primary-btn full">ثبت نظر</button></form>}</section>
    </div>
  );
}
