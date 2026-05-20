import BlogEditor from '../../BlogEditor';
export default function Page({ params }: { params: { id: string } }){ return <BlogEditor id={params.id}/>; }
