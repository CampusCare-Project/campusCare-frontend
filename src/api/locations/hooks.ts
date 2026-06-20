import { useCallback, useEffect, useState } from 'react';
import { locationService } from './service';
import type { Building, Room } from './types';

export function useLocations(autoFetch = true) {
  const [buildings, setBuildings] = useState<Building[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchBuildings = useCallback(async () => {
    setLoading(true);
    try {
      const data = await locationService.buildings();
      setBuildings(data);
      return data;
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchRooms = useCallback(async (buildingId?: string) => {
    const data = await locationService.rooms(buildingId);
    setRooms(data);
    return data;
  }, []);

  useEffect(() => {
    if (autoFetch) void fetchBuildings();
  }, [autoFetch, fetchBuildings]);

  return { buildings, rooms, loading, fetchBuildings, fetchRooms, setBuildings, setRooms };
}
