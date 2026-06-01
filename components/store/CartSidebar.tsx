'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import type { Product } from '@/app/admin/types';
import { useCart } from '@/lib/cart-context';
import { storeApi } from '@/lib/store-api';
import { productHref } from '@/lib/product-normalization';

const freeShippingThreshold = 5000000;
const formatPrice = (price: number) => `${price.toLocaleString('fa-IR')} تومان`;

function Icon({ name }: { name: 'close' | 'trash' | 'truck' | 'lock' | 'gift' | 'headset' | 'tag' | 'arrow' }) {
  const paths = {
    close: <path d="m6 6 12 12M18 6 6 18" />,
    trash: <><path d="M4 7h16" /><path d="M10 11v6M14 11v6" /><path d="M6 7l1 14h10l1-14" /><path d="M9 7V4h6v3" /></>,
    truck: <><path d="M3 7h11v9H3z" /><path d="M14 10h4l3 3v3h-7z" /><circle cx="7" cy="18" r="2" /><circle cx="18" cy="18" r="2" /></>,
    lock: <><rect x="5" y="10" width="14" height="10" rx="2" /><path d="M8 10V7a4 4 0 0 1 8 0v3" /></>,
    gift: <><path d="M20 12v8H4v-8" /><path d="M2 7h20v5H2z" /><path d="M12 7v13" /><path d="M12 7H8.5A2.5 2.5 0 1 1 12 4.5V7Zm0 0h3.5A2.5 2.5 0 1 0 12 4.5V7Z" /></>,
    headset: <><path d="M4 13a8 8 0 0 1 16 0" /><path d="M4 13v4a2 2 0 0 0 2 2h2v-7H6a2 2 0 0 0-2 2Zm16 0v4a2 2 0 0 1-2 2h-2v-7h2a2 2 0 0 1 2 2Z" /></>,
    tag: <><path d="M20 12 12 20 4 12V4h8l8 8Z" /><circle cx="8.5" cy="8.5" r="1" /></>,
    arrow: <path d="M15 6 9 12l6 6" />
  };
  return <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">{paths[name]}</svg>;
}

export default function CartSidebar() {
  const { items, isOpen, setIsOpen, removeItem, updateQuantity, totalPrice, totalItems, addItem } = useCart();
  const [recommendations, setRecommendations] = useState<Product[]>([]);
  const originalTotal = items.reduce((sum, item) => sum + item.original_price * item.quantity, 0);
  const savedAmount = Math.max(0, originalTotal - totalPrice);
  const remaining = Math.max(0, freeShippingThreshold - totalPrice);
  const shipping = remaining === 0 ? 0 : 85000;
  const payable = totalPrice + shipping;
  const progress = Math.min(100, Math.round((totalPrice / freeShippingThreshold) * 100));

  useEffect(() => {
    if (!isOpen || recommendations.length) return;
    storeApi.products().then((data) => setRecommendations(data.filter((product) => product.is_active !== false).slice(0, 3))).catch(() => setRecommendations([]));
  }, [isOpen, recommendations.length]);

  const filteredRecommendations = useMemo(() => recommendations.filter((product) => !items.some((item) => item.product_id === product.id)).slice(0, 3), [items, recommendations]);

  if (!isOpen) return null;

  return (
    <div className="store-cart-backdrop premium" onClick={() => setIsOpen(false)}>
      <aside className="store-cart-sidebar premium" dir="rtl" onClick={(event) => event.stopPropagation()}>
        <header>
          <button onClick={() => setIsOpen(false)} aria-label="بستن"><Icon name="close" /></button>
          <h2>سبد خرید شما {totalItems > 0 && <span>({totalItems.toLocaleString('fa-IR')})</span>}</h2>
        </header>

        {items.length === 0 ? (
          <div className="store-cart-empty">
            <div><Icon name="gift" /></div>
            <strong>سبد خرید شما خالی است</strong>
            <p>برای شروع، پرفروش‌ترین‌ها یا محصولات جدید نوشه را ببینید.</p>
            <Link href="/category/all" className="store-primary-btn full" onClick={() => setIsOpen(false)}>مشاهده محصولات</Link>
            <Link href="/search" className="store-cart-continue" onClick={() => setIsOpen(false)}>جستجو در فروشگاه</Link>
          </div>
        ) : (
          <>
            <div className="store-free-shipping">
              <div><Icon name="truck" /><span>{remaining > 0 ? `تا ارسال رایگان فقط ${formatPrice(remaining)} باقی مانده` : 'ارسال رایگان فعال شد'}</span></div>
              <i><b style={{ width: `${progress}%` }} /></i>
            </div>

            <div className="store-cart-items">
              {items.map((item) => (
                <article key={item.key}>
                  {item.image ? <img src={item.image} alt={item.title} /> : <div className="store-cart-placeholder">NOOSHEH</div>}
                  <div>
                    <div className="store-cart-item-head">
                      <h3>{item.title}</h3>
                      <button onClick={() => removeItem(item.key)} aria-label="حذف محصول"><Icon name="trash" /></button>
                    </div>
                    <div className="store-cart-tags">{item.color && <span>رنگ: {item.color}</span>}{item.size && <span>سایز: {item.size}</span>}{item.cup && <span>کاپ: {item.cup}</span>}</div>
                    <div className="store-cart-item-bottom">
                      <div className="store-cart-qty"><button onClick={() => updateQuantity(item.key, item.quantity - 1)}>−</button><span>{item.quantity.toLocaleString('fa-IR')}</span><button onClick={() => updateQuantity(item.key, item.quantity + 1)}>+</button></div>
                      <div className="store-cart-price"><b>{formatPrice(item.price * item.quantity)}</b>{item.original_price > item.price && <del>{formatPrice(item.original_price * item.quantity)}</del>}</div>
                    </div>
                  </div>
                </article>
              ))}
            </div>

            <footer>
              <div className="store-cart-summary">
                <p><span>جمع کل کالاها</span><b>{formatPrice(originalTotal)}</b></p>
                {savedAmount > 0 ? <p className="save"><span>تخفیف</span><b>- {formatPrice(savedAmount)}</b></p> : null}
                <p><span>هزینه ارسال</span><b>{shipping === 0 ? 'رایگان' : formatPrice(shipping)}</b></p>
                <p className="payable"><span>مبلغ قابل پرداخت</span><b>{formatPrice(payable)}</b></p>
              </div>

              <div className="store-coupon-ui">
                <Icon name="tag" />
                <input placeholder="کد تخفیف دارید؟ وارد کنید" />
                <button type="button">اعمال</button>
              </div>

              <div className="store-cart-trust">
                <span><Icon name="lock" />پرداخت امن</span>
                <span><Icon name="gift" />بسته‌بندی محرمانه</span>
                <span><Icon name="truck" />تعویض سایز آسان</span>
                <span><Icon name="headset" />پشتیبانی خرید</span>
              </div>

              {filteredRecommendations.length > 0 ? (
                <div className="store-cart-cross-sell">
                  <h3>کامل کنید استایلتان را</h3>
                  <div>
                    {filteredRecommendations.map((product) => {
                      const price = product.discount_price || product.price;
                      return (
                        <article key={product.id}>
                          <Link href={productHref(product)} onClick={() => setIsOpen(false)}>{product.images?.[0] || product.cover_image ? <img src={product.images?.[0] || product.cover_image} alt="" /> : null}</Link>
                          <b>{product.title}</b>
                          <small>{formatPrice(price)}</small>
                          <button type="button" onClick={() => addItem(product, 1)}>افزودن +</button>
                        </article>
                      );
                    })}
                  </div>
                </div>
              ) : null}

              <Link href="/checkout" className="store-primary-btn full checkout" onClick={() => setIsOpen(false)}>تسویه حساب <Icon name="arrow" /></Link>
              <button onClick={() => setIsOpen(false)} className="store-cart-continue">بازگشت به فروشگاه</button>
            </footer>
          </>
        )}
      </aside>
    </div>
  );
}
