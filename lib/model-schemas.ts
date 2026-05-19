export const modelSchemas = {
  Address: {
    name: 'Address',
    type: 'object',
    properties: {
      user_email: { type: 'string' },
      full_name: { type: 'string' },
      phone: { type: 'string' },
      province: { type: 'string' },
      city: { type: 'string' },
      address: { type: 'string' },
      postal_code: { type: 'string' },
      unit: { type: 'string' },
      notes: { type: 'string' },
      is_default: { type: 'boolean', default: false }
    },
    required: ['user_email', 'full_name', 'phone', 'address']
  },
  CartItem: {
    name: 'CartItem',
    type: 'object',
    properties: {
      product_id: { type: 'string', description: 'Product ID' },
      product_name: { type: 'string' },
      product_image: { type: 'string' },
      color: { type: 'string' },
      size: { type: 'string' },
      cup: { type: 'string' },
      sku: { type: 'string' },
      price: { type: 'number' },
      quantity: { type: 'number', default: 1 },
      user_email: { type: 'string' }
    },
    required: ['product_id', 'quantity', 'price']
  },
  Category: {
    name: 'Category',
    type: 'object',
    properties: {
      name: { type: 'string' },
      slug: { type: 'string' },
      parent_id: { type: 'string' },
      image: { type: 'string' },
      sort_order: { type: 'number', default: 0 },
      is_active: { type: 'boolean', default: true }
    },
    required: ['name']
  },
  Order: {
    name: 'Order',
    type: 'object',
    properties: {
      user_email: { type: 'string' },
      items: { type: 'array', items: { type: 'object' } },
      total: { type: 'number' },
      status: { type: 'string', enum: ['pending', 'processing', 'shipped', 'delivered', 'cancelled'], default: 'pending' },
      shipping_address: { type: 'string' },
      tracking_number: { type: 'string' }
    },
    required: ['items', 'total']
  },

  ProductAttribute: {
    name: 'ProductAttribute',
    type: 'object',
    properties: {
      type: { type: 'string', enum: ['size', 'color', 'cup'] },
      name: { type: 'string' },
      value: { type: 'string' }
    },
    required: ['type', 'name']
  },
  Product: {
    name: 'Product',
    type: 'object',
    properties: {
      name: { type: 'string', description: 'Product name' },
      slug: { type: 'string', description: 'URL-friendly slug' },
      brand: { type: 'string', description: 'Brand name' },
      short_description: { type: 'string', description: 'Short description' },
      description: { type: 'string', description: 'Full product description (rich text)' },
      price: { type: 'number', description: 'Base price in Rial' },
      compare_at_price: { type: 'number', description: 'Original price before discount' },
      category: { type: 'string', description: 'Product category' },
      collection: { type: 'string', description: 'Product collection' },
      tags: { type: 'array', items: { type: 'string' }, description: 'Product tags for filtering' },
      cover_image: { type: 'string', description: 'Main cover image URL' },
      images: { type: 'array', description: 'General product images', items: { type: 'object' } },
      colors: { type: 'array', description: 'Available colors', items: { type: 'object' } },
      sizes: { type: 'array', description: 'Available sizes', items: { type: 'string' } },
      has_cup: { type: 'boolean', description: 'Whether product has cup selection (e.g. bra)', default: false },
      cups: { type: 'array', description: 'Available cup sizes', items: { type: 'string' } },
      variants: { type: 'array', description: 'Product variants (color+size+cup combinations)', items: { type: 'object' } },
      product_details: { type: 'string', description: 'Product details tab content' },
      size_and_fit: { type: 'string', description: 'Size & fit guide content' },
      fabric_and_care: { type: 'string', description: 'Fabric & care content' },
      shipping_and_returns: { type: 'string', description: 'Shipping & returns info' },
      faq: { type: 'string', description: 'FAQ content' },
      features: { type: 'array', description: 'Bullet point features', items: { type: 'string' } },
      badges: { type: 'array', description: 'Product badges', items: { type: 'string', enum: ['new', 'sale', 'final_sale', 'best_seller', 'limited'] } },
      complete_the_look: { type: 'array', description: 'Related product IDs for Complete the Look', items: { type: 'string' } },
      similar_products: { type: 'array', description: 'Similar product IDs (manual)', items: { type: 'string' } },
      complete_the_look_enabled: { type: 'boolean', default: true },
      is_active: { type: 'boolean', default: true },
      product_type: { type: 'string', description: 'Type like bra, underwear, clothing etc.' },
      weight: { type: 'number', description: 'Product weight in grams' },
      avg_rating: { type: 'number', description: 'Average rating', default: 0 },
      review_count: { type: 'number', description: 'Total reviews count', default: 0 }
    },
    required: ['name', 'price']
  },
  ReturnRequest: {
    name: 'ReturnRequest',
    type: 'object',
    properties: {
      user_email: { type: 'string' },
      order_id: { type: 'string' },
      order_number: { type: 'string' },
      product_name: { type: 'string' },
      reason: { type: 'string', enum: ['defective', 'wrong_item', 'size_issue', 'changed_mind', 'other'] },
      description: { type: 'string' },
      status: { type: 'string', enum: ['submitted', 'reviewing', 'approved', 'rejected', 'refunded', 'exchanged'], default: 'submitted' }
    },
    required: ['user_email', 'order_id', 'reason']
  },
  Review: {
    name: 'Review',
    type: 'object',
    properties: {
      product_id: { type: 'string', description: 'Product ID' },
      user_name: { type: 'string' },
      user_email: { type: 'string' },
      rating: { type: 'number', description: '1-5 stars' },
      comment: { type: 'string' },
      is_verified_purchase: { type: 'boolean', default: false },
      purchased_color: { type: 'string' },
      purchased_size: { type: 'string' },
      purchased_cup: { type: 'string' },
      status: { type: 'string', enum: ['pending', 'approved', 'rejected'], default: 'pending' },
      admin_reply: { type: 'string' },
      images: { type: 'array', items: { type: 'string' } }
    },
    required: ['product_id', 'rating']
  },

  SiteSettings: {
    name: 'SiteSettings',
    type: 'object',
    properties: {
      site_name: { type: 'string' },
      site_description: { type: 'string' }
    },
    required: []
  },
  SeoSettings: {
    name: 'SeoSettings',
    type: 'object',
    properties: {
      site_name: { type: 'string' },
      site_description: { type: 'string' },
      site_url: { type: 'string' },
      default_og_image: { type: 'string' },
      title_separator: { type: 'string', default: '|' },
      title_template_product: { type: 'string', default: '%product_title% | خرید با بهترین قیمت | %site_name%' },
      title_template_category: { type: 'string', default: 'خرید %category_name% | قیمت و مشخصات | %site_name%' },
      title_template_brand: { type: 'string', default: 'محصولات %brand_name% | %site_name%' },
      title_template_home: { type: 'string', default: '%site_name% | %site_description%' },
      desc_template_product: { type: 'string', default: 'خرید %product_title% با قیمت مناسب، مشخصات کامل، نظرات کاربران و ارسال سریع از %site_name%.' },
      desc_template_category: { type: 'string', default: 'مشاهده و خرید انواع %category_name% با بهترین قیمت و کیفیت از %site_name%.' },
      robots_disallow: { type: 'array', items: { type: 'string' }, default: ['/admin', '/api', '/cart', '/checkout', '/account'] },
      robots_txt: { type: 'string' },
      google_analytics_id: { type: 'string' },
      google_search_console: { type: 'string' },
      instagram_url: { type: 'string' },
      twitter_handle: { type: 'string' },
      organization_name: { type: 'string' },
      organization_logo: { type: 'string' },
      organization_phone: { type: 'string' },
      organization_address: { type: 'string' }
    },
    required: []
  },
  SeoMeta: {
    name: 'SeoMeta',
    type: 'object',
    properties: {
      entity_type: { type: 'string', enum: ['product', 'category', 'brand', 'page', 'home'] },
      entity_id: { type: 'string' },
      meta_title: { type: 'string' },
      meta_description: { type: 'string' },
      focus_keyword: { type: 'string' },
      secondary_keywords: { type: 'array', items: { type: 'string' } },
      canonical_url: { type: 'string' },
      robots_index: { type: 'boolean', default: true },
      robots_follow: { type: 'boolean', default: true },
      robots_noarchive: { type: 'boolean', default: false },
      robots_nosnippet: { type: 'boolean', default: false },
      og_title: { type: 'string' },
      og_description: { type: 'string' },
      og_image: { type: 'string' },
      og_type: { type: 'string', default: 'website' },
      twitter_title: { type: 'string' },
      twitter_description: { type: 'string' },
      twitter_image: { type: 'string' },
      twitter_card: { type: 'string', default: 'summary_large_image' },
      schema_type: { type: 'string' },
      custom_schema: { type: 'string' },
      seo_score: { type: 'number', default: 0 },
      readability_score: { type: 'number', default: 0 },
      seo_warnings: { type: 'array', items: { type: 'string' } },
      seo_suggestions: { type: 'array', items: { type: 'string' } }
    },
    required: ['entity_type']
  },
  Redirect: {
    name: 'Redirect',
    type: 'object',
    properties: { from_path: { type: 'string' }, to_path: { type: 'string' }, status_code: { type: 'number', default: 301 }, is_active: { type: 'boolean', default: true }, hit_count: { type: 'number', default: 0 }, notes: { type: 'string' } },
    required: ['from_path', 'to_path']
  },
  NotFoundLog: {
    name: 'NotFoundLog',
    type: 'object',
    properties: { path: { type: 'string' }, hit_count: { type: 'number', default: 1 }, resolved: { type: 'boolean', default: false }, referrer: { type: 'string' }, first_seen_at: { type: 'string' }, last_seen_at: { type: 'string' } },
    required: ['path']
  },
  Wishlist: {
    name: 'Wishlist',
    type: 'object',
    properties: {
      user_email: { type: 'string' },
      product_id: { type: 'string' },
      product_name: { type: 'string' },
      product_image: { type: 'string' },
      product_slug: { type: 'string' },
      price: { type: 'number' }
    },
    required: ['user_email', 'product_id']
  }
} as const;

export type ModelName = keyof typeof modelSchemas;

type AnyRecord = Record<string, any>;

const entityToModel = {
  products: 'Product',
  orders: 'Order',
  categories: 'Category',
  settings: 'SiteSettings',
  reviews: 'Review',
  users: 'User',
  addresses: 'Address',
  cart_items: 'CartItem',
  return_requests: 'ReturnRequest',
  wishlists: 'Wishlist',
  product_attributes: 'ProductAttribute',
  seo_settings: 'SeoSettings',
  seo_meta: 'SeoMeta',
  redirects: 'Redirect',
  not_found_logs: 'NotFoundLog'
} as const;

const aliases: Record<string, Record<string, string>> = {
  Product: {
    title: 'name',
    color_swatches: 'colors',
    has_cup_option: 'has_cup',
    details: 'product_details',
    size_fit: 'size_and_fit',
    fabric_care: 'fabric_and_care',
    shipping_returns: 'shipping_and_returns',
    complete_the_look_ids: 'complete_the_look',
    similar_product_ids: 'similar_products'
  },
  Category: { title: 'name', order: 'sort_order' },
  Order: { total_amount: 'total', tracking_code: 'tracking_number', customer_email: 'user_email' },
  CartItem: { title: 'product_name', image: 'product_image' }
};

function isEmptyRequiredValue(value: unknown) {
  return value === undefined || value === null || value === '' || (Array.isArray(value) && value.length === 0);
}

export function getModelNameForEntity(entity: string): ModelName | null {
  const modelName = entityToModel[entity as keyof typeof entityToModel];
  return modelName && modelName in modelSchemas ? modelName as ModelName : null;
}

export function normalizeEntityForModel(entity: string, input: AnyRecord, options: { partial?: boolean } = {}) {
  const modelName = getModelNameForEntity(entity);
  if (!modelName) return { record: { ...input }, errors: [] as string[] };

  const schema = modelSchemas[modelName];
  const record: AnyRecord = { ...input };
  const modelAliases = aliases[modelName] || {};

  for (const [legacyKey, modelKey] of Object.entries(modelAliases)) {
    if (record[modelKey] === undefined && record[legacyKey] !== undefined) record[modelKey] = record[legacyKey];
  }

  for (const [key, config] of Object.entries(schema.properties)) {
    if (!options.partial && record[key] === undefined && 'default' in config) record[key] = config.default;
  }

  if (modelName === 'ProductAttribute') {
    record.value = record.value || record.name || '';
  }

  if (modelName === 'Product') {
    record.title = record.title || record.name || '';
    record.name = record.name || record.title || '';
    record.color_swatches = record.color_swatches || record.colors || [];
    record.colors = record.colors || record.color_swatches || [];
    record.has_cup_option = record.has_cup_option ?? record.has_cup ?? false;
    record.has_cup = record.has_cup ?? record.has_cup_option ?? false;
    record.details = record.details ?? record.product_details;
    record.product_details = record.product_details ?? record.details;
    record.size_fit = record.size_fit ?? record.size_and_fit;
    record.size_and_fit = record.size_and_fit ?? record.size_fit;
    record.fabric_care = record.fabric_care ?? record.fabric_and_care;
    record.fabric_and_care = record.fabric_and_care ?? record.fabric_care;
    record.shipping_returns = record.shipping_returns ?? record.shipping_and_returns;
    record.shipping_and_returns = record.shipping_and_returns ?? record.shipping_returns;
    record.complete_the_look_ids = record.complete_the_look_ids || record.complete_the_look || [];
    record.complete_the_look = record.complete_the_look || record.complete_the_look_ids || [];
    record.similar_product_ids = record.similar_product_ids || record.similar_products || [];
    record.similar_products = record.similar_products || record.similar_product_ids || [];
    const normalizedImages = Array.isArray(record.images)
      ? record.images.map((image: AnyRecord | string) => typeof image === 'string' ? image : image?.url).filter(Boolean)
      : [];
    record.images = normalizedImages;
    record.cover_image = record.cover_image || normalizedImages[0] || '';
  }

  if (modelName === 'Category') {
    record.title = record.title || record.name || '';
    record.name = record.name || record.title || '';
    record.order = record.order ?? record.sort_order ?? 0;
    record.sort_order = record.sort_order ?? record.order ?? 0;
  }

  if (modelName === 'Order') {
    record.total_amount = record.total_amount ?? record.total ?? 0;
    record.total = record.total ?? record.total_amount ?? 0;
    record.tracking_code = record.tracking_code ?? record.tracking_number;
    record.tracking_number = record.tracking_number ?? record.tracking_code;
    record.user_email = record.user_email || record.customer_email || '';
    record.items = Array.isArray(record.items) ? record.items.map((item: AnyRecord) => ({
      ...item,
      product_name: item.product_name || item.title || '',
      title: item.title || item.product_name || '',
      product_image: item.product_image || item.image || '',
      image: item.image || item.product_image || ''
    })) : [];
  }

  if (modelName === 'CartItem') {
    record.quantity = record.quantity ?? 1;
    record.product_name = record.product_name || record.title || '';
    record.product_image = record.product_image || record.image || '';
    record.title = record.title || record.product_name || '';
    record.image = record.image || record.product_image || '';
  }

  if (modelName === 'Review') {
    record.status = record.status || 'pending';
    record.images = Array.isArray(record.images) ? record.images : [];
  }

  if (modelName === 'ReturnRequest') record.status = record.status || 'submitted';
  if (modelName === 'Address') record.is_default = Boolean(record.is_default);

  const errors = options.partial ? [] : schema.required.filter((key) => isEmptyRequiredValue(record[key])).map((key) => `${schema.name}.${key} is required`);
  return { record, errors };
}
