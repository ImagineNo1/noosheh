'use client';

import Link from 'next/link';
import { useState } from 'react';
import StoreHeader from '@/components/store/StoreHeader';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

const faqs = [
  { category: 'سفارش و خرید', items: [{ q: 'چطور سفارش ثبت کنم؟', a: 'محصول مورد نظر را انتخاب کنید، سایز و رنگ دلخواه را مشخص کرده و دکمه افزودن به سبد خرید را بزنید.' }, { q: 'آیا می‌توانم سفارشم را لغو کنم؟', a: 'تا زمانی که سفارش وارد مرحله ارسال نشده باشد، می‌توانید درخواست لغو بدهید.' }, { q: 'حداقل مبلغ سفارش چقدر است؟', a: 'بدون حداقل مبلغ سفارش نیز می‌توانید خرید کنید.' }] },
  { category: 'ارسال و تحویل', items: [{ q: 'مدت زمان ارسال چقدر است؟', a: 'معمولاً سفارشات در ۲ تا ۵ روز کاری به دستتان می‌رسد.' }, { q: 'آیا ارسال به تمام ایران دارید؟', a: 'بله، ما به تمام نقاط ایران ارسال می‌کنیم.' }] },
  { category: 'بازگشت و مرجوعی', items: [{ q: 'شرایط مرجوع کردن کالا چیست؟', a: 'تا ۷ روز پس از دریافت، در صورتی که محصول آسیب ندیده باشد می‌توانید درخواست مرجوعی بدهید.' }] },
  { category: 'محصولات', items: [{ q: 'جنس پارچه محصولات چیست؟', a: 'جزئیات جنس هر محصول در صفحه آن ذکر شده است.' }, { q: 'راهنمای انتخاب سایز کجاست؟', a: 'در صفحه هر محصول، دکمه راهنمای اندازه وجود دارد.' }] }
];

export default function FAQ() {
  const [activeCategory, setActiveCategory] = useState(faqs[0].category);
  const active = faqs.find((item) => item.category === activeCategory) || faqs[0];

  return (
    <div className="store-page" dir="rtl">
      <StoreHeader />
      <div className="store-container store-breadcrumb"><Link href="/">خانه</Link><span>‹</span><b>سوالات متداول</b></div>
      <section className="store-gradient-hero center"><div className="store-container"><div className="store-hero-icon">؟</div><h1>سوالات متداول</h1><p>پاسخ سوالات رایج مشتریان را اینجا بیابید</p></div></section>
      <main className="store-container store-faq-layout">
        <aside aria-label="دسته‌بندی سوالات متداول">
          {faqs.map((item) => <button key={item.category} onClick={() => setActiveCategory(item.category)} className={activeCategory === item.category ? 'active' : ''}>{item.category}</button>)}
        </aside>
        <section>
          <Accordion type="single" collapsible defaultValue={`${active.category}-0`} key={active.category}>
            {active.items.map((item, index) => (
              <AccordionItem key={item.q} value={`${active.category}-${index}`} className="store-faq-item">
                <AccordionTrigger>{item.q}</AccordionTrigger>
                <AccordionContent>{item.a}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </section>
      </main>
      <div className="store-container"><div className="store-cta"><h3>جواب سوالتان را نیافتید؟</h3><p>تیم پشتیبانی ما آماده پاسخگویی است</p><Link href="/contact" className="store-primary-btn">تماس با ما</Link></div></div>
    </div>
  );
}
