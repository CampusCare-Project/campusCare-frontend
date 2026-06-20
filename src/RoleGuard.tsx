import { ReactNode, useEffect } from "react";
import { ActivityIndicator, View } from "react-native";
import { toast } from "sonner-native";

import { resetTo,resetToMainTabs } from "@/app/navigationRef";
import { useAuth } from "@/api/auth/hooks";

export type UserRole = "STUDENT" | "STAFF" | "TECHNICIAN" | "ADMIN";

type RoleGuardProps = {
  children: ReactNode;
  allowedRoles?: UserRole[];
};

export function RoleGuard({ children, allowedRoles }: RoleGuardProps) {
  const { user, token, bootstrapping } = useAuth();

  const isAllowed =
    !allowedRoles || Boolean(user && allowedRoles.includes(user.role));

  useEffect(() => {
    if (bootstrapping) return;

    if (!token || !user) {
      toast.error("Silakan login terlebih dahulu.");
      resetTo("Login");
      return;
    }

    if (!isAllowed) {
      toast.error("Kamu tidak memiliki akses ke halaman ini.");
      resetToMainTabs("Dashboard");
    }
  }, [bootstrapping, token, user?.role, isAllowed]);

  if (bootstrapping) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
        <ActivityIndicator />
      </View>
    );
  }

  if (!token || !user) return null;
  if (!isAllowed) return null;

  return <>{children}</>;
}