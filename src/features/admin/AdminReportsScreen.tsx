import { useEffect } from 'react';
import { FlatList, Pressable, Text } from 'react-native';
import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { DashboardLayout } from '@/layouts/DashboardLayout';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Loading } from '@/components/ui/Loading';
import { useReports } from '@/api/reports/hooks';
import type { MainTabParamList } from '@/app/router1';

type Props = BottomTabScreenProps<MainTabParamList, 'Admin'>;

export function AdminReportsScreen({ navigation }: Props) {
  const { items, loading, fetchReports } = useReports();
  useEffect(() => { void fetchReports({ limit: 100 }); }, []);
  if (loading) return <Loading text="Memuat laporan admin..." />;
  return (
    <DashboardLayout title="Admin Panel">
        <Text
        testID="admin-reports-title"
        accessibilityLabel="admin-reports-title"
        style={{ fontWeight: "900", fontSize: 18, marginBottom: 12 }}
      >
        Admin Panel
      </Text>
      <FlatList
        scrollEnabled={false}
        data={items}
        keyExtractor={(i) => i.id}
        renderItem={({ item,index }) => (
          <Pressable
            testID={`admin-report-detail-button-${index}`}
            accessibilityLabel={`admin-report-detail-button-${index}`}
          onPress={() => (navigation as any).getParent()?.navigate('ReportDetail', { id: item.id })}>
            <Card>
              <Text 
                testID={`admin-report-title-${index}`}
                accessibilityLabel={`admin-report-title-${index}`}
              style={{ fontWeight: '900' }}>{item.title}</Text>
              <Badge label={`${item.status} • ${item.priority}`} />
            </Card>
          </Pressable>
        )}
      />
    </DashboardLayout>
  );
}
