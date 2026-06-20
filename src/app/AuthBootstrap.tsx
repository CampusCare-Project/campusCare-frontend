import { ReactNode, useEffect } from "react";
import { ActivityIndicator, View } from "react-native";

import { useAuth } from "@/api/auth/hooks";

type Props = {
  children: ReactNode;
};

export function AuthBootstrap({ children }: Props) {
  const { loading, restore } = useAuth();

  useEffect(() => {
    restore().catch(() => {
      // Tidak perlu toast di sini.
      //  RoleGuard akan redirect ke Login.
    });
  }, []);

  if (loading) {
    return (
      <View
        style={{
          flex: 1,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <ActivityIndicator />
      </View>
    );
  }

  return <>{children}</>;
}