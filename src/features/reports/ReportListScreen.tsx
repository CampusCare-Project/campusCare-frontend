import { useEffect } from 'react';
import { FlatList, Pressable, Text } from 'react-native';
import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { DashboardLayout } from '@/layouts/DashboardLayout';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';
import { Loading } from '@/components/ui/Loading';
import { useAuth } from '@/api/auth/hooks';
import { useReports } from '@/api/reports/hooks';
import type { MainTabParamList } from '@/app/router';

type Props = BottomTabScreenProps<MainTabParamList, 'Reports'>;

export function ReportListScreen({ navigation }: Props) {
  const { user } = useAuth();
  const { items, loading, fetchReports } = useReports();

  useEffect(() => { void fetchReports({ limit: 50 }); }, []);

  if (loading) return <Loading text="Mengambil laporan..." />;

  return (
    <DashboardLayout title="Laporan">
      {(user?.role === 'STUDENT' || user?.role === 'STAFF' || user?.role === 'ADMIN') ? (
        <Button title="+ Buat Laporan" onPress={() => (navigation as any).getParent()?.navigate('CreateReport')} />
      ) : null}
      {items.length === 0 ? <EmptyState title="Belum ada laporan" message="Buat laporan baru atau tarik untuk refresh." /> : null}
      <FlatList
        scrollEnabled={false}
        data={items}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <Pressable onPress={() => (navigation as any).getParent()?.navigate('ReportDetail', { id: item.id })}>
            <Card>
              <Text style={{ fontWeight: '900', fontSize: 16 }}>{item.title}</Text>
              <Text numberOfLines={2} style={{ color: '#64748B' }}>{item.description}</Text>
              <Badge label={`${item.status} • ${item.priority}`} />
            </Card>
          </Pressable>
        )}
      />
    </DashboardLayout>
  );
}
