import { promises as fs } from 'fs';
import path from 'path';

const filePath = path.join(process.cwd(), 'public', 'uploads', 'blog-db.json');

type DB = { posts: any[]; categories: any[]; tags: any[]; comments: any[] };
const initial: DB = { posts: [], categories: [], tags: [], comments: [] };

async function ensure() {
  try { await fs.access(filePath); } catch { await fs.writeFile(filePath, JSON.stringify(initial, null, 2)); }
}
export async function readDB(): Promise<DB> { await ensure(); return JSON.parse(await fs.readFile(filePath, 'utf8')); }
export async function writeDB(db: DB) { await fs.writeFile(filePath, JSON.stringify(db, null, 2)); }
export function applyFilter(items: any[], filter: Record<string, any> = {}) { return items.filter(i => Object.entries(filter).every(([k,v]) => JSON.stringify(i[k])===JSON.stringify(v))); }
export function applySort(items: any[], sort?: string) { if(!sort) return items; const desc=sort.startsWith('-'); const key=desc?sort.slice(1):sort; return [...items].sort((a,b)=> ((a[key]??'')>(b[key]??'')?1:-1)*(desc?-1:1)); }
