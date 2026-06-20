import { useCallback, useEffect, useState } from 'react';
import { getErrorMessage } from '@/api/client';
import { technicianService } from './service';
import type { CreateTechnicianInput, Technician } from './types';

export function useTechnicians(autoFetch = true) {
  const [technicians, setTechnicians] = useState<Technician[]>([]);
   const [selectedTechnician, setSelectedTechnician] =
    useState<Technician | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchTechnicians = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      // const data = await technicianService.list();
      const data = await technicianService.getTechnicians();
        if (data.length > 0 && !selectedTechnician) {
        setSelectedTechnician(data[0]);
      }
      setTechnicians(data);
      return data;
    } catch (err) {
      const message = getErrorMessage(err);
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  },  [selectedTechnician]);

  const createTechnician = useCallback(async (payload: CreateTechnicianInput) => {
    try {
      setSaving(true);
      setError(null);
      const created = await technicianService.create(payload);
      setTechnicians((prev) => [created, ...prev]);
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
    if (autoFetch) void fetchTechnicians();
  }, [autoFetch, fetchTechnicians]);

  return {
    technicians,
    selectedTechnician,
    setSelectedTechnician,
    loading,
    saving,
    error,
    fetchTechnicians,
    createTechnician,
  };
}
