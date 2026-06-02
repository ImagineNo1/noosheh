import Image from 'next/image';
import Link from 'next/link';
import type { Category, Product } from '@/app/admin/types';
import { homepageCategories } from '@/lib/category-helpers';
import type { SiteSettingsMap } from '@/lib/site-settings';
import StaticProductCard from './StaticProductCard';

const heroImage = '/store/noosheh-hero-editorial.png';
const promoSetImage = '/store/noosheh-cat-lounge.png';
const promoGiftImage = '/store/noosheh-cat-gift.png';
const newsletterImage = '/store/noosheh-cat-bra.png';

const trustItems = [
  { title: 'ارسال سریع', text: 'برای همه شهرها' },
  { title: 'ضمانت اصالت کالا', text: 'انتخاب مطمئن و باکیفیت' },
  { title: 'تعویض آسان سایز', text: 'مطابق شرایط فروشگاه' },
  { title: 'پرداخت امن', text: 'درگاه های معتبر' },
  { title: 'پشتیبانی خرید', text: 'کنار شما تا انتخاب بهتر' }
];

const guideCards = [
  { title: 'مراقبت از لباس های ظریف', text: 'چگونه عمر لباس زیر و لباس خواب را بیشتر کنیم؟', href: '/blog', image: '/store/noosheh-cat-lingerie.png' },
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
      {products.map((product, index) => <StaticProductCard key={`${product.id}-${index}`} product={product} imageSizes={compact ? '(max-width: 768px) 50vw, 14vw' : '(max-width: 768px) 50vw, 25vw'} />)}
    </div>
  );
}

function fillMerchRow(products: Product[], fallback: Product[], count: number) {
  const source = products.length ? products : fallback;
  if (!source.length) return [];
  return Array.from({ length: Math.min(count, Math.max(source.length, Math.min(count, 4))) }, (_, index) => source[index % source.length]);
}

export function StoreHome({ products, settings = {}, categories = [] }: { products: Product[]; settings?: SiteSettingsMap; categories?: Category[] }) {
  const activeProducts = products.filter((product) => product.is_active !== false);
  const featuredProducts = activeProducts.slice(0, 8);
  const newArrivals = activeProducts.filter((product) => product.badges?.includes('new') || product.collection === 'new').slice(0, 4);
  const saleProducts = activeProducts.filter((product) => product.discount_price && product.discount_price < product.price).slice(0, 4);
  const heroSrc = settings.home_hero_rect_image || heroImage;
  const displayNew = fillMerchRow(newArrivals, featuredProducts, 4);
  const displaySale = fillMerchRow(saleProducts, featuredProducts, 4);
  const categoryCards = homepageCategories(categories, 8);

  return (
    <div className="store-home store-reference-home" dir="rtl">
      <section className="store-ref-hero">
        <div className="store-ref-hero-main">
          <BoutiqueImage src={heroSrc} alt="کالکشن نوشه" priority sizes="(max-width: 900px) 100vw, 70vw" />
          <div className="store-ref-hero-copy">
            <span>کالکشن جدید بهار و تابستان ۱۴۰۳</span>
            <h1>زیبایی، راحتی، اعتماد به نفس</h1>
            <p>لباس زیر و لباس خواب هایی برای لحظاتی که فقط مال توست.</p>
            <Link href="/category/all">مشاهده کالکشن</Link>
          </div>
        </div>
        <aside className="store-ref-hero-side">
          <Link href="/category/sets" className="store-ref-side-card light">
            <BoutiqueImage src={promoSetImage} alt="ست زنانه نوشه" sizes="(max-width: 900px) 50vw, 24vw" />
            <div><b>ست های دلنشین</b><span>برای هر سلیقه ای</span><small>مشاهده</small></div>
          </Link>
          <Link href="/category/all?collection=sale" className="store-ref-side-card burgundy">
            <BoutiqueImage src={promoGiftImage} alt="پیشنهاد ویژه نوشه" sizes="(max-width: 900px) 50vw, 24vw" />
            <div><b>تخفیف های ویژه</b><span>فرصت را از دست نده</span><small>مشاهده</small></div>
          </Link>
        </aside>
      </section>

      <section className="store-ref-trust" aria-label="مزیت های خرید از نوشه">
        {trustItems.map((item) => (
          <article key={item.title}>
            <b>{item.title}</b>
            <span>{item.text}</span>
          </article>
        ))}
      </section>

      <section className="store-ref-section">
        <SectionHeading title="دسته بندی های محبوب" />
        <div className="store-ref-category-row">
          {categoryCards.map((category) => (
            <Link href={category.href} key={category.id}>
              <BoutiqueImage src={category.image || '/store/noosheh-cat-lingerie.png'} alt={category.displayTitle} sizes="(max-width: 700px) 38vw, 13vw" />
              <span>{category.homepage_title || category.displayTitle}</span>
            </Link>
          ))}
        </div>
      </section>

      <section className="store-ref-section store-ref-merch-section">
        <SectionHeading title="جدیدترین محصولات" href="/category/all" />
        <ProductGrid products={displayNew} emptyText="هنوز محصولی برای نمایش وجود ندارد." compact />
      </section>

      <section className="store-ref-section store-ref-merch-section">
        <SectionHeading title="فروش ویژه" href="/category/all?collection=sale" />
        <ProductGrid products={displaySale} emptyText="هنوز محصول تخفیف دار برای نمایش وجود ندارد." compact />
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
          <BoutiqueImage src={newsletterImage} alt="خبرنامه نوشه" sizes="36vw" />
        </div>
        <div>
          <h2>عضویت در خبرنامه نوشه</h2>
          <p>اولین نفر باشید از جدیدترین محصولات، تخفیف ها و راهنماهای ویژه ما مطلع شوید.</p>
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
