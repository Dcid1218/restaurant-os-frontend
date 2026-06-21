'use client';

import { useCallback } from 'react';
import { useToast } from '@/lib/toast';
import { apiFetch } from '@/lib/api';

export function useApi() {
  const { addToast } = useToast();

  const fetchWithToast = useCallback(
    async (path: string, options?: RequestInit) => {
      try {
        return await apiFetch(path, options);
      } catch (err: any) {
        addToast(err.message || 'An error occurred', 'error');
        throw err;
      }
    },
    [addToast]
  );

  return { fetchWithToast };
}
