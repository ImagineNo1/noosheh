import { NextResponse } from 'next/server';
import { createEntity, listEntity } from '@/lib/admin-store';
import type { Category } from '@/app/admin/types';

const BRANDS = ['Noosheh', 'Luna', 'Velvet', 'Ariana', 'Mira'];
const COLLECTIONS = ['Spring 2026', 'Essentials', 'Premium', 'Daily Comfort', 'Active'];
const PRODUCT_TYPES = ['bra', 'underwear', 'set', 'top', 'bodysuit'];
const BADGES = ['new', 'sale', 'final_sale', 'best_seller', 'limited'] as const;
const SIZES = ['XS', 'S', 'M', 'L', 'XL'];
const CUPS = ['A', 'B', 'C', 'D'];
const COLORS = [
  { name: 'Black', hex: '#111111' },
  { name: 'White', hex: '#F5F5F5' },
  { name: 'Nude', hex: '#D2A679' },
  { name: 'Rose', hex: '#C66B7C' },
  { name: 'Navy', hex: '#1D3557' }
];

const rnd = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;
const pick = <T,>(arr: T[]) => arr[rnd(0, arr.length - 1)];

function makeSlug(input: string) {
  return input.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

function generateProduct(index: number, categories: string[]) {
  const type = pick(PRODUCT_TYPES);
  const name = `${type.toUpperCase()} Model ${index + 1}`;
  const slug = makeSlug(`${name}-${Date.now()}-${index}`);
  const basePrice = rnd(450000, 1950000);
  const hasDiscount = Math.random() > 0.35;
  const compareAt = hasDiscount ? basePrice + rnd(80000, 300000) : 0;
  const hasCup = type === 'bra' || type === 'set';
  const productColors = [...COLORS].sort(() => Math.random() - 0.5).slice(0, rnd(2, 4));
  const sizes = SIZES.slice(0, rnd(3, 5));

  const variants = productColors.flatMap((color) =>
    sizes.flatMap((size) =>
      (hasCup ? CUPS.slice(0, rnd(2, 4)) : ['']).map((cup) => ({
        id: crypto.randomUUID(),
        color: color.name,
        size,
        cup: cup || undefined,
        sku: `${slug}-${color.name}-${size}${cup ? `-${cup}` : ''}`.toUpperCase(),
        price: basePrice,
        compare_at_price: compareAt || undefined,
        inventory: rnd(2, 30),
        stock: rnd(2, 30),
        is_available: true,
        image: `https://picsum.photos/seed/${slug}-${color.name}-${size}${cup}/900/1200`
      }))
    )
  );

  const firstImage = `https://picsum.photos/seed/${slug}-cover/900/1200`;

  return {
    title: name,
    name,
    code: slug,
    slug,
    brand: pick(BRANDS),
    short_description: `Comfortable ${type} for everyday use.`,
    description: `Generated fake product #${index + 1} with complete details for testing catalog flows.`,
    price: basePrice,
    discount_price: hasDiscount ? basePrice : 0,
    compare_at_price: compareAt || undefined,
    category: categories.length ? pick(categories) : 'General',
    collection: pick(COLLECTIONS),
    tags: [type, 'generated', pick(['soft', 'daily', 'premium', 'light'])],
    cover_image: firstImage,
    images: [firstImage, `https://picsum.photos/seed/${slug}-2/900/1200`, `https://picsum.photos/seed/${slug}-3/900/1200`],
    colors: productColors.map((c) => c.name),
    color_swatches: productColors.map((c, idx) => ({ name: c.name, hex: c.hex, slug: makeSlug(c.name), sort_order: idx, is_active: true })),
    sizes,
    has_cup_option: hasCup,
    has_cup: hasCup,
    cups: hasCup ? CUPS : [],
    cup_size: hasCup ? 'B' : '',
    variants,
    details: 'Soft support, adjustable straps, and seamless fit.',
    product_details: 'Soft support, adjustable straps, and seamless fit.',
    size_fit: 'Fits true to size. Choose your normal size.',
    size_and_fit: 'Fits true to size. Choose your normal size.',
    fabric_care: 'Hand wash cold, do not bleach, line dry.',
    fabric_and_care: 'Hand wash cold, do not bleach, line dry.',
    shipping_returns: 'Ships in 2-4 days. Return within 7 days.',
    shipping_and_returns: 'Ships in 2-4 days. Return within 7 days.',
    faq: 'This is fake generated content used for QA and demo.',
    wash_instructions: 'Hand wash cold, do not tumble dry.',
    features: ['Breathable fabric', 'Comfort fit', 'Colorfast material'],
    badges: [pick([...BADGES])],
    complete_the_look_enabled: true,
    complete_the_look_ids: [],
    similar_product_ids: [],
    is_active: true,
    is_featured: Math.random() > 0.8,
    product_type: type,
    material: pick(['Cotton', 'Modal', 'Polyamide', 'Lace blend']),
    stock: variants.reduce((sum, item) => sum + (item.stock || 0), 0),
    weight: rnd(120, 420),
    avg_rating: Number((Math.random() * 2 + 3).toFixed(1)),
    review_count: rnd(0, 120)
  };
}

export async function POST() {
  const categories = await listEntity('categories', '-created_date', '200') as Category[];
  const categoryNames = categories.map((c) => c.title || c.name || '').filter(Boolean);
  const created = [];
  for (let i = 0; i < 50; i += 1) {
    const product = generateProduct(i, categoryNames);
    const record = await createEntity('products', product);
    created.push(record.id);
  }
  return NextResponse.json({ message: '50 products created successfully', count: created.length, ids: created });
}
