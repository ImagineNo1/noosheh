export type Product = {
  id: string;
  title: string;
  code?: string;
  price: number;
  discount_price?: number;
  description?: string;
  short_description?: string;
  product_type?: string;
  tags?: string[];
  features?: string[];
  weight?: number;
  avg_rating?: number;
  review_count?: number;
  complete_the_look_enabled?: boolean;
  images?: string[];
  category?: string;
  collection?: string;
  sizes?: string[];
  colors?: string[];
  cup_size?: string;
  has_cup_option?: boolean;
  cups?: string[];
  color_swatches?: { name: string; value?: string; slug?: string; hex?: string; swatch_image?: string; image?: string; active?: boolean; is_active?: boolean; order?: number; sort_order?: number; images?: (string | { url?: string; alt?: string })[] }[];
  variants?: { id?: string; color?: string; size?: string; cup?: string; sku?: string; price?: number; discount_price?: number; compare_at_price?: number; stock?: number; inventory?: number; is_available?: boolean; image?: string }[];
  badges?: string[];
  details?: string;
  size_fit?: string;
  fabric_care?: string;
  shipping_returns?: string;
  faq?: string;
  complete_the_look_ids?: string[];
  similar_product_ids?: string[];
  material?: string;
  brand?: string;
  stock?: number;
  is_active?: boolean;
  is_featured?: boolean;
  wash_instructions?: string;
  created_date?: string;
};

export type Category = {
  id: string;
  title: string;
  title_en?: string;
  slug?: string;
  image?: string;
  order?: number;
  is_active?: boolean;
};

export type OrderItem = {
  title: string;
  image?: string;
  product_name?: string;
  product_image?: string;
  quantity: number;
  price: number;
  size?: string;
  color?: string;
  product_id?: string;
};

export type Order = {
  id: string;
  order_number: string;
  customer_name?: string;
  customer_family?: string;
  customer_phone?: string;
  customer_email?: string;
  province?: string;
  city?: string;
  address?: string;
  postal_code?: string;
  notes?: string;
  items?: OrderItem[];
  total_amount?: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | string;
  payment_status: 'unpaid' | 'paid' | 'refunded' | string;
  tracking_code?: string;
  tracking_number?: string;
  total?: number;
  shipping_address?: string;
  user_email?: string;
  created_date?: string;
};

export type SiteSetting = {
  id: string;
  key: string;
  value: string;
  type: 'text' | 'image' | string;
};


export type Review = {
  id: string;
  product_id?: string;
  user_email?: string;
  user_name?: string;
  rating?: number;
  comment?: string;
  status?: string;
  purchased_color?: string;
  purchased_size?: string;
  purchased_cup?: string;
  admin_reply?: string;
  is_verified_purchase?: boolean;
  created_date?: string;
};
