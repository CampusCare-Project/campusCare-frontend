import { useCallback, useMemo, useState } from "react";
import { FlatList, Pressable, StyleSheet, Text, View } from "react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useFocusEffect } from "@react-navigation/native";
import { toast } from "sonner-native";
import { AddUserModal } from "@/features/users/components/AddUserModal";
import { DashboardLayout } from "@/layouts/DashboardLayout";
import { Button } from "@/components/ui/ButtonId";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { Loading } from "@/components/ui/Loading";
import { SearchInput } from "@/components/ui/SearchInput";

import { useAuth } from "@/api/auth/hooks";
import { useUsers } from "@/api/users/hooks";
import type { AppUser, UserStatus } from "@/api/users/types";
import type { UserRole } from "@/constants/roles";
import { getApiErrorMessage } from "@/utils/apiError";

import type { RootStackParamList } from "@/app/router1";

type Props = NativeStackScreenProps<RootStackParamList, "Users">;

function formatDate(value?: string | null) {
  if (!value) return "-";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "-";

  return date.toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function getRoleLabel(role?: UserRole) {
  const labels: Record<string, string> = {
    ADMIN: "Admin",
    STUDENT: "Mahasiswa",
    STAFF: "Staff",
    TECHNICIAN: "Teknisi",
  };

  return role ? labels[role] || role : "-";
}

function getStatusLabel(status?: UserStatus) {
  const labels: Record<string, string> = {
    ACTIVE: "Aktif",
    INACTIVE: "Nonaktif",
    BANNED: "Diblokir",
    DELETED: "Dihapus",
  };

  return status ? labels[status] || status : "-";
}

function searchInUser(query: string, user: AppUser) {
  const keyword = query.trim().toLowerCase();

  if (!keyword) return true;

  const values = [
    user.username,
    user.name,
    user.email,
    user.phone,
    user.role,
    user.status,
    user.identityNumber,
    user.department,
  ];

  return values.some((value) =>
    String(value ?? "")
      .toLowerCase()
      .includes(keyword)
  );
}

export function UserListScreen({ navigation }: Props) {
  const { user } = useAuth();

const { items, loading, saving, fetchUsers, addUser } = useUsers(
  undefined,
  false
);
const [addModalVisible, setAddModalVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const loadUsers = useCallback(async () => {
    try {
      await fetchUsers();
    } catch (error: any) {
      toast.error(getApiErrorMessage(error, "Gagal mengambil data user"));
    }
  }, [fetchUsers]);

  useFocusEffect(
    useCallback(() => {
      void loadUsers();

      return undefined;
    }, [loadUsers])
  );

  const filteredUsers = useMemo(() => {
    return items.filter((item) => searchInUser(searchQuery, item));
  }, [items, searchQuery]);

  const totalTechnicians = useMemo(() => {
    return items.filter((item) => item.role === "TECHNICIAN").length;
  }, [items]);

  const totalActive = useMemo(() => {
    return items.filter((item) => item.status === "ACTIVE").length;
  }, [items]);

  if (user?.role !== "ADMIN") {
    return (
      <DashboardLayout title="Manajemen User">
        <EmptyState
          title="Akses ditolak"
          message="Hanya ADMIN yang dapat mengakses halaman manajemen user."
        />
      </DashboardLayout>
    );
  }

  if (loading && items.length === 0) {
    return <Loading text="Mengambil data user..." />;
  }

  return (
    <DashboardLayout title="Manajemen User">
      <View style={styles.header}>
       <Text
  testID="users-title"
  accessibilityLabel="users-title"
  style={styles.pageTitle}
>
  Daftar User
</Text>
        <Text style={styles.pageSubtitle}>
          Kelola user aplikasi CampusCare seperti mahasiswa, staff, dan teknisi.
        </Text>
      </View>

    <Button
      testID="users-add-button"
  accessibilityLabel="users-add-button"
  title="+ Tambah User"
  onPress={() => setAddModalVisible(true)}
/>

      <View style={styles.filterSection}>
        <SearchInput
          testID="users-search-input"
  accessibilityLabel="users-search-input"
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Cari nama, username, email, role..."
          helperText={
            searchQuery.trim()
              ? `Hasil pencarian untuk "${searchQuery}"`
              : "Cari berdasarkan nama, username, email, role, status, atau departemen."
          }
        />
      </View>

      <View style={styles.summaryRow}>
        <View style={styles.summaryCard}>
          <Text style={styles.summaryValue}>{items.length}</Text>
          <Text style={styles.summaryLabel}>Total User</Text>
        </View>

        <View style={styles.summaryCard}>
          <Text style={styles.summaryValue}>{totalActive}</Text>
          <Text style={styles.summaryLabel}>Aktif</Text>
        </View>

        <View style={styles.summaryCard}>
          <Text style={styles.summaryValue}>{totalTechnicians}</Text>
          <Text style={styles.summaryLabel}>Teknisi</Text>
        </View>
      </View>

      {filteredUsers.length === 0 ? (
        <EmptyState
          title={items.length === 0 ? "Belum ada user" : "User tidak ditemukan"}
          message={
            items.length === 0
              ? "Tambahkan user baru untuk mulai menggunakan fitur ini."
              : "Coba ubah kata kunci pencarian."
          }
        />
      ) : null}

      <FlatList
        scrollEnabled={false}
        data={filteredUsers}
        keyExtractor={(item, index) => item.id_user || String(index)}
        renderItem={({ item,index}) => {
          const appUser = item;

          return (
            <Pressable
              testID={`user-card-${index}`}
  accessibilityLabel={`user-card-${index}`}
            >
              <Card>
                <View style={styles.cardHeader}>
                  <View style={{ flex: 1 }}>
                    <Text 
                      testID={`user-name-${index}`}
  accessibilityLabel={`user-name-${index}`}
                    style={styles.userName}>{appUser.name}</Text>

                    <Text 
                      testID={`user-username-${index}`}
  accessibilityLabel={`user-username-${index}`}
                    style={styles.userMeta}>
                      @{appUser.username}
                    </Text>

                    <Text
                      testID={`user-email-${index}`}
  accessibilityLabel={`user-email-${index}`}
                    style={styles.userEmail}>
                      {appUser.email}
                    </Text>
                  </View>

                  <Badge label={getRoleLabel(appUser.role)} />
                </View>

                <View style={styles.badgeRow}>
                  <Badge label={getStatusLabel(appUser.status)} />

                  {appUser.department ? (
                    <Badge label={appUser.department} />
                  ) : null}
                </View>

                <View style={styles.detailGrid}>
                  <View style={styles.detailItem}>
                    <Text style={styles.detailLabel}>No. Identitas</Text>
                    <Text style={styles.detailValue}>
                      {appUser.identityNumber || "-"}
                    </Text>
                  </View>

                  <View style={styles.detailItem}>
                    <Text style={styles.detailLabel}>Telepon</Text>
                    <Text style={styles.detailValue}>
                      {appUser.phone || "-"}
                    </Text>
                  </View>

                  <View style={styles.detailItem}>
                    <Text style={styles.detailLabel}>Dibuat</Text>
                    <Text style={styles.detailValue}>
                      {formatDate(appUser.createdAt)}
                    </Text>
                  </View>

                  <View style={styles.detailItem}>
                    <Text style={styles.detailLabel}>ID User</Text>
                    <Text 
                      testID={`user-id-${index}`}
  accessibilityLabel={`user-id-${index}`}
                    numberOfLines={1} style={styles.detailValue}>
                      {appUser.id_user}
                    </Text>
                  </View>
                </View>
              </Card>
            </Pressable>
          );
        }}
      />

<AddUserModal
  visible={addModalVisible}
  saving={saving}
  onClose={() => setAddModalVisible(false)}
  onSubmit={async (payload:any) => {
    try {
      await addUser(payload);

      toast.success("User berhasil ditambahkan");
      setAddModalVisible(false);

      await fetchUsers();
    } catch (error: any) {
    //   console.log("ADD USER ERROR STATUS:", error?.response?.status);
    //   console.log("ADD USER ERROR DATA:", error?.response?.data);

      toast.error(getApiErrorMessage(error, "Gagal menambahkan user"));
    }
  }}
/>

    </DashboardLayout>
  );
}

const styles = StyleSheet.create({
  header: {
    marginBottom: 16,
  },
  pageTitle: {
    fontSize: 24,
    fontWeight: "900",
    color: "#0F172A",
  },
  pageSubtitle: {
    marginTop: 4,
    fontSize: 14,
    color: "#64748B",
    lineHeight: 20,
  },
  filterSection: {
    marginTop: 16,
  },
  summaryRow: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 16,
  },
  summaryCard: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 16,
    padding: 12,
  },
  summaryValue: {
    fontSize: 22,
    fontWeight: "900",
    color: "#0F172A",
  },
  summaryLabel: {
    marginTop: 2,
    fontSize: 12,
    color: "#64748B",
    fontWeight: "700",
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
  },
  userName: {
    fontSize: 16,
    fontWeight: "900",
    color: "#0F172A",
  },
  userMeta: {
    marginTop: 3,
    fontSize: 12,
    color: "#2563EB",
    fontWeight: "800",
  },
  userEmail: {
    marginTop: 3,
    fontSize: 13,
    color: "#64748B",
    fontWeight: "700",
  },
  badgeRow: {
    marginTop: 12,
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  detailGrid: {
    marginTop: 14,
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  detailItem: {
    width: "48%",
    backgroundColor: "#F8FAFC",
    borderRadius: 12,
    padding: 10,
  },
  detailLabel: {
    fontSize: 11,
    color: "#64748B",
    fontWeight: "800",
    marginBottom: 3,
  },
  detailValue: {
    fontSize: 13,
    color: "#0F172A",
    fontWeight: "800",
  },
});