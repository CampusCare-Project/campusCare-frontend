import { Alert, Text } from 'react-native';
import { DashboardLayout } from '@/layouts/DashboardLayout';
// import { Button } from '@/components/ui/Button';
import { Button } from "@/components/ui/ButtonId";

import { Card } from '@/components/ui/Card';
import { useAuth } from '@/api/auth/hooks';

export function ProfileScreen() {
  const { user, logout } = useAuth();
  const handleLogout = async () => {
    try { await logout(); }
    catch { Alert.alert('Info', 'Session lokal dihapus.'); }
  };
  return (
    <DashboardLayout title="Profil">
      <Card>
        <Text style={{ fontWeight: '900', fontSize: 18 }}>{user?.name}</Text>
        <Text>{user?.email}</Text>
        <Text>Username: {user?.username}</Text>
        <Text>Role: {user?.role}</Text>
        <Text>Department: {user?.department || '-'}</Text>
      </Card>
      <Button 
      title="Logout" 
      variant="danger"  
        testID="profile-logout-button"
  accessibilityLabel="profile-logout-button"
      onPress={handleLogout} />
    </DashboardLayout>
  );
}
