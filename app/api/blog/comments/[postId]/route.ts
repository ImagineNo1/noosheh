import { listEntity } from '@/lib/admin-store';
export async function GET(_: Request, { params }: { params: { postId: string } }) {
  const rows = await listEntity('blog_comments', '-created_date');
  return Response.json(rows.filter((c:any)=>c.post_id===params.postId && c.status==='approved'));
}
