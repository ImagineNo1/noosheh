import React, { useEffect, useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Link } from 'react-router-dom';
import { Calendar, Clock, Eye, MessageCircle, ChevronLeft, Twitter, Link2, User, Check } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';

export default function BlogPost() {
  const slug = window.location.pathname.split('/blog/')[1];
  const [commentForm, setCommentForm] = useState({ author_name: '', author_email: '', content: '' });
  const [copied, setCopied] = useState(false);
  const { data: posts = [] } = useQuery({ queryKey: ['post-by-slug', slug], queryFn: () => base44.entities.BlogPost.filter({ slug, is_deleted: false }), enabled: !!slug });
  const post = posts[0];
  const { data: comments = [] } = useQuery({ queryKey: ['comments', post?.id], queryFn: () => base44.entities.BlogComment.filter({ post_id: post.id, status: 'approved' }), enabled: !!post?.id });
  const { data: allPosts = [] } = useQuery({ queryKey: ['blog-posts-public'], queryFn: () => base44.entities.BlogPost.filter({ status: 'published', is_deleted: false }, '-publish_at', 100) });

  useEffect(() => { if (post?.id) base44.entities.BlogPost.update(post.id, { views_count: (post.views_count || 0) + 1 }); }, [post?.id]);
  const submitComment = useMutation({ mutationFn: data => base44.entities.BlogComment.create({ ...data, post_id: post.id, post_slug: slug, status: 'pending' }), onSuccess: () => { toast.success('دیدگاه شما با موفقیت ثبت شد و پس از تایید نمایش داده می‌شود.'); setCommentForm({ author_name: '', author_email: '', content: '' }); } });
  const handleShare = () => { navigator.clipboard.writeText(window.location.href); setCopied(true); setTimeout(() => setCopied(false), 2000); };

  if (!post) return <div className="min-h-screen flex items-center justify-center" dir="rtl"><div className="text-center"><div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" /><p className="text-muted-foreground">در حال بارگذاری...</p></div></div>;

  const related = allPosts.filter(p => p.id !== post.id && p.categories?.some(c => post.categories?.includes(c))).slice(0, 3);
  const headings = [];
  const headingRegex = /<h([2-3])[^>]*>(.*?)<\/h[2-3]>/gi;
  let match; while ((match = headingRegex.exec(post.content || '')) !== null) headings.push({ level: match[1], text: match[2].replace(/<[^>]*>/g, '') });

  return <div className="bg-white min-h-screen" dir="rtl"><div className="container mx-auto px-4 py-4 text-xs text-muted-foreground flex items-center gap-1 flex-wrap"><Link to="/" className="hover:text-primary">خانه</Link><ChevronLeft className="w-3 h-3" /><Link to="/blog" className="hover:text-primary">بلاگ</Link><ChevronLeft className="w-3 h-3" /><span className="text-foreground line-clamp-1">{post.title}</span></div><div className="container mx-auto px-4 pb-16"><h1 className="text-3xl md:text-4xl font-black mb-4 leading-tight">{post.title}</h1><div className="flex items-center gap-4 text-sm text-muted-foreground flex-wrap mb-6 pb-6 border-b border-border/50">{post.author_name && <div className="flex items-center gap-2">{post.author_avatar ? <img src={post.author_avatar} className="w-8 h-8 rounded-full object-cover" alt={post.author_name} /> : <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center"><User className="w-4 h-4 text-primary" /></div>}<span>{post.author_name}</span></div>}{post.publish_at && <span className="flex items-center gap-1"><Calendar className="w-4 h-4" />{new Date(post.publish_at).toLocaleDateString('fa-IR')}</span>}{post.reading_time > 0 && <span className="flex items-center gap-1"><Clock className="w-4 h-4" />{post.reading_time} دقیقه مطالعه</span>}<span className="flex items-center gap-1"><Eye className="w-4 h-4" />{post.views_count || 0} بازدید</span><span className="flex items-center gap-1"><MessageCircle className="w-4 h-4" />{comments.length} دیدگاه</span></div><div className="prose prose-lg max-w-none" dangerouslySetInnerHTML={{ __html: post.content || '' }} /><div className="flex items-center gap-3 mt-6 pt-6 border-t border-border/50"><button onClick={handleShare} className="flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-lg bg-secondary">{copied ? <Check className="w-4 h-4" /> : <Link2 className="w-4 h-4" />}{copied ? 'کپی شد!' : 'کپی لینک'}</button><a href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(window.location.href)}&text=${encodeURIComponent(post.title)}`} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-lg bg-secondary"><Twitter className="w-4 h-4" />توییتر</a></div><div className="mt-12"><h3 className="text-xl font-bold mb-6 flex items-center gap-2"><MessageCircle className="w-5 h-5 text-primary" />دیدگاه‌ها ({comments.length})</h3><div className="bg-secondary/30 rounded-2xl p-6"><div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4"><Input placeholder="نام شما *" value={commentForm.author_name} onChange={e => setCommentForm(p => ({ ...p, author_name: e.target.value }))} /><Input placeholder="ایمیل شما *" type="email" value={commentForm.author_email} onChange={e => setCommentForm(p => ({ ...p, author_email: e.target.value }))} /></div><Textarea placeholder="دیدگاه شما... *" rows={4} value={commentForm.content} onChange={e => setCommentForm(p => ({ ...p, content: e.target.value }))} className="mb-4" /><Button onClick={() => { if (!commentForm.author_name || !commentForm.author_email || !commentForm.content) return toast.error('همه فیلدها الزامی هستند'); submitComment.mutate(commentForm); }} disabled={submitComment.isPending}>{submitComment.isPending ? 'در حال ارسال...' : 'ارسال دیدگاه'}</Button></div></div>{headings.length > 0 && <aside><h3>فهرست مطالب</h3>{headings.map((h, i) => <div key={i}>{h.text}</div>)}</aside>}{related.length > 0 && <aside>{related.map(p => <Link key={p.id} to={`/blog/${p.slug}`}><Badge>{p.title}</Badge></Link>)}</aside>}</div></div>;
}
