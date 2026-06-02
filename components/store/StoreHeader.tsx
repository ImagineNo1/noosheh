'use client';

import Link from 'next/link';
import { FormEvent, useEffect, useState } from 'react';
import type { Category } from '@/app/admin/types';
import { useCart } from '@/lib/cart-context';
import { headerCategories, type CategoryNode } from '@/lib/category-helpers';
import { getStoredUser } from '@/lib/user-auth';
import CartSidebar from './CartSidebar';

const headerLinks = [
  { label: 'مجله نوشه', path: '/blog', desc: 'راهنمای خرید و استایل' },
  { label: 'پرسش های متداول', path: '/faq', desc: 'پاسخ سوالات رایج' },
  { label: 'ارتباط با ما', path: '/contact', desc: 'راه های تماس با نوشه' }
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

function groupedChildren(category: CategoryNode) {
  const groups = new Map<string, CategoryNode[]>();
  const children = category.children.length ? category.children : [category];
  children.forEach((child) => {
    const key = child.menu_group || child.displayTitle;
    groups.set(key, [...(groups.get(key) || []), child]);
  });
  return Array.from(groups.entries()).slice(0, 4);
}

export default function StoreHeader({
  promoText = 'ارسال رایگان برای خریدهای بالای ۵۰۰,۰۰۰ تومان',
  logoText = 'NOOSHEH',
  categories = []
}: {
  promoText?: string;
  logoText?: string;
  categories?: Category[];
} = {}) {
  const { totalItems, setIsOpen } = useCart();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [promoClosed, setPromoClosed] = useState(false);
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const menuCategories = headerCategories(categories);
  const activeCategory = menuCategories.find((category) => category.id === activeMenu) || menuCategories[0];

  useEffect(() => {
    setIsAuthenticated(Boolean(getStoredUser()));
  }, []);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setActiveMenu(null);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const submitSearch = (event?: FormEvent) => {
    event?.preventDefault();
    const query = searchQuery.trim();
    if (!query) return;
    window.location.href = `/search?q=${encodeURIComponent(query)}`;
  };

  const searchForm = (compact = false) => (
    <form onSubmit={submitSearch} className={`store-ref-search ${compact ? 'compact' : ''}`}>
      <input value={searchQuery} onChange={(event) => setSearchQuery(event.target.value)} placeholder="جستجو در نوشه..." autoFocus={compact} />
      <button type="submit" aria-label="جستجو"><Icon name="search" /></button>
    </form>
  );

  return (
    <>
      <header className="store-premium-header store-ref-header" dir="rtl" onMouseLeave={() => setActiveMenu(null)}>
        {!promoClosed ? (
          <div className="store-announcement store-ref-announcement">
            <span>{promoText}</span>
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
            <Link href="/account/wishlist" className="store-ref-action desktop-flex" aria-label="علاقه مندی ها"><Icon name="heart" /><span>علاقه مندی ها</span></Link>
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

        <nav className="store-ref-nav store-ref-nav-minimal" aria-label="ناوبری فروشگاه">
          <button
            type="button"
            className="store-mega-trigger"
            onMouseEnter={() => setActiveMenu(activeCategory?.id || null)}
            onFocus={() => setActiveMenu(activeCategory?.id || null)}
          >
            دسته بندی کالاها
          </button>
          {headerLinks.map((link) => <Link key={link.path} href={link.path}>{link.label}</Link>)}
        </nav>

        {activeMenu && activeCategory ? (
          <div className="store-mega-menu" onMouseEnter={() => setActiveMenu(activeCategory.id)}>
            <div className="store-mega-tabs">
              {menuCategories.slice(0, 9).map((category) => (
                <Link key={category.id} href={category.href} className={category.id === activeCategory.id ? 'active' : ''} onMouseEnter={() => setActiveMenu(category.id)}>
                  {category.displayTitle}
                </Link>
              ))}
            </div>
            <div className="store-mega-content">
              <div className="store-mega-intro">
                <span>همه محصولات {activeCategory.displayTitle}</span>
                <Link href={activeCategory.href}>مشاهده دسته بندی</Link>
                {activeCategory.highlight_label && activeCategory.highlight_url ? <Link href={activeCategory.highlight_url} className="highlight">{activeCategory.highlight_label}</Link> : null}
              </div>
              <div className="store-mega-columns">
                {groupedChildren(activeCategory).map(([group, items]) => (
                  <section key={group}>
                    <h3>{group}</h3>
                    {items.slice(0, 8).map((item) => <Link key={item.id} href={item.href}>{item.displayTitle}</Link>)}
                  </section>
                ))}
              </div>
            </div>
          </div>
        ) : null}
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
              {menuCategories.map((category) => (
                <Link key={category.id} href={category.href} onClick={() => setMobileOpen(false)}>
                  <b>{category.displayTitle}</b>
                  <small>{category.children.length ? `${category.children.length.toLocaleString('fa-IR')} زیر دسته` : 'مشاهده محصولات'}</small>
                </Link>
              ))}
              {headerLinks.map((link) => (
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
