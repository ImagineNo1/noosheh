export type Address = { id: string; label?: string; text?: string; full_name?: string; phone?: string; province?: string; city?: string; address?: string; postal_code?: string; unit?: string; notes?: string; is_default?: boolean };
export type WishlistItem = { id: string; product_id: string; product_name?: string; product_image?: string; product_slug?: string; price?: number; added_date?: string };
export type AccountProfile = { name?: string; email: string; phone?: string; created_date?: string };

export type AccountReview = { id: string; product_id?: string; user_email?: string; user_name?: string; rating?: number; comment?: string; status?: string; purchased_color?: string; purchased_size?: string; purchased_cup?: string; admin_reply?: string; created_date?: string };
export type ReturnRequest = { id: string; order_id: string; order_number?: string; product_name?: string; reason: string; description?: string; status?: string; created_date?: string };
