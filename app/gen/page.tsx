'use client';

import { useState } from 'react';

export default function GeneratePage() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string>('');

  const handleGenerate = async () => {
    setLoading(true);
    setResult('');
    try {
      const response = await fetch('/api/gen-products', { method: 'POST' });
      const data = await response.json();
      if (!response.ok) throw new Error(data?.error || 'خطا در ساخت محصولات');
      setResult(`✅ ${data.count} محصول فیک با موفقیت ساخته شد.`);
    } catch (error) {
      setResult(`❌ ${error instanceof Error ? error.message : 'خطای ناشناخته'}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen max-w-2xl mx-auto px-6 py-16">
      <h1 className="text-3xl font-bold mb-4">تولید اطلاعات فیک محصولات</h1>
      <p className="text-sm text-gray-600 mb-6">
        با کلیک روی دکمه زیر، بر اساس تنظیمات مدل محصولات، ۵۰ محصول فیک با تمام جزئیات و تصاویر غیرتکراری ساخته می‌شود.
      </p>
      <button
        type="button"
        onClick={handleGenerate}
        disabled={loading}
        className="px-5 py-3 rounded-lg bg-black text-white disabled:opacity-60"
      >
        {loading ? 'در حال ساخت...' : 'ساخت ۵۰ محصول فیک من'}
      </button>
      {result && <p className="mt-5 text-sm">{result}</p>}
    </main>
  );
}
