'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { FormEvent, useEffect, useState, type ReactNode } from 'react';
import { adminApi, clearAdminToken } from './admin-api';

const menuItems = [
  { label: 'داشبورد', path: '/admin', icon: '▦' },
  { label: 'محصولات', path: '/admin/products', icon: '▣' },
  { label: 'سفارشات', path: '/admin/orders', icon: '◈' },
  { label: 'دسته‌بندی‌ها', path: '/admin/categories', icon: '▤' },
  { label: 'تنظیمات سایت', path: '/admin/settings', icon: '⚙' }
];

export default function AdminShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);
  const [secret, setSecret] = useState('');
  const [loginError, setLoginError] = useState('');

  useEffect(() => {
    adminApi.isAuthenticated().then(setAuthenticated).finally(() => setCheckingAuth(false));
  }, []);

  const handleLogin = async (event: FormEvent) => {
    event.preventDefault();
    setLoginError('');
    try {
      await adminApi.login(secret);
      setAuthenticated(true);
    } catch {
      setLoginError('رمز مدیریت معتبر نیست. مقدار JWT_SECRET را وارد کنید.');
    }
  };

  const handleLogout = () => {
    clearAdminToken();
    setAuthenticated(false);
  };

  if (checkingAuth) {
    return <div className="admin-auth-screen" dir="rtl"><div className="admin-card"><p>در حال بررسی دسترسی مدیریت...</p></div></div>;
  }

  if (!authenticated) {
    return (
      <div className="admin-auth-screen" dir="rtl">
        <form className="admin-auth-card" onSubmit={handleLogin}>
          <h1>ورود به پنل مدیریت</h1>
          <p>برای تغییر محصولات، سفارشات و تنظیمات، مقدار امن `JWT_SECRET` را وارد کنید.</p>
          <input type="password" value={secret} onChange={(event) => setSecret(event.target.value)} placeholder="JWT_SECRET" autoFocus />
          {loginError && <span>{loginError}</span>}
          <button className="admin-btn primary" disabled={!secret}>ورود</button>
          <Link href="/">بازگشت به سایت</Link>
        </form>
      </div>
    );
  }

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
          <button className="admin-nav-link muted admin-logout" onClick={handleLogout}><span>⎋</span> خروج از پنل</button>
          <Link href="/" className="admin-nav-link muted"><span>↩</span> بازگشت به سایت</Link>
        </div>
      </aside>

      <header className="admin-mobile-header">
        <div className="admin-mobile-top">
          <Link href="/admin" className="admin-mobile-brand"><span className="admin-brand-icon">◆</span> پنل مدیریت</Link>
          <button className="admin-mobile-return" onClick={handleLogout}>خروج</button>
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
