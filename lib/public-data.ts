import { cache } from 'react';
import type { Product } from '@/app/admin/types';
import { listEntity, type EntityName } from '@/lib/admin-store';
import { getSiteSettings } from '@/lib/site-settings';
import { normalizeStorefrontProducts } from '@/lib/product-normalization';

export const getCachedSiteSettings = cache(getSiteSettings);

export const listCachedEntity = cache(async (entity: EntityName, sort?: string | null, limit?: string | null) => {
  return listEntity(entity, sort, limit);
});

export const listCachedProducts = cache(async (sort = '-created_date', limit = '100') => {
  const products = await listEntity('products', sort, limit).catch(() => [] as Product[]);
  return normalizeStorefrontProducts(products as Product[]);
});
