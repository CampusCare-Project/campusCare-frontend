import { useEffect, useState } from 'react';
import { Alert, Image, Pressable, Text, View } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Screen } from '@/components/ui/Screen';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { useCategories } from '@/api/categories/hooks';
import { useLocations } from '@/api/locations/hooks';
import { reportService } from '@/api/reports/service';
import { mediaService } from '@/api/media/service';
import { saveLocalReport } from '@/offline/db';
import type { RootStackParamList } from '@/app/router';
import type { ReportPriority } from '@/api/reports/types';

type Props = NativeStackScreenProps<RootStackParamList, 'CreateReport'>;

export function CreateReportScreen({ navigation }: Props) {
  const { items: categories } = useCategories(true);
  const { buildings, rooms, fetchRooms } = useLocations(true);
  const [categoryId, setCategoryId] = useState('');
  const [buildingId, setBuildingId] = useState('');
  const [roomId, setRoomId] = useState('');
  const [priority, setPriority] = useState<ReportPriority>('MEDIUM');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [locationText, setLocationText] = useState('');
  const [coords, setCoords] = useState<{ latitude?: number; longitude?: number }>({});
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (buildingId) void fetchRooms(buildingId);
  }, [buildingId]);

const pickImage = async () => {
  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ["images"],
    quality: 0.75,
  });

  if (!result.canceled && result.assets?.[0]?.uri) {
    setImageUri(result.assets[0].uri);
  }
};
  // const pickImage = async () => {
  //   const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, quality: 0.75 });
  //   if (!result.canceled) setImageUri(result.assets[0].uri);
  // };

  const useCurrentLocation = async () => {
    const permission = await Location.requestForegroundPermissionsAsync();
    if (!permission.granted) return Alert.alert('Izin lokasi ditolak');
    const pos = await Location.getCurrentPositionAsync({});
    setCoords({ latitude: pos.coords.latitude, longitude: pos.coords.longitude });
    setLocationText((old) => old || `Lat ${pos.coords.latitude}, Long ${pos.coords.longitude}`);
  };

  const submitOnline = async () => {
    const payload = {
      clientLocalId: `mobile-${Date.now()}`,
      categoryId,
      buildingId: buildingId || undefined,
      roomId: roomId || undefined,
      title,
      description,
      priority,
      locationText,
      latitude: coords.latitude,
      longitude: coords.longitude,
    };

    const report = await reportService.create(payload);

    if (imageUri) {
      const media = await mediaService.upload({
        uri: imageUri,
        source: 'CAMERA',
        targetType: 'REPORT',
        targetId: report.id,
        usageType: 'REPORT_DAMAGE_PHOTO',
      });
      await reportService.addMedia(report.id, {
        mediaId: media.id,
        type: 'DAMAGE_PHOTO',
        caption: 'Foto kondisi kerusakan',
      });
    }

    return report;
  };

  const handleSubmit = async () => {
    if (!categoryId || !title || !description) return Alert.alert('Validasi', 'Kategori, judul, dan deskripsi wajib diisi.');
    setLoading(true);
    try {
      const report = await submitOnline();
      Alert.alert('Berhasil', 'Laporan berhasil dibuat.');
      navigation.replace('ReportDetail', { id: report.id });
    } catch (error: any) {
      await saveLocalReport({
        clientLocalId: `offline-${Date.now()}`,
        categoryId,
        buildingId: buildingId || undefined,
        roomId: roomId || undefined,
        title,
        description,
        priority,
        locationText,
        latitude: coords.latitude,
        longitude: coords.longitude,
      }, imageUri);
      Alert.alert('Disimpan offline', 'Koneksi/API gagal. Laporan disimpan di Offline Queue untuk disync nanti.');
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  };

  return (
    <Screen>
      <Input label="Judul" value={title} onChangeText={setTitle} placeholder="AC tidak dingin" />
      <Input label="Deskripsi" value={description} onChangeText={setDescription} placeholder="Jelaskan kerusakan" multiline numberOfLines={4} />
      <Text style={{ fontWeight: '900' }}>Kategori</Text>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
        {categories.map((c) => <Pressable key={c.id} onPress={() => setCategoryId(c.id)}><Badge label={`${categoryId === c.id ? '✓ ' : ''}${c.name}`} /></Pressable>)}
      </View>
      <Text style={{ fontWeight: '900' }}>Prioritas</Text>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
        {(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'] as ReportPriority[]).map((p) => <Pressable key={p} onPress={() => setPriority(p)}><Badge label={`${priority === p ? '✓ ' : ''}${p}`} /></Pressable>)}
      </View>
      <Text style={{ fontWeight: '900' }}>Gedung</Text>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
        {buildings.map((b) => <Pressable key={b.id} onPress={() => setBuildingId(b.id)}><Badge label={`${buildingId === b.id ? '✓ ' : ''}${b.name}`} /></Pressable>)}
      </View>
      <Text style={{ fontWeight: '900' }}>Ruangan</Text>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
        {rooms.map((r) => <Pressable key={r.id} onPress={() => setRoomId(r.id)}><Badge label={`${roomId === r.id ? '✓ ' : ''}${r.code}`} /></Pressable>)}
      </View>
      <Input label="Keterangan lokasi" value={locationText} onChangeText={setLocationText} placeholder="Gedung A, Lantai 1" />
      <Button title="Gunakan Lokasi Saat Ini" variant="secondary" onPress={useCurrentLocation} />
      <Button title="Pilih Foto Kerusakan" variant="secondary" onPress={pickImage} />
      {imageUri ? <Card><Image source={{ uri: imageUri }} style={{ height: 180, borderRadius: 12 }} /></Card> : null}
      <Button title="Kirim Laporan" loading={loading} onPress={handleSubmit} />
    </Screen>
  );
}
