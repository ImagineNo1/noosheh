'use client';

import { useState } from 'react';
import { adminApi } from '@/app/admin/admin-api';
import { Card, Input } from '@/app/admin/_components/ui';

type GalleryImage = string | { url?: string; alt?: string; sort_order?: number };

const imageUrl = (image: GalleryImage) => typeof image === 'string' ? image : image.url || '';

export default function AdminImageManager({
  coverImage,
  images = [],
  onCoverChange,
  onImagesChange
}: {
  coverImage?: string;
  images?: GalleryImage[];
  onCoverChange: (url: string) => void;
  onImagesChange: (images: GalleryImage[]) => void;
}) {
  const [uploading, setUploading] = useState(false);

  const upload = async (file: File) => {
    setUploading(true);
    try {
      const { file_url } = await adminApi.upload(file);
      return file_url;
    } finally {
      setUploading(false);
    }
  };

  const handleCoverUpload = async (file: File) => onCoverChange(await upload(file));
  const handleGalleryUpload = async (file: File) => onImagesChange([...images, { url: await upload(file), alt: '', sort_order: images.length }]);
  const updateImageAlt = (index: number, alt: string) => onImagesChange(images.map((image, i) => i === index ? { ...(typeof image === 'string' ? { url: image } : image), alt } : image));

  return (
    <div className="admin-manager-stack">
      <Card>
        <div className="admin-card-header compact"><h2>تصویر کاور</h2></div>
        <div className="admin-card-body">
          {coverImage ? (
            <div className="admin-image-item large">
              <img src={coverImage} alt="تصویر کاور محصول" />
              <button type="button" onClick={() => onCoverChange('')} aria-label="حذف تصویر کاور">×</button>
            </div>
          ) : (
            <label className="admin-image-uploader large">↥<span>{uploading ? 'آپلود...' : 'آپلود کاور'}</span><input type="file" accept="image/*" hidden disabled={uploading} onChange={(event) => event.target.files?.[0] && handleCoverUpload(event.target.files[0])} /></label>
          )}
        </div>
      </Card>

      <Card>
        <div className="admin-card-header compact manager-header"><h2>گالری تصاویر</h2><label className={`admin-btn outline ${uploading ? 'disabled' : ''}`}>↥ آپلود<input type="file" accept="image/*" hidden disabled={uploading} onChange={(event) => event.target.files?.[0] && handleGalleryUpload(event.target.files[0])} /></label></div>
        <div className="admin-card-body">
          <div className="admin-gallery-grid">
            {images.map((image, index) => {
              const url = imageUrl(image);
              const alt = typeof image === 'string' ? '' : image.alt || '';
              return (
                <div key={url + index} className="admin-gallery-cell">
                  <div className="admin-image-item square"><img src={url} alt={alt} /><button type="button" onClick={() => onImagesChange(images.filter((_, i) => i !== index))} aria-label="حذف تصویر">×</button></div>
                  <Input value={alt} onChange={(event) => updateImageAlt(index, event.target.value)} placeholder="Alt text" />
                </div>
              );
            })}
            {images.length === 0 && <p className="admin-muted center pad-lg">تصویری آپلود نشده</p>}
          </div>
        </div>
      </Card>
    </div>
  );
}
