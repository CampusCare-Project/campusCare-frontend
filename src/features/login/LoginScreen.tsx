import { useState } from 'react';
import { Alert, Pressable, Text } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AuthLayout } from '@/layouts/AuthLayout';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useAuth } from '@/api/auth/hooks';
import type { RootStackParamList } from '@/app/router';

type Props = NativeStackScreenProps<RootStackParamList, 'Login'>;

export function LoginScreen({ navigation }: Props) {
  const { login, loading } = useAuth();
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async () => {
    try {
      await login(identifier, password);
    } catch (error: any) {
      Alert.alert('Login gagal', error?.message || 'Cek username/email dan password.');
    }
  };

  return (
    <AuthLayout title="Masuk">
      <Input label="Username / Email / Nama" value={identifier} onChangeText={setIdentifier} placeholder="admin / email@kampus.ac.id" autoCapitalize="none" />
      <Input label="Password" value={password} onChangeText={setPassword} placeholder="Password" secureTextEntry />
      <Button title="Masuk" onPress={handleLogin} loading={loading} />
      <Pressable onPress={() => navigation.navigate('Register')}>
        <Text style={{ textAlign: 'center', color: '#2563EB', fontWeight: '700' }}>Belum punya akun? Register</Text>
      </Pressable>
    </AuthLayout>
  );
}
