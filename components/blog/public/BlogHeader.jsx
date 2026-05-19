import React from 'react';
import { Link } from 'react-router-dom';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';

export default function BlogHeader({ searchQuery, onSearchChange }) {
  return (
    <div className="bg-gradient-to-l from-primary/5 to-primary/10 border-b">
      <div className="max-w-6xl mx-auto px-4 py-12 text-center">
        <h1 className="text-4xl font-bold mb-3">بلاگ نوشه</h1>
        <p className="text-muted-foreground mb-6 max-w-lg mx-auto">
          آخرین مقالات، راهنماها و نکات مفید در زمینه مد و پوشاک
        </p>
        {onSearchChange && (
          <div className="relative max-w-md mx-auto">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="جستجو در مقالات..."
              value={searchQuery || ''}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pr-10 bg-background"
            />
          </div>
        )}
      </div>
    </div>
  );
}
