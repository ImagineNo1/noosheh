'use client';

import Link from 'next/link';
import { FormEvent, useState } from 'react';
import { useCart } from '@/lib/cart-context';
import CartSidebar from './CartSidebar';
import DiscountBanner from './DiscountBanner';
import TopBar from './TopBar';

export default function StoreHeader() {
  const { totalItems, setIsOpen } = useCart();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const navLinks = [
    { label: 'خانه', path: '/' },
    { label: 'ست لباس زیر', path: '/category/sets' },
    { label: 'سوتین', path: '/category/bra' },
    { label: 'پیگیری سفارش', path: '/order-tracking' },
    { label: 'سوالات متداول', path: '/faq' },
    { label: 'تماس با ما', path: '/contact' }
  ];

  const handleSearch = (event: FormEvent) => {
    event.preventDefault();
    if (searchQuery.trim()) window.location.href = `/search?q=${encodeURIComponent(searchQuery.trim())}`;
  };

  return (
    <>
      <DiscountBanner />
      <TopBar />
      <header className="store-navbar" dir="rtl">
        <div className="store-container">
          <div className="store-navbar-main">
            <Link href="/" className="store-logo">N<span>♥</span>OSHEH</Link>
            <form onSubmit={handleSearch} className="store-navbar-search">
              <input placeholder="جستجوی محصولات..." value={searchQuery} onChange={(event) => setSearchQuery(event.target.value)} />
              <button type="submit">⌕</button>
            </form>
            <div className="store-navbar-actions">
              <button onClick={() => setIsOpen(true)} className="store-cart-button" aria-label="سبد خرید">🛍{totalItems > 0 && <span>{totalItems.toLocaleString('fa-IR')}</span>}</button>
              <button className="store-menu-button" onClick={() => setMobileMenuOpen((open) => !open)}>{mobileMenuOpen ? '×' : '☰'}</button>
            </div>
          </div>
          <nav className="store-navbar-links">{navLinks.map((link) => <Link key={link.path} href={link.path}>{link.label}</Link>)}</nav>
        </div>
        {mobileMenuOpen && <div className="store-mobile-menu"><form onSubmit={handleSearch}><input placeholder="جستجوی محصولات..." value={searchQuery} onChange={(event) => setSearchQuery(event.target.value)} /></form><nav>{navLinks.map((link) => <Link key={link.path} href={link.path} onClick={() => setMobileMenuOpen(false)}>{link.label}</Link>)}</nav></div>}
      </header>
      <CartSidebar />
    </>
  );
}
