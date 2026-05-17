'use client';

import Link from 'next/link';
import { FormEvent, useEffect, useMemo, useState } from 'react';
import { useCart } from '@/lib/cart-context';
import { CommandDialog, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList, CommandSeparator, CommandShortcut } from '@/components/ui/command';
import { Drawer, DrawerClose, DrawerContent, DrawerDescription, DrawerHeader, DrawerTitle } from '@/components/ui/drawer';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import CartSidebar from './CartSidebar';
import DiscountBanner from './DiscountBanner';
import TopBar from './TopBar';

const navLinks = [
  { label: 'خانه', path: '/' },
  { label: 'پیگیری سفارش', path: '/order-tracking' },
  { label: 'سوالات متداول', path: '/faq' },
  { label: 'تماس با ما', path: '/contact' }
];

const categoryLinks = [
  { label: 'همه محصولات', path: '/category/all', hint: 'نمایش کامل کالکشن' },
  { label: 'ست لباس زیر', path: '/category/sets', hint: 'ست‌های جدید نوشه' },
  { label: 'سوتین', path: '/category/bra', hint: 'انتخاب بر اساس سایز و فرم' }
];

export default function StoreHeader() {
  const { totalItems, setIsOpen } = useCart();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const commandLinks = useMemo(() => [...categoryLinks, ...navLinks], []);
  const filteredCommandLinks = commandLinks.filter((link) => link.label.includes(searchQuery.trim()) || link.path.includes(searchQuery.trim()));

  useEffect(() => {
    const handleShortcut = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        setSearchOpen(true);
      }
    };
    window.addEventListener('keydown', handleShortcut);
    return () => window.removeEventListener('keydown', handleShortcut);
  }, []);

  const goTo = (path: string) => {
    window.location.href = path;
  };

  const submitSearch = (event?: FormEvent) => {
    event?.preventDefault();
    const query = searchQuery.trim();
    if (!query) return;
    window.location.href = `/search?q=${encodeURIComponent(query)}`;
  };

  return (
    <>
      <DiscountBanner />
      <TopBar />
      <header className="store-navbar" dir="rtl">
        <div className="store-container">
          <div className="store-navbar-main">
            <Link href="/" className="store-logo">N<span>♥</span>OSHEH</Link>
            <button type="button" onClick={() => setSearchOpen(true)} className="store-search-trigger" aria-label="باز کردن جستجو">
              <span>⌕</span>
              <b>جستجوی محصولات...</b>
              <kbd>⌘K</kbd>
            </button>
            <div className="store-navbar-actions">
              <button onClick={() => setIsOpen(true)} className="store-cart-button" aria-label="سبد خرید">🛍{totalItems > 0 && <span>{totalItems.toLocaleString('fa-IR')}</span>}</button>
              <button className="store-menu-button" onClick={() => setMobileMenuOpen(true)} aria-label="باز کردن منو">☰</button>
            </div>
          </div>
          <nav className="store-navbar-links">
            <DropdownMenu>
              <DropdownMenuTrigger asChild><button className="store-nav-dropdown-trigger">دسته‌بندی‌ها <span>⌄</span></button></DropdownMenuTrigger>
              <DropdownMenuContent className="store-nav-dropdown-content">
                <DropdownMenuLabel>کالکشن‌های فروشگاه</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {categoryLinks.map((link) => (
                  <DropdownMenuItem key={link.path} onClick={() => goTo(link.path)}>
                    <span>{link.label}</span>
                    <small>{link.hint}</small>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
            {navLinks.map((link) => <Link key={link.path} href={link.path}>{link.label}</Link>)}
          </nav>
        </div>
      </header>

      <CommandDialog open={searchOpen} onOpenChange={setSearchOpen}>
        <form onSubmit={submitSearch}>
          <CommandInput placeholder="نام محصول، دسته یا کد را جستجو کنید..." value={searchQuery} onChange={(event) => setSearchQuery(event.target.value)} autoFocus />
        </form>
        <CommandList>
          {searchQuery.trim() && (
            <CommandGroup heading="جستجو">
              <CommandItem onClick={() => submitSearch()}>
                <span>جستجو برای «{searchQuery.trim()}»</span>
                <CommandShortcut>Enter</CommandShortcut>
              </CommandItem>
            </CommandGroup>
          )}
          {searchQuery.trim() && <CommandSeparator />}
          <CommandGroup heading="دسترسی سریع">
            {(searchQuery.trim() ? filteredCommandLinks : commandLinks).map((link) => (
              <CommandItem key={link.path} onClick={() => goTo(link.path)}>
                <span>{link.label}</span>
                <CommandShortcut>{link.path}</CommandShortcut>
              </CommandItem>
            ))}
          </CommandGroup>
          {searchQuery.trim() && filteredCommandLinks.length === 0 && <CommandEmpty>مورد مشابهی پیدا نشد؛ Enter را برای جستجو بزنید.</CommandEmpty>}
        </CommandList>
      </CommandDialog>

      <Drawer open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
        <DrawerContent className="store-mobile-drawer">
          <DrawerHeader>
            <DrawerTitle>منوی نوشه پوش</DrawerTitle>
            <DrawerDescription>دسترسی سریع به دسته‌بندی‌ها، پیگیری سفارش و پشتیبانی</DrawerDescription>
          </DrawerHeader>
          <button type="button" className="store-mobile-search" onClick={() => { setMobileMenuOpen(false); setSearchOpen(true); }}>⌕ جستجوی محصولات...</button>
          <nav>
            {[...categoryLinks, ...navLinks].map((link) => (
              <DrawerClose asChild key={link.path}><Link href={link.path}>{link.label}</Link></DrawerClose>
            ))}
          </nav>
        </DrawerContent>
      </Drawer>
      <CartSidebar />
    </>
  );
}
