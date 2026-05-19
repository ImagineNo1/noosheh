export type AdminEntity = 'Product' | 'Order' | 'Category' | 'SiteSettings' | 'Review' | 'Address' | 'CartItem' | 'ReturnRequest' | 'Wishlist' | 'ProductAttribute' | 'SeoSettings' | 'SeoMeta' | 'Redirect' | 'NotFoundLog';

const tokenKey = 'noosheh-admin-token';

function getAdminToken() {
  if (typeof window === 'undefined') return '';
  return window.localStorage.getItem(tokenKey) || '';
}

export function setAdminToken(token: string) {
  if (typeof window !== 'undefined') window.localStorage.setItem(tokenKey, token);
}

export function clearAdminToken() {
  if (typeof window !== 'undefined') window.localStorage.removeItem(tokenKey);
}

async function request<T>(url: string, init?: RequestInit): Promise<T> {
  const token = getAdminToken();
  const headers = init?.body instanceof FormData
    ? { ...(init.headers || {}), ...(token ? { Authorization: `Bearer ${token}` } : {}) }
    : { 'Content-Type': 'application/json', ...(init?.headers || {}), ...(token ? { Authorization: `Bearer ${token}` } : {}) };
  const response = await fetch(url, { ...init, headers });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || 'درخواست با خطا مواجه شد');
  }

  return response.json();
}

export const adminApi = {
  async checkServerConnection() {
    try {
      const response = await fetch('/api/admin/auth', { cache: 'no-store' });
      if (!response.ok) {
        const text = await response.text();
        return { connected: false, message: `سرور پاسخ داد ولی اتصال دیتابیس مشکل دارد. ${text}` };
      }
      const result = await response.json() as { configured?: boolean; db_connected?: boolean; db_error?: string };
      if (result.db_connected === false) {
        return { connected: false, message: `اتصال دیتابیس برقرار نشد: ${result.db_error || 'خطای نامشخص'}` };
      }
      if (result.configured === false) {
        return { connected: true, message: 'ارتباط با سرور برقرار است، اما JWT_SECRET تنظیم نشده است.' };
      }
      return { connected: true, message: 'ارتباط با سرور برقرار شد.' };
    } catch {
      return { connected: false, message: 'ارتباط با سرور برقرار نشد.' };
    }
  },
  async login(credentials: { email: string; password: string }) {
    const result = await request<{ token: string }>('/api/admin/auth', { method: 'POST', body: JSON.stringify(credentials) });
    setAdminToken(result.token);
    return result;
  },
  async isAuthenticated() {
    try {
      const result = await request<{ authenticated: boolean }>('/api/admin/auth');
      return result.authenticated;
    } catch {
      return false;
    }
  },
  list<T>(entity: AdminEntity, sort?: string, limit?: number) {
    const params = new URLSearchParams();
    if (sort) params.set('sort', sort);
    if (limit) params.set('limit', String(limit));
    const query = params.toString();
    return request<T[]>(`/api/admin/entities/${entity}${query ? `?${query}` : ''}`, { cache: 'no-store' });
  },
  create<T>(entity: AdminEntity, data: Partial<T>) {
    return request<T>(`/api/admin/entities/${entity}`, { method: 'POST', body: JSON.stringify(data) });
  },
  update<T>(entity: AdminEntity, id: string, data: Partial<T>) {
    return request<T>(`/api/admin/entities/${entity}/${id}`, { method: 'PATCH', body: JSON.stringify(data) });
  },
  delete(entity: AdminEntity, id: string) {
    return request<{ ok: boolean }>(`/api/admin/entities/${entity}/${id}`, { method: 'DELETE' });
  },
  async upload(file: File) {
    const form = new FormData();
    form.append('file', file);
    return request<{ file_url: string }>('/api/admin/upload', { method: 'POST', body: form });
  }
};
