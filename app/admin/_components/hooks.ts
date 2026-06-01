'use client';

import { useCallback, useEffect, useState } from 'react';
import { adminApi, type AdminEntity } from '../admin-api';

export function useEntityList<T>(entity: AdminEntity, sort?: string, limit?: number) {
  const [data, setData] = useState<T[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      setData(await adminApi.list<T>(entity, sort, limit));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'خطای ناشناخته');
    } finally {
      setIsLoading(false);
    }
  }, [entity, sort, limit]);

  useEffect(() => {
    reload();
  }, [reload]);

  return { data, isLoading, error, reload, setData };
}

export const formatPrice = (price?: number) => (price || 0).toLocaleString('fa-IR');

export const formatDate = (date?: string) => {
  if (!date) return '—';
  return new Date(date).toLocaleDateString('fa-IR');
};
