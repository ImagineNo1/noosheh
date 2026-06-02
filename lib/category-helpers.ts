import type { Category } from '@/app/admin/types';
import { categoryPath } from '@/lib/seo/schema';

export type CategoryNode = Category & {
  children: CategoryNode[];
  href: string;
  displayTitle: string;
};

const fallbackImages = [
  '/store/noosheh-cat-lingerie.png',
  '/store/noosheh-cat-bra.png',
  '/store/noosheh-cat-underwear.png',
  '/store/noosheh-cat-sleepwear.png',
  '/store/noosheh-cat-lounge.png',
  '/store/noosheh-cat-socks.png',
  '/store/noosheh-cat-accessories.png',
  '/store/noosheh-cat-gift.png'
];

export const fallbackStoreCategories: Category[] = [
  { id: 'fallback-lingerie', title: 'لباس زیر', name: 'لباس زیر', slug: 'lingerie', image: fallbackImages[0], sort_order: 10, order: 10, is_active: true, show_in_header: true, show_on_home: true, is_featured: true },
  { id: 'fallback-bra', title: 'سوتین', name: 'سوتین', slug: 'bra', parent_id: 'fallback-lingerie', image: fallbackImages[1], sort_order: 20, order: 20, is_active: true, show_in_header: true, show_on_home: true, is_featured: true },
  { id: 'fallback-underwear', title: 'شورت', name: 'شورت', slug: 'underwear', parent_id: 'fallback-lingerie', image: fallbackImages[2], sort_order: 30, order: 30, is_active: true, show_in_header: true, show_on_home: true, is_featured: true },
  { id: 'fallback-sets', title: 'ست زنانه', name: 'ست زنانه', slug: 'sets', image: fallbackImages[3], sort_order: 40, order: 40, is_active: true, show_in_header: true, show_on_home: true, is_featured: true },
  { id: 'fallback-sleepwear', title: 'لباس خواب', name: 'لباس خواب', slug: 'sleepwear', image: fallbackImages[3], sort_order: 50, order: 50, is_active: true, show_in_header: true, show_on_home: true, is_featured: true },
  { id: 'fallback-lounge', title: 'خانگی و راحتی', name: 'خانگی و راحتی', slug: 'lounge', image: fallbackImages[4], sort_order: 60, order: 60, is_active: true, show_in_header: true, show_on_home: true, is_featured: true },
  { id: 'fallback-socks', title: 'جوراب و لگ', name: 'جوراب و لگ', slug: 'socks', image: fallbackImages[5], sort_order: 70, order: 70, is_active: true, show_in_header: true, show_on_home: true, is_featured: true },
  { id: 'fallback-accessories', title: 'اکسسوری', name: 'اکسسوری', slug: 'accessories', image: fallbackImages[6], sort_order: 80, order: 80, is_active: true, show_in_header: true, show_on_home: true, is_featured: true }
];

function orderOf(category: Category) {
  return Number(category.sort_order ?? category.order ?? 0);
}

function titleOf(category: Category) {
  return category.menu_title || category.homepage_title || category.title || category.name || category.slug || 'دسته بندی';
}

function normalizeCategory(category: Category, index = 0): CategoryNode {
  const safe = {
    ...category,
    id: category.id || category.slug || `category-${index}`,
    title: category.title || category.name || category.slug || 'دسته بندی',
    name: category.name || category.title || category.slug || 'دسته بندی',
    image: category.image || fallbackImages[index % fallbackImages.length]
  };
  return {
    ...safe,
    children: [],
    href: categoryPath(safe),
    displayTitle: titleOf(safe)
  };
}

export function activeCategories(categories: Category[] = []) {
  const source = categories.some((category) => category.is_active !== false) ? categories : fallbackStoreCategories;
  return source.filter((category) => category.is_active !== false).sort((a, b) => orderOf(a) - orderOf(b) || titleOf(a).localeCompare(titleOf(b), 'fa'));
}

export function buildCategoryTree(categories: Category[] = []) {
  const nodes = activeCategories(categories).map(normalizeCategory);
  const byId = new Map(nodes.map((node) => [node.id, node]));
  const roots: CategoryNode[] = [];

  nodes.forEach((node) => {
    const parent = node.parent_id ? byId.get(node.parent_id) : null;
    if (parent && parent.id !== node.id) parent.children.push(node);
    else roots.push(node);
  });

  return roots.map((root) => ({
    ...root,
    children: [...root.children].sort((a, b) => orderOf(a) - orderOf(b) || a.displayTitle.localeCompare(b.displayTitle, 'fa'))
  }));
}

export function headerCategories(categories: Category[] = []) {
  const configured = activeCategories(categories).filter((category) => category.show_in_header !== false);
  return buildCategoryTree(configured.length ? configured : categories);
}

export function homepageCategories(categories: Category[] = [], limit = 8) {
  const active = activeCategories(categories);
  const selected = active.filter((category) => category.show_on_home || category.is_featured);
  return (selected.length ? selected : active).slice(0, limit).map(normalizeCategory);
}
