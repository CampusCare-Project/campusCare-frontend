import { useState } from 'react';
import { Alert } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AuthLayout } from '@/layouts/AuthLayout';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useAuth } from '@/api/auth/hooks';
import type { RootStackParamList } from '@/app/router1';

type Props = NativeStackScreenProps<RootStackParamList, 'Register'>;

export function RegisterScreen({ navigation }: Props) {
  const { register, loading } = useAuth();
  const [username, setUsername] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [passwordHash, setPasswordHash] = useState('');

  const handleRegister = async () => {
    try {
      await register({ username, name, email, passwordHash });
      Alert.alert('Berhasil', 'Akun berhasil dibuat. Silakan login.');
      navigation.goBack();
    } catch (error: any) {
      Alert.alert('Register gagal', error?.message || 'Cek data input.');
    }
  };

  return (
    <AuthLayout title="Daftar Akun">
      <Input label="Username" value={username} onChangeText={setUsername} autoCapitalize="none" />
      <Input label="Nama" value={name} onChangeText={setName} />
      <Input label="Email" value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" />
      <Input label="Password" value={passwordHash} onChangeText={setPasswordHash} secureTextEntry />
      <Button title="Register" onPress={handleRegister} loading={loading} />
    </AuthLayout>
  );
}
