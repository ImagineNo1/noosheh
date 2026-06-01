import type { Address as AdminAddress, ReturnRequest as AdminReturnRequest, Review, Wishlist } from '@/app/admin/types';

export type Address = Partial<AdminAddress> & {
  id: string;
  label?: string;
  text?: string;
};

export type WishlistItem = Partial<Wishlist> & {
  id: string;
  product_id: string;
  added_date?: string;
};

export type AccountProfile = { name?: string; email: string; phone?: string; created_date?: string };

export type AccountReview = Partial<Review> & {
  id: string;
};

export type ReturnRequest = Partial<AdminReturnRequest> & {
  id: string;
  order_id: string;
  reason: string;
};
