import type { PropsWithChildren } from 'react';
import { useAuth } from '@/api/auth/hooks';
import type { UserRole } from '@/constants/roles';
import { Loading } from '@/components/ui/Loading';

export function ProtectedRoute({ children, roles }: PropsWithChildren<{ roles?: UserRole[] }>) {
  const { user, bootstrapping } = useAuth();
  if (bootstrapping) return <Loading text="Memuat sesi..." />;
  if (!user) return null;
  if (roles && !roles.includes(user.role)) return null;
  return <>{children}</>;
}
