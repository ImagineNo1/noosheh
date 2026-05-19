'use client';
import { useEffect } from 'react';

export default function MetaTags({ meta }: { meta?: any }) {
  useEffect(() => {
    if (!meta) return;
    const setMeta = (name: string, content?: string, prop = false) => {
      if (!content) return;
      const attr = prop ? 'property' : 'name';
      let el = document.querySelector(`meta[${attr}="${name}"]`) as HTMLMetaElement | null;
      if (!el) {
        el = document.createElement('meta');
        el.setAttribute(attr, name);
        document.head.appendChild(el);
      }
      el.content = content;
    };
    const setLink = (rel: string, href?: string) => {
      if (!href) return;
      let el = document.querySelector(`link[rel="${rel}"]`) as HTMLLinkElement | null;
      if (!el) {
        el = document.createElement('link');
        el.rel = rel;
        document.head.appendChild(el);
      }
      el.href = href;
    };
    if (meta.title) document.title = meta.title;
    setMeta('description', meta.description); setMeta('robots', meta.robots); setLink('canonical', meta.canonical);
    setMeta('og:title', meta.og?.title, true); setMeta('og:description', meta.og?.description, true); setMeta('og:image', meta.og?.image, true);
    setMeta('og:type', meta.og?.type, true); setMeta('og:site_name', meta.og?.siteName, true); setMeta('og:url', meta.og?.url, true);
    setMeta('twitter:card', meta.twitter?.card); setMeta('twitter:title', meta.twitter?.title); setMeta('twitter:description', meta.twitter?.description); setMeta('twitter:image', meta.twitter?.image);
  }, [meta]);
  return null;
}
