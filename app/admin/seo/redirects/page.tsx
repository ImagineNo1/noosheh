'use client';import {useEntityList} from '../../_components/hooks';
export default function P(){const {data,isLoading}=useEntityList<any>('Redirect','-created_date',200);if(isLoading)return <p>loading...</p>;return <pre className='text-xs bg-secondary/30 p-3 rounded overflow-auto'>{JSON.stringify(data,null,2)}</pre>;}
