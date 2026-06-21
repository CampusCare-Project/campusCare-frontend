import { useEffect, useMemo, useState,useCallback } from "react";
import {
  Alert,
  Image,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useFocusEffect } from "@react-navigation/native";

import { Screen } from "@/components/ui/Screen";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Loading } from "@/components/ui/Loading";
import { useAuth } from "@/api/auth/hooks";
import { authService } from "@/api/auth/service";
import { User } from "@/api/auth/types";
import { getReportFeedback} from "@/api/feedback/service";
import { ReportFeedback } from "@/api/feedback/types";
import { useReports } from "@/api/reports/hooks";
import { mediaService } from "@/api/media/service";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { TOKEN_KEY } from "@/api/client";
import { ENV } from "@/config/env";

import type { RootStackParamList } from "@/app/router";


type Props = NativeStackScreenProps<RootStackParamList, "ReportDetail">;



function formatDateTime(value?: string | Date | null) {
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

function getStatusLabel(status?: string) {
  const labels: Record<string, string> = {
    PENDING: "Menunggu",
    VERIFIED: "Diverifikasi",
    ASSIGNED: "Ditugaskan",
    IN_PROGRESS: "Diproses",
    RESOLVED: "Selesai",
    REJECTED: "Ditolak",
    CANCELLED: "Dibatalkan",
  };

  return status ? labels[status] || status : "-";
}

function getPriorityLabel(priority?: string) {
  const labels: Record<string, string> = {
    LOW: "Rendah",
    MEDIUM: "Sedang",
    HIGH: "Tinggi",
    URGENT: "Darurat",
    CRITICAL: "Kritis",
  };

  return priority ? labels[priority] || priority : "-";
}

function getBuildingDisplay(report: any) {
  const building = report?.building;
  const room = report?.room;

  if (typeof building === "string") return building;

  return (
    building?.name ||
    building?.code ||
    report?.buildingName ||
    report?.buildingCode ||
    room?.building?.name ||
    room?.building?.code ||
    "-"
  );
}

function getRoomDisplay(report: any) {
  const room = report?.room;

  if (typeof room === "string") return room;

  const roomCode = room?.code || report?.roomCode;
  const roomName = room?.name || report?.roomName;

  if (roomCode && roomName) return `${roomCode} - ${roomName}`;
  if (roomName) return roomName;
  if (roomCode) return roomCode;

  return "-";
}

function getLocationNoteDisplay(report: any) {
  if (typeof report?.locationText === "string" && report.locationText.trim()) {
    return report.locationText;
  }

  return "-";
}

function getCoordinateDisplay(report: any) {
  const latitude = report?.latitude;
  const longitude = report?.longitude;

  if (latitude === null || latitude === undefined) return "-";
  if (longitude === null || longitude === undefined) return "-";

  return `${latitude}, ${longitude}`;
}

function getGatewayMediaBaseUrl() {
  return `${ENV.API_BASE_URL.replace(/\/$/, "")}/api/media`;
}

function normalizeUrl(url?: string | null) {
  if (!url) return null;

  const apiBaseUrl = ENV.API_BASE_URL.replace(/\/$/, "");
  const mediaBaseUrl = getGatewayMediaBaseUrl();

  if (url.startsWith("http://") || url.startsWith("https://")) {
    try {
      const parsed = new URL(url);

      if (parsed.pathname.startsWith("/uploads/")) {
        return `${mediaBaseUrl}${parsed.pathname}`;
      }

      if (parsed.pathname.startsWith("/api/media/uploads/")) {
        return `${apiBaseUrl}${parsed.pathname}`;
      }

      return url;
    } catch {
      return url;
    }
  }

  // Kalau backend kasih /uploads/media/...
  if (url.startsWith("/uploads/")) {
    return `${mediaBaseUrl}${url}`;
  }

  // Kalau backend sudah kasih /api/media/uploads/...
  if (url.startsWith("/api/media/uploads/")) {
    return `${apiBaseUrl}${url}`;
  }

  // Kalau backend kasih uploads/media/... tanpa slash depan
  if (url.startsWith("uploads/")) {
    return `${mediaBaseUrl}/${url}`;
  }

  // Fallback
  return `${mediaBaseUrl}/${url.replace(/^\/+/, "")}`;
}

function getReportMediaId(item: any) {
  return (
    item?.mediaId ||
    item?.media?.id ||
    item?.asset?.id ||
    item?.mediaAsset?.id ||
    null
  );
}

function getMediaAsset(item: any) {
  return (
    item?.media ||
    item?.asset ||
    item?.mediaAsset ||
    item?.file ||
    null
  );
}

function getMediaUrl(item: any) {
  const asset = getMediaAsset(item);

  return normalizeUrl(
    item?.url ||
      item?.mediaUrl ||
      item?.fileUrl ||
      asset?.url ||
      asset?.mediaUrl ||
      asset?.fileUrl
  );
}

function getMediaMimeType(item: any) {
  const asset = getMediaAsset(item);

  return item?.mimeType || asset?.mimeType || "";
}

function isImageMedia(item: any) {
  const url = getMediaUrl(item);
  const mimeType = String(getMediaMimeType(item)).toLowerCase();

  if (mimeType.startsWith("image/")) return true;

  if (!url) return false;

  return /\.(jpg|jpeg|png|webp)$/i.test(url);
}

function getMediaCaption(item: any) {
  const asset = getMediaAsset(item);

  return (
    item?.caption ||
    asset?.originalName ||
    asset?.fileName ||
    item?.mediaId ||
    "-"
  );
}

function getMediaTypeLabel(type?: string) {
  const labels: Record<string, string> = {
    DAMAGE_PHOTO: "Foto Kerusakan",
    REPAIR_PROOF: "Bukti Perbaikan",
    ADDITIONAL_EVIDENCE: "Bukti Tambahan",
    REPORT_DAMAGE_PHOTO: "Foto Kerusakan",
    REPORT_REPAIR_PROOF: "Bukti Perbaikan",
    REPORT_ADDITIONAL_EVIDENCE: "Bukti Tambahan",
  };

  return type ? labels[type] || type : "Media";
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
    null
  );
}
function getUserDisplayName(user?: User | null) {
  if (!user) return null;

  return user.name || user.username || user.email || null;
}


function getFeedbackComment(feedback?: ReportFeedback | null) {
  if (!feedback) return "-";

  return feedback.comment?.trim() || "-";
}

function getRatingStars(rating?: number | null) {
  const numericRating = Number(rating || 0);

  const safeRating = Math.max(
    0,
    Math.min(5, Math.round(Number.isNaN(numericRating) ? 0 : numericRating))
  );

  const fullStars = "★".repeat(safeRating);
  const emptyStars = "☆".repeat(5 - safeRating);

  return `${fullStars}${emptyStars}`;
}

export function ReportDetailScreen({ route, navigation }: Props) {
  const { id } = route.params;
  // feedback
  const [feedback, setFeedback] = useState<ReportFeedback | null>(null);
const [feedbackLoading, setFeedbackLoading] = useState(false);
const [feedbackError, setFeedbackError] = useState<string | null>(null);

  const { user } = useAuth();
  const { selected, fetchReportDetail } = useReports();

  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [mediaAssetsById, setMediaAssetsById] = useState<Record<string, any>>(
    {}
  );
  const [mediaLoading, setMediaLoading] = useState(false);
const [token, setToken] = useState<string | null>(null);
const [usersById, setUsersById] = useState<Record<string, User>>({});
const [usersLoading, setUsersLoading] = useState(false);
useEffect(() => {
  const loadToken = async () => {
    const savedToken = await AsyncStorage.getItem(TOKEN_KEY);
    setToken(savedToken);
  };

  void loadToken();
}, []);

 useFocusEffect(
  useCallback(() => {
    void fetchReportDetail(id);

    return undefined;
  }, [id])
);

  useEffect(() => {
    setMediaAssetsById({});
  }, [id]);

  const mediaItems = useMemo(() => {
    return selected?.media ?? [];
  }, [selected]);

  useEffect(() => {
    if (!mediaItems.length) return;

    const missingMediaIds = mediaItems
      .map((item: any) => getReportMediaId(item))
      .filter(Boolean)
      .filter((mediaId: string, index: number, array: string[]) => {
        return array.indexOf(mediaId) === index;
      })
      .filter((mediaId: string) => {
        const reportMedia = mediaItems.find(
          (item: any) => getReportMediaId(item) === mediaId
        );

        const embeddedAsset = getMediaAsset(reportMedia);
        const hasEmbeddedUrl = Boolean(
          // reportMedia?.url ||
          //   reportMedia?.mediaUrl ||
          //   reportMedia?.fileUrl ||
            embeddedAsset?.url ||
            embeddedAsset?.mediaUrl ||
            embeddedAsset?.fileUrl
        );

        return !hasEmbeddedUrl && !mediaAssetsById[mediaId];
      });

    if (missingMediaIds.length === 0) return;


    let alive = true;

    const fetchMediaAssets = async () => {
      try {
        setMediaLoading(true);

        const results = await Promise.allSettled(
          missingMediaIds.map(async (mediaId: string) => {
            const asset = await mediaService.getById(mediaId);
            return { mediaId, asset };
          })
        );

        if (!alive) return;

        setMediaAssetsById((prev) => {
          const next = { ...prev };

          for (const result of results) {
            if (result.status === "fulfilled") {
              next[result.value.mediaId] = result.value.asset;
            } else {
              console.log("FETCH MEDIA DETAIL FAILED:", result.reason);
            }
          }

          return next;
        });
      } catch (error) {
        console.log("FETCH MEDIA ASSETS ERROR:", error);
      } finally {
        if (alive) setMediaLoading(false);
      }
    };

    void fetchMediaAssets();

    return () => {
      alive = false;
    };
  }, [mediaItems, mediaAssetsById]);

useEffect(() => {
  if (!selected) return;

  const reporterId = getReporterId(selected);
  const technicianId = getTechnicianId(selected);

const feedbackUserId = (selected as any).feedback?.userId || feedback?.userId || null;

const ids = [reporterId, technicianId, feedbackUserId]
    .filter(Boolean)
    .filter((value, index, array) => array.indexOf(value) === index)
    .filter((id) => !usersById[id as string]) as string[];

  if (ids.length === 0) return;

  let alive = true;

  const fetchUsers = async () => {
    try {
      setUsersLoading(true);

      const results = await Promise.allSettled(
        ids.map(async (userId) => {
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
}, [selected?.id, feedback?.userId, usersById]);

useEffect(() => {
  if (!selected || selected.id !== id) return;

  let alive = true;

  const fetchFeedback = async () => {
    try {
      setFeedbackLoading(true);
      setFeedbackError(null);
      setFeedback(null);

      const data = await getReportFeedback(id);

      if (!alive) return;

      setFeedback(data);
    } catch (error: any) {
      if (!alive) return;

      // console.log("FETCH REPORT FEEDBACK FAILED:", error);

      setFeedback(null);
      setFeedbackError(
        error?.response?.data?.message ||
          error?.message ||
          "Gagal mengambil feedback laporan."
      );
    } finally {
      if (alive) setFeedbackLoading(false);
    }
  };

  void fetchFeedback();

  return () => {
    alive = false;
  };
}, [selected?.id, id]);

  const mergedMediaItems = useMemo(() => {
    return mediaItems.map((item: any) => {
      const mediaId = getReportMediaId(item);
      const embeddedAsset = getMediaAsset(item);

      if (embeddedAsset || !mediaId) {
        return item;
      }

      const fetchedAsset = mediaAssetsById[mediaId];

      if (!fetchedAsset) {
        return item;
      }

      return {
        ...item,
        media: fetchedAsset,
      };
    });
  }, [mediaItems, mediaAssetsById]);

  const imageMedia = useMemo(() => {
    return mergedMediaItems.filter((item: any) => isImageMedia(item));
  }, [mergedMediaItems]);

  const nonImageMedia = useMemo(() => {
    return mergedMediaItems.filter((item: any) => !isImageMedia(item));
  }, [mergedMediaItems]);

  if (!selected || selected.id !== id) {
    return <Loading text="Mengambil detail laporan..." />;
  }

const isAdmin = user?.role === "ADMIN";
const isTechnician = user?.role === "TECHNICIAN";

const reporterId = getReporterId(selected);
const technicianId = getTechnicianId(selected);

const isReporter = user?.id_user === reporterId;

const buildingName = getBuildingDisplay(selected);
const roomName = getRoomDisplay(selected);
const coordinateText = getCoordinateDisplay(selected);


const reporterName =
  (selected as any).user?.name ||
  (selected as any).reporter?.name ||
  (selected as any).creator?.name ||
  getUserDisplayName(reporterId ? usersById[reporterId] : null) ||
  (reporterId ? (usersLoading ? "Memuat..." : `ID: ${reporterId}`) : "-");

const technicianName =
  (selected as any).assignedTechnician?.name ||
  (selected as any).technician?.name ||
  getUserDisplayName(technicianId ? usersById[technicianId] : null) ||
  (technicianId ? (usersLoading ? "Memuat..." : `ID: ${technicianId}`) : "-");
const feedbackData = (selected as any).feedback || feedback;
const feedbackUserId = feedbackData?.userId;

const feedbackUserName =
  getUserDisplayName(feedbackUserId ? usersById[feedbackUserId] : null) ||
  (feedbackUserId ? (usersLoading ? "Memuat..." : `ID: ${feedbackUserId}`) : "-");
  return (
    <Screen>
      <Card>
        <Text style={styles.title}>{selected.title}</Text>

        <View style={styles.badgeRow}>
          <Badge label={getStatusLabel(selected.status)} />
          <Badge label={getPriorityLabel(selected.priority)} />
          {selected.category?.name ? (
            <Badge label={selected.category.name} />
          ) : null}
        </View>

        <Text style={styles.description}>
          {selected.description || "Tidak ada deskripsi."}
        </Text>

        <View style={styles.detailGrid}>
      

          <View style={styles.detailItem}>
  <Text style={styles.detailLabel}>Gedung</Text>
  <Text style={styles.detailValue}>{buildingName}</Text>
</View>

<View style={styles.detailItem}>
  <Text style={styles.detailLabel}>Ruangan</Text>
  <Text style={styles.detailValue}>{roomName}</Text>
</View>

<View style={styles.detailItem}>
  <Text style={styles.detailLabel}>Koordinat GPS</Text>
  <Text style={styles.detailValue}>{coordinateText}</Text>
</View>

          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>Dibuat</Text>
            <Text style={styles.detailValue}>
              {formatDateTime(selected.createdAt)}
            </Text>
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

        {selected.rejectionReason ? (
          <View style={styles.dangerBox}>
            <Text style={styles.dangerText}>
              Alasan ditolak: {selected.rejectionReason}
            </Text>
          </View>
        ) : null}

        {selected.resolvedNote ? (
          <View style={styles.successBox}>
            <Text style={styles.successText}>
              Catatan selesai: {selected.resolvedNote}
            </Text>
          </View>
        ) : null}
      </Card>

      <Card>
        <Text style={styles.sectionTitle}>Media Laporan</Text>

        {mediaLoading ? (
          <Text style={styles.mutedText}>Memuat media laporan...</Text>
        ) : null}

        {mergedMediaItems.length === 0 ? (
          <Text style={styles.mutedText}>Belum ada media yang diupload.</Text>
        ) : null}

        {imageMedia.length > 0 ? (
          <View style={styles.imageGrid}>
            {imageMedia.map((m: any) => {
              const imageUrl = getMediaUrl(m);

              if (!imageUrl) return null;

              return (
                <Pressable
                  key={m.id || m.mediaId || imageUrl}
                  style={styles.imageCard}
                  onPress={() => setPreviewUrl(imageUrl)}
                >
         <Image
  source={{
    uri: imageUrl,
    headers: token
      ? {
          Authorization: `Bearer ${token}`,
        }
      : undefined,
  }}
  style={styles.image}
  resizeMode="cover"
  onError={(error) => {
    console.log("IMAGE LOAD ERROR URL:", imageUrl);
    console.log("IMAGE LOAD ERROR:", error.nativeEvent);
  }}
/>

                  <View style={styles.imageInfo}>
                    <Text style={styles.imageType}>
                      {getMediaTypeLabel(m.type || m.usageType)}
                    </Text>

                    <Text numberOfLines={1} style={styles.imageCaption}>
                      {getMediaCaption(m)}
                    </Text>
                  </View>
                </Pressable>
              );
            })}
          </View>
        ) : null}

        {nonImageMedia.length > 0 ? (
          <View style={styles.mediaList}>
            {nonImageMedia.map((m: any) => {
              const asset = getMediaAsset(m);
              const mediaUrl = getMediaUrl(m);

              return (
                <View key={m.id || m.mediaId} style={styles.mediaItem}>
                  <Text style={styles.mediaText}>
                    • {getMediaTypeLabel(m.type || m.usageType)} —{" "}
                    {getMediaCaption(m)}
                  </Text>

                  {mediaUrl ? (
                    <Text numberOfLines={1} style={styles.mediaUrlText}>
                      {mediaUrl}
                    </Text>
                  ) : (
                    <Text numberOfLines={1} style={styles.mediaIdText}>
                      ID: {m.mediaId || asset?.id || "-"}
                    </Text>
                  )}
                </View>
              );
            })}
          </View>
        ) : null}

        {mergedMediaItems.length > 0 &&
        imageMedia.length === 0 &&
        !mediaLoading ? (
          <Text style={styles.mutedText}>
            Media ditemukan, tetapi URL gambar belum tersedia dari media service.
          </Text>
        ) : null}
      </Card>

      {selected.repairNotes?.length ? (
        <Card>
          <Text style={styles.sectionTitle}>Catatan Perbaikan</Text>

          {selected.repairNotes.map((n) => (
            <View key={n.id} style={styles.noteItem}>
              <Text style={styles.noteText}>• {n.note}</Text>
              <Text style={styles.noteMeta}>{n.visibility}</Text>
            </View>
          ))}
        </Card>
      ) : null}

      <Card>
  <Text style={styles.sectionTitle}>Feedback Laporan</Text>

  {feedbackLoading ? (
    <Text style={styles.mutedText}>Memuat feedback laporan...</Text>
  ) : null}

  {feedbackError ? (
    <View style={styles.dangerBox}>
      <Text style={styles.dangerText}>{feedbackError}</Text>
    </View>
  ) : null}

  {!feedbackLoading && !feedbackError && feedbackData ? (
    <View style={styles.feedbackBox}>
      <View style={styles.feedbackHeader}>
        <Text style={styles.feedbackStars}>
          {getRatingStars(feedbackData.rating)}
        </Text>

        <Text style={styles.feedbackRating}>
          {feedbackData.rating}/5
        </Text>
      </View>

    <View style={styles.feedbackMetaBox}>
      <Text style={styles.feedbackMetaLabel}>Diberikan oleh</Text>
      <Text style={styles.feedbackMetaValue}>{feedbackUserName}</Text>
    </View>


      <Text style={styles.feedbackComment}>
  {getFeedbackComment(feedbackData)}
</Text>

      <Text style={styles.feedbackDate}>
        Diberikan pada: {formatDateTime(feedbackData.createdAt)}
      </Text>
    </View>
  ) : null}

  {!feedbackLoading && !feedbackError && !feedbackData ? (
    <Text style={styles.mutedText}>
      Feedback belum tersedia untuk laporan ini.
    </Text>
  ) : null}
</Card>

      <View style={styles.actionGroup}>
        {isAdmin && selected.status === "PENDING" ? (
          <Button
            title="Verifikasi / Tolak"
            onPress={() => navigation.navigate("VerifyRejectReport", { id })}
          />
        ) : null}

        {isAdmin && ["VERIFIED", "ASSIGNED"].includes(selected.status) ? (
          <Button
            title="Assign Teknisi"
            onPress={() => navigation.navigate("AssignTechnician", { id })}
          />
        ) : null}

        {(isTechnician || isAdmin) &&
        ["ASSIGNED", "IN_PROGRESS"].includes(selected.status) ? (
          <Button
            title="Update Status"
            onPress={() => navigation.navigate("UpdateStatus", { id })}
          />
        ) : null}

        {isTechnician || isAdmin ? (
          <Button
            title="Tambah Catatan Perbaikan"
            variant="secondary"
            onPress={() => navigation.navigate("RepairNote", { id })}
          />
        ) : null}

        {isTechnician || isAdmin || isReporter ? (
  <Button
    title={
      selected.status === "CANCELLED"
        ? "Upload Media Dinonaktifkan"
        : "Upload Media"
    }
    variant="secondary"
    disabled={selected.status === "CANCELLED"}
    onPress={() => {
      if (selected.status === "CANCELLED") return;

      navigation.navigate("UploadMedia", { reportId: id });
    }}
  />
) : null}

     {isReporter &&
selected.status === "RESOLVED" &&
!feedbackLoading &&
!feedbackData ? (
  <Button
    title="Beri Feedback"
    onPress={() => navigation.navigate("Feedback", { id })}
  />
) : null}

        {selected.status === "CANCELLED" ? (
          <Button
            title="Laporan Dibatalkan"
            disabled
            onPress={() => Alert.alert("Info")}
          />
        ) : null}
      </View>

      <Modal
        visible={Boolean(previewUrl)}
        transparent
        animationType="fade"
        onRequestClose={() => setPreviewUrl(null)}
      >
        <View style={styles.modalBackdrop}>
          <Pressable
            style={styles.closeArea}
            onPress={() => setPreviewUrl(null)}
          />

          <View style={styles.previewBox}>
            {previewUrl ? (
            <Image
  source={{
    uri: previewUrl,
    headers: token
      ? {
          Authorization: `Bearer ${token}`,
        }
      : undefined,
  }}
  style={styles.previewImage}
  resizeMode="contain"
/>
            ) : null}

            <Button
              title="Tutup"
              variant="secondary"
              onPress={() => setPreviewUrl(null)}
            />
          </View>
        </View>
      </Modal>
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: {
    fontSize: 22,
    fontWeight: "900",
    color: "#0F172A",
  },
  badgeRow: {
    flexDirection: "row",
    gap: 8,
    flexWrap: "wrap",
    marginTop: 12,
  },
  description: {
    color: "#334155",
    marginTop: 12,
    fontSize: 14,
    lineHeight: 20,
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
  dangerBox: {
    backgroundColor: "#FEF2F2",
    borderWidth: 1,
    borderColor: "#FECACA",
    borderRadius: 12,
    padding: 10,
    marginTop: 14,
  },
  dangerText: {
    color: "#B91C1C",
    fontWeight: "800",
    fontSize: 13,
    lineHeight: 18,
  },
  successBox: {
    backgroundColor: "#F0FDF4",
    borderWidth: 1,
    borderColor: "#BBF7D0",
    borderRadius: 12,
    padding: 10,
    marginTop: 14,
  },
  successText: {
    color: "#15803D",
    fontWeight: "800",
    fontSize: 13,
    lineHeight: 18,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "900",
    color: "#0F172A",
    marginBottom: 10,
  },
  mutedText: {
    color: "#64748B",
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 10,
  },
  imageGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  imageCard: {
    width: "48%",
    borderRadius: 14,
    overflow: "hidden",
    backgroundColor: "#F8FAFC",
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  image: {
    width: "100%",
    height: 130,
    backgroundColor: "#E2E8F0",
  },
  imageInfo: {
    padding: 8,
  },
  imageType: {
    fontSize: 11,
    color: "#2563EB",
    fontWeight: "900",
  },
  imageCaption: {
    marginTop: 2,
    fontSize: 12,
    color: "#475569",
    fontWeight: "700",
  },
  mediaList: {
    marginTop: 8,
    gap: 8,
  },
  mediaItem: {
    backgroundColor: "#F8FAFC",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 12,
    padding: 10,
  },
  mediaText: {
    fontSize: 13,
    color: "#475569",
    lineHeight: 18,
    fontWeight: "700",
  },
  mediaUrlText: {
    marginTop: 3,
    fontSize: 10,
    color: "#2563EB",
  },
  mediaIdText: {
    marginTop: 3,
    fontSize: 10,
    color: "#94A3B8",
  },
  noteItem: {
    marginBottom: 8,
  },
  noteText: {
    fontSize: 13,
    color: "#334155",
    lineHeight: 18,
  },
  noteMeta: {
    fontSize: 12,
    color: "#64748B",
    marginTop: 2,
  },
  actionGroup: {
    gap: 10,
    marginTop: 4,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(15, 23, 42, 0.88)",
    justifyContent: "center",
    padding: 16,
  },
  closeArea: {
    ...StyleSheet.absoluteFillObject,
  },
  previewBox: {
    backgroundColor: "#0F172A",
    borderRadius: 18,
    overflow: "hidden",
    padding: 10,
    gap: 10,
  },
  previewImage: {
    width: "100%",
    height: 420,
  },

  feedbackBox: {
  backgroundColor: "#F8FAFC",
  borderWidth: 1,
  borderColor: "#E2E8F0",
  borderRadius: 14,
  padding: 12,
},
feedbackHeader: {
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "space-between",
  marginBottom: 8,
},
feedbackStars: {
  fontSize: 20,
  color: "#F59E0B",
  fontWeight: "900",
},
feedbackRating: {
  fontSize: 13,
  color: "#0F172A",
  fontWeight: "900",
},
feedbackComment: {
  fontSize: 13,
  color: "#334155",
  lineHeight: 19,
  fontWeight: "700",
},
feedbackDate: {
  marginTop: 8,
  fontSize: 12,
  color: "#64748B",
  fontWeight: "700",
},
feedbackMetaBox: {
  backgroundColor: "#FFFFFF",
  borderWidth: 1,
  borderColor: "#E2E8F0",
  borderRadius: 12,
  padding: 10,
  marginBottom: 10,
},
feedbackMetaLabel: {
  fontSize: 11,
  color: "#64748B",
  fontWeight: "800",
  marginBottom: 3,
},
feedbackMetaValue: {
  fontSize: 13,
  color: "#0F172A",
  fontWeight: "900",
},
});