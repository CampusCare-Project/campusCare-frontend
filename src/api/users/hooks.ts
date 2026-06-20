import { useCallback, useEffect, useMemo, useState } from 'react';
import { getErrorMessage } from '@/api/client';
import { userService } from './service';
import type { AddUserPayload, AppUser, ListUsersQuery } from './types';

export function useUsers(initialQuery?: ListUsersQuery, autoFetch = true) {
  const [items, setItems] = useState<AppUser[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const stableInitialQuery = useMemo(() => initialQuery, [JSON.stringify(initialQuery ?? {})]);

  const fetchUsers = useCallback(async (query?: ListUsersQuery) => {
    try {
      setLoading(true);
      setError(null);
      const data = await userService.list(query ?? stableInitialQuery);
      setItems(data);
      return data;
    } catch (err) {
      const message = getErrorMessage(err);
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [stableInitialQuery]);

  const addUser = useCallback(async (payload: AddUserPayload) => {
    try {
      setSaving(true);
      setError(null);
      const created = await userService.addUser(payload);
      setItems((prev) => [created, ...prev]);
      return created;
    } catch (err) {
      const message = getErrorMessage(err);
      setError(message);
      throw err;
    } finally {
      setSaving(false);
    }
  }, []);

  useEffect(() => {
    if (autoFetch) void fetchUsers(stableInitialQuery);
  }, [autoFetch, fetchUsers, stableInitialQuery]);

  return {
    items,
    loading,
    saving,
    error,
    fetchUsers,
    addUser,
  };
}
