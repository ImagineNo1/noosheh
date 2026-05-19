export type ProductImage = string;

export type ProductColor = {
  name: string;
  hex?: string;
  slug?: string;
  swatch_image?: string;
  is_active?: boolean;
  sort_order?: number;
  images?: (string | { url?: string; alt?: string })[];
  value?: string;
  image?: string;
  active?: boolean;
  order?: number;
};

export type ProductVariant = {
  id?: string;
  product_variant_id?: string;
  color?: string;
  size?: string;
  cup?: string;
  sku?: string;
  price?: number;
  compare_at_price?: number;
  inventory?: number;
  is_available?: boolean;
  discount_price?: number;
  stock?: number;
  image?: string;
  color_id?: string;
  size_id?: string;
  cup_id?: string;
};

export type ProductBadge = 'new' | 'sale' | 'final_sale' | 'best_seller' | 'limited' | string;

export type Product = {
  id: string;
  name?: string;
  title: string;
  slug?: string;
  code?: string;
  brand?: string;
  short_description?: string;
  description?: string;
  price: number;
  compare_at_price?: number;
  discount_price?: number;
  category?: string;
  collection?: string;
  tags?: string[];
  cover_image?: string;
  images?: ProductImage[];
  colors?: string[];
  color_swatches?: ProductColor[];
  sizes?: string[];
  has_cup?: boolean;
  has_cup_option?: boolean;
  cups?: string[];
  cup_size?: string;
  variants?: ProductVariant[];
  product_details?: string;
  details?: string;
  size_and_fit?: string;
  size_fit?: string;
  fabric_and_care?: string;
  fabric_care?: string;
  shipping_and_returns?: string;
  shipping_returns?: string;
  faq?: string;
  features?: string[];
  badges?: ProductBadge[];
  complete_the_look?: string[];
  complete_the_look_ids?: string[];
  similar_products?: string[];
  similar_product_ids?: string[];
  complete_the_look_enabled?: boolean;
  is_active?: boolean;
  product_type?: string;
  weight?: number;
  avg_rating?: number;
  review_count?: number;
  material?: string;
  stock?: number;
  is_featured?: boolean;
  wash_instructions?: string;
  created_date?: string;
  updated_date?: string;
  metaTitle?: string;
  metaDescription?: string;
  focusKeyword?: string;
  canonicalUrl?: string;
  robotsIndex?: boolean;
  robotsFollow?: boolean;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  twitterTitle?: string;
  twitterDescription?: string;
  twitterImage?: string;
  schemaType?: string;
  customSchema?: string;
};

export type Category = {
  id: string;
  name?: string;
  title: string;
  title_en?: string;
  slug?: string;
  parent_id?: string;
  image?: string;
  sort_order?: number;
  order?: number;
  is_active?: boolean;
  created_date?: string;
  updated_date?: string;
  metaTitle?: string;
  metaDescription?: string;
  focusKeyword?: string;
  canonicalUrl?: string;
};

export type OrderItem = {
  product_id?: string;
  product_name?: string;
  title?: string;
  product_image?: string;
  image?: string;
  color?: string;
  size?: string;
  cup?: string;
  sku?: string;
  variant_id?: string;
  product_variant_id?: string;
  quantity: number;
  price: number;
};

export type Order = {
  id: string;
  user_email?: string;
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
  total: number;
  total_amount?: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | string;
  payment_status: 'unpaid' | 'paid' | 'refunded' | string;
  shipping_address?: string;
  tracking_number?: string;
  tracking_code?: string;
  created_date?: string;
  updated_date?: string;
};

export type SiteSetting = {
  id: string;
  key: string;
  value: string;
  type: 'text' | 'image' | string;
};

export type ReviewStatus = 'pending' | 'approved' | 'rejected' | string;

export type Review = {
  id: string;
  product_id: string;
  user_name?: string;
  user_email?: string;
  rating: number;
  comment?: string;
  is_verified_purchase?: boolean;
  purchased_color?: string;
  purchased_size?: string;
  purchased_cup?: string;
  status?: ReviewStatus;
  admin_reply?: string;
  images?: string[];
  created_date?: string;
  updated_date?: string;
};

export type Address = {
  id: string;
  user_email: string;
  full_name: string;
  phone: string;
  province?: string;
  city?: string;
  address: string;
  postal_code?: string;
  unit?: string;
  notes?: string;
  is_default?: boolean;
  label?: string;
  text?: string;
  created_date?: string;
  updated_date?: string;
};

export type CartItem = {
  id?: string;
  key?: string;
  product_id: string;
  product_name?: string;
  product_image?: string;
  color?: string;
  size?: string;
  cup?: string;
  sku?: string;
  price: number;
  quantity: number;
  user_email?: string;
  title?: string;
  image?: string;
  original_price?: number;
  variant_id?: string;
  product_variant_id?: string;
};

export type ReturnRequest = {
  id: string;
  user_email: string;
  order_id: string;
  order_number?: string;
  product_name?: string;
  reason: 'defective' | 'wrong_item' | 'size_issue' | 'changed_mind' | 'other' | string;
  description?: string;
  status?: 'submitted' | 'reviewing' | 'approved' | 'rejected' | 'refunded' | 'exchanged' | string;
  created_date?: string;
  updated_date?: string;
};

export type ProductAttribute = {
  id: string;
  type: 'size' | 'color' | 'cup' | string;
  name: string;
  value?: string;
  created_date?: string;
  updated_date?: string;
};

export type Wishlist = {
  id: string;
  user_email: string;
  product_id: string;
  product_name?: string;
  product_image?: string;
  product_slug?: string;
  price?: number;
  created_date?: string;
  updated_date?: string;
};
