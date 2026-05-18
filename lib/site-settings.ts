import type { SiteSetting } from '@/app/admin/types';
import { listEntity } from '@/lib/admin-store';

export type SiteSettingsMap = Record<string, string>;

export async function getSiteSettings(): Promise<SiteSettingsMap> {
  try {
    const settings = await listEntity('settings');
    return Object.fromEntries((settings as SiteSetting[]).map((item) => [item.key, item.value]));
  } catch {
    return {};
  }
}
