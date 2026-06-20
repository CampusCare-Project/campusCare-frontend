import { useEffect, useState } from 'react';
import { FlatList, Text } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { DashboardLayout } from '@/layouts/DashboardLayout';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';
import type { AppDispatch, RootState } from '@/store';
import { loadOfflineQueueThunk, syncOfflineQueueThunk } from '@/store/slices/offlineSlice';
import { getLocalReports, type LocalReportRow } from '@/offline/db';

export function OfflineQueueScreen() {
  const dispatch = useDispatch<AppDispatch>();
  const { pendingCount, syncing } = useSelector((s: RootState) => s.offline);
  const [rows, setRows] = useState<LocalReportRow[]>([]);

  const reload = async () => {
    await dispatch(loadOfflineQueueThunk()).unwrap();
    setRows(await getLocalReports());
  };

  useEffect(() => { void reload(); }, []);

  const sync = async () => {
    await dispatch(syncOfflineQueueThunk()).unwrap();
    await reload();
  };

  return (
    <DashboardLayout title="Offline Queue">
      <Text>Pending: {pendingCount}</Text>
      <Button title="Sync Sekarang" loading={syncing} onPress={sync} />
      {rows.length === 0 ? <EmptyState title="Queue kosong" message="Laporan offline akan muncul di sini." /> : null}
      <FlatList scrollEnabled={false} data={rows} keyExtractor={(i) => i.id} renderItem={({ item }) => (
        <Card><Text style={{ fontWeight: '900' }}>{item.id}</Text><Text>Status: {item.status}</Text><Text>{item.errorMessage || '-'}</Text></Card>
      )} />
    </DashboardLayout>
  );
}
