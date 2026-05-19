import React, { useState, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowRight, Save, Loader2 } from 'lucide-react';
import RichTextEditor from '@/components/blog/admin/RichTextEditor';
import ImageUploader from '@/components/blog/admin/ImageUploader';
import { generateSlug } from '@/lib/blogUtils';
import { useToast } from '@/components/ui/use-toast';
export default function BlogPageEditor(){ return <div />; }
