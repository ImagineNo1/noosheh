export const fallbackBlogImages = [
  '/store/noosheh-hero-editorial.png',
  '/store/hero-boutique.png',
  '/store/noosheh-cat-lingerie.png',
  '/store/noosheh-cat-sleepwear.png',
  '/store/noosheh-cat-lounge.png',
  '/store/noosheh-cat-gift.png'
];

export function getBlogImage(post: any, index = 0) {
  return post?.cover_image || fallbackBlogImages[index % fallbackBlogImages.length];
}

export function formatBlogDate(value?: string) {
  if (!value) return 'بدون تاریخ';
  return new Date(value).toLocaleDateString('fa-IR', { day: 'numeric', month: 'long', year: 'numeric' });
}

export function getReadingTime(post: any) {
  const source = `${post?.content || ''} ${post?.excerpt || ''}`.replace(/<[^>]+>/g, ' ');
  const words = source.trim().split(/\s+/).filter(Boolean).length;
  const minutes = Math.max(3, Math.ceil(words / 180));
  return `${minutes.toLocaleString('fa-IR')} دقیقه مطالعه`;
}

export function getPostCategory(post: any) {
  return post?.category || 'مجله نوشه';
}
