'use client';

import { useEntityList } from '../../_components/hooks';

export default function Page() {
  const { data } = useEntityList<any>('SeoSettings');
  const content = data[0]?.robots_txt || `User-agent: *
Allow: /`;
  return <pre className='text-xs bg-secondary/30 p-3 rounded'>{content}</pre>;
}
