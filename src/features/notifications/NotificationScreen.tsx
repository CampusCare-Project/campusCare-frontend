import { useEffect } from 'react';
import { FlatList, Pressable, Text,View } from 'react-native';
import { DashboardLayout } from '@/layouts/DashboardLayout';
import { Button } from '@/components/ui/ButtonId';
import { Card } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';
import { useNotifications } from '@/api/notifications/hooks';

export function NotificationScreen() {
  const { items, fetchNotifications, fetchUnreadCount, markRead, markAllRead } = useNotifications();

  useEffect(() => { void fetchNotifications(); void fetchUnreadCount(); }, []);

  return (
    <DashboardLayout  title="Notifikasi">
         <Text
        testID="notifications-title"
        accessibilityLabel="notifications-title"
        style={{
          fontSize: 24,
          fontWeight: "900",
          color: "#0F172A",
          marginBottom: 12,
        }}
      >
        Notifikasi
      </Text>
      <Button 
            testID="notifications-mark-all-read-button"
        accessibilityLabel="notifications-mark-all-read-button"
      title="Tandai semua dibaca" variant="secondary" onPress={() => void markAllRead()} />
       {items.length === 0 ? (
        <View
          testID="notifications-empty-state"
          accessibilityLabel="notifications-empty-state"
        >
          <EmptyState title="Tidak ada notifikasi" />
        </View>
      ) : null}

      <FlatList scrollEnabled={false} data={items} keyExtractor={(i) => i.id} renderItem={({ item ,index}) => (
        <Pressable
            testID={`notification-mark-read-button-${index}`}
            accessibilityLabel={`notification-mark-read-button-${index}`}
        onPress={() => void markRead(item.id)}>

            <View
              testID={`notification-card-${index}`}
              accessibilityLabel={`notification-card-${index}`}
            >
          <Card>
            <Text 
              testID={`notification-title-${index}`}
                  accessibilityLabel={`notification-title-${index}`}
            style={{ fontWeight: item.isRead ? '600' : '900' }}>{item.title}</Text>
            <Text
             testID={`notification-body-${index}`}
                  accessibilityLabel={`notification-body-${index}`}
            style={{ color: '#64748B' }}>{item.body}</Text>
            <Text
              testID={`notification-created-at-${index}`}
              accessibilityLabel={`notification-created-at-${index}`}
            style={{ fontSize: 12, color: '#94A3B8' }}>{new Date(item.createdAt).toLocaleString()}</Text>
          </Card>
          </View>
        </Pressable>
      )} />
    </DashboardLayout>
  );
}
