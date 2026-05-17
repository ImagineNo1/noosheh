export type AdminEntity = 'Product' | 'Order' | 'Category' | 'SiteSettings';

async function request<T>(url: string, init?: RequestInit): Promise<T> {
  const response = await fetch(url, {
    ...init,
    headers: init?.body instanceof FormData ? init.headers : { 'Content-Type': 'application/json', ...(init?.headers || {}) }
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || 'درخواست با خطا مواجه شد');
  }

  return response.json();
}

export const adminApi = {
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
