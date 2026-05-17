import type { Order, Product, SiteSetting, Category } from '@/app/admin/types';

async function request<T>(url: string, init?: RequestInit): Promise<T> {
  const response = await fetch(url, {
    ...init,
    headers: init?.body ? { 'Content-Type': 'application/json', ...(init.headers || {}) } : init?.headers,
    cache: 'no-store'
  });
  if (!response.ok) throw new Error(await response.text());
  return response.json();
}

export const storeApi = {
  products: () => request<Product[]>('/api/admin/entities/Product?sort=-created_date&limit=100'),
  categories: () => request<Category[]>('/api/admin/entities/Category?sort=order&limit=50'),
  orders: () => request<Order[]>('/api/admin/entities/Order?sort=-created_date&limit=100'),
  settings: () => request<SiteSetting[]>('/api/admin/entities/SiteSettings'),
  createOrder: (data: Partial<Order>) => request<Order>('/api/admin/entities/Order', { method: 'POST', body: JSON.stringify(data) })
};
