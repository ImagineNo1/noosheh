'use client';

import Link from 'next/link';
import { FormEvent, useEffect, useMemo, useState } from 'react';
import { useCart } from '@/lib/cart-context';
import { getStoredUser } from '@/lib/user-auth';
import { storeApi } from '@/lib/store-api';
import CartSidebar from './CartSidebar';

const navLinks = [
  { label: 'خانه', path: '/' },
  { label: 'پیگیری سفارش', path: '/order-tracking' },
  { label: 'سوالات متداول', path: '/faq' },
  { label: 'تماس با ما', path: '/contact' }
];

const categoryLinks = [
  { label: 'همه محصولات', path: '/category/all' },
  { label: 'ست لباس زیر', path: '/category/sets' },
  { label: 'سوتین', path: '/category/bra' }
];

export default function StoreHeader() {
  const { totalItems, setIsOpen } = useCart();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [promoClosed, setPromoClosed] = useState(false);
  const [promoText, setPromoText] = useState('🔥 تخفیف ویژه تا ۴۰٪ روی محصولات منتخب! همین حالا خرید کن|ارسال رایگان سفارشات بالای ۵۰۰ هزار تومان');
  const [logoText, setLogoText] = useState('NOOSHEH');

  useEffect(() => {
    setIsAuthenticated(Boolean(getStoredUser()));
    storeApi.settings().then((items) => {
      const map = Object.fromEntries(items.map((item) => [item.key, item.value]));
      if (map.promo_banner_text) setPromoText(map.promo_banner_text);
      if (map.site_title) setLogoText(map.site_title);
    }).catch(() => {});
  }, []);

  const promoParts = useMemo(() => promoText.split('|').map((item) => item.trim()).filter(Boolean), [promoText]);

  const submitSearch = (event?: FormEvent) => {
    event?.preventDefault();
    const query = searchQuery.trim();
    if (!query) return;
    window.location.href = `/search?q=${encodeURIComponent(query)}`;
  };

  const searchForm = (compact = false) => (
    <form onSubmit={submitSearch} className="relative">
      <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">⌕</span>
      <input
        value={searchQuery}
        onChange={(event) => setSearchQuery(event.target.value)}
        placeholder="جستجوی محصولات..."
        className={`w-full rounded-lg bg-secondary/50 pr-10 text-sm outline-none transition focus:ring-2 focus:ring-primary/20 ${compact ? 'h-10 border border-border pl-3' : 'h-11 border-0 pl-3'}`}
        autoFocus={compact}
      />
    </form>
  );

  return (
    <>
      <header className="sticky top-0 z-50 border-b border-border bg-background" dir="rtl">
        {!promoClosed && promoParts.length > 0 && <div className="relative bg-primary px-8 py-2 text-center text-xs font-medium text-primary-foreground">
          <span>{promoParts[0]}</span>
          {promoParts[1] && <><span className="mx-4 hidden md:inline">|</span><span className="hidden md:inline">{promoParts[1]}</span></>}
          <button type="button" onClick={() => setPromoClosed(true)} aria-label="بستن بنر" className="absolute left-2 top-1/2 -translate-y-1/2 rounded px-2">×</button>
        </div>}

        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3">
          <button type="button" className="rounded-md p-2 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground md:hidden" onClick={() => setMobileOpen(true)} aria-label="باز کردن منو">☰</button>

          <Link href="/" className="shrink-0">
            <h1 className="text-xl font-bold tracking-tight md:text-2xl">{logoText}</h1>
          </Link>

          <div className="mx-auto hidden max-w-md flex-1 md:block">{searchForm()}</div>

          <div className="flex items-center gap-2">
            <button type="button" className="rounded-md p-2 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground md:hidden" onClick={() => setSearchOpen((open) => !open)} aria-label="جستجو">⌕</button>
            <Link href={isAuthenticated ? '/account' : '/login'} className="rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground" aria-label={isAuthenticated ? 'حساب کاربری' : 'ورود / ساخت حساب'}>
              {isAuthenticated ? 'حساب کاربری' : 'ورود / ساخت حساب'}
            </Link>
            <button type="button" onClick={() => setIsOpen(true)} className="relative rounded-md p-2 text-2xl text-primary transition-colors hover:bg-secondary hover:text-primary/80" aria-label="سبد خرید">
              🧺
              {totalItems > 0 && <span className="absolute -left-1 -top-1 grid min-w-5 place-items-center rounded-full bg-primary px-1 text-[10px] font-bold text-primary-foreground">{totalItems.toLocaleString('fa-IR')}</span>}
            </button>
          </div>
        </div>

        <nav className="hidden border-t border-border md:block">
          <div className="mx-auto flex max-w-7xl items-center justify-center gap-8 px-4 py-2.5">
            <Link href="/category/all" className="flex items-center gap-1 text-sm font-medium text-foreground/80 transition-colors hover:text-primary">دسته‌بندی‌ها <span className="text-xs">⌄</span></Link>
            {navLinks.map((link) => <Link key={link.path} href={link.path} className="text-sm font-medium text-foreground/80 transition-colors hover:text-primary">{link.label}</Link>)}
          </div>
        </nav>

        {searchOpen && <div className="px-4 pb-3 md:hidden">{searchForm(true)}</div>}
      </header>

      {mobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden" dir="rtl">
          <button type="button" className="absolute inset-0 bg-black/40" onClick={() => setMobileOpen(false)} aria-label="بستن منو" />
          <aside className="absolute right-0 top-0 h-full w-72 bg-card p-4 shadow-xl">
            <div className="mb-6 flex items-center justify-between border-b border-border pb-4">
              <span className="font-semibold">منوی نوشه پوش</span>
              <button type="button" className="rounded-md p-2 text-muted-foreground hover:bg-secondary" onClick={() => setMobileOpen(false)} aria-label="بستن">×</button>
            </div>
            <nav className="flex flex-col gap-1">
              {[...categoryLinks, ...navLinks].map((link) => (
                <Link key={link.path} href={link.path} onClick={() => setMobileOpen(false)} className="border-b border-border py-3 text-sm font-medium transition-colors hover:text-primary">{link.label}</Link>
              ))}
            </nav>
          </aside>
        </div>
      )}

      <CartSidebar />
    </>
  );
}
