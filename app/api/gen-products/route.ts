import { NextResponse } from 'next/server';
import { createEntity, listEntity } from '@/lib/admin-store';
import type { Category, Product, ProductAttribute, Review } from '@/app/admin/types';

const BRANDS = ['NOOSHEH', 'Ariana', 'Luna', 'Velvet', 'Mira', 'Triumph'];
const COLLECTIONS = ['بهار ۱۴۰۵', 'Daily Comfort', 'Premium Lace', 'Soft Basics', 'Bridal Edit', 'New Season'];
const PRODUCT_TYPES = ['bra', 'underwear', 'set', 'sleepwear', 'lounge', 'bodysuit'];
const BADGES = ['new', 'sale', 'best_seller', 'limited'] as const;
const SIZES = ['65', '70', '75', '80', '85', '90', '95', 'XS', 'S', 'M', 'L', 'XL'];
const CUPS = ['A', 'B', 'C', 'D', 'E'];
const MATERIALS = ['پنبه نرم', 'تور لطیف', 'ساتن براق', 'مودال تنفس‌پذیر', 'میکروفایبر سبک', 'گیپور ظریف'];
const COLORS = [
  { name: 'کرم', value: 'cream', hex: '#e8d6c4' },
  { name: 'مشکی', value: 'black', hex: '#111111' },
  { name: 'رز', value: 'rose', hex: '#d9a0a6' },
  { name: 'نود', value: 'nude', hex: '#d6ad8e' },
  { name: 'سفید', value: 'white', hex: '#faf7f1' },
  { name: 'موکا', value: 'mocha', hex: '#8b6258' },
  { name: 'زرشکی', value: 'burgundy', hex: '#970f35' }
];

const CATEGORY_SEEDS = [
  { title: 'لباس زیر', name: 'لباس زیر', slug: 'lingerie', image: '/store/noosheh-cat-lingerie.png', order: 1 },
  { title: 'سوتین', name: 'سوتین', slug: 'bra', image: '/store/noosheh-cat-bra.png', order: 2 },
  { title: 'ست زنانه', name: 'ست زنانه', slug: 'sets', image: '/store/noosheh-cat-underwear.png', order: 3 },
  { title: 'لباس خواب', name: 'لباس خواب', slug: 'sleepwear', image: '/store/noosheh-cat-sleepwear.png', order: 4 },
  { title: 'لباس راحتی', name: 'لباس راحتی', slug: 'lounge', image: '/store/noosheh-cat-lounge.png', order: 5 },
  { title: 'جوراب و لگ', name: 'جوراب و لگ', slug: 'socks', image: '/store/noosheh-cat-socks.png', order: 6 }
];

const PRODUCT_IMAGES = [
  '/store/noosheh-cat-bra.png',
  '/store/noosheh-cat-lingerie.png',
  '/store/noosheh-cat-underwear.png',
  '/store/noosheh-cat-sleepwear.png',
  '/store/noosheh-cat-lounge.png',
  '/store/cat-bra.png',
  '/store/cat-underwear.png',
  '/store/cat-sleepwear.png'
];

const REVIEW_NAMES = ['سارا احمدی', 'نگار رضایی', 'مریم نوری', 'الهام کریمی', 'رها محمدی', 'آتنا حسینی'];

const rnd = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;
const pick = <T,>(arr: T[]) => arr[rnd(0, arr.length - 1)];

function makeSlug(input: string) {
  return input.toLowerCase().replace(/[^\w\u0600-\u06FF]+/g, '-').replace(/(^-|-$)/g, '');
}

function productTitle(type: string, material: string, color: string, index: number) {
  const labels: Record<string, string> = {
    bra: 'سوتین',
    underwear: 'شورت زنانه',
    set: 'ست لباس زیر',
    sleepwear: 'لباس خواب',
    lounge: 'لباس راحتی',
    bodysuit: 'بادی زنانه'
  };
  return `${labels[type] || 'محصول'} ${material} ${color} مدل ${index + 1}`;
}

function categoryForType(type: string, categories: string[]) {
  const byType: Record<string, string> = {
    bra: 'سوتین',
    underwear: 'لباس زیر',
    set: 'ست زنانه',
    sleepwear: 'لباس خواب',
    lounge: 'لباس راحتی',
    bodysuit: 'لباس زیر'
  };
  const preferred = byType[type];
  return categories.includes(preferred) ? preferred : categories[0] || 'لباس زیر';
}

function generateProduct(index: number, categories: string[]): Partial<Product> {
  const type = pick(PRODUCT_TYPES);
  const material = pick(MATERIALS);
  const productColors = [...COLORS].sort(() => Math.random() - 0.5).slice(0, rnd(3, 5));
  const primaryColor = productColors[0];
  const title = productTitle(type, material, primaryColor.name, index);
  const slug = makeSlug(`${title}-${Date.now()}-${index}`);
  const basePrice = rnd(490000, 2290000);
  const hasDiscount = Math.random() > 0.42;
  const discountPrice = hasDiscount ? Math.round(basePrice * (1 - rnd(10, 24) / 100)) : undefined;
  const hasCup = type === 'bra' || type === 'set' || type === 'bodysuit';
  const sizes = [...SIZES].sort(() => Math.random() - 0.5).slice(0, rnd(5, 8));
  const cups = hasCup ? [...CUPS].sort(() => Math.random() - 0.5).slice(0, rnd(3, 5)) : [];
  const images = [
    PRODUCT_IMAGES[index % PRODUCT_IMAGES.length],
    PRODUCT_IMAGES[(index + 2) % PRODUCT_IMAGES.length],
    PRODUCT_IMAGES[(index + 4) % PRODUCT_IMAGES.length]
  ];

  const variants = productColors.flatMap((color) =>
    sizes.flatMap((size) =>
      (hasCup ? cups : ['']).map((cup) => {
        const stock = rnd(2, 18);
        return {
          id: crypto.randomUUID(),
          product_variant_id: crypto.randomUUID(),
          color: color.name,
          size,
          cup: cup || undefined,
          sku: `${slug}-${color.value}-${size}${cup ? `-${cup}` : ''}`.toUpperCase(),
          price: basePrice,
          discount_price: discountPrice,
          compare_at_price: hasDiscount ? basePrice : undefined,
          inventory: stock,
          stock,
          is_available: stock > 0,
          image: images[0]
        };
      })
    )
  );

  const reviewCount = rnd(8, 120);
  const rating = Number((4 + Math.random()).toFixed(1));
  const category = categoryForType(type, categories);

  return {
    title,
    name: title,
    code: slug,
    slug,
    brand: pick(BRANDS),
    short_description: `${material} با فرم راحت، مناسب استفاده روزمره و استایل ظریف نوشه.`,
    description: `<p>${title} برای تجربه‌ای نرم، خوش‌فرم و مطمئن طراحی شده است. این محصول فیک برای نمایش کامل فروشگاه، فیلترها، SEO، واریانت‌ها و تجربه خرید ساخته شده است.</p>`,
    price: basePrice,
    discount_price: discountPrice,
    compare_at_price: hasDiscount ? basePrice : undefined,
    category,
    collection: pick(COLLECTIONS),
    tags: [type, material, primaryColor.name, 'نوشه', 'demo'],
    cover_image: images[0],
    images,
    colors: productColors.map((color) => color.value),
    color_swatches: productColors.map((color, sort_order) => ({ ...color, slug: color.value, sort_order, is_active: true, active: true })),
    sizes,
    has_cup_option: hasCup,
    has_cup: hasCup,
    cups,
    cup_size: cups[0] || '',
    variants,
    details: 'بند قابل تنظیم، دوخت نرم، فرم مناسب زیر لباس و طراحی مناسب استفاده طولانی.',
    product_details: 'بند قابل تنظیم، دوخت نرم، فرم مناسب زیر لباس و طراحی مناسب استفاده طولانی.',
    size_fit: 'فیت استاندارد دارد. اگر بین دو سایز هستید، سایز بزرگ‌تر را انتخاب کنید.',
    size_and_fit: 'فیت استاندارد دارد. اگر بین دو سایز هستید، سایز بزرگ‌تر را انتخاب کنید.',
    fabric_care: `${material}. شستشو با آب سرد، خشک‌کردن در سایه و اتوکشی مستقیم ممنوع.`,
    fabric_and_care: `${material}. شستشو با آب سرد، خشک‌کردن در سایه و اتوکشی مستقیم ممنوع.`,
    shipping_returns: 'ارسال سریع، بسته‌بندی محرمانه و امکان تعویض سایز طبق قوانین فروشگاه.',
    shipping_and_returns: 'ارسال سریع، بسته‌بندی محرمانه و امکان تعویض سایز طبق قوانین فروشگاه.',
    faq: 'این داده برای تست فروشگاه ساخته شده است. موجودی، رنگ، سایز و کاپ به صورت دمو کامل شده‌اند.',
    wash_instructions: 'با دست و آب سرد شسته شود. از سفیدکننده استفاده نشود.',
    features: ['پارچه لطیف و تنفس‌پذیر', 'مناسب استفاده روزمره', 'بسته‌بندی محرمانه', 'چند رنگ و چند سایز'],
    badges: [hasDiscount ? 'sale' : pick([...BADGES])],
    complete_the_look_enabled: true,
    complete_the_look_ids: [],
    similar_product_ids: [],
    complete_the_look: [],
    similar_products: [],
    is_active: true,
    is_featured: index % 6 === 0,
    product_type: type,
    material,
    stock: variants.reduce((sum, item) => sum + (item.stock || 0), 0),
    weight: rnd(120, 420),
    avg_rating: rating,
    review_count: reviewCount
  };
}

async function seedCategories() {
  const existing = await listEntity('categories', '-created_date', '300') as Category[];
  const existingSlugs = new Set(existing.map((item) => item.slug));
  const created = [];
  for (const category of CATEGORY_SEEDS) {
    if (existingSlugs.has(category.slug)) continue;
    created.push(await createEntity('categories', { ...category, title_en: category.slug, is_active: true, sort_order: category.order }));
  }
  return created;
}

async function seedAttributes() {
  const attributes: Array<Partial<ProductAttribute>> = [
    ...SIZES.map((value) => ({ type: 'size', name: value, value })),
    ...CUPS.map((value) => ({ type: 'cup', name: value, value })),
    ...COLORS.map((color) => ({ type: 'color', name: color.name, value: color.hex }))
  ];
  const created = [];
  for (const attribute of attributes) created.push(await createEntity('product_attributes', attribute));
  return created;
}

async function seedProducts(count = 50) {
  const categories = await listEntity('categories', '-created_date', '300') as Category[];
  const categoryNames = categories.map((category) => category.title || category.name || '').filter(Boolean);
  const created = [];
  for (let i = 0; i < count; i += 1) {
    const product = generateProduct(i, categoryNames.length ? categoryNames : CATEGORY_SEEDS.map((item) => item.title));
    const record = await createEntity('products', product);
    created.push(record);
  }
  return created;
}

async function seedReviews(products: Array<any>) {
  const created = [];
  for (const product of products.slice(0, 20)) {
    const count = rnd(2, 5);
    for (let i = 0; i < count; i += 1) {
      const variant = pick<any>(product.variants || [{}]);
      const review: Partial<Review> = {
        product_id: product.id,
        user_name: pick(REVIEW_NAMES),
        user_email: `demo-${crypto.randomUUID().slice(0, 8)}@noosheh.test`,
        rating: rnd(4, 5),
        comment: pick([
          'کیفیت و بسته‌بندی خیلی خوب بود، سایز هم مطابق راهنما انتخاب شد.',
          'برای استفاده روزمره راحت است و رنگ محصول شبیه عکس بود.',
          'ارسال سریع انجام شد و بسته‌بندی محرمانه بود.',
          'جنس لطیفی دارد و بعد از شستشو فرم خودش را حفظ کرد.'
        ]),
        is_verified_purchase: true,
        purchased_color: variant.color,
        purchased_size: variant.size,
        purchased_cup: variant.cup,
        status: 'approved',
        admin_reply: 'نوش جانتان؛ خوشحالیم که از خریدتان راضی بودید.',
        images: []
      };
      created.push(await createEntity('reviews', review));
    }
  }
  return created;
}

async function seedBlog() {
  const stamp = Date.now();
  const blogCategories = [
    { name: 'راهنمای خرید', slug: `buying-guide-${stamp}`, description: 'راهنمای انتخاب سایز، جنس و مدل مناسب', color: '#970f35' },
    { name: 'استایل و مراقبت', slug: `style-care-${stamp}`, description: 'نکات نگهداری و ست کردن محصولات', color: '#8b6258' }
  ];
  const createdCategories = [];
  for (const category of blogCategories) createdCategories.push(await createEntity('blog_categories', category));

  const posts = [
    {
      title: 'چطور سایز مناسب سوتین را انتخاب کنیم؟',
      slug: `bra-size-guide-${stamp}`,
      excerpt: 'راهنمای ساده برای انتخاب سایز و کاپ مناسب قبل از خرید آنلاین.',
      content: '<p>برای انتخاب بهتر، دور زیر سینه و دور برجسته‌ترین قسمت سینه را اندازه بگیرید و با جدول سایزبندی محصول مقایسه کنید.</p><p>اگر بین دو سایز هستید، برای استفاده روزمره معمولا انتخاب راحت‌تر نتیجه بهتری دارد.</p>',
      cover_image: '/store/noosheh-cat-bra.png',
      category: 'راهنمای خرید',
      tags: ['سایز', 'سوتین', 'راهنمای خرید'],
      author_name: 'تیم نوشه',
      status: 'published',
      view_count: rnd(80, 420)
    },
    {
      title: 'نگهداری لباس زیر ظریف و گیپور',
      slug: `lace-care-${stamp}`,
      excerpt: 'چند نکته کوتاه برای حفظ فرم، رنگ و لطافت لباس زیر.',
      content: '<p>لباس‌های ظریف را با آب سرد و شوینده ملایم بشویید. خشک‌کردن در سایه باعث حفظ رنگ و لطافت پارچه می‌شود.</p>',
      cover_image: '/store/noosheh-cat-lingerie.png',
      category: 'استایل و مراقبت',
      tags: ['مراقبت', 'گیپور', 'شستشو'],
      author_name: 'تیم نوشه',
      status: 'published',
      view_count: rnd(80, 420)
    },
    {
      title: 'برای هدیه دادن چه مدل‌هایی امن‌تر هستند؟',
      slug: `gift-guide-${stamp}`,
      excerpt: 'انتخاب‌هایی که برای هدیه شیک، کاربردی و کم‌ریسک‌تر هستند.',
      content: '<p>ست‌های راحتی، لباس خواب ساتن و اکسسوری‌های لطیف معمولا برای هدیه دادن انتخاب‌های امن‌تری هستند.</p>',
      cover_image: '/store/noosheh-cat-gift.png',
      category: 'راهنمای خرید',
      tags: ['هدیه', 'لباس خواب', 'ست'],
      author_name: 'تیم نوشه',
      status: 'published',
      view_count: rnd(80, 420)
    }
  ];
  const createdPosts = [];
  for (const post of posts) createdPosts.push(await createEntity('blog_posts', post));
  return { categories: createdCategories, posts: createdPosts };
}

async function seedSettings() {
  const siteSettings = await createEntity('settings', { site_name: 'نوشه', site_description: 'فروشگاه پریمیوم لباس زیر و پوشاک راحتی زنانه' });
  const seoSettings = await createEntity('seo_settings', {
    site_name: 'نوشه',
    site_description: 'خرید لباس زیر، لباس خواب و پوشاک راحتی زنانه با بسته‌بندی محرمانه و ارسال سریع.',
    site_url: process.env.NEXT_PUBLIC_SITE_URL || 'https://noosheh.com',
    default_og_image: '/store/noosheh-hero-editorial.png',
    title_separator: '|',
    robots_txt: 'User-agent: *\nAllow: /\nDisallow: /admin\nDisallow: /api\nSitemap: https://noosheh.com/sitemap.xml'
  });
  return { siteSettings, seoSettings };
}

export async function POST(request: Request) {
  const payload = await request.json().catch(() => ({}));
  const mode = payload?.mode || 'products';
  const count = Number(payload?.count || 50);

  if (mode === 'full') {
    const categories = await seedCategories();
    const attributes = await seedAttributes();
    const products = await seedProducts(Math.max(20, Math.min(80, count)));
    const reviews = await seedReviews(products);
    const blog = await seedBlog();
    const settings = await seedSettings();
    return NextResponse.json({
      message: 'Demo store data created successfully',
      mode,
      counts: {
        categories: categories.length,
        attributes: attributes.length,
        products: products.length,
        reviews: reviews.length,
        blog_categories: blog.categories.length,
        blog_posts: blog.posts.length,
        settings: 2
      },
      settings
    });
  }

  const products = await seedProducts(Math.max(1, Math.min(100, count)));
  return NextResponse.json({ message: `${products.length} products created successfully`, mode, count: products.length, ids: products.map((item) => item.id) });
}
