import { useState } from 'react';
import { Alert, Pressable, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Screen } from '@/components/ui/Screen';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Input } from '@/components/ui/Input';
import { reportService } from '@/api/reports/service';
import type { RootStackParamList } from '@/app/router1';
import type { ReportStatus } from '@/api/reports/types';

type Props = NativeStackScreenProps<RootStackParamList, 'UpdateStatus'>;

export function UpdateStatusScreen({ route, navigation }: Props) {
  const { id } = route.params;
  const [status, setStatus] = useState<ReportStatus>('IN_PROGRESS');
  const [note, setNote] = useState('');
  const [resolvedNote, setResolvedNote] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    setLoading(true);
    try {
      await reportService.updateStatus(id, { status, note, resolvedNote: status === 'RESOLVED' ? resolvedNote : undefined });
      Alert.alert('Berhasil', 'Status laporan berhasil diupdate.');
      navigation.goBack();
    } catch (e: any) { Alert.alert('Gagal', e?.message || 'Update status gagal'); }
    finally { setLoading(false); }
  };

  return (
    <Screen>
      <Text style={{ fontWeight: '900' }}>Pilih Status</Text>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
        {(['IN_PROGRESS', 'RESOLVED', 'CANCELLED'] as ReportStatus[]).map((s) => <Pressable key={s} onPress={() => setStatus(s)}><Badge label={`${status === s ? '✓ ' : ''}${s}`} /></Pressable>)}
      </View>
      <Input label="Catatan" value={note} onChangeText={setNote} multiline />
      {status === 'RESOLVED' ? <Input label="Catatan penyelesaian" value={resolvedNote} onChangeText={setResolvedNote} multiline /> : null}
      <Button title="Update Status" loading={loading} onPress={submit} />
    </Screen>
  );
}
