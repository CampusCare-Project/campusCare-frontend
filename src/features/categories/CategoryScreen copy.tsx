import { useState } from 'react';
import { Alert, FlatList, Text } from 'react-native';
import { DashboardLayout } from '@/layouts/DashboardLayout';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { useCategories } from '@/api/categories/hooks';
import { categoryService } from '@/api/categories/service';

export function CategoryScreen() {
  const { items, fetchCategories } = useCategories(true);
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');

  const create = async () => {
    try {
      await categoryService.create({ name, slug, description, defaultSlaHours: 72 });
      setName(''); setSlug(''); setDescription('');
      await fetchCategories();
    } catch (e: any) { Alert.alert('Gagal', e?.message || 'Gagal membuat kategori'); }
  };

  return (
    <DashboardLayout title="Kategori Masalah">
      <Card>
        <Input label="Nama" value={name} onChangeText={setName} placeholder="AC" />
        <Input label="Slug" value={slug} onChangeText={setSlug} placeholder="ac" autoCapitalize="none" />
        <Input label="Deskripsi" value={description} onChangeText={setDescription} />
        <Button title="Tambah Kategori" onPress={create} />
      </Card>
      <FlatList scrollEnabled={false} data={items} keyExtractor={(i) => i.id} renderItem={({ item }) => (
        <Card><Text style={{ fontWeight: '900' }}>{item.name}</Text><Text>{item.description || '-'}</Text><Text>SLA: {item.defaultSlaHours} jam</Text></Card>
      )} />
    </DashboardLayout>
  );
}
