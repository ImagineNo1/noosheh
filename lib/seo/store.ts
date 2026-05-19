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
  return (await getCollection('seo_meta')).find({}).sort({ updated_date: -1 }).toArray();
}
export async function createSeoMeta(data: AnyRecord) {
  const collection = await getCollection('seo_meta');
  const record = { ...data, id: randomUUID(), created_date: now(), updated_date: now() };
  await collection.insertOne(record);
  return record;
}
export async function analyze404(path: string, referrer?: string, userAgent?: string) {
  const collection = await getCollection('not_found_logs');
  await collection.updateOne({ path }, { $setOnInsert: { id: randomUUID(), firstSeenAt: now(), resolved: false }, $set: { referrer, userAgent, lastSeenAt: now(), updated_date: now() }, $inc: { hitCount: 1 } }, { upsert: true });
}
