'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import type { Order } from '@/app/admin/types';
import { accountApi } from '@/components/account/account-api';
import type { AccountProfile, Address, WishlistItem } from '@/components/account/account-types';

const statusLabels: Record<string, { label: string; color: string }> = {
  pending: { label: 'در انتظار پرداخت', color: 'bg-amber-100 text-amber-700' },
  processing: { label: 'در حال پردازش', color: 'bg-blue-100 text-blue-700' },
  shipped: { label: 'ارسال‌شده', color: 'bg-purple-100 text-purple-700' },
  delivered: { label: 'تحویل‌داده‌شده', color: 'bg-green-100 text-green-700' },
  cancelled: { label: 'لغوشده', color: 'bg-red-100 text-red-700' }
};

export default function AccountPage() {
  const [profile, setProfile] = useState<AccountProfile | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [wishlist, setWishlist] = useState<WishlistItem[]>([]);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      accountApi.profile().then(setProfile).catch(() => null),
      accountApi.orders().then((items) => setOrders(items.slice(0, 5))).catch(() => setOrders([])),
      accountApi.wishlist().then(setWishlist).catch(() => setWishlist([])),
      accountApi.addresses().then(setAddresses).catch(() => setAddresses([]))
    ]).finally(() => setLoading(false));
  }, []);

  const stats = useMemo(() => ({
    total: orders.length,
    processing: orders.filter((order) => order.status === 'processing').length,
    shipped: orders.filter((order) => order.status === 'shipped').length,
    wishlist: wishlist.length
  }), [orders, wishlist]);
  const defaultAddress = addresses.find((address) => address.is_default) || addresses[0];
  const profileComplete = Boolean(profile?.name && profile?.email);

  return (
    <div className="space-y-6">
      <div><h1 className="text-xl font-bold">سلام، {profile?.name || 'کاربر عزیز'} 👋</h1><p className="mt-1 text-sm text-muted-foreground">خوش آمدید به پنل کاربری</p></div>
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {[{ label: 'کل سفارش‌ها', value: stats.total, icon: '▣', color: 'text-blue-600 bg-blue-50' }, { label: 'در پردازش', value: stats.processing, icon: '◷', color: 'text-amber-600 bg-amber-50' }, { label: 'در راه', value: stats.shipped, icon: '🚚', color: 'text-purple-600 bg-purple-50' }, { label: 'علاقه‌مندی', value: stats.wishlist, icon: '♡', color: 'text-pink-600 bg-pink-50' }].map((item) => <article key={item.label} className="flex items-center gap-3 rounded-xl border border-border bg-card p-4"><div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${item.color}`}>{item.icon}</div><div>{loading ? <div className="mb-1 h-6 w-8 animate-pulse rounded bg-secondary" /> : <p className="text-xl font-bold">{item.value.toLocaleString('fa-IR')}</p>}<p className="text-xs text-muted-foreground">{item.label}</p></div></article>)}
      </div>
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <section className="rounded-xl border border-border bg-card lg:col-span-2"><div className="flex items-center justify-between border-b border-border p-4"><h2 className="font-semibold">آخرین سفارش‌ها</h2><Link href="/account/orders" className="text-xs text-primary hover:underline">مشاهده همه ←</Link></div><div className="space-y-2 p-4">{loading ? [1,2,3].map((i) => <div key={i} className="h-14 animate-pulse rounded-lg bg-secondary" />) : orders.length === 0 ? <div className="py-10 text-center"><div className="mb-3 text-4xl opacity-30">🛍</div><p className="text-sm text-muted-foreground">هنوز سفارشی ثبت نکرده‌اید</p><Link href="/" className="store-primary-btn mt-3 inline-flex">شروع خرید</Link></div> : orders.map((order) => { const status = statusLabels[order.status] || { label: order.status, color: 'bg-secondary text-foreground' }; return <Link key={order.id} href={`/account/orders/${order.id}`} className="flex items-center justify-between rounded-lg bg-secondary/40 p-3 transition-colors hover:bg-secondary/70"><div className="flex items-center gap-3"><div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">▣</div><div><p className="text-xs font-medium">سفارش #{order.order_number || order.id.slice(-6).toUpperCase()}</p><p className="text-[10px] text-muted-foreground">{(order.total_amount || 0).toLocaleString('fa-IR')} ریال</p></div></div><span className={`rounded-full px-2 py-1 text-[10px] font-medium ${status.color}`}>{status.label}</span></Link>; })}</div></section>
        <aside className="space-y-4"><section className="rounded-xl border border-border bg-card p-4"><div className="mb-3 flex items-center gap-3"><div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/15 text-sm font-bold text-primary">{(profile?.name || 'K').charAt(0)}</div><div><p className="text-sm font-medium">{profile?.name || '---'}</p><p className="text-xs text-muted-foreground">{profile?.email}</p></div></div>{!profileComplete && <div className="mb-3 rounded-lg border border-amber-200 bg-amber-50 p-2 text-xs text-amber-700">پروفایل شما ناقص است</div>}<Link href="/account/profile" className="store-outline-btn w-full justify-center text-xs">ویرایش پروفایل</Link></section><section className="rounded-xl border border-border bg-card p-4"><div className="mb-2 flex items-center justify-between"><h3 className="text-sm font-semibold">⌖ آدرس پیش‌فرض</h3><Link href="/account/addresses" className="text-xs text-primary hover:underline">مدیریت</Link></div>{defaultAddress ? <p className="text-xs leading-7 text-muted-foreground">{defaultAddress.city}، {defaultAddress.address || defaultAddress.text}</p> : <div><p className="mb-2 text-xs text-muted-foreground">آدرسی ثبت نشده است</p><Link href="/account/addresses" className="store-outline-btn w-full justify-center text-xs">افزودن آدرس</Link></div>}</section></aside>
      </div>
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">{[{ to: '/account/orders', icon: '▣', label: 'سفارش‌ها' }, { to: '/account/addresses', icon: '⌖', label: 'آدرس‌ها' }, { to: '/account/wishlist', icon: '♡', label: 'علاقه‌مندی‌ها' }, { to: '/', icon: '🛍', label: 'ادامه خرید' }].map((item) => <Link key={item.to} href={item.to} className="flex flex-col items-center gap-2 rounded-xl border border-border bg-card p-4 transition-all hover:border-primary/30 hover:bg-primary/5"><span className="text-primary">{item.icon}</span><span className="text-xs font-medium">{item.label}</span></Link>)}</div>
    </div>
  );
}
