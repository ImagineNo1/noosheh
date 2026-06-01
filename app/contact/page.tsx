'use client';

import Link from 'next/link';
import { FormEvent, useState } from 'react';
import StoreHeader from '@/components/store/StoreHeader';

const contactInfo = [
  { icon: '☎', title: 'تلفن تماس', value: '۰۲۱-۱۲۳۴۵۶۷۸', sub: 'شنبه تا پنجشنبه ۹ تا ۱۷' },
  { icon: '✉', title: 'ایمیل', value: 'info@nosheposh.ir', sub: 'پاسخ‌دهی در ۲۴ ساعت' },
  { icon: '⌖', title: 'آدرس', value: 'تهران، خیابان ولیعصر', sub: 'پلاک ۱۲۳، طبقه دوم' },
  { icon: '◷', title: 'ساعت کاری', value: 'شنبه تا پنجشنبه', sub: '۹:۰۰ صبح تا ۵:۰۰ بعدازظهر' }
];

export default function ContactPage() {
  const [form, setForm] = useState({ name: '', phone: '', email: '', subject: '', message: '' });
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const handleSubmit = async (event: FormEvent) => { event.preventDefault(); setLoading(true); await new Promise((resolve) => setTimeout(resolve, 500)); setLoading(false); setSent(true); };
  return <div className="store-page" dir="rtl"><StoreHeader /><div className="store-container store-breadcrumb"><Link href="/">خانه</Link><span>‹</span><b>تماس با ما</b></div><section className="store-gradient-hero center"><div className="store-container"><h1>تماس با ما</h1><p>ما اینجاییم تا به سوالات شما پاسخ دهیم. با ما در تماس باشید!</p></div></section><main className="store-container store-contact-grid"><aside>{contactInfo.map((item) => <div className="store-contact-card" key={item.title}><span>{item.icon}</span><div><b>{item.title}</b><p>{item.value}</p><small>{item.sub}</small></div></div>)}<div className="store-contact-card social"><b>شبکه‌های اجتماعی</b><a href="#">Instagram</a></div></aside><section className="store-panel"><h2>ارسال پیام</h2>{sent ? <div className="store-empty">✉<h3>پیام شما ارسال شد!</h3><p>در اسرع وقت با شما تماس خواهیم گرفت.</p><button className="store-outline-btn" onClick={() => setSent(false)}>ارسال پیام جدید</button></div> : <form onSubmit={handleSubmit} className="store-simple-form"><div className="store-form-grid"><label>نام و نام خانوادگی *<input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} required /></label><label>شماره موبایل *<input value={form.phone} onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))} required /></label></div><label>ایمیل<input type="email" value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} /></label><label>موضوع *<input value={form.subject} onChange={(e) => setForm((f) => ({ ...f, subject: e.target.value }))} required /></label><label>متن پیام *<textarea value={form.message} onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))} required /></label><button className="store-primary-btn full" disabled={loading}>✉ {loading ? 'در حال ارسال...' : 'ارسال پیام'}</button></form>}</section></main></div>;
}
