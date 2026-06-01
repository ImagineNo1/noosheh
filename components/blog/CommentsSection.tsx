'use client';

import { useEffect, useMemo, useState } from 'react';

export default function CommentsSection({ postId, allowComments = true }: { postId: string; allowComments?: boolean }) {
  const [rows, setRows] = useState<any[]>([]);
  const [form, setForm] = useState({ author_name: '', author_email: '', content: '' });
  const [loading, setLoading] = useState(false);
  const [touched, setTouched] = useState(false);
  const [message, setMessage] = useState('');

  const errors = useMemo(() => ({
    author_name: form.author_name.trim().length < 2,
    author_email: !/^\S+@\S+\.\S+$/.test(form.author_email.trim()),
    content: form.content.trim().length < 8
  }), [form]);
  const hasError = errors.author_name || errors.author_email || errors.content;

  const load = async () => {
    const response = await fetch(`/api/blog/comments/${postId}`, { cache: 'no-store' });
    setRows(await response.json());
  };

  useEffect(() => { load(); }, [postId]);

  const submit = async () => {
    setTouched(true);
    setMessage('');
    if (hasError) return;
    setLoading(true);
    const response = await fetch('/api/blog/comments', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...form, post_id: postId }) });
    setLoading(false);
    if (response.ok) {
      setForm({ author_name: '', author_email: '', content: '' });
      setTouched(false);
      setMessage('دیدگاه شما ثبت شد و پس از تأیید نمایش داده می‌شود.');
    } else {
      setMessage('ثبت دیدگاه با خطا مواجه شد. لطفاً دوباره تلاش کنید.');
    }
  };

  return (
    <section className="mt-8 rounded-[1.8rem] border border-[#eaded5] bg-[#fffdf9] p-5 shadow-[0_18px_55px_rgba(74,36,31,0.06)] sm:p-6" dir="rtl">
      <div className="flex flex-col gap-2 border-b border-[#f0e4dc] pb-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-black tracking-[0.2em] text-[#970f35]">COMMENTS</p>
          <h2 className="mt-2 text-2xl font-black text-[#2d1b18]">دیدگاه‌ها</h2>
        </div>
        <span className="rounded-full bg-[#f7e8ee] px-3 py-1 text-xs font-black text-[#970f35]">{rows.length.toLocaleString('fa-IR')} دیدگاه</span>
      </div>

      <div className="my-6 space-y-4">
        {rows.length === 0 ? <div className="rounded-2xl border border-dashed border-[#eaded5] bg-[#fffaf5] p-5 text-sm leading-7 text-[#7d6660]">هنوز دیدگاهی ثبت نشده؛ شما اولین نفر باشید.</div> : rows.map((comment) => (
          <div key={comment.id} className="rounded-2xl border border-[#eaded5] bg-[#fffaf5] p-4">
            <div className="flex items-center gap-3"><span className="grid h-10 w-10 place-items-center rounded-full bg-[#970f35]/10 text-sm font-black text-[#970f35]">{String(comment.author_name || 'ن').slice(0, 1)}</span><div><p className="text-sm font-black text-[#2d1b18]">{comment.author_name}</p><p className="text-xs text-[#9b857b]">خواننده مجله نوشه</p></div></div>
            <p className="mt-3 text-sm leading-8 text-[#5f4a44]">{comment.content}</p>
          </div>
        ))}
      </div>

      {allowComments && (
        <div className="rounded-[1.4rem] border border-[#eaded5] bg-[#fffaf5] p-4 sm:p-5">
          <h3 className="text-lg font-black text-[#2d1b18]">ثبت دیدگاه</h3>
          <p className="mt-2 text-sm leading-7 text-[#7d6660]">نظر شما پس از بررسی تحریریه منتشر می‌شود.</p>
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            <label className="space-y-2 text-sm font-bold text-[#3a211d]"><span>نام</span><input className={`w-full rounded-2xl border bg-white px-4 py-3 outline-none transition focus:ring-4 focus:ring-[#970f35]/10 ${touched && errors.author_name ? 'border-red-300' : 'border-[#eaded5] focus:border-[#970f35]'}`} placeholder="نام شما" value={form.author_name} onChange={(e) => setForm({ ...form, author_name: e.target.value })} />{touched && errors.author_name && <span className="block text-xs text-red-600">نام باید حداقل دو کاراکتر باشد.</span>}</label>
            <label className="space-y-2 text-sm font-bold text-[#3a211d]"><span>ایمیل</span><input className={`w-full rounded-2xl border bg-white px-4 py-3 text-left outline-none transition focus:ring-4 focus:ring-[#970f35]/10 ${touched && errors.author_email ? 'border-red-300' : 'border-[#eaded5] focus:border-[#970f35]'}`} dir="ltr" placeholder="you@example.com" value={form.author_email} onChange={(e) => setForm({ ...form, author_email: e.target.value })} />{touched && errors.author_email && <span className="block text-xs text-red-600">ایمیل معتبر وارد کنید.</span>}</label>
          </div>
          <label className="mt-3 block space-y-2 text-sm font-bold text-[#3a211d]"><span>متن دیدگاه</span><textarea className={`min-h-32 w-full rounded-2xl border bg-white px-4 py-3 leading-8 outline-none transition focus:ring-4 focus:ring-[#970f35]/10 ${touched && errors.content ? 'border-red-300' : 'border-[#eaded5] focus:border-[#970f35]'}`} placeholder="دیدگاه خود را بنویسید..." value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} />{touched && errors.content && <span className="block text-xs text-red-600">دیدگاه باید حداقل هشت کاراکتر باشد.</span>}</label>
          {message && <p className="mt-3 rounded-2xl bg-[#f7e8ee] px-4 py-3 text-sm font-bold text-[#970f35]">{message}</p>}
          <button disabled={loading} onClick={submit} className="mt-4 rounded-2xl bg-[#970f35] px-6 py-3 text-sm font-black text-white shadow-[0_16px_35px_rgba(151,15,53,0.18)] transition hover:bg-[#7d0b2b] disabled:opacity-60">{loading ? 'در حال ارسال...' : 'ارسال دیدگاه'}</button>
        </div>
      )}
    </section>
  );
}
