import { randomUUID } from 'crypto';
import { hashPassword } from '@/lib/password';

export type EntityName = 'products' | 'orders' | 'categories' | 'settings' | 'reviews' | 'users';

export const entityMap = {
  Product: 'products',
  Order: 'orders',
  Category: 'categories',
  SiteSettings: 'settings',
  Review: 'reviews'
} as const;

export type ApiEntity = keyof typeof entityMap;

type AnyRecord = Record<string, any>;

type UserRole = 'user' | 'admin';

export type UserRecord = {
  id: string;
  name?: string;
  email: string;
  password_hash: string;
  role: UserRole;
  created_date: string;
  updated_date: string;
};

type MongoCollection = {
  countDocuments: (filter?: AnyRecord) => Promise<number>;
  insertMany: (records: AnyRecord[], options?: AnyRecord) => Promise<unknown>;
  insertOne: (record: AnyRecord) => Promise<unknown>;
  find: (filter?: AnyRecord) => { sort: (sort: AnyRecord) => { limit: (limit: number) => { toArray: () => Promise<AnyRecord[]> } } };
  findOneAndUpdate: (filter: AnyRecord, update: AnyRecord, options: AnyRecord) => Promise<AnyRecord | { value?: AnyRecord | null } | null>;
  deleteOne: (filter: AnyRecord) => Promise<{ deletedCount?: number }>;
};

const now = () => new Date().toISOString();

const initialDatabase: Record<EntityName, AnyRecord[]> = {
  categories: [{ id: 'cat-set', title: 'کالکشن ست', title_en: 'Set Collection', slug: 'sets', image: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=900&q=80', order: 1, is_active: true, created_date: now(), updated_date: now() }, { id: 'cat-bra', title: 'کالکشن سوتین', title_en: 'Bra Collection', slug: 'bra', image: 'https://images.unsplash.com/photo-1469504512102-900f29606341?auto=format&fit=crop&w=900&q=80', order: 2, is_active: true, created_date: now(), updated_date: now() }],
  products: [{ id: 'prd-1', title: 'ست شورت و سوتین تورگاز', code: 'NP-1001', price: 1020000, discount_price: 860000, description: 'محصولی لطیف و خوش‌دوخت برای استفاده روزمره.', short_description: 'ست لطیف و سبک', images: ['https://images.unsplash.com/photo-1512436991641-6745cdb1723f?auto=format&fit=crop&w=900&q=80'], category: 'sets', collection: 'fantasy', sizes: ['75', '80', '85', '90'], colors: ['مشکی', 'صورتی'], cup_size: 'B', material: 'تور و نخ', brand: 'نوشه پوش', stock: 12, is_active: true, is_featured: true, wash_instructions: 'با آب سرد و شوینده ملایم شسته شود.', created_date: now(), updated_date: now() }],
  orders: [{ id: 'ord-1', order_number: 'NO-14040517-001', customer_name: 'سارا', customer_family: 'محمدی', customer_phone: '09120000000', customer_email: 'sara@example.com', province: 'تهران', city: 'تهران', address: 'خیابان ولیعصر، پلاک ۱۲', postal_code: '1234567890', notes: '', items: [{ product_id: 'prd-1', title: 'ست شورت و سوتین تورگاز', image: 'https://images.unsplash.com/photo-1512436991641-6745cdb1723f?auto=format&fit=crop&w=900&q=80', quantity: 1, price: 1020000, size: '80' }], total_amount: 1020000, discount_amount: 0, shipping_cost: 0, status: 'pending', payment_status: 'paid', tracking_code: '', created_date: now(), updated_date: now() }],
  settings: [{ id: 'set-phone', key: 'phone', value: '021-00000000', type: 'text', created_date: now(), updated_date: now() }, { id: 'set-free-shipping', key: 'free_shipping_min', value: '1500000', type: 'text', created_date: now(), updated_date: now() }, { id: 'set-about', key: 'about_text', value: 'نوشه پوش، ترکیب زیبایی، کیفیت و تجربه خرید مطمئن است.', type: 'text', created_date: now(), updated_date: now() }],
  reviews: [{ id: 'rev-1', product_id: 'prd-1', author_name: 'مریم', rating: 5, comment: 'کیفیت دوخت و لطافت پارچه عالی بود.', is_approved: true, created_date: now(), updated_date: now() }],
  users: []
};

let mongoClientPromise: Promise<any> | null = null;

function stripMongoId(record: AnyRecord) {
  const { _id, ...rest } = record;
  return rest;
}

async function getMongoCollection(entity: EntityName): Promise<MongoCollection | null> {
  if (!process.env.MONGODB_URI) return null;
  try {
    const req = eval('require') as NodeRequire;
    const { MongoClient } = req('mongodb');
    if (!mongoClientPromise) {
      const client = new MongoClient(process.env.MONGODB_URI, { serverSelectionTimeoutMS: 5000 });
      mongoClientPromise = client.connect();
    }
    const client = await mongoClientPromise;
    const collection = client.db().collection(`noosheh_${entity}`) as MongoCollection;
    if ((await collection.countDocuments()) === 0 && initialDatabase[entity].length > 0) {
      await collection.insertMany(initialDatabase[entity].map((record) => ({ ...record })), { ordered: false });
    }
    return collection;
  } catch (error) {
    console.warn('MongoDB connection failed.', error);
    return null;
  }
}

async function getRequiredMongoCollection(entity: EntityName): Promise<MongoCollection> {
  if (!process.env.MONGODB_URI) throw new Error('MONGODB_URI is not configured');
  const collection = await getMongoCollection(entity);
  if (!collection) throw new Error('MongoDB connection failed');
  return collection;
}

export function resolveEntity(entity: string): EntityName | null {
  return (entityMap as Record<string, EntityName>)[entity] ?? null;
}

function sortDescriptor(sort?: string | null) {
  const sortKey = sort || 'created_date';
  const desc = sortKey.startsWith('-');
  const key = desc ? sortKey.slice(1) : sortKey;
  return { key, direction: desc ? -1 : 1 };
}

export async function listEntity(entity: EntityName, sort?: string | null, limit?: string | null) {
  const collection = await getRequiredMongoCollection(entity);
  const { key, direction } = sortDescriptor(sort);
  const take = Number(limit);
  const records = await collection.find({}).sort({ [key]: direction }).limit(Number.isFinite(take) && take > 0 ? take : 0).toArray();
  return records.map(stripMongoId);
}

export async function createEntity(entity: EntityName, data: AnyRecord) {
  const record = { ...data, id: data.id || randomUUID(), created_date: data.created_date || now(), updated_date: now() };
  const collection = await getRequiredMongoCollection(entity);
  await collection.insertOne(record);
  return record;
}

export async function updateEntity(entity: EntityName, id: string, data: AnyRecord) {
  const collection = await getRequiredMongoCollection(entity);
  const result = await collection.findOneAndUpdate({ id }, { $set: { ...data, id, updated_date: now() } }, { returnDocument: 'after' });
  const record = result && 'value' in result ? result.value : result;
  return record ? stripMongoId(record as AnyRecord) : null;
}

export async function deleteEntity(entity: EntityName, id: string) {
  const collection = await getRequiredMongoCollection(entity);
  const result = await collection.deleteOne({ id });
  return (result.deletedCount ?? 0) > 0;
}

export async function countUsers() {
  const collection = await getRequiredMongoCollection('users');
  return collection.countDocuments({});
}

export async function findUserByEmail(email: string): Promise<UserRecord | null> {
  const normalized = email.trim().toLowerCase();
  const collection = await getRequiredMongoCollection('users');
  const users = await collection.find({ email: normalized }).sort({ created_date: -1 }).limit(1).toArray();
  return users[0] ? stripMongoId(users[0]) as UserRecord : null;
}

export async function createUser(data: { name?: string; email: string; password_hash: string; role?: UserRole }): Promise<UserRecord> {
  const existing = await findUserByEmail(data.email);
  if (existing) throw new Error('USER_EXISTS');
  const normalized = data.email.trim().toLowerCase();
  const hasUsers = (await countUsers()) > 0;
  const user: UserRecord = { id: randomUUID(), name: data.name || '', email: normalized, password_hash: data.password_hash, role: data.role || (hasUsers ? 'user' : 'admin'), created_date: now(), updated_date: now() };
  const collection = await getRequiredMongoCollection('users');
  await collection.insertOne(user);
  return user;
}

export async function ensureDefaultAdminUser(): Promise<UserRecord | null> {
  const collection = await getRequiredMongoCollection('users');
  const admins = await collection.find({ role: 'admin' }).limit(1).toArray();
  if (admins.length > 0) return null;
  return createUser({ name: 'Admin', email: 'admin', password_hash: hashPassword('admin'), role: 'admin' });
}
