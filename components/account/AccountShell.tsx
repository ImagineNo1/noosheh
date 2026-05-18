'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState, type ReactNode } from 'react';
import { clearUserSession, getStoredUser, type SessionUser } from '@/lib/user-auth';

const navItems = [
  { href: '/account', label: 'خلاصه حساب', icon: '▦', exact: true },
  { href: '/account/orders', label: 'سفارش‌ها', icon: '◈' },
  { href: '/account/addresses', label: 'آدرس‌ها', icon: '⌖' },
  { href: '/account/wishlist', label: 'علاقه‌مندی‌ها', icon: '♡' },
  { href: '/account/reviews', label: 'نظرات من', icon: '☆' },
  { href: '/account/returns', label: 'مرجوعی‌ها', icon: '↻' },
  { href: '/account/profile', label: 'پروفایل', icon: '♙' },
  { href: '/account/security', label: 'امنیت', icon: '⚿' }
];

function getInitials(name?: string) {
  if (!name) return '؟';
  return name.trim().split(/\s+/).map((word) => word[0]).join('').slice(0, 2);
}

function isActivePath(pathname: string, item: { href: string; exact?: boolean }) {
  return item.exact ? pathname === item.href : pathname.startsWith(item.href);
}

export default function AccountShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<SessionUser | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const current = getStoredUser();
    if (!current) router.replace('/login?redirect=' + encodeURIComponent(pathname));
    else setUser(current);
  }, [pathname, router]);

  if (!user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-secondary/30" dir="rtl">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-border border-t-primary" />
      </div>
    );
  }

  const sidebar = (
    <div className="flex h-full flex-col">
      <div className="border-b border-border p-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/15 text-sm font-bold text-primary">
            {getInitials(user.name)}
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-medium">{user.name || 'کاربر'}</p>
            <p className="truncate text-xs text-muted-foreground">{user.email}</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 space-y-0.5 p-3">
        {navItems.map((item) => {
          const active = isActivePath(pathname, item);
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileOpen(false)}
              className={`flex items-center gap-2.5 rounded-md px-3 py-2.5 text-sm transition-colors ${active ? 'bg-primary/10 font-medium text-primary' : 'text-muted-foreground hover:bg-secondary hover:text-foreground'}`}
            >
              {item.icon && <span className="w-4 shrink-0 text-center">{item.icon}</span>}
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="space-y-0.5 border-t border-border p-3">
        <Link href="/" className="flex items-center gap-2.5 rounded-md px-3 py-2.5 text-sm text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground">
          <span className="w-4 text-center">⌂</span>
          بازگشت به فروشگاه
        </Link>
        <button
          type="button"
          onClick={() => { clearUserSession(); router.replace('/'); }}
          className="flex w-full items-center gap-2.5 rounded-md px-3 py-2.5 text-sm text-destructive transition-colors hover:bg-destructive/10"
        >
          <span className="w-4 text-center">⎋</span>
          خروج از حساب
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-secondary/30 font-vazir" dir="rtl">
      <header className="sticky top-0 z-50 flex items-center justify-between border-b border-border bg-card px-4 py-3">
        <div className="flex items-center gap-3">
          <button type="button" className="rounded-md p-2 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground md:hidden" onClick={() => setMobileOpen(true)} aria-label="باز کردن منو">☰</button>
          <Link href="/" className="text-lg font-bold">N<span className="text-primary">♥</span>OSHEH</Link>
          <span className="rounded bg-secondary px-2 py-0.5 text-xs text-muted-foreground">حساب کاربری</span>
        </div>
        <Link href="/" className="flex items-center gap-1 text-xs text-primary hover:underline">بازگشت به سایت <span>‹</span></Link>
      </header>

      {mobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <button type="button" className="absolute inset-0 bg-black/40" onClick={() => setMobileOpen(false)} aria-label="بستن منو" />
          <div className="absolute right-0 top-0 h-full w-72 bg-card shadow-xl">
            <div className="flex items-center justify-between border-b border-border p-4">
              <span className="text-sm font-semibold">منو</span>
              <button type="button" className="rounded-md p-2 text-muted-foreground hover:bg-secondary" onClick={() => setMobileOpen(false)} aria-label="بستن">×</button>
            </div>
            {sidebar}
          </div>
        </div>
      )}

      <div className="flex">
        <aside className="sticky top-[53px] hidden min-h-[calc(100vh-53px)] w-60 flex-col border-l border-border bg-card md:flex">
          {sidebar}
        </aside>

        <div className="fixed bottom-0 left-0 right-0 z-40 border-t border-border bg-card px-1 py-1 md:hidden">
          <div className="flex justify-around overflow-x-auto">
            {navItems.slice(0, 5).map((item) => {
              const active = isActivePath(pathname, item);
              return (
                <Link key={item.href} href={item.href} className={`flex shrink-0 flex-col items-center gap-0.5 px-2 py-1.5 text-[10px] ${active ? 'text-primary' : 'text-muted-foreground'}`}>
                  <span className="h-4">{item.icon}</span>
                  <span className="whitespace-nowrap">{item.label}</span>
                </Link>
              );
            })}
          </div>
        </div>

        <main className="min-w-0 flex-1 p-4 pb-24 md:p-6 md:pb-6">{children}</main>
      </div>
    </div>
  );
}
