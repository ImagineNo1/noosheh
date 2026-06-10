'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { FormEvent, useEffect, useState, type ReactNode } from 'react';
import GuidedTour from '@/components/GuidedTour';
import { adminApi, clearAdminToken } from './admin-api';

const navItems = [
  { path: '/admin', label: 'داشبورد', icon: '⌘', exact: true },
  { path: '/admin/products', label: 'محصولات', icon: '◈' },
  { path: '/admin/orders', label: 'سفارش‌ها', icon: '🛒' },
  { path: '/admin/reviews', label: 'نظرات', icon: '💬' },
  { path: '/admin/blog', label: 'مدیریت بلاگ', icon: '✎' },
  { path: '/admin/attributes', label: 'پیش‌فرض‌ها', icon: '☷' },
  { path: '/admin/settings', label: 'تنظیمات', icon: '⚙' },
  { path: '/admin/seo', label: 'SEO', icon: '▥' },
  { path: '/', label: 'صفحه اصلی سایت', icon: '⌂', exact: true }
];


const adminTourSteps = [
  { selector: '[data-tour="admin-dashboard"]', title: 'نمای کلی مدیریت', description: 'از این بخش وضعیت فروشگاه، آمارها و مسیرهای اصلی پنل مدیریت را دنبال می‌کنید.' },
  { selector: '[data-tour="admin-products"]', title: 'مدیریت محصولات', description: 'محصول، تصویر، رنگ، سایز، کاپ، موجودی، محصولات مرتبط و SEO را از اینجا مدیریت کنید.' },
  { selector: '[data-tour="admin-defaults"]', title: 'پیش‌فرض‌ها', description: 'همه مقدارهای دراپ‌داونی محصول و دسته‌بندی بلاگ را یکجا اضافه یا ویرایش کنید.' },
  { selector: '[data-tour="admin-orders"]', title: 'سفارش‌ها', description: 'پرداخت، وضعیت آماده‌سازی، ارسال و پیگیری سفارش مشتری‌ها در این بخش قرار دارد.' },
  { selector: '[data-tour="admin-blog"]', title: 'مجله و بلاگ', description: 'مقاله جدید بسازید، دسته‌بندی بلاگ را داخل فرم انتخاب کنید و وضعیت انتشار را کنترل کنید.' },
  { selector: '[data-tour="admin-settings"]', title: 'تنظیمات سایت', description: 'تنظیمات عمومی فروشگاه، درگاه‌های پرداخت و ابزارهای SEO در این مسیرها قرار گرفته‌اند.' }
];

function isActivePath(pathname: string, item: { path: string; exact?: boolean }) {
  return item.exact ? pathname === item.path : pathname.startsWith(item.path);
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
    <div className="admin-ref-shell font-vazir" dir="rtl">
      <aside className="admin-ref-sidebar">
        <div className="admin-ref-logo">N<span>♥</span>OSHEH</div>
        <nav className="admin-ref-nav">
          {navItems.map((item) => {
            const active = isActivePath(pathname, item);
            return (
              <Link key={item.path} href={item.path} data-tour={item.path === '/admin' ? 'admin-dashboard' : item.path === '/admin/products' ? 'admin-products' : item.path === '/admin/attributes' ? 'admin-defaults' : item.path === '/admin/orders' ? 'admin-orders' : item.path === '/admin/blog' ? 'admin-blog' : item.path === '/admin/settings' ? 'admin-settings' : undefined} className={active ? 'active' : ''}>
                <span aria-hidden="true">{item.icon}</span>
                <b>{item.label}</b>
              </Link>
            );
          })}
        </nav>
        <div className="admin-ref-sidebar-footer">
          <button type="button" onClick={handleLogout} className="admin-ref-logout"><span>↪</span> خروج از پنل</button>
        </div>
      </aside>

      <div className="admin-ref-main">
        <header className="admin-ref-header">
          <div className="admin-ref-user">
            <button type="button" className="admin-ref-chevron">⌄</button>
            <span className="admin-ref-avatar" aria-hidden="true" />
            <div>
              <strong>پشتیبانی نوشه</strong>
              <small>مدیر سیستم</small>
            </div>
            <span className="admin-ref-bell" aria-label="اعلان‌ها">♧<i>۳</i></span>
          </div>
          <Link href="/" className="admin-ref-store-link">مشاهده فروشگاه <span>↗</span></Link>
        </header>
        <main className="admin-ref-content">{children}</main>
      </div>
      <GuidedTour storageKey="noosheh-admin-tour-v1" steps={adminTourSteps} helpLabel="راهنمای پنل" />
    </div>
  );
}