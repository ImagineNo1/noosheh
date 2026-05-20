import { randomUUID } from 'crypto';
import { MongoClient } from 'mongodb';
import { hashPassword } from '@/lib/password';
import { normalizeEntityForModel } from '@/lib/model-schemas';
import { analyzeSeoContent, generateAutoSeoMeta } from '@/lib/seo/seoHelpers';

export type EntityName = 'products' | 'orders' | 'categories' | 'settings' | 'reviews' | 'users' | 'addresses' | 'cart_items' | 'return_requests' | 'wishlists' | 'product_attributes' | 'seo_settings' | 'seo_meta' | 'redirects' | 'not_found_logs' | 'blog_posts' | 'blog_categories' | 'blog_tags' | 'blog_pages' | 'blog_comments' | 'blog_media' | 'blog_revisions';

export const entityMap = {
  Product: 'products',
  Order: 'orders',
  Category: 'categories',
  SiteSettings: 'settings',
  Review: 'reviews',
  Address: 'addresses',
  CartItem: 'cart_items',
  ReturnRequest: 'return_requests',
  Wishlist: 'wishlists',
  ProductAttribute: 'product_attributes',
  SeoSettings: 'seo_settings',
  SeoMeta: 'seo_meta',
  Redirect: 'redirects',
  NotFoundLog: 'not_found_logs',
  BlogPost: 'blog_posts',
  BlogCategory: 'blog_categories',
  BlogTag: 'blog_tags',
  BlogPage: 'blog_pages',
  BlogComment: 'blog_comments',
  BlogMedia: 'blog_media',
  BlogRevision: 'blog_revisions'
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
  updateOne?: (filter: AnyRecord, update: AnyRecord) => Promise<unknown>;
  createIndex?: (keys: AnyRecord, options?: AnyRecord) => Promise<unknown>;
  deleteOne: (filter: AnyRecord) => Promise<{ deletedCount?: number }>;
};

const now = () => new Date().toISOString();

const initialDatabase: Record<EntityName, AnyRecord[]> = {
  categories: [],
  products: [],
  orders: [],
  settings: [],
  reviews: [],
  users: [],
  addresses: [],
  cart_items: [],
  return_requests: [],
  wishlists: [],
  product_attributes: [],
  seo_settings: [],
  seo_meta: [],
  redirects: [],
  not_found_logs: [],
  blog_posts: [
    { id: randomUUID(), title: 'راهنمای انتخاب سایز مناسب لباس زیر', slug: 'size-guide-1405', excerpt: 'راهنمای کاربردی انتخاب سایز', content: '<p>متن نمونه مقاله</p>', cover_image: 'https://images.unsplash.com/photo-1469334031218-e382a71b716b?q=80&w=1200&auto=format&fit=crop', category: 'آموزش', tags: ['سایز','راهنما'], author_name: 'تیم نوشه', status: 'published', view_count: 234, created_date: now(), updated_date: now() },
    { id: randomUUID(), title: 'ترندهای لباس زیر زنانه در سال ۱۴۰۵', slug: 'trend-1405', excerpt: 'نگاهی به ترندها', content: '<p>متن نمونه مقاله</p>', cover_image: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?q=80&w=1200&auto=format&fit=crop', category: 'مد و فشن', tags: ['ترند','۱۴۰۵'], author_name: 'تیم نوشه', status: 'published', view_count: 189, created_date: now(), updated_date: now() }
  ],
  blog_categories: [
    { id: randomUUID(), name: 'آموزش', slug: 'learning', created_date: now(), updated_date: now() },
    { id: randomUUID(), name: 'مد و فشن', slug: 'fashion', created_date: now(), updated_date: now() },
    { id: randomUUID(), name: 'سلامت و زیبایی', slug: 'health-beauty', created_date: now(), updated_date: now() }
  ],
  blog_tags: [],
  blog_pages: [],
  blog_comments: [],
  blog_media: [],
  blog_revisions: []
};

let mongoClientPromise: Promise<any> | null = null;

let bootstrapPromise: Promise<void> | null = null;

async function ensureBootstrapData(client: any) {
  if (bootstrapPromise) return bootstrapPromise;
  bootstrapPromise = (async () => {
    const db = client.db();
    await Promise.all((Object.values(entityMap) as EntityName[]).concat('users').map(async (entity) => {
      const collectionName = `noosheh_${entity}`;
      const exists = await db.listCollections({ name: collectionName }, { nameOnly: true }).toArray();
      if (!exists.length) await db.createCollection(collectionName);
    }));



async function ensureBlogIndexes(db: any) {
  const posts = db.collection('noosheh_blog_posts') as MongoCollection;
  const categories = db.collection('noosheh_blog_categories') as MongoCollection;
  const tags = db.collection('noosheh_blog_tags') as MongoCollection;
  const pages = db.collection('noosheh_blog_pages') as MongoCollection;
  const comments = db.collection('noosheh_blog_comments') as MongoCollection;

  if (posts.createIndex) {
    await posts.createIndex({ slug: 1 }, { unique: true });
    await posts.createIndex({ status: 1, publish_at: -1 });
    await posts.createIndex({ title: 'text', excerpt: 'text', content: 'text' });
    await posts.createIndex({ deleted_at: 1 });
  }
  if (categories.createIndex) await categories.createIndex({ slug: 1 }, { unique: true });
  if (tags.createIndex) await tags.createIndex({ slug: 1 }, { unique: true });
  if (pages.createIndex) {
    await pages.createIndex({ slug: 1 }, { unique: true });
    await pages.createIndex({ status: 1, publish_at: -1 });
  }
  if (comments.createIndex) {
    await comments.createIndex({ post_id: 1, status: 1, created_date: -1 });
    await comments.createIndex({ parent_id: 1 });
  }
}

    const usersCollection = db.collection('noosheh_users') as MongoCollection;
    const productsCollection = db.collection('noosheh_products') as MongoCollection;
    const userCount = await usersCollection.countDocuments({});
    const productCount = await productsCollection.countDocuments({});
    await ensureBlogIndexes(db);

    if (userCount === 0 && productCount === 0) {
      await usersCollection.insertOne({
        id: randomUUID(),
        name: 'Admin',
        email: 'admin',
        password_hash: hashPassword('admin'),
        role: 'admin',
        created_date: now(),
        updated_date: now()
      });
    }
  })().catch((error) => {
    bootstrapPromise = null;
    throw error;
  });
  return bootstrapPromise;
}


function stripMongoId(record: AnyRecord) {
  const { _id, ...rest } = record;
  return rest;
}

async function getMongoCollection(entity: EntityName): Promise<MongoCollection | null> {
  if (!process.env.MONGODB_URI) return null;
  try {
    if (!mongoClientPromise) {
      const client = new MongoClient(process.env.MONGODB_URI, { serverSelectionTimeoutMS: 5000 });
      mongoClientPromise = client.connect();
    }
    const client = await mongoClientPromise;
    await ensureBootstrapData(client);
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

export async function checkMongoHealth(): Promise<{ ok: boolean; error?: string }> {
  if (!process.env.MONGODB_URI) {
    return { ok: false, error: 'MONGODB_URI is not configured' };
  }
  try {
    if (!mongoClientPromise) {
      const client = new MongoClient(process.env.MONGODB_URI, { serverSelectionTimeoutMS: 5000 });
      mongoClientPromise = client.connect();
    }
    const client = await mongoClientPromise;
    await client.db().command({ ping: 1 });
    return { ok: true };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'MongoDB connection failed';
    return { ok: false, error: message };
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

function variantStockTotal(product: AnyRecord) {
  return Array.isArray(product.variants) ? product.variants.reduce((sum: number, variant: AnyRecord) => sum + Number(variant.stock ?? variant.inventory ?? 0), 0) : 0;
}

function normalizeProductVariants(record: AnyRecord) {
  if (!Array.isArray(record.variants)) record.variants = [];
  record.variants = record.variants.map((variant: AnyRecord) => {
    const id = variant.id || variant.product_variant_id || [record.id, variant.color || 'default', variant.size || 'default', variant.cup || ''].join('-');
    const stock = Number(variant.stock ?? variant.inventory ?? 0);
    return { ...variant, id, product_variant_id: id, stock, inventory: stock };
  });
  record.stock = variantStockTotal(record);
  return record;
}

async function ensureOrderedVariantStock(order: AnyRecord) {
  if (!Array.isArray(order.items) || !order.items.length) return;
  const collection = await getRequiredMongoCollection('products');
  for (const item of order.items) {
    const productId = item.product_id;
    const variantId = item.product_variant_id || item.variant_id;
    if (!productId || !variantId) continue;
    const products = await collection.find({ id: productId }).sort({ created_date: -1 }).limit(1).toArray();
    const product = products[0];
    const variant = product?.variants?.find((variant: AnyRecord) => (variant.id || variant.product_variant_id) === variantId);
    if (!variant) throw new Error('VARIANT_NOT_FOUND');
    if (variant.is_available === false || Number(variant.stock ?? variant.inventory ?? 0) < Number(item.quantity || 0)) throw new Error('OUT_OF_STOCK');
  }
}

async function decrementOrderedVariantStock(order: AnyRecord) {
  if (!Array.isArray(order.items) || !order.items.length) return;
  const collection = await getRequiredMongoCollection('products');
  for (const item of order.items) {
    const productId = item.product_id;
    const variantId = item.product_variant_id || item.variant_id;
    if (!productId || !variantId) continue;
    const products = await collection.find({ id: productId }).sort({ created_date: -1 }).limit(1).toArray();
    const product = products[0];
    if (!product || !Array.isArray(product.variants)) continue;
    const quantity = Math.max(0, Number(item.quantity) || 0);
    let changed = false;
    const variants = product.variants.map((variant: AnyRecord) => {
      const id = variant.id || variant.product_variant_id;
      if (id !== variantId) return variant;
      const nextStock = Math.max(0, Number(variant.stock ?? variant.inventory ?? 0) - quantity);
      changed = true;
      return { ...variant, id, product_variant_id: id, stock: nextStock, inventory: nextStock };
    });
    if (changed && collection.updateOne) await collection.updateOne({ id: productId }, { $set: { variants, stock: variantStockTotal({ variants }), updated_date: now() } });
  }
}

export async function createEntity(entity: EntityName, data: AnyRecord) {
  const normalized = normalizeEntityForModel(entity, data);
  if (normalized.errors.length) throw new Error(`VALIDATION:${normalized.errors.join(', ')}`);
  const record = entity === 'products' ? normalizeProductVariants({ ...normalized.record, id: data.id || randomUUID(), created_date: data.created_date || now(), updated_date: now() }) : { ...normalized.record, id: data.id || randomUUID(), created_date: data.created_date || now(), updated_date: now() };
  if (entity === 'orders') await ensureOrderedVariantStock(record);
  const collection = await getRequiredMongoCollection(entity);
  await collection.insertOne(record);
  await ensureEntitySeoMeta(entity, record);
  if (entity === 'orders') await decrementOrderedVariantStock(record);
  return record;
}

export async function updateEntity(entity: EntityName, id: string, data: AnyRecord) {
  const normalized = normalizeEntityForModel(entity, data, { partial: true });
  const collection = await getRequiredMongoCollection(entity);
  const updateRecord = entity === 'products' ? normalizeProductVariants({ ...normalized.record, id }) : normalized.record;
  const result = await collection.findOneAndUpdate({ id }, { $set: { ...updateRecord, id, updated_date: now() } }, { returnDocument: 'after' });
  const record = result && 'value' in result ? result.value : result;
  if (record) await ensureEntitySeoMeta(entity, stripMongoId(record as AnyRecord));
  return record ? stripMongoId(record as AnyRecord) : null;
}

async function ensureEntitySeoMeta(entity: EntityName, record: AnyRecord) {
  const entityTypeMap: Partial<Record<EntityName, string>> = {
    products: 'product',
    blog_posts: 'blog_post',
    blog_categories: 'blog_category',
    blog_tags: 'blog_tag',
    blog_pages: 'blog_page',
    categories: 'category'
  };
  const entityType = entityTypeMap[entity];
  if (!entityType || !record?.id) return;

  const seoCollection = await getRequiredMongoCollection('seo_meta');
  const siteUrl = await resolveSeoSiteUrl();
  const auto = generateAutoSeoMeta({ entity: record, entityType, siteUrl });
  const existingRecords = await seoCollection.find({ entity_type: entityType, entity_id: record.id }).sort({ created_date: -1 }).limit(1).toArray();
  const existing = existingRecords[0] ? stripMongoId(existingRecords[0]) : null;

  const merged = {
    ...(existing || {}),
    ...auto,
    entity_type: entityType,
    entity_id: record.id,
    seo_warnings: analyzeSeoContent({ entity: record, seoMeta: { ...(existing || {}), ...auto }, entityType }).warnings
  };

  if (existing?.id) {
    await seoCollection.findOneAndUpdate({ id: existing.id }, { $set: { ...merged, updated_date: now() } }, { returnDocument: 'after' });
    return;
  }
  await seoCollection.insertOne({ ...merged, id: randomUUID(), created_date: now(), updated_date: now() });
}

async function resolveSeoSiteUrl() {
  const settingsCollection = await getRequiredMongoCollection('seo_settings');
  const settings = await settingsCollection.find({}).sort({ updated_date: -1, created_date: -1 }).limit(1).toArray();
  const siteUrl = String(settings[0]?.site_url || process.env.NEXT_PUBLIC_SITE_URL || '').trim();
  return siteUrl.replace(/\/$/, '');
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

export async function updateUserPassword(email: string, password_hash: string): Promise<boolean> {
  const normalized = email.trim().toLowerCase();
  const collection = await getRequiredMongoCollection('users');
  const result = await collection.findOneAndUpdate({ email: normalized }, { $set: { password_hash, updated_date: now() } }, { returnDocument: 'after' });
  return Boolean(result && ('value' in result ? result.value : result));
}

export async function ensureDefaultAdminUser(): Promise<UserRecord | null> {
  const collection = await getRequiredMongoCollection('users');
  const admins = await collection.find({ role: 'admin' }).sort({ created_date: -1 }).limit(1).toArray();
  if (admins.length > 0) return null;
  return createUser({ name: 'Admin', email: 'admin', password_hash: hashPassword('admin'), role: 'admin' });
}
