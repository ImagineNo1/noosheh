'use client';
import { useState } from 'react';
export function useQuery({ queryFn, enabled = true }) { const [data] = useState([]); return { data: enabled ? data : [], isLoading: false }; }
export function useMutation({ mutationFn, onSuccess }) { return { mutate: async (v) => { const r = await mutationFn?.(v); onSuccess?.(r); }, isPending: false }; }
export function useQueryClient() { return { invalidateQueries: () => {} }; }
