import type { PropsWithChildren } from 'react';
import { Text } from 'react-native';
import { useAuth } from '@/api/auth/hooks';
import type { UserRole } from '@/constants/roles';

export function RoleGuard({ roles, children }: PropsWithChildren<{ roles: UserRole[] }>) {
  const { user } = useAuth();
  if (!user || !roles.includes(user.role)) return <Text>Forbidden</Text>;
  return <>{children}</>;
}
