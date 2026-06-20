import React, { useEffect } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { navigationRef } from "./navigationRef";

import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Text } from "react-native";

import { useAuth } from "@/api/auth/hooks";
import { initDb } from "@/offline/db";
import { RoleGuard, type UserRole } from "@/RoleGuard";

import { LoginScreen } from "@/features/login/LoginScreen";
import { RegisterScreen } from "@/features/register/RegisterScreen";
import { DashboardScreen } from "@/features/dashboard/DashboardScreen";
import { ReportListScreen } from "@/features/reports/ReportListScreen";
import { ReportDetailScreen } from "@/features/reports/ReportDetailScreen";
import { CreateReportScreen } from "@/features/reports/CreateReportScreen";
import { FeedbackScreen } from "@/features/reports/FeedbackScreen";
import { NotificationScreen } from "@/features/notifications/NotificationScreen";
import { ProfileScreen } from "@/features/profile/ProfileScreen";
import { OfflineQueueScreen } from "@/features/offline/OfflineQueueScreen";

import { AdminReportsScreen } from "@/features/admin/AdminReportsScreen";
import { VerifyRejectReportScreen } from "@/features/admin/VerifyRejectReportScreen";
import { AssignTechnicianScreen } from "@/features/admin/AssignTechnicianScreen";

import { CategoryScreen } from "@/features/categories/CategoryScreen";
import { LocationScreen } from "@/features/locations/LocationScreen";

import { TechnicianTasksScreen } from "@/features/technician/TechnicianTasksScreen";
import { UpdateStatusScreen } from "@/features/technician/UpdateStatusScreen";
import { RepairNoteScreen } from "@/features/technician/RepairNoteScreen";

import { UploadMediaScreen } from "@/features/media/UploadMediaScreen";
import { NotFoundScreen } from "@/features/notFound";

export type RootStackParamList = {
  Login: undefined;
  Register: undefined;
  MainTabs: undefined;
  ReportDetail: { id: string };
  CreateReport: undefined;
  Feedback: { id: string };
  VerifyRejectReport: { id: string };
  AssignTechnician: { id: string };
  UpdateStatus: { id: string };
  RepairNote: { id: string };
  UploadMedia: {
    reportId: string;
    mediaType?: "DAMAGE_PHOTO" | "REPAIR_PROOF" | "ADDITIONAL_EVIDENCE";
  };
  NotFound: undefined;
};

export type MainTabParamList = {
  Dashboard: undefined;
  Reports: undefined;
  Admin: undefined;
  Technician: undefined;
  Notifications: undefined;
  Offline: undefined;
  Profile: undefined;
  Categories: undefined;
  Locations: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<MainTabParamList>();

const ALL_ROLES: UserRole[] = ["STUDENT", "STAFF", "TECHNICIAN", "ADMIN"];
const REPORT_CREATOR_ROLES: UserRole[] = ["STUDENT", "STAFF", "ADMIN"];
const ADMIN_ONLY: UserRole[] = ["ADMIN"];
const TECHNICIAN_ONLY: UserRole[] = ["TECHNICIAN"];
const TECHNICIAN_OR_ADMIN: UserRole[] = ["TECHNICIAN", "ADMIN"];

function TabIcon({ label }: { label: string }) {
  return <Text>{label}</Text>;
}

function MainTabs() {
  const { user } = useAuth();

  return (
    <Tab.Navigator screenOptions={{ headerShown: false }}>
      <Tab.Screen
        name="Dashboard"
        options={{
          tabBarIcon: () => <TabIcon label="🏠" />,
        }}
      >
        {(props) => (
          <RoleGuard allowedRoles={ALL_ROLES}>
            <DashboardScreen {...props}/>
          </RoleGuard>
        )}
      </Tab.Screen>

      <Tab.Screen
        name="Reports"
        options={{
          title: "Laporan",
          tabBarIcon: () => <TabIcon label="📋" />,
        }}
      >
        {(props) => (
          <RoleGuard allowedRoles={ALL_ROLES}>
            <ReportListScreen {...props} />
          </RoleGuard>
        )}
      </Tab.Screen>

      {user?.role === "ADMIN" ? (
        <Tab.Screen
          name="Admin"
          options={{
            title: "Admin",
            tabBarIcon: () => <TabIcon label="🛡️" />,
          }}
        >
          {(props) => (
            <RoleGuard allowedRoles={ADMIN_ONLY}>
              <AdminReportsScreen {...props} />
            </RoleGuard>
          )}
        </Tab.Screen>
      ) : null}

      {user?.role === "TECHNICIAN" ? (
        <Tab.Screen
          name="Technician"
          options={{
            title: "Tugas",
            tabBarIcon: () => <TabIcon label="🛠️" />,
          }}
        >
          {(props) => (
            <RoleGuard allowedRoles={TECHNICIAN_ONLY}>
              <TechnicianTasksScreen {...props}/>
            </RoleGuard>
          )}
        </Tab.Screen>
      ) : null}

      {user?.role === "ADMIN" ? (
        <Tab.Screen
          name="Categories"
          options={{
            title: "Kategori",
            tabBarIcon: () => <TabIcon label="🏷️" />,
          }}
        >
          {() => (
            <RoleGuard allowedRoles={ADMIN_ONLY}>
              <CategoryScreen />
            </RoleGuard>
          )}
        </Tab.Screen>
      ) : null}

      {user?.role === "ADMIN" ? (
        <Tab.Screen
          name="Locations"
          options={{
            title: "Lokasi",
            tabBarIcon: () => <TabIcon label="📍" />,
          }}
        >
          {() => (
            <RoleGuard allowedRoles={ADMIN_ONLY}>
              <LocationScreen />
            </RoleGuard>
          )}
        </Tab.Screen>
      ) : null}

      <Tab.Screen
        name="Notifications"
        options={{
          title: "Notif",
          tabBarIcon: () => <TabIcon label="🔔" />,
        }}
      >
        {() => (
          <RoleGuard allowedRoles={ALL_ROLES}>
            <NotificationScreen />
          </RoleGuard>
        )}
      </Tab.Screen>

      <Tab.Screen
        name="Offline"
        options={{
          title: "Offline",
          tabBarIcon: () => <TabIcon label="📦" />,
        }}
      >
        {() => (
          <RoleGuard allowedRoles={ALL_ROLES}>
            <OfflineQueueScreen />
          </RoleGuard>
        )}
      </Tab.Screen>

      <Tab.Screen
        name="Profile"
        options={{
          title: "Profil",
          tabBarIcon: () => <TabIcon label="👤" />,
        }}
      >
        {() => (
          <RoleGuard allowedRoles={ALL_ROLES}>
            <ProfileScreen />
          </RoleGuard>
        )}
      </Tab.Screen>
    </Tab.Navigator>
  );
}

export function AppRouter() {
  const { user, bootstrapping, restore } = useAuth();

  useEffect(() => {
    void initDb();
    void restore();
  }, []);

  if (bootstrapping) return null;

  return (
    <NavigationContainer ref={navigationRef}>
      <Stack.Navigator>
        {!user ? (
          <>
            <Stack.Screen
              name="Login"
              component={LoginScreen}
              options={{ headerShown: false }}
            />

            <Stack.Screen
              name="Register"
              component={RegisterScreen}
              options={{ title: "Register" }}
            />
          </>
        ) : (
          <>
            <Stack.Screen
              name="MainTabs"
              component={MainTabs}
              options={{ headerShown: false }}
            />

            <Stack.Screen
              name="CreateReport"
              options={{ title: "Buat Laporan" }}
            >
              {(props) => (
                <RoleGuard allowedRoles={REPORT_CREATOR_ROLES}>
                  <CreateReportScreen {...props} />
                </RoleGuard>
              )}
            </Stack.Screen>

            <Stack.Screen
              name="ReportDetail"
              options={{ title: "Detail Laporan" }}
            >
              {(props) => (
                <RoleGuard allowedRoles={ALL_ROLES}>
                  <ReportDetailScreen {...props} />
                </RoleGuard>
              )}
            </Stack.Screen>

            <Stack.Screen name="Feedback" options={{ title: "Feedback" }}>
              {(props) => (
                <RoleGuard allowedRoles={ALL_ROLES}>
                  <FeedbackScreen {...props} />
                </RoleGuard>
              )}
            </Stack.Screen>

            <Stack.Screen
              name="VerifyRejectReport"
              options={{ title: "Verifikasi / Tolak" }}
            >
              {(props) => (
                <RoleGuard allowedRoles={ADMIN_ONLY}>
                  <VerifyRejectReportScreen {...props} />
                </RoleGuard>
              )}
            </Stack.Screen>

            <Stack.Screen
              name="AssignTechnician"
              options={{ title: "Assign Teknisi" }}
            >
              {(props) => (
                <RoleGuard allowedRoles={ADMIN_ONLY}>
                  <AssignTechnicianScreen {...props} />
                </RoleGuard>
              )}
            </Stack.Screen>

            <Stack.Screen
              name="UpdateStatus"
              options={{ title: "Update Status" }}
            >
              {(props) => (
                <RoleGuard allowedRoles={TECHNICIAN_OR_ADMIN}>
                  <UpdateStatusScreen {...props} />
                </RoleGuard>
              )}
            </Stack.Screen>

            <Stack.Screen
              name="RepairNote"
              options={{ title: "Catatan Perbaikan" }}
            >
              {(props) => (
                <RoleGuard allowedRoles={TECHNICIAN_OR_ADMIN}>
                  <RepairNoteScreen {...props} />
                </RoleGuard>
              )}
            </Stack.Screen>

            <Stack.Screen
              name="UploadMedia"
              options={{ title: "Upload Media" }}
            >
              {(props) => (
                <RoleGuard allowedRoles={ALL_ROLES}>
                  <UploadMediaScreen {...props} />
                </RoleGuard>
              )}
            </Stack.Screen>

            <Stack.Screen name="NotFound" options={{ title: "404" }}>
              {() => (
                <RoleGuard allowedRoles={ALL_ROLES}>
                  <NotFoundScreen />
                </RoleGuard>
              )}
            </Stack.Screen>
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}