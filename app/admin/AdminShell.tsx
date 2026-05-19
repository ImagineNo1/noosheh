'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { FormEvent, useEffect, useState, type ReactNode } from 'react';
import { adminApi, clearAdminToken } from './admin-api';

const navItems = [
  { path: '/admin', label: 'داشبورد', icon: '▦', exact: true },
  { path: '/admin/products', label: 'محصولات', icon: '▣' },
  { path: '/admin/attributes', label: 'پیش‌فرض‌ها', icon: '☷' },
  { path: '/admin/orders', label: 'سفارشات', icon: '◈' },
  { path: '/admin/reviews', label: 'نظرات', icon: '☷' },
  { path: '/admin/categories', label: 'دسته‌بندی‌ها', icon: '▤' },
  { path: '/admin/settings', label: 'تنظیمات', icon: '⚙' },
  { path: '/admin/blog/BlogDashboard', label: 'بلاگ', icon: '✎' },
  { path: '/', label: 'صفحه اصلی', icon: '⌂', exact: true }
];

function isActivePath(pathname: string | null, item: { path: string; exact?: boolean }) {
  const currentPath = pathname ?? '';
  return item.exact ? currentPath === item.path : currentPath.startsWith(item.path);
}

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
    return (
      <div className="flex min-h-screen items-center justify-center bg-secondary/30" dir="rtl">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-border border-t-primary" />
      </div>
    );
  }

  if (!authenticated) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-secondary/30 px-4 font-vazir" dir="rtl">
        <form className="grid w-full max-w-md gap-4 rounded-2xl border border-border bg-card p-6 shadow-xl shadow-primary/5" onSubmit={handleLogin}>
          <div className="text-center">
            <h1 className="text-xl font-bold">ورود به پنل مدیریت</h1>
            <p className="mt-2 text-sm leading-7 text-muted-foreground">اگر هیچ کاربری در سیستم وجود نداشته باشد، حساب پیش‌فرض با نام کاربری admin و رمز عبور admin خودکار ساخته می‌شود.</p>
          </div>
          <p className={`rounded-lg px-3 py-2 text-xs ${serverStatus.connected ? 'bg-emerald-50 text-emerald-700' : 'bg-destructive/10 text-destructive'}`}>{serverStatus.message}</p>
          <input className="h-11 rounded-lg border border-input bg-background px-3 text-left outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20" type="text" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="admin" autoFocus dir="ltr" />
          <input className="h-11 rounded-lg border border-input bg-background px-3 text-left outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20" type="password" value={password} onChange={(event) => setPassword(event.target.value)} placeholder="admin" dir="ltr" />
          {loginError && <span className="text-sm text-destructive">{loginError}</span>}
          <button className="h-11 rounded-lg bg-primary font-bold text-primary-foreground transition hover:bg-primary/90 disabled:opacity-50" disabled={!email || !password}>ورود</button>
          <Link href="/" className="text-center text-sm text-primary hover:underline">بازگشت به سایت</Link>
        </form>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-secondary/30 font-vazir" dir="rtl">
      <header className="sticky top-0 z-50 flex items-center justify-between border-b border-border bg-card px-4 py-3">
        <div className="flex items-center gap-3">
          <h1 className="text-lg font-bold">N<span className="text-primary">♥</span>OSHEH</h1>
          <span className="rounded bg-secondary px-2 py-0.5 text-xs text-muted-foreground">پنل مدیریت</span>
        </div>
        <div className="flex items-center gap-3">
          <button type="button" onClick={handleLogout} className="hidden text-xs text-destructive hover:underline sm:inline">خروج</button>
          <Link href="/" className="flex items-center gap-1 text-xs text-primary hover:underline">بازگشت به سایت <span>‹</span></Link>
        </div>
      </header>

      <div className="flex">
        <aside className="sticky top-[53px] hidden min-h-[calc(100vh-53px)] w-56 border-l border-border bg-card md:block">
          <nav className="space-y-0.5 p-3">
            {navItems.map((item) => {
              const active = isActivePath(pathname, item);
              return (
                <Link key={item.path} href={item.path} className={`flex items-center gap-2.5 rounded-md px-3 py-2.5 text-sm transition-colors ${active ? 'bg-primary/10 font-medium text-primary' : 'text-muted-foreground hover:bg-secondary hover:text-foreground'}`}>
                  <span className="h-4 w-4 text-center">{item.icon}</span>
                  {item.label}
                </Link>
              );
            })}
            <button type="button" onClick={handleLogout} className="flex w-full items-center gap-2.5 rounded-md px-3 py-2.5 text-sm text-destructive transition-colors hover:bg-destructive/10">
              <span className="h-4 w-4 text-center">⎋</span>
              خروج از پنل
            </button>
          </nav>
        </aside>

        <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-card px-2 py-1 md:hidden">
          <div className="flex justify-around overflow-x-auto">
            {navItems.slice(0, 5).map((item) => {
              const active = isActivePath(pathname, item);
              return (
                <Link key={item.path} href={item.path} className={`flex flex-col items-center gap-0.5 px-2 py-1.5 text-[10px] ${active ? 'text-primary' : 'text-muted-foreground'}`}>
                  <span className="h-4">{item.icon}</span>
                  <span className="whitespace-nowrap">{item.label}</span>
                </Link>
              );
            })}
          </div>
        </div>

        <main className="min-w-0 flex-1 p-4 pb-20 md:p-6 md:pb-6">{children}</main>
      </div>
    </div>
  );
}
