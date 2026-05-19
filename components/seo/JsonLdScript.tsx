'use client';
import { useEffect } from 'react';
import { generateJsonLd } from '@/lib/seo/seoHelpers';

export default function JsonLdScript({ type, data, siteUrl = '', id }: { type: string; data: any; siteUrl?: string; id?: string }) {
  const schemaId = `jsonld-${id || type}`;
  useEffect(() => {
    const schema = generateJsonLd(type, data, siteUrl);
    if (!schema) return;
    const existing = document.getElementById(schemaId);
    if (existing) existing.remove();
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.id = schemaId;
    script.textContent = JSON.stringify(schema);
    document.head.appendChild(script);
    return () => { document.getElementById(schemaId)?.remove(); };
  }, [type, data, siteUrl, schemaId]);
  return null;
}
