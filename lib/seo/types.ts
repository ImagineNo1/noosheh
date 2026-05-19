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

export type RedirectStatusCode = 301 | 302 | 307 | 308 | 410;

export type RedirectRecord = {
  id: string;
  fromPath: string;
  toPath?: string;
  statusCode: RedirectStatusCode;
  isActive: boolean;
  hitCount: number;
  lastHitAt?: string;
  createdBy?: string;
  notes?: string;
  created_date: string;
  updated_date: string;
};

export type NotFoundLogRecord = {
  id: string;
  path: string;
  referrer?: string;
  userAgent?: string;
  ipHash?: string;
  hitCount: number;
  firstSeenAt: string;
  lastSeenAt: string;
  resolved: boolean;
  redirectId?: string;
  created_date: string;
  updated_date: string;
};

export type SeoSettingRecord = {
  id: string;
  siteName?: string;
  siteDescription?: string;
  defaultMetaTitle?: string;
  defaultMetaDescription?: string;
  defaultOgImage?: string;
  titleSeparator?: string;
  metaTemplates?: Record<string, string>;
  robotsRules?: { userAgent: string; allow?: string[]; disallow?: string[] }[];
  sitemapSettings?: { includeProducts?: boolean; includeCategories?: boolean; includePages?: boolean };
  organizationSchema?: Record<string, unknown>;
  socialProfiles?: string[];
  defaultRobots?: RobotsDirectives;
  created_date: string;
  updated_date: string;
};
