import { authRequest } from '@/lib/user-auth';
import type { AccountProfile, Address, WishlistItem } from './account-types';
import type { Order } from '@/app/admin/types';

export const accountApi = {
  profile: () => authRequest<AccountProfile>('/api/account/profile'),
  updateProfile: (data: Partial<AccountProfile>) => authRequest<AccountProfile>('/api/account/profile', { method: 'PUT', body: JSON.stringify(data) }),
  orders: () => authRequest<Order[]>('/api/account/orders'),
  addresses: () => authRequest<Address[]>('/api/account/addresses'),
  addAddress: (data: Omit<Address, 'id'>) => authRequest<Address>('/api/account/addresses', { method: 'POST', body: JSON.stringify(data) }),
  wishlist: () => authRequest<WishlistItem[]>('/api/account/wishlist')
};
