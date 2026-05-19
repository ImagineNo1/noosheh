export type SeoEntityType =
  | 'Product'
  | 'ProductCategory'
  | 'Brand'
  | 'BlogPost'
  | 'BlogCategory'
  | 'BlogTag'
  | 'Page'
  | 'HomePage'
  | 'Author'
  | 'StaticPage'
  | 'SearchPage'
  | 'LandingPage';

export type RobotsDirectives = {
  index: boolean;
  follow: boolean;
  noarchive?: boolean;
  nosnippet?: boolean;
  noimageindex?: boolean;
};

export type SeoMetaRecord = {
  id: string;
  entityType: SeoEntityType;
  entityId: string;
  metaTitle?: string;
  metaDescription?: string;
  focusKeyword?: string;
  secondaryKeywords?: string[];
  canonicalUrl?: string;
  robots?: RobotsDirectives;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  ogType?: string;
  twitterTitle?: string;
  twitterDescription?: string;
  twitterImage?: string;
  twitterCard?: 'summary' | 'summary_large_image';
  breadcrumbTitle?: string;
  schemaType?: string;
  customSchema?: Record<string, unknown> | null;
  seoScore?: number;
  readabilityScore?: number;
  warnings?: string[];
  suggestions?: string[];
  created_date: string;
  updated_date: string;
};
