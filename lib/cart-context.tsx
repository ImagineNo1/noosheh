'use client';

import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import type { Product } from '@/app/admin/types';

export type CartItem = {
  key: string;
  product_id: string;
  title: string;
  price: number;
  original_price: number;
  quantity: number;
  size?: string;
  color?: string;
  image?: string;
};

type CartContextValue = {
  items: CartItem[];
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  totalPrice: number;
  totalItems: number;
  addItem: (product: Product, quantity?: number, size?: string, color?: string) => void;
  removeItem: (key: string) => void;
  updateQuantity: (key: string, quantity: number) => void;
  clearCart: () => void;
};

const CartContext = createContext<CartContextValue | null>(null);
const storageKey = 'noosheh-cart';

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(storageKey);
      if (saved) setItems(JSON.parse(saved));
    } catch {
      setItems([]);
    }
  }, []);

  useEffect(() => {
    window.localStorage.setItem(storageKey, JSON.stringify(items));
  }, [items]);

  const value = useMemo<CartContextValue>(() => ({
    items,
    isOpen,
    setIsOpen,
    totalPrice: items.reduce((sum, item) => sum + item.price * item.quantity, 0),
    totalItems: items.reduce((sum, item) => sum + item.quantity, 0),
    addItem(product, quantity = 1, size = '', color = '') {
      const price = product.discount_price && product.discount_price > 0 ? product.discount_price : product.price;
      const key = `${product.id}-${size || 'no-size'}-${color || 'no-color'}`;
      setItems((current) => {
        const existing = current.find((item) => item.key === key);
        if (existing) {
          return current.map((item) => item.key === key ? { ...item, quantity: item.quantity + quantity } : item);
        }
        return [...current, {
          key,
          product_id: product.id,
          title: product.title,
          price,
          original_price: product.price,
          quantity,
          size,
          color,
          image: product.images?.[0]
        }];
      });
      setIsOpen(true);
    },
    removeItem(key) {
      setItems((current) => current.filter((item) => item.key !== key));
    },
    updateQuantity(key, quantity) {
      if (quantity <= 0) {
        setItems((current) => current.filter((item) => item.key !== key));
        return;
      }
      setItems((current) => current.map((item) => item.key === key ? { ...item, quantity } : item));
    },
    clearCart() {
      setItems([]);
    }
  }), [items, isOpen]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within CartProvider');
  return context;
}
