import Image from 'next/image';

type Product = {
  id: number;
  titleFa: string;
  titleEn?: string;
  price: string;
  image: string;
};

const fantasyProducts: Product[] = [
  { id: 1, titleFa: 'ست شورَت و سوتین تورگاز', price: '۱,۰۲۰,۰۰۰ تومان', image: 'https://images.unsplash.com/photo-1512436991641-6745cdb1723f?auto=format&fit=crop&w=800&q=80' },
  { id: 2, titleFa: 'ست شورَت و سوتین مشکی', price: '۱,۰۲۰,۰۰۰ تومان', image: 'https://images.unsplash.com/photo-1464863979621-258859e62245?auto=format&fit=crop&w=800&q=80' },
  { id: 3, titleFa: 'ست شورَت و سوتین گلدار', price: '۱,۰۲۰,۰۰۰ تومان', image: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=800&q=80' },
  { id: 4, titleFa: 'ست شورَت و سوتین آبی', price: '۱,۰۲۰,۰۰۰ تومان', image: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&w=800&q=80' }
];

const popularProducts: Product[] = [
  { id: 5, titleFa: 'ست شورَت و سوتین صورتی', price: '۱,۰۲۰,۰۰۰ تومان', image: 'https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=800&q=80' },
  { id: 6, titleFa: 'ست شورَت و سوتین قرمز', price: '۱,۰۲۰,۰۰۰ تومان', image: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=800&q=80' },
  { id: 7, titleFa: 'ست شورَت و سوتین سفید یخی', price: '۱,۰۲۰,۰۰۰ تومان', image: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=800&q=80' },
  { id: 8, titleFa: 'ست شورَت و سوتین یاسی', price: '۱,۰۲۰,۰۰۰ تومان', image: 'https://images.unsplash.com/photo-1496747611176-843222e1e57c?auto=format&fit=crop&w=800&q=80' }
];

export default function HomePage() {
  return (
    <main>
      <header className="topbar">ارسال برای سفارشات بالای ۱ میلیون و ۵۰۰ هزار تومان رایگان است.</header>

      <section className="hero">
        <div className="overlay" />
        <div className="heroContent">
          <h1>NOOSHEH POOSH</h1>
          <p>Beauty &amp; Quality</p>
        </div>
      </section>

      <section className="categoryCards container">
        <article className="categoryCard">
          <div className="cardShade" />
          <h3>Bra Collection</h3>
          <p>کالکشن سوتین</p>
          <button>نمایش</button>
        </article>
        <article className="categoryCard">
          <div className="cardShade" />
          <h3>Set (B&amp;P) Collection</h3>
          <p>کالکشن ست</p>
          <button>نمایش</button>
        </article>
      </section>

      <section className="container productsSection">
        <div className="sectionHeading">
          <h2>کالکشن فانتزی</h2>
          <h2>Fantasy Collection</h2>
        </div>
        <div className="productGrid">
          {fantasyProducts.map((product) => (
            <article key={product.id} className="productCard">
              <div className="imageWrap">
                <Image src={product.image} alt={product.titleFa} fill sizes="(max-width: 768px) 100vw, 25vw" />
              </div>
              <h4>{product.titleFa}</h4>
              <p>{product.price}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="featureBanner">
        <div className="quoteBox">زیبایی و کیفیت دو اصل مهم در تولیدی لباس زیر نوشه هستند.</div>
      </section>

      <section className="container benefits">
        <h3>چرا نوشه پوش؟</h3>
        <p className="intro">چون ما باور داریم لباس زیر، اولین لایه اعتماد به نفس است.</p>
        <div className="benefitGrid">
          <article>
            <h4>قیمت رقابتی</h4>
            <p>تضمین قیمت رقابتی و اصالت کالا در فروشگاه آنلاین</p>
          </article>
          <article>
            <h4>خدمات پشتیبانی</h4>
            <p>پشتیبانی و خدمات پس از فروش برای تمام سفارش‌ها</p>
          </article>
          <article>
            <h4>خرید امن</h4>
            <p>پرداخت آنلاین از طریق درگاه‌های معتبر بانکی</p>
          </article>
        </div>
      </section>

      <section className="featureBanner second">
        <div className="quoteBox">نوشه فقط یک برند نیست؛ جایی که زیبایی و کیفیت در هم می‌آمیزند.</div>
      </section>

      <section className="container productsSection">
        <div className="sectionHeading single">
          <h2>محبوب ترین محصولات ما</h2>
        </div>
        <div className="productGrid">
          {popularProducts.map((product) => (
            <article key={product.id} className="productCard">
              <div className="imageWrap">
                <Image src={product.image} alt={product.titleFa} fill sizes="(max-width: 768px) 100vw, 25vw" />
              </div>
              <h4>{product.titleFa}</h4>
              <p>{product.price}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="partners container">
        <p>همکاران ما</p>
        <div className="logoRow">
          {['SAAD', 'Bertonix', 'GABIANI', 'GT HUGERO', 'CORUM', 'MK'].map((brand) => (
            <span key={brand}>{brand}</span>
          ))}
        </div>
      </section>

      <footer className="footer">
        <div className="container footerGrid">
          <div>
            <h4>درباره ما</h4>
            <p>طراحی مدرن، کیفیت بالا و تجربه خرید متفاوت؛ هدف ما در نوشه پوش همین است.</p>
          </div>
          <div>
            <h4>راهنمای فروشگاه</h4>
            <ul>
              <li>حساب کاربری من</li>
              <li>راهنمای مشتریان</li>
              <li>تماس با ما</li>
            </ul>
          </div>
          <div>
            <h4>نظر مشتریان</h4>
            <p>«در بیست سال تجربه تولید، همیشه کیفیت اولویت ما بوده است.»</p>
          </div>
        </div>
        <p className="copyright">© ۱۴۰۴ تمامی حقوق محفوظ است.</p>
      </footer>
    </main>
  );
}
