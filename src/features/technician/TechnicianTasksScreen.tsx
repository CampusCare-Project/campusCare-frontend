import { useEffect } from 'react';
import { FlatList, Pressable, Text } from 'react-native';
import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { DashboardLayout } from '@/layouts/DashboardLayout';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { useReports } from '@/api/reports/hooks';
import type { MainTabParamList } from '@/app/router';

type Props = BottomTabScreenProps<MainTabParamList, 'Technician'>;

export function TechnicianTasksScreen({ navigation }: Props) {
  const { items, fetchReports } = useReports();
  useEffect(() => { void fetchReports({ limit: 100 }); }, []);
  return (
    <DashboardLayout title="Tugas Teknisi">
      <FlatList scrollEnabled={false} data={items} keyExtractor={(i) => i.id} renderItem={({ item }) => (
        <Pressable onPress={() => (navigation as any).getParent()?.navigate('ReportDetail', { id: item.id })}>
          <Card><Text style={{ fontWeight: '900' }}>{item.title}</Text><Badge label={item.status} /><Text>{item.locationText || '-'}</Text></Card>
        </Pressable>
      )} />
    </DashboardLayout>
  );
}
