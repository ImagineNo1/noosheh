'use client';

import Link from 'next/link';
import { FormEvent, useEffect, useMemo, useState } from 'react';
import { useCart } from '@/lib/cart-context';
import { getStoredUser } from '@/lib/user-auth';
import { storeApi } from '@/lib/store-api';
import CartSidebar from './CartSidebar';

const mainCategories = [
  { label: 'جدیدترین‌ها', path: '/category/all', desc: 'تازه‌رسیده‌ها' },
  { label: 'لباس زیر', path: '/category/lingerie', desc: 'انتخاب روزمره' },
  { label: 'لباس خواب', path: '/category/sleepwear', desc: 'نرم و آرام' },
  { label: 'ست زنانه', path: '/category/sets', desc: 'هماهنگ و ظریف' },
  { label: 'خانگی و راحتی', path: '/category/lounge', desc: 'برای خانه' },
  { label: 'جوراب و لگ', path: '/category/socks', desc: 'جزئیات کامل' },
  { label: 'راهنمای سایز', path: '/faq', desc: 'انتخاب دقیق' },
  { label: 'پیشنهادها', path: '/category/all?collection=sale', desc: 'فروش ویژه' },
  { label: 'تخفیف‌ها', path: '/category/all?collection=sale', desc: 'قیمت بهتر' }
];

function Icon({ name }: { name: 'menu' | 'search' | 'user' | 'heart' | 'cart' | 'close' }) {
  const paths = {
    menu: <path d="M4 7h16M4 12h16M4 17h16" />,
    search: <><circle cx="11" cy="11" r="6" /><path d="m16 16 4 4" /></>,
    user: <><circle cx="12" cy="8" r="4" /><path d="M5 20c1.5-4 12.5-4 14 0" /></>,
    heart: <path d="M20.2 5.8c-1.7-1.9-4.5-1.9-6.2 0L12 8l-2-2.2c-1.7-1.9-4.5-1.9-6.2 0-1.9 2.1-1.7 5.3.4 7.2L12 20l7.8-7c2.1-1.9 2.3-5.1.4-7.2Z" />,
    cart: <><path d="M6 7h15l-2 8H8L6 7Z" /><path d="M6 7 5.2 4H3" /><circle cx="9" cy="20" r="1.5" /><circle cx="18" cy="20" r="1.5" /></>,
    close: <path d="m6 6 12 12M18 6 6 18" />
  };
  return <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.65" strokeLinecap="round" strokeLinejoin="round">{paths[name]}</svg>;
}

export default function StoreHeader() {
  const { totalItems, setIsOpen } = useCart();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [promoClosed, setPromoClosed] = useState(false);
  const [promoText, setPromoText] = useState('ارسال رایگان سفارش‌های بالای ۵۰۰ هزار تومان | ۱۲٪ تخفیف اولین خرید');
  const [logoText, setLogoText] = useState('Noosheh');

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
    <form onSubmit={submitSearch} className={`store-ref-search ${compact ? 'compact' : ''}`}>
      <Icon name="search" />
      <input value={searchQuery} onChange={(event) => setSearchQuery(event.target.value)} placeholder="جستجو در فروشگاه..." autoFocus={compact} />
      <button type="submit" aria-label="جستجو">جستجو</button>
    </form>
  );

  return (
    <>
      <header className="store-premium-header store-ref-header" dir="rtl">
        {!promoClosed && promoParts.length > 0 ? (
          <div className="store-announcement store-ref-announcement">
            <span>{promoParts[0]}</span>
            {promoParts[1] ? <><i /> <span className="desktop-only">{promoParts[1]}</span></> : null}
            <button type="button" onClick={() => setPromoClosed(true)} aria-label="بستن پیام"><Icon name="close" /></button>
          </div>
        ) : null}

        <div className="store-ref-header-main">
          <div className="store-ref-actions">
            <button type="button" className="store-icon-button mobile-only" onClick={() => setMobileOpen(true)} aria-label="باز کردن منو"><Icon name="menu" /></button>
            <button type="button" className="store-ref-action mobile-only" onClick={() => setSearchOpen((open) => !open)} aria-label="جستجو"><Icon name="search" /></button>
            <button type="button" onClick={() => setIsOpen(true)} className="store-ref-action" aria-label="سبد خرید">
              <Icon name="cart" />
              <span>سبد خرید</span>
              {totalItems > 0 ? <b>{totalItems.toLocaleString('fa-IR')}</b> : null}
            </button>
            <Link href="/account/wishlist" className="store-ref-action desktop-flex" aria-label="علاقه‌مندی‌ها"><Icon name="heart" /><span>علاقه‌مندی‌ها</span></Link>
            <Link href={isAuthenticated ? '/account' : '/login'} className="store-ref-action">
              <Icon name="user" />
              <span>{isAuthenticated ? 'حساب کاربری' : 'ورود / ثبت نام'}</span>
            </Link>
          </div>

          <Link href="/" className="store-ref-brand" aria-label="صفحه اصلی نوشه">
            <span>{logoText}</span>
            <small>زیبایی، راحتی، اعتماد به نفس</small>
          </Link>

          <div className="store-ref-search-wrap">{searchForm()}</div>
        </div>

        {searchOpen ? <div className="store-mobile-search-panel">{searchForm(true)}</div> : null}

        <nav className="store-ref-nav" aria-label="دسته‌بندی‌های فروشگاه">
          {mainCategories.map((link) => <Link key={link.path} href={link.path}>{link.label}</Link>)}
        </nav>
      </header>

      {mobileOpen ? (
        <div className="store-mobile-menu-layer" dir="rtl">
          <button type="button" className="store-mobile-backdrop" onClick={() => setMobileOpen(false)} aria-label="بستن منو" />
          <aside className="store-mobile-panel">
            <div className="store-mobile-panel-head">
              <span>منوی نوشه</span>
              <button type="button" onClick={() => setMobileOpen(false)} aria-label="بستن"><Icon name="close" /></button>
            </div>
            <nav>
              {mainCategories.map((link) => (
                <Link key={link.path} href={link.path} onClick={() => setMobileOpen(false)}>
                  <b>{link.label}</b>
                  <small>{link.desc}</small>
                </Link>
              ))}
            </nav>
          </aside>
        </div>
      ) : null}

      <CartSidebar />
    </>
  );
}
