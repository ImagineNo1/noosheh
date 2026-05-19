'use client';
import { useEntityList } from '../../_components/hooks';import type { BlogPage } from '../../types';
export default function BlogPages(){const {data}=useEntityList<BlogPage>('BlogPage','order',200);return <div className='admin-page'><h1 className='admin-title'>صفحات بلاگ</h1><div className='admin-card mt-4'><table className='admin-table'><thead><tr><th>عنوان</th><th>اسلاگ</th><th>وضعیت</th></tr></thead><tbody>{data.map(p=><tr key={p.id}><td>{p.title}</td><td>{p.slug}</td><td>{p.status}</td></tr>)}</tbody></table></div></div>}
