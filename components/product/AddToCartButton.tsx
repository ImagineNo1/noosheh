'use client';

import { useState } from 'react';

export default function AddToCartButton({
  isAvailable = true,
  isValid = false,
  onAdd,
  onNotify,
  validationErrors = []
}: {
  isAvailable?: boolean;
  isValid?: boolean;
  onAdd: () => void | Promise<void>;
  onNotify?: () => void;
  validationErrors?: string[];
}) {
  const [loading, setLoading] = useState(false);
  const [added, setAdded] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);

  const handleClick = async () => {
    if (!isValid) {
      setErrors(validationErrors.length ? validationErrors : ['لطفاً گزینه‌های محصول را کامل انتخاب کنید']);
      return;
    }
    setErrors([]);
    setLoading(true);
    try {
      await onAdd();
      setAdded(true);
      setTimeout(() => setAdded(false), 2000);
    } finally {
      setLoading(false);
    }
  };

  if (!isAvailable) {
    return (
      <div className="space-y-2">
        <button type="button" disabled className="h-12 w-full rounded-full bg-secondary font-bold text-muted-foreground opacity-70">ناموجود</button>
        {onNotify && <button type="button" className="h-10 w-full rounded-full border border-border text-sm font-medium hover:border-primary hover:text-primary" onClick={onNotify}>🔔 اطلاع‌رسانی موجود شدن</button>}
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {errors.map((error) => <p key={error} className="rounded-xl bg-destructive/10 p-3 text-sm text-destructive" role="alert">{error}</p>)}
      <button
        type="button"
        onClick={handleClick}
        disabled={loading}
        className={`h-12 w-full rounded-full font-bold text-white transition disabled:cursor-not-allowed disabled:opacity-60 ${added ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-primary hover:bg-primary/90'}`}
      >
        {loading ? 'در حال افزودن...' : added ? '✓ اضافه شد!' : '🛍 افزودن به سبد خرید'}
      </button>
    </div>
  );
}
