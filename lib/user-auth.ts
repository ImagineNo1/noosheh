'use client';

export type SessionUser = { id: string; name?: string; email: string; role?: string };
const tokenKey = 'noosheh-user-token';
const userKey = 'noosheh-user';

export function getUserToken() {
  if (typeof window === 'undefined') return '';
  return localStorage.getItem(tokenKey) || '';
}

export function getStoredUser(): SessionUser | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(userKey);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function setUserSession(token: string, user: SessionUser) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(tokenKey, token);
  localStorage.setItem(userKey, JSON.stringify(user));
}

export function clearUserSession() {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(tokenKey);
  localStorage.removeItem(userKey);
}

export async function authRequest<T>(url: string, init?: RequestInit): Promise<T> {
  const token = getUserToken();
  const headers = {
    ...(init?.body ? { 'Content-Type': 'application/json' } : {}),
    ...(init?.headers || {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {})
  };
  const response = await fetch(url, { ...init, headers, cache: 'no-store' });
  if (!response.ok) throw new Error((await response.json().catch(() => ({}))).error || 'خطا در ارتباط با سرور');
  return response.json();
}
