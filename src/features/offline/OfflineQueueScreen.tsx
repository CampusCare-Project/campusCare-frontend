import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Alert,
  FlatList,
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useDispatch, useSelector } from "react-redux";

import { DashboardLayout } from "@/layouts/DashboardLayout";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { Badge } from "@/components/ui/Badge";
import { useCategories } from "@/api/categories/hooks";
import { useLocations } from "@/api/locations/hooks";

import type { AppDispatch, RootState } from "@/store";
import {
  loadOfflineQueueThunk,
  syncOfflineQueueThunk,
} from "@/store/slices/offlineSlice";

import {
  deleteLocalReport,
  listLocalReports,
  markLocalReportPending,
  type LocalReportRow,
} from "@/offline/db";

import type { CreateReportPayload } from "@/api/reports/types";

type ParsedPayload = Partial<CreateReportPayload> & Record<string, any>;

function parsePayload(payload: string): ParsedPayload {
  try {
    return JSON.parse(payload);
  } catch {
    return {};
  }
}

function formatDateTime(value?: string | null) {
  if (!value) return "-";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "-";
  }

  return date.toLocaleString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function getStatusLabel(status: LocalReportRow["status"]) {
  const labels: Record<LocalReportRow["status"], string> = {
    PENDING: "Menunggu Sync",
    FAILED: "Gagal Sync",
    SYNCED: "Tersinkron",
  };

  return labels[status] || status;
}

function getPriorityLabel(priority?: string | null) {
  const labels: Record<string, string> = {
    LOW: "Rendah",
    MEDIUM: "Sedang",
    HIGH: "Tinggi",
    URGENT: "Darurat",
    CRITICAL: "Kritis",
  };

  return priority ? labels[priority] || priority : "-";
}

function getCoordinateText(payload: ParsedPayload) {
  if (payload.latitude === undefined || payload.latitude === null) return "-";
  if (payload.longitude === undefined || payload.longitude === null) return "-";

  return `${payload.latitude}, ${payload.longitude}`;
}

function getCategoryName(payload: any, categories: any[]) {
  if (payload.categoryName) return payload.categoryName;

  const category = categories.find((item) => item.id === payload.categoryId);

  return category?.name || payload.categoryId || "-";
}

function getBuildingName(payload: any, buildings: any[]) {
  if (payload.buildingName) return payload.buildingName;

  const building = buildings.find((item) => item.id === payload.buildingId);

  return building?.name || payload.buildingId || "-";
}

function getRoomName(payload: any, rooms: any[]) {
  if (payload.roomName) return payload.roomName;

  const room = rooms.find((item) => item.id === payload.roomId);

  if (!room) return payload.roomId || "-";

  if (room.code && room.name) return `${room.code} - ${room.name}`;
  return room.name || room.code || payload.roomId || "-";
}

// helper to get Da name
function getCategoryDisplay(payload: ParsedPayload) {
  return payload.categoryName || payload.categoryId || "-";
}

function getBuildingDisplay(payload: ParsedPayload) {
  return payload.buildingName || payload.buildingId || "-";
}

function getRoomDisplay(payload: ParsedPayload) {
  return payload.roomName || payload.roomCode || payload.roomId || "-";
}

export function OfflineQueueScreen() {
  const dispatch = useDispatch<AppDispatch>();
  const { pendingCount, syncing } = useSelector((s: RootState) => s.offline);
  const { items: categories } = useCategories(true);
const { buildings, rooms } = useLocations(true);
  const [rows, setRows] = useState<LocalReportRow[]>([]);
  const [loading, setLoading] = useState(false);

  const reload = useCallback(async () => {
    try {
      setLoading(true);

      await dispatch(loadOfflineQueueThunk()).unwrap();

      const localRows = await listLocalReports();
      setRows(localRows);
    } finally {
      setLoading(false);
    }
  }, [dispatch]);

  useEffect(() => {
    void reload();
  }, [reload]);

  const summary = useMemo(() => {
    const failed = rows.filter((row) => row.status === "FAILED").length;
    const pending = rows.filter((row) => row.status === "PENDING").length;

    return {
      pending,
      failed,
      total: rows.length,
    };
  }, [rows]);

  const sync = async () => {
    try {
      await dispatch(syncOfflineQueueThunk()).unwrap();
      await reload();

      Alert.alert("Selesai", "Proses sync offline queue selesai.");
    } catch (error: any) {
      Alert.alert(
        "Sync gagal",
        error?.message || "Terjadi kesalahan saat sync offline queue."
      );

      await reload();
    }
  };

  const retryItem = async (item: LocalReportRow) => {
    try {
      await markLocalReportPending(item.id);
      await dispatch(syncOfflineQueueThunk()).unwrap();
      await reload();
    } catch (error: any) {
      Alert.alert(
        "Retry gagal",
        error?.message || "Gagal melakukan retry laporan offline."
      );

      await reload();
    }
  };

  const confirmDelete = (item: LocalReportRow) => {
    Alert.alert(
      "Hapus Queue?",
      "Laporan offline ini akan dihapus dari perangkat dan tidak akan disync.",
      [
        {
          text: "Batal",
          style: "cancel",
        },
        {
          text: "Hapus",
          style: "destructive",
          onPress: async () => {
            await deleteLocalReport(item.id);
            await reload();
          },
        },
      ]
    );
  };

  return (
    <DashboardLayout title="Offline Queue">
      <View style={styles.header}>
        <Text
  testID="offline-title"
  accessibilityLabel="offline-title"
>
  Offline
</Text>
        <Text style={styles.subtitle}>
          Laporan yang gagal dikirim saat offline/API error akan disimpan di sini
          dan bisa disinkronkan ulang.
        </Text>
      </View>

      <View style={styles.summaryRow}>
        <Card>
          <Text style={styles.summaryValue}>{summary.total}</Text>
          <Text style={styles.summaryLabel}>Total Queue</Text>
        </Card>

        <Card>
          <Text style={styles.summaryValue}>{summary.pending}</Text>
          <Text style={styles.summaryLabel}>Pending</Text>
        </Card>

        <Card>
          <Text style={styles.summaryValue}>{summary.failed}</Text>
          <Text style={styles.summaryLabel}>Failed</Text>
        </Card>
      </View>

      <View style={styles.actionRow}>
        <Button
          title={syncing ? "Sync berjalan..." : "Sync Sekarang"}
          loading={syncing}
          disabled={syncing || rows.length === 0}
          onPress={sync}
        />

        <Button
          title="Refresh"
          variant="secondary"
          loading={loading}
          disabled={loading || syncing}
          onPress={reload}
        />
      </View>

      <Text style={styles.pendingText}>Pending dari Redux: {pendingCount}</Text>

      {rows.length === 0 ? (
        <EmptyState
          title="Queue kosong"
          message="Laporan offline akan muncul di sini jika proses kirim online gagal."
        />
      ) : null}

      <FlatList
        scrollEnabled={false}
        data={rows}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => {
          const payload = parsePayload(item.payload);
          const categoryName = getCategoryName(payload, categories);
const buildingName = getBuildingName(payload, buildings);
const roomName = getRoomName(payload, rooms);
          return (
            <Card>
              <View style={styles.cardHeader}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.reportTitle}>
                    {payload.title || "Laporan tanpa judul"}
                  </Text>

                  <Text numberOfLines={2} style={styles.description}>
                    {payload.description || "Tidak ada deskripsi."}
                  </Text>
                </View>

                <Badge label={getStatusLabel(item.status)} />
              </View>

              <View style={styles.badgeRow}>
                <Badge label={`Prioritas: ${getPriorityLabel(payload.priority)}`} />

                {payload.categoryId ? (
                  <Badge label={`Kategori ID: ${payload.categoryId}`} />
                ) : null}
              </View>

              <View style={styles.detailGrid}>
                <View style={styles.detailGrid}>
  <View style={styles.detailItem}>
    <Text style={styles.detailLabel}>Dibuat Offline</Text>
    <Text style={styles.detailValue}>
      {formatDateTime(item.createdAt)}
    </Text>
  </View>

  <View style={styles.detailItem}>
    <Text style={styles.detailLabel}>Status</Text>
    <Text style={styles.detailValue}>
      {getStatusLabel(item.status)}
    </Text>
  </View>

  <View style={styles.detailItem}>
    <Text style={styles.detailLabel}>Kategori</Text>
    <Text style={styles.detailValue}>
      {getCategoryDisplay(payload)}
    </Text>
  </View>

  <View style={styles.detailItem}>
    <Text style={styles.detailLabel}>Gedung</Text>
    <Text style={styles.detailValue}>
      {getBuildingDisplay(payload)}
    </Text>
  </View>

  <View style={styles.detailItem}>
    <Text style={styles.detailLabel}>Ruangan</Text>
    <Text style={styles.detailValue}>
      {getRoomDisplay(payload)}
    </Text>
  </View>

  <View style={styles.detailItem}>
    <Text style={styles.detailLabel}>Lokasi</Text>
    <Text style={styles.detailValue}>
      {payload.locationText || "-"}
    </Text>
  </View>

  <View style={styles.detailItem}>
    <Text style={styles.detailLabel}>Koordinat</Text>
    <Text style={styles.detailValue}>
      {getCoordinateText(payload)}
    </Text>
  </View>
</View>
              </View>

              {item.mediaUri ? (
                <View style={styles.mediaPreview}>
                  <Image
                    source={{ uri: item.mediaUri }}
                    style={styles.image}
                    resizeMode="cover"
                  />

                  <Text numberOfLines={1} style={styles.mediaUri}>
                    {item.mediaUri}
                  </Text>
                </View>
              ) : (
                <View style={styles.noMediaBox}>
                  <Text style={styles.noMediaText}>Tidak ada media offline.</Text>
                </View>
              )}

              {item.errorMessage ? (
                <View style={styles.errorBox}>
                  <Text style={styles.errorTitle}>Error terakhir</Text>
                  <Text style={styles.errorText}>{item.errorMessage}</Text>
                </View>
              ) : null}

              <Text numberOfLines={1} style={styles.localId}>
                Local ID: {item.id}
              </Text>

              <View style={styles.itemActions}>
                <Button
                  title="Retry Sync"
                  variant="secondary"
                  disabled={syncing}
                  loading={syncing}
                  onPress={() => retryItem(item)}
                />

                <Pressable
                  style={styles.deleteButton}
                  onPress={() => confirmDelete(item)}
                  disabled={syncing}
                >
                  <Text style={styles.deleteButtonText}>Hapus</Text>
                </Pressable>
              </View>
            </Card>
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
  title: {
    fontSize: 24,
    fontWeight: "900",
    color: "#0F172A",
  },
  subtitle: {
    marginTop: 4,
    fontSize: 14,
    color: "#64748B",
    lineHeight: 20,
  },
  summaryRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 14,
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
  actionRow: {
    gap: 10,
    marginBottom: 10,
  },
  pendingText: {
    fontSize: 13,
    color: "#64748B",
    marginBottom: 12,
    fontWeight: "700",
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
  },
  reportTitle: {
    fontSize: 16,
    fontWeight: "900",
    color: "#0F172A",
  },
  description: {
    marginTop: 4,
    fontSize: 13,
    color: "#64748B",
    lineHeight: 18,
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
    fontSize: 12,
    color: "#0F172A",
    fontWeight: "800",
  },
  mediaPreview: {
    marginTop: 14,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 14,
    overflow: "hidden",
    backgroundColor: "#FFFFFF",
  },
  image: {
    width: "100%",
    height: 170,
    backgroundColor: "#E2E8F0",
  },
  mediaUri: {
    padding: 10,
    fontSize: 11,
    color: "#64748B",
  },
  noMediaBox: {
    marginTop: 14,
    borderWidth: 1,
    borderStyle: "dashed",
    borderColor: "#CBD5E1",
    borderRadius: 14,
    padding: 14,
    backgroundColor: "#F8FAFC",
  },
  noMediaText: {
    fontSize: 13,
    color: "#64748B",
    fontWeight: "700",
    textAlign: "center",
  },
  errorBox: {
    marginTop: 14,
    backgroundColor: "#FEF2F2",
    borderWidth: 1,
    borderColor: "#FECACA",
    borderRadius: 14,
    padding: 12,
  },
  errorTitle: {
    fontSize: 12,
    color: "#991B1B",
    fontWeight: "900",
    marginBottom: 4,
  },
  errorText: {
    fontSize: 12,
    color: "#B91C1C",
    fontWeight: "700",
    lineHeight: 17,
  },
  localId: {
    marginTop: 10,
    fontSize: 10,
    color: "#94A3B8",
  },
  itemActions: {
    marginTop: 14,
    gap: 10,
  },
  deleteButton: {
    minHeight: 44,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#FCA5A5",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FEF2F2",
  },
  deleteButtonText: {
    color: "#DC2626",
    fontWeight: "900",
    fontSize: 14,
  },
});