'use client';

import Image from 'next/image';
import Link from 'next/link';
import { type ReactNode, useMemo, useState } from 'react';

type ProductImageInput = string | { url?: string; alt?: string } | null | undefined;

type ProductCardImageCarouselProps = {
  href: string;
  title: string;
  images?: ProductImageInput[];
  coverImage?: ProductImageInput;
  fallbackImage: string;
  imageSizes: string;
  children?: ReactNode;
  quickView?: ReactNode;
};

function resolveImageUrl(image: ProductImageInput) {
  if (!image) return '';
  return typeof image === 'string' ? image : image.url || '';
}

function uniqueImages(images: string[]) {
  const seen = new Set<string>();
  return images.filter((image) => {
    if (!image || seen.has(image)) return false;
    seen.add(image);
    return true;
  });
}

export default function ProductCardImageCarousel({
  href,
  title,
  images,
  coverImage,
  fallbackImage,
  imageSizes,
  children,
  quickView
}: ProductCardImageCarouselProps) {
  const gallery = useMemo(() => {
    const productImages = images?.map(resolveImageUrl) || [];
    return uniqueImages([...productImages, resolveImageUrl(coverImage), fallbackImage]).filter(Boolean);
  }, [coverImage, fallbackImage, images]);
  const [activeIndex, setActiveIndex] = useState(0);
  const activeImage = gallery[activeIndex] || fallbackImage;
  const hasMultipleImages = gallery.length > 1;

  const showPreviousImage = () => setActiveIndex((current) => (current - 1 + gallery.length) % gallery.length);
  const showNextImage = () => setActiveIndex((current) => (current + 1) % gallery.length);

  return (
    <div className="store-product-media">
      <Link href={href} className="store-product-media-link" aria-label={`مشاهده ${title}`}>
        <Image src={activeImage} alt={title} fill sizes={imageSizes} unoptimized={activeImage.startsWith('http')} />
        {children}
        {quickView}
      </Link>

      {hasMultipleImages ? (
        <>
          <button
            type="button"
            className="store-product-image-nav store-product-image-nav-prev"
            onClick={showPreviousImage}
            aria-label={`تصویر قبلی ${title}`}
          >
            ›
          </button>
          <button
            type="button"
            className="store-product-image-nav store-product-image-nav-next"
            onClick={showNextImage}
            aria-label={`تصویر بعدی ${title}`}
          >
            ‹
          </button>
          <div className="store-product-image-dots" aria-hidden="true">
            {gallery.map((image, index) => (
              <span key={`${image}-${index}`} className={index === activeIndex ? 'active' : ''} />
            ))}
          </div>
        </>
      ) : null}
    </div>
  );
}
