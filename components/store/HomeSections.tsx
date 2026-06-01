import Image from 'next/image';
import Link from 'next/link';
import type { Product } from '@/app/admin/types';
import type { SiteSettingsMap } from '@/lib/site-settings';
import StaticProductCard from './StaticProductCard';

const heroImage = '/store/noosheh-hero-editorial.png';
const promoSetImage = '/store/noosheh-cat-lounge.png';
const promoGiftImage = '/store/noosheh-cat-gift.png';
const newsletterImage = '/store/noosheh-cat-bra.png';

const categoryCards = [
  { title: 'لباس زیر', href: '/category/lingerie', image: '/store/noosheh-cat-lingerie.png' },
  { title: 'سوتین', href: '/category/bra', image: '/store/noosheh-cat-bra.png' },
  { title: 'شورت', href: '/category/underwear', image: '/store/noosheh-cat-underwear.png' },
  { title: 'ست زنانه', href: '/category/sets', image: '/store/noosheh-cat-sleepwear.png' },
  { title: 'لباس خواب', href: '/category/sleepwear', image: '/store/noosheh-cat-sleepwear.png' },
  { title: 'خانگی و راحتی', href: '/category/lounge', image: '/store/noosheh-cat-lounge.png' },
  { title: 'جوراب و لگ', href: '/category/socks', image: '/store/noosheh-cat-socks.png' },
  { title: 'اکسسوری', href: '/category/accessories', image: '/store/noosheh-cat-accessories.png' }
];

const trustItems = [
  { title: 'ارسال سریع', text: 'برای همه شهرها' },
  { title: 'ضمانت اصالت کالا', text: 'کالای اورجینال' },
  { title: 'تعویض آسان', text: 'تا ۷ روز طبق شرایط' },
  { title: 'پرداخت امن', text: 'درگاه‌های معتبر' },
  { title: 'پشتیبانی ۲۴/۷', text: 'همیشه کنار شما هستیم' }
];

const guideCards = [
  { title: 'مراقبت از لباس‌های ظریف', text: 'چگونه عمر لباس زیر و لباس خواب را بیشتر کنیم؟', href: '/blog', image: '/store/noosheh-cat-lingerie.png' },
  { title: 'راهنمای انتخاب سایز', text: 'چطور سایز مناسب خود را بدون تردید پیدا کنیم؟', href: '/faq', image: '/store/noosheh-cat-socks.png' },
  { title: 'چطور ست مناسب انتخاب کنیم؟', text: 'نکاتی برای داشتن انتخابی جذاب و راحت.', href: '/blog', image: '/store/noosheh-cat-gift.png' }
];

function BoutiqueImage({ src, alt, className = '', priority = false, sizes }: { src: string; alt: string; className?: string; priority?: boolean; sizes: string }) {
  return <Image src={src} alt={alt} fill priority={priority} unoptimized={src.startsWith('http')} sizes={sizes} className={className} />;
}

function SectionHeading({ title, href, linkLabel = 'مشاهده همه' }: { title: string; href?: string; linkLabel?: string }) {
  return (
    <div className="store-ref-heading">
      <span />
      <h2>{title}</h2>
      <span />
      {href ? <Link href={href}>{linkLabel}</Link> : null}
    </div>
  );
}

function ProductGrid({ products, emptyText, compact = false }: { products: Product[]; emptyText: string; compact?: boolean }) {
  if (!products.length) return <div className="store-empty-state">{emptyText}</div>;
  return (
    <div className={compact ? 'store-ref-product-grid compact' : 'store-ref-product-grid'}>
      {products.map((product, index) => <StaticProductCard key={`${product.id}-${index}`} product={product} imageSizes={compact ? '(max-width: 768px) 50vw, 12vw' : '(max-width: 768px) 50vw, 25vw'} />)}
    </div>
  );
}

function fillMerchRow(products: Product[], fallback: Product[], count: number) {
  const source = products.length ? products : fallback;
  if (!source.length) return [];
  return Array.from({ length: count }, (_, index) => source[index % source.length]);
}

export function StoreHome({ products, settings = {} }: { products: Product[]; settings?: SiteSettingsMap }) {
  const activeProducts = products.filter((product) => product.is_active !== false);
  const featuredProducts = activeProducts.slice(0, 8);
  const newArrivals = activeProducts.filter((product) => product.badges?.includes('new') || product.collection === 'new').slice(0, 8);
  const saleProducts = activeProducts.filter((product) => product.discount_price && product.discount_price < product.price).slice(0, 4);
  const heroSrc = settings.home_hero_rect_image || heroImage;
  const displayNew = fillMerchRow(newArrivals.slice(0, 4), featuredProducts.slice(0, 4), 4);
  const displaySale = fillMerchRow(saleProducts.slice(0, 4), featuredProducts.slice(0, 4), 4);

  return (
    <div className="store-home store-reference-home" dir="rtl">
      <section className="store-ref-hero">
        <div className="store-ref-hero-main">
          <BoutiqueImage src={heroSrc} alt="مدل با لباس زنانه لطیف در کالکشن نوشه" priority sizes="(max-width: 900px) 100vw, 70vw" />
          <div className="store-ref-hero-copy">
            <span>کالکشن جدید بهار و تابستان ۱۴۰۳</span>
            <h1>زیبایی، راحتی، اعتماد به نفس</h1>
            <p>لباس زیر و لباس خواب‌هایی برای لحظاتی که فقط مال توست.</p>
            <Link href="/category/all">مشاهده کالکشن</Link>
          </div>
        </div>
        <aside className="store-ref-hero-side">
          <Link href="/category/sets" className="store-ref-side-card light">
            <BoutiqueImage src={promoSetImage} alt="ست زنانه نوشه" sizes="(max-width: 900px) 50vw, 24vw" />
            <div><b>ست‌های دلنشین</b><span>برای هر سلیقه‌ای</span><small>مشاهده</small></div>
          </Link>
          <Link href="/category/all?collection=sale" className="store-ref-side-card burgundy">
            <BoutiqueImage src={promoGiftImage} alt="بسته هدیه نوشه" sizes="(max-width: 900px) 50vw, 24vw" />
            <div><b>تخفیف‌های ویژه</b><span>فرصت را از دست نده</span><small>مشاهده</small></div>
          </Link>
        </aside>
      </section>

      <section className="store-ref-trust" aria-label="مزیت‌های خرید از نوشه">
        {trustItems.map((item) => (
          <article key={item.title}>
            <b>{item.title}</b>
            <span>{item.text}</span>
          </article>
        ))}
      </section>

      <section className="store-ref-section">
        <SectionHeading title="دسته‌بندی‌های محبوب" />
        <div className="store-ref-category-row">
          {categoryCards.map((category) => (
            <Link href={category.href} key={category.title}>
              <BoutiqueImage src={category.image} alt={category.title} sizes="(max-width: 700px) 38vw, 13vw" />
              <span>{category.title}</span>
            </Link>
          ))}
        </div>
      </section>

      <section className="store-ref-section store-ref-merch-grid">
        <div>
          <SectionHeading title="فروش ویژه" href="/category/all?collection=sale" />
          <ProductGrid products={displaySale} emptyText="هنوز محصول تخفیف‌دار برای نمایش وجود ندارد." compact />
        </div>
        <div>
          <SectionHeading title="جدیدترین محصولات" href="/category/all" />
          <ProductGrid products={displayNew} emptyText="هنوز محصولی برای نمایش وجود ندارد." compact />
        </div>
      </section>

      <section className="store-ref-promo">
        <div>
          <span>برای اولین خرید</span>
          <h2>۷٪ تخفیف ویژه</h2>
          <p>با عضویت در خبرنامه نوشه، زودتر از پیشنهادهای منتخب باخبر شوید.</p>
          <Link href="/signup">مشاهده و خرید</Link>
        </div>
        <div className="store-ref-promo-image">
          <BoutiqueImage src="/store/noosheh-cat-gift.png" alt="پیشنهاد ویژه نوشه" sizes="50vw" />
        </div>
      </section>

      <section className="store-ref-section">
        <SectionHeading title="راهنمای خرید و استایل" />
        <div className="store-ref-guide-row">
          {guideCards.map((guide) => (
            <Link href={guide.href} key={guide.title}>
              <BoutiqueImage src={guide.image} alt={guide.title} sizes="(max-width: 700px) 100vw, 33vw" />
              <div>
                <h3>{guide.title}</h3>
                <p>{guide.text}</p>
                <span>مطالعه مقاله</span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="store-ref-newsletter">
        <div className="store-ref-newsletter-image">
          <BoutiqueImage src={newsletterImage} alt="مدل نوشه برای خبرنامه" sizes="36vw" />
        </div>
        <div>
          <h2>عضویت در خبرنامه نوشه</h2>
          <p>اولین نفر باشید از جدیدترین محصولات، تخفیف‌ها و راهنمای‌های ویژه ما مطلع شوید.</p>
        </div>
        <form action="/signup">
          <input type="email" name="email" placeholder="ایمیل شما..." aria-label="ایمیل شما" />
          <button type="submit">عضویت</button>
        </form>
      </section>
    </div>
  );
}

export const HeroBanner = StoreHome;
export function CategorySection() { return null; }
export function FeaturedProducts() { return null; }
export function FlashSaleSection() { return null; }
export function QuoteSection() { return null; }
export function WhyUsSection() { return null; }
