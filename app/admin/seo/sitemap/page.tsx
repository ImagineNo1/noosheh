'use client';import {useEntityList} from '../../_components/hooks';
export default function P(){const {data:p=[]}=useEntityList<any>('Product');return <div><p>{p.length} products</p><pre className='text-xs'>{`<urlset>...</urlset>`}</pre></div>}
