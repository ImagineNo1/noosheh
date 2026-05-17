'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { ReactNode } from 'react';

const menuItems = [
  { label: 'داشبورد', path: '/admin', icon: '▦' },
  { label: 'محصولات', path: '/admin/products', icon: '▣' },
  { label: 'سفارشات', path: '/admin/orders', icon: '◈' },
  { label: 'دسته‌بندی‌ها', path: '/admin/categories', icon: '▤' },
  { label: 'تنظیمات سایت', path: '/admin/settings', icon: '⚙' }
];

export default function AdminShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="admin-shell" dir="rtl">
      <aside className="admin-sidebar">
        <div className="admin-brand">
          <Link href="/admin"><span className="admin-brand-icon">◆</span> پنل مدیریت</Link>
        </div>
        <nav className="admin-nav">
          {menuItems.map((item) => {
            const isActive = pathname === item.path;
            return (
              <Link key={item.path} href={item.path} className={`admin-nav-link ${isActive ? 'active' : ''}`}>
                <span>{item.icon}</span>
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="admin-sidebar-footer">
          <Link href="/" className="admin-nav-link muted"><span>↩</span> بازگشت به سایت</Link>
        </div>
      </aside>

      <header className="admin-mobile-header">
        <div className="admin-mobile-top">
          <Link href="/admin" className="admin-mobile-brand"><span className="admin-brand-icon">◆</span> پنل مدیریت</Link>
          <Link href="/" className="admin-mobile-return">بازگشت به سایت</Link>
        </div>
        <nav className="admin-mobile-nav">
          {menuItems.map((item) => (
            <Link key={item.path} href={item.path} className={`admin-mobile-link ${pathname === item.path ? 'active' : ''}`}>
              <span>{item.icon}</span>{item.label}
            </Link>
          ))}
        </nav>
      </header>

      <main className="admin-main">{children}</main>
    </div>
  );
}
