import { randomUUID } from 'crypto';
import { MongoClient } from 'mongodb';

type AnyRecord = Record<string, any>;
let mongoClientPromise: Promise<MongoClient> | null = null;

function now() { return new Date().toISOString(); }

async function getCollection(name: string) {
  if (!process.env.MONGODB_URI) throw new Error('MONGODB_URI is not configured');
  if (!mongoClientPromise) {
    mongoClientPromise = new MongoClient(process.env.MONGODB_URI, { serverSelectionTimeoutMS: 5000 }).connect();
  }
  const client = await mongoClientPromise;
  const db = client.db();
  const collection = db.collection(`noosheh_${name}`);
  await collection.createIndex({ id: 1 }, { unique: true });
  return collection;
}

export async function listSeoMeta() {
  const collection = await getCollection('seo_meta');
  await collection.createIndex({ entityType: 1, entityId: 1 }, { unique: true });
  return collection.find({ deleted_at: { $exists: false } }).sort({ updated_date: -1 }).toArray();
}
export async function createSeoMeta(data: AnyRecord) {
  const collection = await getCollection('seo_meta');
  const record = { ...data, id: randomUUID(), created_date: now(), updated_date: now() };
  await collection.insertOne(record);
  return record;
}
export async function getSeoMetaById(id: string) {
  return (await getCollection('seo_meta')).findOne({ id, deleted_at: { $exists: false } });
}
export async function updateSeoMeta(id: string, data: AnyRecord) {
  return (await getCollection('seo_meta')).findOneAndUpdate({ id }, { $set: { ...data, updated_date: now() } }, { returnDocument: 'after' });
}
export async function deleteSeoMeta(id: string) {
  const result = await (await getCollection('seo_meta')).findOneAndUpdate({ id }, { $set: { deleted_at: now(), updated_date: now() } }, { returnDocument: 'after' });
  return !!result;
}
export async function analyze404(path: string, referrer?: string, userAgent?: string) {
  const collection = await getCollection('not_found_logs');
  await collection.createIndex({ path: 1 }, { unique: true });
  await collection.updateOne({ path }, { $setOnInsert: { id: randomUUID(), firstSeenAt: now(), resolved: false, created_date: now() }, $set: { referrer, userAgent, lastSeenAt: now(), updated_date: now() }, $inc: { hitCount: 1 } }, { upsert: true });
}

export async function listRedirects() {
  const collection = await getCollection('redirects');
  await collection.createIndex({ fromPath: 1 }, { unique: true });
  return collection.find({}).sort({ updated_date: -1 }).toArray();
}

export async function createRedirect(data: AnyRecord) {
  const collection = await getCollection('redirects');
  await collection.createIndex({ fromPath: 1 }, { unique: true });
  const fromPath = String(data.fromPath).toLowerCase();
  const toPath = data.toPath ? String(data.toPath).toLowerCase() : undefined;
  const record = { ...data, fromPath, toPath, id: randomUUID(), hitCount: 0, isActive: data.isActive ?? true, created_date: now(), updated_date: now() };
  await collection.insertOne(record);
  return record;
}

export async function updateRedirect(id: string, data: AnyRecord) {
  const collection = await getCollection('redirects');
  const fromPath = data.fromPath ? String(data.fromPath).toLowerCase() : undefined;
  const toPath = data.toPath ? String(data.toPath).toLowerCase() : undefined;
  const updateData = { ...data, ...(fromPath ? { fromPath } : {}), ...(data.toPath ? { toPath } : {}) };
  const result = await collection.findOneAndUpdate({ id }, { $set: { ...updateData, updated_date: now() } }, { returnDocument: 'after' });
  return result;
}

export async function deleteRedirect(id: string) {
  const collection = await getCollection('redirects');
  const result = await collection.deleteOne({ id });
  return (result.deletedCount ?? 0) > 0;
}

export async function listNotFoundLogs() {
  const collection = await getCollection('not_found_logs');
  return collection.find({}).sort({ hitCount: -1, lastSeenAt: -1 }).toArray();
}

export async function resolveNotFound(id: string, redirectId?: string) {
  const collection = await getCollection('not_found_logs');
  const result = await collection.findOneAndUpdate({ id }, { $set: { resolved: true, redirectId, updated_date: now() } }, { returnDocument: 'after' });
  return result;
}

export async function getSeoSettings() {
  const collection = await getCollection('seo_settings');
  const settings = await collection.find({}).sort({ updated_date: -1 }).limit(1).toArray();
  return settings[0] || null;
}

export async function upsertSeoSettings(data: AnyRecord) {
  const collection = await getCollection('seo_settings');
  const existing = await getSeoSettings();
  if (existing) {
    const result = await collection.findOneAndUpdate({ id: existing.id }, { $set: { ...data, updated_date: now() } }, { returnDocument: 'after' });
    return result;
  }
  const record = { ...data, id: randomUUID(), created_date: now(), updated_date: now() };
  await collection.insertOne(record);
  return record;
}
