'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState, type ReactNode } from 'react';
import { clearUserSession, getStoredUser, type SessionUser } from '@/lib/user-auth';

const items = [
  { href: '/account', label: 'نمای کلی' },
  { href: '/account/orders', label: 'سفارش‌ها' },
  { href: '/account/profile', label: 'پروفایل' },
  { href: '/account/addresses', label: 'آدرس‌ها' },
  { href: '/account/wishlist', label: 'علاقه‌مندی‌ها' },
  { href: '/account/reviews', label: 'نظرات من' },
  { href: '/account/returns', label: 'مرجوعی' },
  { href: '/account/security', label: 'امنیت' }
];

export default function AccountShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<SessionUser | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const current = getStoredUser();
    if (!current) router.replace('/login?redirect=' + encodeURIComponent(pathname));
    else setUser(current);
  }, [pathname, router]);

  if (!user) return <div className="admin-auth-screen"><div className="admin-card">در حال بررسی حساب کاربری...</div></div>;

  return (
    <div dir="rtl" className="store-account-layout">
      <aside className={`store-account-sidebar ${mobileMenuOpen ? 'open' : ''}`}>
        <div className="store-account-brand"><Link href="/account">حساب کاربری</Link></div>
        <div className="store-account-user"><b>{user.name || 'کاربر'}</b><small>{user.email}</small></div>
        <nav className="store-account-nav">{items.map((item) => <Link key={item.href} className={`store-account-link ${pathname === item.href ? 'active' : ''}`} href={item.href} onClick={() => setMobileMenuOpen(false)}>{item.label}</Link>)}</nav>
        <button className="store-account-logout" onClick={() => { clearUserSession(); router.replace('/'); }}>خروج از حساب</button>
      </aside>
      {mobileMenuOpen && <button className="store-account-overlay" onClick={() => setMobileMenuOpen(false)} aria-label="بستن" />}
      <div className="store-account-main"><header className="store-account-mobile-head"><button onClick={() => setMobileMenuOpen(true)}>☰</button><b>پنل کاربری</b><span /></header>{children}</div>
    </div>
  );
}
