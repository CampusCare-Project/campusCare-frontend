import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Text } from 'react-native';
import { useAuth } from '@/api/auth/hooks';
import { initDb } from '@/offline/db';
import { LoginScreen } from '@/features/login/LoginScreen';
import { RegisterScreen } from '@/features/register/RegisterScreen';
import { DashboardScreen } from '@/features/dashboard/DashboardScreen';
import { ReportListScreen } from '@/features/reports/ReportListScreen';
import { ReportDetailScreen } from '@/features/reports/ReportDetailScreen';
import { CreateReportScreen } from '@/features/reports/CreateReportScreen';
import { FeedbackScreen } from '@/features/reports/FeedbackScreen';
import { NotificationScreen } from '@/features/notifications/NotificationScreen';
import { ProfileScreen } from '@/features/profile/ProfileScreen';
import { OfflineQueueScreen } from '@/features/offline/OfflineQueueScreen';
import { AdminReportsScreen } from '@/features/admin/AdminReportsScreen';
import { VerifyRejectReportScreen } from '@/features/admin/VerifyRejectReportScreen';
import { AssignTechnicianScreen } from '@/features/admin/AssignTechnicianScreen';
import { CategoryScreen } from '@/features/categories/CategoryScreen';
import { LocationScreen } from '@/features/locations/LocationScreen';
import { TechnicianTasksScreen } from '@/features/technician/TechnicianTasksScreen';
import { UpdateStatusScreen } from '@/features/technician/UpdateStatusScreen';
import { RepairNoteScreen } from '@/features/technician/RepairNoteScreen';
import { UploadMediaScreen } from '@/features/media/UploadMediaScreen';
import { NotFoundScreen } from '@/features/notFound';

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
  UploadMedia: { reportId: string; mediaType?: 'DAMAGE_PHOTO' | 'REPAIR_PROOF' | 'ADDITIONAL_EVIDENCE' };
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

function TabIcon({ label }: { label: string }) {
  return <Text>{label}</Text>;
}

function MainTabs() {
  const { user } = useAuth();
  return (
    <Tab.Navigator screenOptions={{ headerShown: false }}>
      <Tab.Screen name="Dashboard" component={DashboardScreen} options={{ tabBarIcon: () => <TabIcon label="🏠" /> }} />
      <Tab.Screen name="Reports" component={ReportListScreen} options={{ title: 'Laporan', tabBarIcon: () => <TabIcon label="📋" /> }} />
      {user?.role === 'ADMIN' ? <Tab.Screen name="Admin" component={AdminReportsScreen} options={{ tabBarIcon: () => <TabIcon label="🛡️" /> }} /> : null}
      {user?.role === 'TECHNICIAN' ? <Tab.Screen name="Technician" component={TechnicianTasksScreen} options={{ title: 'Tugas', tabBarIcon: () => <TabIcon label="🛠️" /> }} /> : null}
      {user?.role === 'ADMIN' ? <Tab.Screen name="Categories" component={CategoryScreen} options={{ title: 'Kategori', tabBarIcon: () => <TabIcon label="🏷️" /> }} /> : null}
      {user?.role === 'ADMIN' ? <Tab.Screen name="Locations" component={LocationScreen} options={{ title: 'Lokasi', tabBarIcon: () => <TabIcon label="📍" /> }} /> : null}
      <Tab.Screen name="Notifications" component={NotificationScreen} options={{ title: 'Notif', tabBarIcon: () => <TabIcon label="🔔" /> }} />
      <Tab.Screen name="Offline" component={OfflineQueueScreen} options={{ title: 'Offline', tabBarIcon: () => <TabIcon label="📦" /> }} />
      <Tab.Screen name="Profile" component={ProfileScreen} options={{ title: 'Profil', tabBarIcon: () => <TabIcon label="👤" /> }} />
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
    <NavigationContainer>
      <Stack.Navigator>
        {!user ? (
          <>
            <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
            <Stack.Screen name="Register" component={RegisterScreen} options={{ title: 'Register' }} />
          </>
        ) : (
          <>
            <Stack.Screen name="MainTabs" component={MainTabs} options={{ headerShown: false }} />
            <Stack.Screen name="CreateReport" component={CreateReportScreen} options={{ title: 'Buat Laporan' }} />
            <Stack.Screen name="ReportDetail" component={ReportDetailScreen} options={{ title: 'Detail Laporan' }} />
            <Stack.Screen name="Feedback" component={FeedbackScreen} options={{ title: 'Feedback' }} />
            <Stack.Screen name="VerifyRejectReport" component={VerifyRejectReportScreen} options={{ title: 'Verifikasi / Tolak' }} />
            <Stack.Screen name="AssignTechnician" component={AssignTechnicianScreen} options={{ title: 'Assign Teknisi' }} />
            <Stack.Screen name="UpdateStatus" component={UpdateStatusScreen} options={{ title: 'Update Status' }} />
            <Stack.Screen name="RepairNote" component={RepairNoteScreen} options={{ title: 'Catatan Perbaikan' }} />
            <Stack.Screen name="UploadMedia" component={UploadMediaScreen} options={{ title: 'Upload Media' }} />
            <Stack.Screen name="NotFound" component={NotFoundScreen} options={{ title: '404' }} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
