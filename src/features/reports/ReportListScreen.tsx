import { useCallback, useEffect, useMemo, useState } from "react";
import { FlatList, Pressable, StyleSheet, Text, View } from "react-native";
import type { BottomTabScreenProps } from "@react-navigation/bottom-tabs";
import { useFocusEffect } from "@react-navigation/native";
import { DashboardLayout } from "@/layouts/DashboardLayout";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { Loading } from "@/components/ui/Loading";
import { SearchInput } from "@/components/ui/SearchInput";
import { DateRangePickerFilter } from "@/components/ui/DateRangerFilter";

import { useAuth } from "@/api/auth/hooks";
import { authService } from "@/api/auth/service";
import { User } from "@/api/auth/types";

import { useReports } from "@/api/reports/hooks";
import { searchInFields } from "@/utils/search";

import type { MainTabParamList } from "@/app/router";

type Props = BottomTabScreenProps<MainTabParamList, "Reports">;

function formatDate(value?: string | Date | null) {
  if (!value) return "-";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "-";
  }

  return date.toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function parseDateInput(value: string, endOfDay = false) {
  const trimmed = value.trim();

  if (!trimmed) return null;

  const date = new Date(`${trimmed}T${endOfDay ? "23:59:59" : "00:00:00"}`);

  if (Number.isNaN(date.getTime())) {
    return "INVALID" as const;
  }

  return date;
}

function getDateRangeError(startDate: string, endDate: string) {
  const start = parseDateInput(startDate);
  const end = parseDateInput(endDate, true);

  if (start === "INVALID") {
    return "Tanggal awal tidak valid. Gunakan format YYYY-MM-DD.";
  }

  if (end === "INVALID") {
    return "Tanggal akhir tidak valid. Gunakan format YYYY-MM-DD.";
  }

  if (start && end && start > end) {
    return "Tanggal awal tidak boleh lebih besar dari tanggal akhir.";
  }

  return null;
}

function isReportInDateRange(reportDateValue: unknown, startDate: string, endDate: string) {
  const error = getDateRangeError(startDate, endDate);

  if (error) return true;

  const start = parseDateInput(startDate);
  const end = parseDateInput(endDate, true);

  if (!start && !end) return true;

  if (!reportDateValue) return false;

  const reportDate = new Date(String(reportDateValue));

  if (Number.isNaN(reportDate.getTime())) return false;

  if (start && reportDate < start) return false;
  if (end && reportDate > end) return false;

  return true;
}

function getStatusLabel(status?: string) {
  if (!status) return "-";

  const labels: Record<string, string> = {
    PENDING: "Menunggu",
    VERIFIED: "Diverifikasi",
    ASSIGNED: "Ditugaskan",
    IN_PROGRESS: "Diproses",
    RESOLVED: "Selesai",
    REJECTED: "Ditolak",
    CANCELLED: "Dibatalkan",
  };

  return labels[status] || status;
}

function getPriorityLabel(priority?: string) {
  if (!priority) return "-";

  const labels: Record<string, string> = {
    LOW: "Rendah",
    MEDIUM: "Sedang",
    HIGH: "Tinggi",
    URGENT: "Darurat",
  };

  return labels[priority] || priority;
}
function getUserDisplayName(user?: User | null) {
  if (!user) return null;

  return user.name || user.username || user.email || null;
}

function getReporterId(report: any) {
  return (
    report?.reporterId ||
    report?.userId ||
    report?.createdById ||
    report?.creatorId ||
    null
  );
}

function getTechnicianId(report: any) {
  return (
    report?.technicianId ||
    report?.assignedTechnicianId ||
    report?.assignedToId ||
    report?.assigneeId ||
    report?.assignedToTechnicianId ||
    report?.technicianUserId ||
    report?.assignedTechnicianUserId ||
    report?.assignedTo ||
    null
  );
}

export function ReportListScreen({ navigation }: Props) {
  const { user } = useAuth();
  const {items, loading, fetchReports } = useReports();

  const [searchQuery, setSearchQuery] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
const [usersById, setUsersById] = useState<Record<string, User>>({});
const [usersLoading, setUsersLoading] = useState(false);
useFocusEffect(
  useCallback(() => {
    void fetchReports({ limit: 50 });

    return undefined;
  }, [])
);
  
useEffect(() => {
  if (!items.length) return;

  const allIds = items
    .flatMap((report: any) => [
      getReporterId(report),
      getTechnicianId(report),
    ])
    .filter(Boolean)
    .filter((value, index, array) => array.indexOf(value) === index) as string[];

  const missingIds = allIds.filter((userId) => !usersById[userId]);

  if (missingIds.length === 0) return;

  let alive = true;

  const fetchUsers = async () => {
    try {
      setUsersLoading(true);

      const results = await Promise.allSettled(
        missingIds.map(async (userId) => {
          const userData = await authService.getUserById(userId);

          return {
            userId,
            user: userData as User,
          };
        })
      );

      if (!alive) return;

      setUsersById((prev) => {
        const next = { ...prev };

        for (const result of results) {
          if (result.status === "fulfilled" && result.value.user) {
            next[result.value.userId] = result.value.user;
          } else if (result.status === "rejected") {
            console.log("FETCH USER DETAIL FAILED:", result.reason);
          }
        }

        return next;
      });
    } catch (error) {
      console.log("FETCH USERS ERROR:", error);
    } finally {
      if (alive) setUsersLoading(false);
    }
  };

  void fetchUsers();

  return () => {
    alive = false;
  };
}, [items, usersById]);




  const dateRangeError = useMemo(() => {
    return getDateRangeError(startDate, endDate);
  }, [startDate, endDate]);

  const filteredReports = useMemo(() => {
    return items.filter((item) => {
      const report: any = item;

      const matchesSearch = searchInFields(searchQuery, [
        report.title,
        report.description,
        report.status,
        report.priority,
        report.category?.name,
        report.categoryName,
        report.location?.name,
        report.building?.name,
        report.room?.name,
        report.roomName,
        report.buildingName,
        report.reporter?.name,
        report.creator?.name,
        report.assignedTechnician?.name,
        report.technician?.name,
      ]);

      const matchesDate = isReportInDateRange(
        report.createdAt || report.reportedAt || report.updatedAt,
        startDate,
        endDate
      );

      return matchesSearch && matchesDate;
    });
  }, [items, searchQuery, startDate, endDate]);

  const canCreateReport =
    user?.role === "STUDENT" || user?.role === "STAFF" || user?.role === "ADMIN";

  if (loading) return <Loading text="Mengambil laporan..." />;

  return (
    <DashboardLayout title="Laporan">
      <View style={styles.header}>
        <View style={{ flex: 1 }}>
          <Text style={styles.pageTitle}>Daftar Laporan</Text>
          <Text style={styles.pageSubtitle}>
            Lihat laporan kerusakan, status penanganan, prioritas, lokasi, dan
            detail pelapor.
          </Text>
        </View>
      </View>

      {canCreateReport ? (
        <Button
          title="+ Buat Laporan"
          onPress={() => (navigation as any).getParent()?.navigate("CreateReport")}
        />
      ) : null}

      <View style={styles.filterSection}>
        <SearchInput
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Cari judul, status, prioritas, lokasi, pelapor..."
          helperText={
            searchQuery.trim()
              ? `Hasil pencarian untuk "${searchQuery}"`
              : "Cari berdasarkan judul, deskripsi, status, prioritas, lokasi, atau pelapor."
          }
        />

       <DateRangePickerFilter
  startDate={startDate}
  endDate={endDate}
  onChangeStartDate={setStartDate}
  onChangeEndDate={setEndDate}
  errorText={dateRangeError}
  onClear={() => {
    setStartDate("");
    setEndDate("");
  }}
/>
      </View>

      <View style={styles.summaryRow}>
        <Card>
          <Text style={styles.summaryValue}>{items.length}</Text>
          <Text style={styles.summaryLabel}>Total Laporan</Text>
        </Card>

        <Card>
          <Text style={styles.summaryValue}>{filteredReports.length}</Text>
          <Text style={styles.summaryLabel}>Ditampilkan</Text>
        </Card>
      </View>

      {filteredReports.length === 0 ? (
        <EmptyState
          title={items.length === 0 ? "Belum ada laporan" : "Laporan tidak ditemukan"}
          message={
            items.length === 0
              ? "Buat laporan baru atau tarik untuk refresh."
              : "Coba ubah kata kunci pencarian atau rentang tanggal."
          }
        />
      ) : null}

      <FlatList
        scrollEnabled={false}
        data={filteredReports}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => {
          const report: any = item;

          const locationName =
            report.room?.name ||
            report.roomName ||
            report.location?.name ||
            report.building?.name ||
            report.buildingName ||
            "-";

          const categoryName =
            report.category?.name || report.categoryName || "-";

   const reporterId = getReporterId(report);
const technicianId = getTechnicianId(report);

const reporterName =
  report.user?.name ||
  report.reporter?.name ||
  report.creator?.name ||
  getUserDisplayName(reporterId ? usersById[reporterId] : null) ||
  (reporterId ? (usersLoading ? "Memuat..." : `ID: ${reporterId}`) : "-");

const technicianName =
  report.assignedTechnician?.name ||
  report.technician?.name ||
  getUserDisplayName(technicianId ? usersById[technicianId] : null) ||
  (technicianId ? (usersLoading ? "Memuat..." : `ID: ${technicianId}`) : "-");

          const createdAt =
            report.createdAt || report.reportedAt || report.updatedAt;

          return (
            <Pressable
              onPress={() =>
                (navigation as any)
                  .getParent()
                  ?.navigate("ReportDetail", { id: item.id })
              }
            >
              <Card>
                <View style={styles.cardHeader}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.reportTitle}>{report.title}</Text>
                    <Text numberOfLines={2} style={styles.description}>
                      {report.description || "Tidak ada deskripsi."}
                    </Text>
                  </View>
                </View>

                <View style={styles.badgeRow}>
                  <Badge label={`${getStatusLabel(report.status)} • ${getPriorityLabel(report.priority)}`} />
                  <Badge label={categoryName} />
                </View>

                <View style={styles.detailGrid}>
                  <View style={styles.detailItem}>
                    <Text style={styles.detailLabel}>Tanggal</Text>
                    <Text style={styles.detailValue}>{formatDate(createdAt)}</Text>
                  </View>

                  <View style={styles.detailItem}>
                    <Text style={styles.detailLabel}>Lokasi</Text>
                    <Text style={styles.detailValue}>{locationName}</Text>
                  </View>

                  <View style={styles.detailItem}>
                    <Text style={styles.detailLabel}>Pelapor</Text>
                    <Text style={styles.detailValue}>{reporterName}</Text>
                  </View>

                  <View style={styles.detailItem}>
                    <Text style={styles.detailLabel}>Teknisi</Text>
                    <Text style={styles.detailValue}>{technicianName}</Text>
                  </View>
                </View>

                <Text style={styles.openDetailText}>Tekan untuk melihat detail →</Text>
              </Card>
            </Pressable>
          );
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
  summaryValue: {
    fontSize: 22,
    fontWeight: "900",
    color: "#0F172A",
  },
  summaryLabel: {
    marginTop: 2,
    fontSize: 13,
    color: "#64748B",
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
  },
  reportTitle: {
    fontWeight: "900",
    fontSize: 16,
    color: "#0F172A",
  },
  description: {
    marginTop: 4,
    color: "#64748B",
    fontSize: 13,
    lineHeight: 19,
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
  openDetailText: {
    marginTop: 12,
    fontSize: 12,
    color: "#2563EB",
    fontWeight: "900",
  },
});