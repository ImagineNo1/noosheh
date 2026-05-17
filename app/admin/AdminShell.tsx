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
  const [email, setEmail] = useState('admin');
  const [password, setPassword] = useState('admin');
  const [loginError, setLoginError] = useState('');
  const [serverStatus, setServerStatus] = useState<{ connected: boolean; message: string }>({ connected: false, message: 'در حال بررسی ارتباط با سرور...' });

  useEffect(() => {
    adminApi.isAuthenticated().then(setAuthenticated).finally(() => setCheckingAuth(false));
    adminApi.checkServerConnection().then(setServerStatus);
  }, []);

  const handleLogin = async (event: FormEvent) => {
    event.preventDefault();
    setLoginError('');
    try {
      await adminApi.login({ email, password });
      setAuthenticated(true);
    } catch {
      setLoginError('ایمیل یا رمز عبور مدیریت معتبر نیست.');
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
          <p>اگر هیچ کاربری در سیستم وجود نداشته باشد، حساب پیش‌فرض با نام کاربری admin و رمز عبور admin خودکار ساخته می‌شود.</p>
          <p className={serverStatus.connected ? 'admin-muted success' : 'admin-muted danger'}>{serverStatus.message}</p>
          <input type="text" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="admin" autoFocus />
          <input type="password" value={password} onChange={(event) => setPassword(event.target.value)} placeholder="admin" />
          {loginError && <span>{loginError}</span>}
          <button className="admin-btn primary" disabled={!email || !password}>ورود</button>
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
