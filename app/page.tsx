import StoreHeader from '@/components/store/StoreHeader';
import Footer from '@/components/store/Footer';
import { CategorySection, FeaturedProducts, FlashSaleSection, HeroBanner, QuoteSection, WhyUsSection } from '@/components/store/HomeSections';

export default function Home() {
  return (
    <main>
      <StoreHeader />
      <HeroBanner />
      <CategorySection />
      <FeaturedProducts title="کالکشن فانتزی" titleEn="Fantasy Collection" collection="fantasy" />
      <QuoteSection />
      <FlashSaleSection />
      <FeaturedProducts title="محصولات پرفروش" titleEn="Best Sellers" />
      <WhyUsSection />
      <FeaturedProducts title="جدیدترین محصولات" titleEn="New Arrivals" collection="new" limit={4} />
      <Footer />
    </main>
  );
}
