import { useEffect } from 'react';
import { Alert, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Screen } from '@/components/ui/Screen';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Loading } from '@/components/ui/Loading';
import { useAuth } from '@/api/auth/hooks';
import { useReports } from '@/api/reports/hooks';
import type { RootStackParamList } from '@/app/router';

type Props = NativeStackScreenProps<RootStackParamList, 'ReportDetail'>;

export function ReportDetailScreen({ route, navigation }: Props) {
  const { id } = route.params;
  const { user } = useAuth();
  const { selected, fetchReportDetail } = useReports();

  useEffect(() => { void fetchReportDetail(id); }, [id]);

  if (!selected || selected.id !== id) return <Loading text="Mengambil detail laporan..." />;

  const isAdmin = user?.role === 'ADMIN';
  const isTechnician = user?.role === 'TECHNICIAN';
  const isReporter = user?.id_user === selected.reporterId;

  return (
    <Screen>
      <Card>
        <Text style={{ fontSize: 22, fontWeight: '900' }}>{selected.title}</Text>
        <View style={{ flexDirection: 'row', gap: 8, flexWrap: 'wrap' }}>
          <Badge label={selected.status} />
          <Badge label={selected.priority} />
          {selected.category?.name ? <Badge label={selected.category.name} /> : null}
        </View>
        <Text style={{ color: '#334155' }}>{selected.description}</Text>
        <Text style={{ color: '#64748B' }}>Lokasi: {selected.locationText || selected.room?.name || '-'}</Text>
        <Text style={{ color: '#64748B' }}>Dibuat: {new Date(selected.createdAt).toLocaleString()}</Text>
        {selected.rejectionReason ? <Text style={{ color: '#DC2626' }}>Alasan ditolak: {selected.rejectionReason}</Text> : null}
        {selected.resolvedNote ? <Text style={{ color: '#16A34A' }}>Catatan selesai: {selected.resolvedNote}</Text> : null}
      </Card>

      {selected.media?.length ? (
        <Card>
          <Text style={{ fontWeight: '900' }}>Media</Text>
          {selected.media.map((m) => <Text key={m.id}>• {m.type} — {m.caption || m.mediaId}</Text>)}
        </Card>
      ) : null}

      {selected.repairNotes?.length ? (
        <Card>
          <Text style={{ fontWeight: '900' }}>Catatan Perbaikan</Text>
          {selected.repairNotes.map((n) => <Text key={n.id}>• {n.note} ({n.visibility})</Text>)}
        </Card>
      ) : null}

      {isAdmin && selected.status === 'PENDING' ? <Button title="Verifikasi / Tolak" onPress={() => navigation.navigate('VerifyRejectReport', { id })} /> : null}
      {isAdmin && ['VERIFIED', 'ASSIGNED'].includes(selected.status) ? <Button title="Assign Teknisi" onPress={() => navigation.navigate('AssignTechnician', { id })} /> : null}
      {(isTechnician || isAdmin) && ['ASSIGNED', 'IN_PROGRESS'].includes(selected.status) ? <Button title="Update Status" onPress={() => navigation.navigate('UpdateStatus', { id })} /> : null}
      {(isTechnician || isAdmin) ? <Button title="Tambah Catatan Perbaikan" variant="secondary" onPress={() => navigation.navigate('RepairNote', { id })} /> : null}
      {(isTechnician || isAdmin || isReporter) ? <Button title="Upload Media" variant="secondary" onPress={() => navigation.navigate('UploadMedia', { reportId: id })} /> : null}
      {isReporter && selected.status === 'RESOLVED' && !selected.feedback ? <Button title="Beri Feedback" onPress={() => navigation.navigate('Feedback', { id })} /> : null}
      {selected.status === 'CANCELLED' ? <Button title="Laporan Dibatalkan" disabled onPress={() => Alert.alert('Info')} /> : null}
    </Screen>
  );
}
