import { useCallback, useEffect, useState } from 'react';
import { categoryService } from './service';
import type { Category } from './types';

export function useCategories(autoFetch = true) {
  const [items, setItems] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchCategories = useCallback(async () => {
    setLoading(true);
    try {
      const data = await categoryService.list();
      setItems(data);
      return data;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (autoFetch) void fetchCategories();
  }, [autoFetch, fetchCategories]);

  return { items, loading, fetchCategories, setItems };
}
