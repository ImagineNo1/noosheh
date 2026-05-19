'use client';
import { useState } from 'react';
import { adminApi } from '../../admin-api';
import { useEntityList } from '../../_components/hooks';
import { Button, Input } from '../../_components/ui';
import type { BlogComment } from '../../types';

export default function BlogComments(){
 const {data:comments,reload}=useEntityList<BlogComment>('BlogComment','-created_date',300);
 const [q,setQ]=useState('');
 const filtered=comments.filter(c=>!q||c.author_name?.includes(q)||c.content?.includes(q));
 const setStatus=async(id:string,status:string)=>{await adminApi.update('BlogComment',id,{status});await reload();};
 return <div className='admin-page'><h1 className='admin-title mb-4'>کامنت‌های بلاگ</h1><Input value={q} onChange={(e)=>setQ(e.target.value)} placeholder='جستجو'/> <div className='admin-card mt-4'><table className='admin-table'><thead><tr><th>نویسنده</th><th>متن</th><th>وضعیت</th><th>عملیات</th></tr></thead><tbody>{filtered.map(c=><tr key={c.id}><td>{c.author_name}</td><td>{c.content?.slice(0,70)}</td><td>{c.status}</td><td className='admin-actions-row'><Button className='ghost' onClick={()=>setStatus(c.id,'approved')}>تایید</Button><Button className='ghost' onClick={()=>setStatus(c.id,'spam')}>اسپم</Button><Button className='ghost' onClick={()=>setStatus(c.id,'trash')}>زباله</Button></td></tr>)}</tbody></table></div></div>
}
