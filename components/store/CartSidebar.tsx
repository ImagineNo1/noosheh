'use client';

import Link from 'next/link';
import { useCart } from '@/lib/cart-context';

const formatPrice = (price: number) => price.toLocaleString('fa-IR') + ' ریال';

export default function CartSidebar() {
  const { items, isOpen, setIsOpen, removeItem, updateQuantity, totalPrice, totalItems } = useCart();
  const originalTotal = items.reduce((sum, item) => sum + item.original_price * item.quantity, 0);
  const savedAmount = originalTotal - totalPrice;

  if (!isOpen) return null;

  return (
    <div className="store-cart-backdrop" onClick={() => setIsOpen(false)}>
      <aside className="store-cart-sidebar" dir="rtl" onClick={(event) => event.stopPropagation()}>
        <header>
          <h2>🛍 سبد خرید {totalItems > 0 && <span>{totalItems.toLocaleString('fa-IR')}</span>}</h2>
          <button onClick={() => setIsOpen(false)} aria-label="بستن">×</button>
        </header>

        {items.length === 0 ? (
          <div className="store-cart-empty">
            <div>🛍</div>
            <strong>سبد خرید شما خالی است</strong>
            <p>محصولات دلخواه خود را اضافه کنید</p>
            <Link href="/category/all" className="store-outline-btn" onClick={() => setIsOpen(false)}>مشاهده محصولات</Link>
          </div>
        ) : (
          <>
            <div className="store-cart-items">
              {items.map((item) => (
                <article key={item.key}>
                  {item.image ? <img src={item.image} alt={item.title} /> : <div className="store-cart-placeholder">🛍</div>}
                  <div>
                    <div className="store-cart-item-head"><h3>{item.title}</h3><button onClick={() => removeItem(item.key)}>🗑</button></div>
                    <div className="store-cart-tags">{item.size && <span>سایز: {item.size}</span>}{item.color && <span>رنگ: {item.color}</span>}{item.cup && <span>کاپ: {item.cup}</span>}</div>
                    <div className="store-cart-item-bottom">
                      <div className="store-cart-qty"><button onClick={() => updateQuantity(item.key, item.quantity + 1)}>+</button><span>{item.quantity.toLocaleString('fa-IR')}</span><button onClick={() => updateQuantity(item.key, item.quantity - 1)}>−</button></div>
                      <div className="store-cart-price"><b>{formatPrice(item.price * item.quantity)}</b>{item.original_price > item.price && <del>{formatPrice(item.original_price * item.quantity)}</del>}</div>
                    </div>
                  </div>
                </article>
              ))}
            </div>
            <footer>
              {savedAmount > 0 && <div className="store-cart-save"><span>🏷 سود شما از این خرید</span><b>{formatPrice(savedAmount)}</b></div>}
              <div className="store-cart-total"><span>جمع کل ({totalItems.toLocaleString('fa-IR')} کالا):</span><b>{formatPrice(totalPrice)}</b></div>
              <Link href="/checkout" className="store-primary-btn full" onClick={() => setIsOpen(false)}>ادامه و پرداخت</Link>
              <button onClick={() => setIsOpen(false)} className="store-cart-continue">ادامه خرید</button>
            </footer>
          </>
        )}
      </aside>
    </div>
  );
}
