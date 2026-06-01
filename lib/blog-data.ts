export type BlogPost = {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  category: string;
  tags: string[];
  authorName: string;
  createdDate: string;
  viewCount: number;
  coverImage?: string;
};

export const blogCategories = ["راهنما", "آموزشی", "محصول", "کسب‌وکار"];

export const blogPosts: BlogPost[] = [
  {
    id: "1",
    slug: "tea-brewing-basics",
    title: "راهنمای کامل دم‌آوری چای برای فروشگاه‌های تخصصی",
    excerpt: "در این مقاله با اصول انتخاب دما، زمان دم‌آوری و سرو حرفه‌ای چای آشنا می‌شوید.",
    content:
      "<p>دم‌آوری درست چای یکی از مهم‌ترین بخش‌های تجربه مشتری است...</p><p>برای چای سبز دمای پایین‌تر و برای چای سیاه دمای بالاتر پیشنهاد می‌شود.</p>",
    category: "آموزشی",
    tags: ["چای", "دم‌آوری", "آموزش"],
    authorName: "تیم نوشه",
    createdDate: "2026-04-12",
    viewCount: 328,
  },
  {
    id: "2",
    slug: "summer-menu-ideas",
    title: "ایده‌هایی برای منوی تابستانی کافه",
    excerpt: "چطور یک منوی خنک و جذاب طراحی کنیم که فروش را بالا ببرد؟",
    content: "<p>برای فصل تابستان نوشیدنی‌های سبک با طعم میوه‌ای انتخاب خوبی هستند...</p>",
    category: "محصول",
    tags: ["منو", "تابستان", "فروش"],
    authorName: "مدیر محتوا",
    createdDate: "2026-03-25",
    viewCount: 517,
  },
  {
    id: "3",
    slug: "store-branding-checklist",
    title: "چک‌لیست برندسازی فروشگاه نوشیدنی",
    excerpt: "از طراحی هویت بصری تا لحن ارتباطی برند، این چک‌لیست را از دست ندهید.",
    content: "<p>برندسازی موفق یعنی خلق تجربه یکپارچه در تمام نقاط تماس با مشتری...</p>",
    category: "کسب‌وکار",
    tags: ["برند", "بازاریابی"],
    authorName: "تیم رشد",
    createdDate: "2026-02-18",
    viewCount: 214,
  },
];

export const popularPosts = [...blogPosts]
  .sort((a, b) => b.viewCount - a.viewCount)
  .slice(0, 5);
