import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, Package, ShoppingCart, FolderOpen, Settings,
  LogOut, Store, BookOpen, FileText, Tag, MessageCircle
} from 'lucide-react';

const menuItems = [
  { label: 'داشبورد', path: '/admin', icon: LayoutDashboard },
  { label: 'محصولات', path: '/admin/products', icon: Package },
  { label: 'سفارشات', path: '/admin/orders', icon: ShoppingCart },
  { label: 'دسته‌بندی‌ها', path: '/admin/categories', icon: FolderOpen },
  { label: 'تنظیمات سایت', path: '/admin/settings', icon: Settings },
  { label: '── بلاگ ──', path: null, icon: null },
  { label: 'داشبورد بلاگ', path: '/admin/blog', icon: BookOpen },
  { label: 'مقالات', path: '/admin/blog/posts', icon: FileText },
  { label: 'دسته‌بندی بلاگ', path: '/admin/blog/categories', icon: FolderOpen },
  { label: 'تگ‌ها', path: '/admin/blog/tags', icon: Tag },
  { label: 'دیدگاه‌ها', path: '/admin/blog/comments', icon: MessageCircle },
];

export default function AdminLayout() {
  const location = useLocation();

  return (
    <div className="min-h-screen bg-secondary/50 flex" dir="rtl">
      <aside className="w-64 bg-foreground text-white flex-shrink-0 hidden md:flex flex-col">
        <div className="p-5 border-b border-white/10">
          <Link to="/admin" className="text-lg font-bold flex items-center gap-2">
            <Store className="w-5 h-5 text-primary" />
            پنل مدیریت
          </Link>
        </div>
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {menuItems.map((item, i) => {
            if (!item.path) return <div key={i} className="text-white/30 text-xs px-4 pt-3 pb-1 tracking-wider">{item.label}</div>;
            const isActive = location.pathname === item.path || (item.path !== '/admin' && location.pathname.startsWith(item.path));
            return (
              <Link key={item.path} to={item.path} className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm transition-colors ${isActive ? 'bg-primary text-white' : 'text-white/70 hover:bg-white/10 hover:text-white'}`}>
                <item.icon className="w-4 h-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="p-3 border-t border-white/10">
          <Link to="/" className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm text-white/70 hover:bg-white/10 hover:text-white transition-colors">
            <LogOut className="w-4 h-4" />
            بازگشت به سایت
          </Link>
        </div>
      </aside>

      <div className="md:hidden fixed top-0 left-0 right-0 z-50 bg-foreground text-white">
        <div className="flex items-center justify-between p-3">
          <Link to="/admin" className="text-base font-bold flex items-center gap-2"><Store className="w-4 h-4 text-primary" />پنل مدیریت</Link>
          <Link to="/" className="text-xs text-white/70">بازگشت به سایت</Link>
        </div>
        <div className="flex overflow-x-auto gap-1 px-3 pb-2">
          {menuItems.filter(item => item.path).map(item => {
            const isActive = location.pathname === item.path || (item.path !== '/admin' && location.pathname.startsWith(item.path));
            return (
              <Link key={item.path} to={item.path} className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs transition-colors ${isActive ? 'bg-primary text-white' : 'bg-white/10 text-white/70'}`}>
                <item.icon className="w-3 h-3" />
                {item.label}
              </Link>
            );
          })}
        </div>
      </div>

      <main className="flex-1 min-w-0 md:p-6 p-4 pt-24 md:pt-6 overflow-x-hidden">
        <Outlet />
      </main>
    </div>
  );
}
