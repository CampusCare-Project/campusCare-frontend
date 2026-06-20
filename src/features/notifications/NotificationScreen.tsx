import { useEffect } from 'react';
import { FlatList, Pressable, Text } from 'react-native';
import { DashboardLayout } from '@/layouts/DashboardLayout';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';
import { useNotifications } from '@/api/notifications/hooks';

export function NotificationScreen() {
  const { items, fetchNotifications, fetchUnreadCount, markRead, markAllRead } = useNotifications();

  useEffect(() => { void fetchNotifications(); void fetchUnreadCount(); }, []);

  return (
    <DashboardLayout title="Notifikasi">
      <Button title="Tandai semua dibaca" variant="secondary" onPress={() => void markAllRead()} />
      {items.length === 0 ? <EmptyState title="Tidak ada notifikasi" /> : null}
      <FlatList scrollEnabled={false} data={items} keyExtractor={(i) => i.id} renderItem={({ item }) => (
        <Pressable onPress={() => void markRead(item.id)}>
          <Card>
            <Text style={{ fontWeight: item.isRead ? '600' : '900' }}>{item.title}</Text>
            <Text style={{ color: '#64748B' }}>{item.body}</Text>
            <Text style={{ fontSize: 12, color: '#94A3B8' }}>{new Date(item.createdAt).toLocaleString()}</Text>
          </Card>
        </Pressable>
      )} />
    </DashboardLayout>
  );
}
