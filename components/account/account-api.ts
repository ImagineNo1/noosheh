import { authRequest } from '@/lib/user-auth';
import type { AccountProfile, Address, AccountReview, ReturnRequest, WishlistItem } from './account-types';
import type { Order } from '@/app/admin/types';

export const accountApi = {
  profile: () => authRequest<AccountProfile>('/api/account/profile'),
  updateProfile: (data: Partial<AccountProfile>) => authRequest<AccountProfile>('/api/account/profile', { method: 'PUT', body: JSON.stringify(data) }),
  orders: () => authRequest<Order[]>('/api/account/orders'),
  addresses: () => authRequest<Address[]>('/api/account/addresses'),
  addAddress: (data: Omit<Address, 'id'>) => authRequest<Address>('/api/account/addresses', { method: 'POST', body: JSON.stringify(data) }),
  updateAddress: (id: string, data: Partial<Address>) => authRequest<Address>(`/api/account/addresses/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  deleteAddress: (id: string) => authRequest<{ ok: boolean }>(`/api/account/addresses/${id}`, { method: 'DELETE' }),
  reviews: () => authRequest<AccountReview[]>('/api/account/reviews'),
  deleteReview: (id: string) => authRequest<{ ok: boolean }>(`/api/account/reviews/${id}`, { method: 'DELETE' }),
  returns: () => authRequest<ReturnRequest[]>('/api/account/returns'),
  createReturn: (data: Omit<ReturnRequest, 'id'>) => authRequest<ReturnRequest>('/api/account/returns', { method: 'POST', body: JSON.stringify(data) }),
  changePassword: (data: { current: string; newPassword: string }) => authRequest<{ ok: boolean }>('/api/account/security', { method: 'POST', body: JSON.stringify(data) }),
  wishlist: () => authRequest<WishlistItem[]>('/api/account/wishlist'),
  removeWishlist: (id: string) => authRequest<{ ok: boolean }>(`/api/account/wishlist/${id}`, { method: 'DELETE' })
};
