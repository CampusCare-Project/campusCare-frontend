import { useEffect } from 'react';
import { Pressable, Text, View } from 'react-native';
import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { DashboardLayout } from '@/layouts/DashboardLayout';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/api/auth/hooks';
import { useReports } from '@/api/reports/hooks';
import { useNotifications } from '@/api/notifications/hooks';
import type { MainTabParamList } from '@/app/router1';

type Props = BottomTabScreenProps<MainTabParamList, 'Dashboard'>;

export function DashboardScreen({ navigation }: Props) {
  const { user } = useAuth();
  const { items, fetchReports } = useReports();
  const { unreadCount, fetchUnreadCount } = useNotifications();

  useEffect(() => {
    void fetchReports({ limit: 5 });
    void fetchUnreadCount();
  }, []);

  return (
    <DashboardLayout title={`Halo, ${user?.name || 'User'}`}>
      <Card>
        <Text
          testID="dashboard-role-text"
          accessibilityLabel="dashboard-role-text"
        style={{ fontWeight: '900', fontSize: 18 }}>Role: {user?.role}</Text>
        <Text style={{ color: '#64748B' }}>Gunakan menu bawah untuk mengakses fitur sesuai hak akses.</Text>
      </Card>
      <View style={{ flexDirection: 'row', gap: 12 }}>
        <Card><Text>Laporan</Text><Text style={{ fontSize: 28, fontWeight: '900' }}>{items.length}</Text></Card>
        <Card><Text>Unread</Text><Text style={{ fontSize: 28, fontWeight: '900' }}>{unreadCount}</Text></Card>
      </View>
      {(user?.role === 'STUDENT' || user?.role === 'STAFF' || user?.role === 'ADMIN') ? (
        <Button title="Buat Laporan Baru" onPress={() => (navigation as any).getParent()?.navigate('CreateReport')} />
      ) : null}
      <Pressable onPress={() => navigation.navigate('Reports')}>
        <Text style={{ color: '#2563EB', fontWeight: '800' }}>Lihat semua laporan →</Text>
      </Pressable>
    </DashboardLayout>
  );
}
