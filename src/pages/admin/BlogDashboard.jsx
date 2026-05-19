import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText, FolderOpen, Tag, MessageSquare, Eye, TrendingUp } from 'lucide-react';
import { Link } from 'react-router-dom';
import { formatDate, getStatusLabel, getStatusColor } from '@/lib/blogUtils';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
export default function BlogDashboard(){ return <div />; }
