import Link from 'next/link';

export const metadata = {
  title: '404 - صفحه پیدا نشد',
  robots: { index: false, follow: false }
};

export default function PageNotFound() {
  return (
    <div className="store-page" dir="rtl">
      <div className="mx-auto max-w-3xl px-4 py-24 text-center">
        <h1 className="text-4xl font-bold">404</h1>
        <p className="mt-3 text-muted-foreground">صفحه موردنظر پیدا نشد.</p>
        <Link href="/" className="mt-6 inline-block text-primary hover:underline">بازگشت به خانه</Link>
      </div>
    </div>
  );
}
