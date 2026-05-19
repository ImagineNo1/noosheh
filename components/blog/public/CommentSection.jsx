import React, { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MessageSquare, Reply, Loader2, User } from 'lucide-react';
import { formatDateTime } from '@/lib/blogUtils';
import { useToast } from '@/components/ui/use-toast';

export default function CommentSection({ postId, postTitle, allowComments = true }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [content, setContent] = useState('');
  const [replyTo, setReplyTo] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: comments = [] } = useQuery({
    queryKey: ['post-comments', postId],
    queryFn: async () => base44.entities.BlogComment.filter({ post_id: postId, status: 'approved' }, '-created_date', 100),
    enabled: !!postId,
  });

  const topComments = comments.filter(c => !c.parent_id);
  const getReplies = (commentId) => comments.filter(c => c.parent_id === commentId);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim() || !content.trim()) return toast({ title: 'نام و متن نظر الزامی است', variant: 'destructive' });
    setSubmitting(true);
    await base44.entities.BlogComment.create({ post_id: postId, post_title: postTitle, parent_id: replyTo || '', author_name: name, author_email: email, content: content.trim(), status: 'pending' });
    setName(''); setEmail(''); setContent(''); setReplyTo(null);
    queryClient.invalidateQueries({ queryKey: ['post-comments', postId] });
    setSubmitting(false);
    toast({ title: 'نظر شما ثبت شد و پس از تایید نمایش داده می‌شود' });
  };

  const CommentItem = ({ comment, depth = 0 }) => {
    const replies = getReplies(comment.id);
    return <div className={depth > 0 ? 'mr-8 border-r-2 border-primary/10 pr-4' : ''}><div className="py-4"><div className="flex items-center gap-2 mb-2"><div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center"><User className="w-4 h-4 text-primary" /></div><span className="font-medium text-sm">{comment.author_name}</span><span className="text-xs text-muted-foreground">{formatDateTime(comment.created_date)}</span></div><p className="text-sm leading-7 text-foreground/80">{comment.content}</p></div>{replies.map(reply => <CommentItem key={reply.id} comment={reply} depth={depth + 1} />)}</div>;
  };

  return <Card><CardHeader><CardTitle className="text-lg flex items-center gap-2"><MessageSquare className="w-5 h-5" />نظرات ({comments.length.toLocaleString('fa-IR')})</CardTitle></CardHeader><CardContent>{topComments.length > 0 ? <div className="divide-y mb-8">{topComments.map(comment => <CommentItem key={comment.id} comment={comment} />)}</div> : <p className="text-center text-muted-foreground py-6 text-sm mb-6">هنوز نظری ثبت نشده. اولین نفر باشید!</p>}</CardContent></Card>;
}
