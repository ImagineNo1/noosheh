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
  { href: '/account/wishlist', label: 'علاقه‌مندی‌ها' }
];

export default function AccountShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<SessionUser | null>(null);

  useEffect(() => {
    const current = getStoredUser();
    if (!current) router.replace('/login?redirect=' + encodeURIComponent(pathname));
    else setUser(current);
  }, [pathname, router]);

  if (!user) return <div className="admin-auth-screen"><div className="admin-card">در حال بررسی حساب کاربری...</div></div>;

  return <div className="admin-shell" dir="rtl"><aside className="admin-sidebar"><div className="admin-brand"><Link href="/account">حساب کاربری</Link></div><nav className="admin-nav">{items.map((item) => <Link key={item.href} className={`admin-nav-link ${pathname === item.href ? 'active' : ''}`} href={item.href}>{item.label}</Link>)}</nav><div className="admin-sidebar-footer"><button className="admin-nav-link muted admin-logout" onClick={() => { clearUserSession(); router.replace('/'); }}>خروج</button></div></aside><main className="admin-main"><div className="admin-page-header"><h1>سلام {user.name || user.email}</h1></div>{children}</main></div>;
}
