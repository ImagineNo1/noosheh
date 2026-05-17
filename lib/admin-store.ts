import { mkdir, readFile, writeFile } from 'fs/promises';
import path from 'path';
import { randomUUID } from 'crypto';

export type EntityName = 'products' | 'orders' | 'categories' | 'settings';

export const entityMap = {
  Product: 'products',
  Order: 'orders',
  Category: 'categories',
  SiteSettings: 'settings'
} as const;

export type ApiEntity = keyof typeof entityMap;

type AnyRecord = Record<string, any>;

type Database = Record<EntityName, AnyRecord[]>;

const dataDir = path.join(process.cwd(), '.data');
const dataFile = path.join(dataDir, 'admin-store.json');

const now = () => new Date().toISOString();

const initialDatabase: Database = {
  categories: [
    {
      id: 'cat-set',
      title: 'کالکشن ست',
      title_en: 'Set Collection',
      slug: 'sets',
      image: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=900&q=80',
      order: 1,
      is_active: true,
      created_date: now(),
      updated_date: now()
    },
    {
      id: 'cat-bra',
      title: 'کالکشن سوتین',
      title_en: 'Bra Collection',
      slug: 'bra',
      image: 'https://images.unsplash.com/photo-1469504512102-900f29606341?auto=format&fit=crop&w=900&q=80',
      order: 2,
      is_active: true,
      created_date: now(),
      updated_date: now()
    }
  ],
  products: [
    {
      id: 'prd-1',
      title: 'ست شورت و سوتین تورگاز',
      code: 'NP-1001',
      price: 1020000,
      discount_price: 0,
      description: 'محصولی لطیف و خوش‌دوخت برای استفاده روزمره.',
      short_description: 'ست لطیف و سبک',
      images: ['https://images.unsplash.com/photo-1512436991641-6745cdb1723f?auto=format&fit=crop&w=900&q=80'],
      category: 'sets',
      collection: 'fantasy',
      sizes: ['75', '80', '85', '90'],
      colors: ['مشکی', 'صورتی'],
      cup_size: 'B',
      material: 'تور و نخ',
      brand: 'نوشه پوش',
      stock: 12,
      is_active: true,
      is_featured: true,
      wash_instructions: 'با آب سرد و شوینده ملایم شسته شود.',
      created_date: now(),
      updated_date: now()
    }
  ],
  orders: [
    {
      id: 'ord-1',
      order_number: 'NO-14040517-001',
      customer_name: 'سارا',
      customer_family: 'محمدی',
      customer_phone: '09120000000',
      customer_email: 'sara@example.com',
      province: 'تهران',
      city: 'تهران',
      address: 'خیابان ولیعصر، پلاک ۱۲',
      postal_code: '1234567890',
      notes: '',
      items: [
        {
          title: 'ست شورت و سوتین تورگاز',
          image: 'https://images.unsplash.com/photo-1512436991641-6745cdb1723f?auto=format&fit=crop&w=900&q=80',
          quantity: 1,
          price: 1020000,
          size: '80'
        }
      ],
      total_amount: 1020000,
      status: 'pending',
      payment_status: 'paid',
      tracking_code: '',
      created_date: now(),
      updated_date: now()
    }
  ],
  settings: [
    { id: 'set-phone', key: 'phone', value: '021-00000000', type: 'text', created_date: now(), updated_date: now() },
    { id: 'set-free-shipping', key: 'free_shipping_min', value: '1500000', type: 'text', created_date: now(), updated_date: now() },
    { id: 'set-about', key: 'about_text', value: 'نوشه پوش، ترکیب زیبایی، کیفیت و تجربه خرید مطمئن است.', type: 'text', created_date: now(), updated_date: now() }
  ]
};

async function readDatabase(): Promise<Database> {
  try {
    const raw = await readFile(dataFile, 'utf8');
    const parsed = JSON.parse(raw);
    return { ...initialDatabase, ...parsed };
  } catch {
    await mkdir(dataDir, { recursive: true });
    await writeFile(dataFile, JSON.stringify(initialDatabase, null, 2));
    return initialDatabase;
  }
}

async function writeDatabase(database: Database) {
  await mkdir(dataDir, { recursive: true });
  await writeFile(dataFile, JSON.stringify(database, null, 2));
}

export function resolveEntity(entity: string): EntityName | null {
  return (entityMap as Record<string, EntityName>)[entity] ?? null;
}

function sortRecords(records: AnyRecord[], sort?: string | null, limit?: string | null) {
  const sortKey = sort || 'created_date';
  const desc = sortKey.startsWith('-');
  const key = desc ? sortKey.slice(1) : sortKey;
  const sorted = [...records].sort((a, b) => {
    const av = a[key] ?? '';
    const bv = b[key] ?? '';
    if (typeof av === 'number' && typeof bv === 'number') return desc ? bv - av : av - bv;
    return desc ? String(bv).localeCompare(String(av), 'fa') : String(av).localeCompare(String(bv), 'fa');
  });
  const take = Number(limit);
  return Number.isFinite(take) && take > 0 ? sorted.slice(0, take) : sorted;
}

export async function listEntity(entity: EntityName, sort?: string | null, limit?: string | null) {
  const database = await readDatabase();
  return sortRecords(database[entity] ?? [], sort, limit);
}

export async function createEntity(entity: EntityName, data: AnyRecord) {
  const database = await readDatabase();
  const record = {
    ...data,
    id: data.id || randomUUID(),
    created_date: data.created_date || now(),
    updated_date: now()
  };
  database[entity] = [record, ...(database[entity] ?? [])];
  await writeDatabase(database);
  return record;
}

export async function updateEntity(entity: EntityName, id: string, data: AnyRecord) {
  const database = await readDatabase();
  const records = database[entity] ?? [];
  const index = records.findIndex((record) => record.id === id);
  if (index === -1) return null;
  records[index] = { ...records[index], ...data, id, updated_date: now() };
  database[entity] = records;
  await writeDatabase(database);
  return records[index];
}

export async function deleteEntity(entity: EntityName, id: string) {
  const database = await readDatabase();
  const before = database[entity]?.length ?? 0;
  database[entity] = (database[entity] ?? []).filter((record) => record.id !== id);
  await writeDatabase(database);
  return database[entity].length < before;
}
