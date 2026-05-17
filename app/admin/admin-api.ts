export type AdminEntity = 'Product' | 'Order' | 'Category' | 'SiteSettings';

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
  async login(secret: string) {
    const result = await request<{ token: string }>('/api/admin/auth', { method: 'POST', body: JSON.stringify({ secret }) });
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
