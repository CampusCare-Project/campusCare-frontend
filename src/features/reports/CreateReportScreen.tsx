import { useCallback, useEffect, useMemo, useState } from "react";
import { Image, StyleSheet, Text, View } from "react-native";
import * as Location from "expo-location";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { toast } from "sonner-native";

import { Screen } from "@/components/ui/Screen";
import { Button } from "@/components/ui/ButtonId";
import { Card } from "@/components/ui/Card";
import { ZodInput } from "@/components/ui/ZodInput";
import { SelectorInput } from "@/components/ui/selectorInputId";
import { useCategories } from "@/api/categories/hooks";
import { useLocations } from "@/api/locations/hooks";
import { reportService } from "@/api/reports/service";
import { mediaService } from "@/api/media/service";
import {
  AttachmentPicker,
  type PickedAttachment,
} from "@/components/ui/AttachmentPicker";
import { saveLocalReport,
   cacheCategories,
  cacheBuildings,
  cacheRooms,
  listCachedCategories,
  listCachedBuildings,
  listCachedRooms,
 } from "@/offline/db";

import type { RootStackParamList } from "@/app/router1";
import type { ReportPriority } from "@/api/reports/types";
import type { ZodFieldErrors } from "@/utils/zodErrors";
import { getApiErrorMessage } from "@/utils/apiError";

type Props = NativeStackScreenProps<RootStackParamList, "CreateReport">;

type PriorityOption = {
  label: string;
  value: ReportPriority;
  description?: string;
};

const PRIORITY_OPTIONS: PriorityOption[] = [
  {
    label: "Rendah",
    value: "LOW",
    description: "Kerusakan ringan dan tidak terlalu mendesak.",
  },
  {
    label: "Sedang",
    value: "MEDIUM",
    description: "Kerusakan normal dan perlu ditangani.",
  },
  {
    label: "Tinggi",
    value: "HIGH",
    description: "Kerusakan cukup mengganggu aktivitas.",
  },
  {
    label: "Kritis",
    value: "CRITICAL",
    description: "Kerusakan darurat dan perlu segera ditangani.",
  },
];

function getFirstError(errors: ZodFieldErrors, field: string) {
  return errors[field]?.[0] || null;
}

export function CreateReportScreen({ navigation }: Props) {
  const { items: categories } = useCategories(true);
  const { buildings, rooms, fetchRooms } = useLocations(true);

  const [categoryId, setCategoryId] = useState("");
  const [buildingId, setBuildingId] = useState("");
  const [roomId, setRoomId] = useState("");

  const [priority, setPriority] = useState<ReportPriority>("MEDIUM");

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [locationText, setLocationText] = useState("");
const [attachments, setAttachments] = useState<PickedAttachment[]>([]);
  // for dropdown if offline i guess
const [cachedCategories, setCachedCategories] = useState<any[]>([]);
const [cachedBuildings, setCachedBuildings] = useState<any[]>([]);
const [cachedRooms, setCachedRooms] = useState<any[]>([]);
useEffect(() => {
  const loadCachedMasterData = async () => {
    const [localCategories, localBuildings, localRooms] = await Promise.all([
      listCachedCategories(),
      listCachedBuildings(),
      listCachedRooms(),
    ]);

    setCachedCategories(localCategories);
    setCachedBuildings(localBuildings);
    setCachedRooms(localRooms);
  };

  void loadCachedMasterData();
}, []);

useEffect(() => {
  if (categories.length > 0) {
    void cacheCategories(categories);
    setCachedCategories(categories);
  }
}, [categories]);

useEffect(() => {
  if (buildings.length > 0) {
    void cacheBuildings(buildings);
    setCachedBuildings(buildings);
  }
}, [buildings]);

useEffect(() => {
  if (rooms.length > 0) {
    void cacheRooms(rooms);
    setCachedRooms(rooms);
  }
}, [rooms]);

const categoryOptions = categories.length > 0 ? categories : cachedCategories;
const buildingOptions = buildings.length > 0 ? buildings : cachedBuildings;
const roomSource = rooms.length > 0 ? rooms : cachedRooms;

const roomOptions = roomSource.filter((room: any) => {
  const roomBuildingId =
    room.buildingId ||
    room.building?.id ||
    room.id_building;

  return roomBuildingId === buildingId;
});

  const [coords, setCoords] = useState<{
    latitude?: number;
    longitude?: number;
  }>({});

  // const [asset, setAsset] = useState<ImagePicker.ImagePickerAsset | null>(null);
  const [fieldErrors, setFieldErrors] = useState<ZodFieldErrors>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (buildingId) {
      void fetchRooms(buildingId);
    }
  }, [buildingId]);

  const selectedCategory = useMemo(() => {
    return categories.find((category) => category.id === categoryId) || null;
  }, [categories, categoryId]);

  const selectedBuilding = useMemo(() => {
    return buildings.find((building) => building.id === buildingId) || null;
  }, [buildings, buildingId]);

  const selectedRoom = useMemo(() => {
    return rooms.find((room) => room.id === roomId) || null;
  }, [rooms, roomId]);

  const selectedPriority = useMemo(() => {
    return (
      PRIORITY_OPTIONS.find((item) => item.value === priority) ||
      PRIORITY_OPTIONS[1]
    );
  }, [priority]);

  // for offline snapshot
  

  const getCategoryLabel = useCallback((item: any) => {
    return item.name;
  }, []);

  const getCategoryValue = useCallback((item: any) => {
    return item.id;
  }, []);

  const getCategoryDescription = useCallback((item: any) => {
    return item.description || item.slug || undefined;
  }, []);

  const getBuildingLabel = useCallback((item: any) => {
    return item.name;
  }, []);

  const getBuildingValue = useCallback((item: any) => {
    return item.id;
  }, []);

  const getBuildingDescription = useCallback((item: any) => {
    const parts = [item.code, item.address].filter(Boolean);
    return parts.length ? parts.join(" • ") : undefined;
  }, []);

  const getRoomLabel = useCallback((item: any) => {
    return item.code ? `${item.code} - ${item.name}` : item.name;
  }, []);

  const getRoomValue = useCallback((item: any) => {
    return item.id;
  }, []);

  const getRoomDescription = useCallback((item: any) => {
    const parts = [item.floorName, item.description].filter(Boolean);
    return parts.length ? parts.join(" • ") : undefined;
  }, []);

  const getPriorityLabel = useCallback((item: PriorityOption) => {
    return item.label;
  }, []);

  const getPriorityValue = useCallback((item: PriorityOption) => {
    return item.value;
  }, []);

  const getPriorityDescription = useCallback((item: PriorityOption) => {
    return item.description;
  }, []);

  const clearFieldError = (fieldName: string) => {
    setFieldErrors((prev) => {
      if (!prev[fieldName]) return prev;

      const next = { ...prev };
      delete next[fieldName];

      return next;
    });
  };

  const validateForm = () => {
    const errors: ZodFieldErrors = {};

    if (!title.trim()) {
      errors.title = ["Judul laporan wajib diisi"];
    }

    if (!description.trim()) {
      errors.description = ["Deskripsi laporan wajib diisi"];
    }

    if (!categoryId.trim()) {
      errors.categoryId = ["Kategori wajib dipilih"];
    }

    setFieldErrors(errors);

    return Object.keys(errors).length === 0;
  };

 
  const useCurrentLocation = async () => {
    try {
      const permission = await Location.requestForegroundPermissionsAsync();

      if (!permission.granted) {
        toast.error("Izin lokasi ditolak");
        return;
      }

      const pos = await Location.getCurrentPositionAsync({});

      setCoords({
        latitude: pos.coords.latitude,
        longitude: pos.coords.longitude,
      });

      setLocationText((old) => {
        if (old.trim()) return old;

        return `Lat ${pos.coords.latitude}, Long ${pos.coords.longitude}`;
      });

      toast.success("Lokasi berhasil diambil");
    } catch (error: any) {
      toast.error(getApiErrorMessage(error, "Gagal mengambil lokasi"));
    }
  };
const getAttachmentMediaSource = (
  source: PickedAttachment["source"]
): "CAMERA" | "GALLERY" | "UPLOAD" => {
  if (source === "camera") return "CAMERA";
  if (source === "gallery") return "GALLERY";

  return "UPLOAD";
};
 const submitOnline = async () => {
  const payload = {
    clientLocalId: `mobile-${Date.now()}`,
    categoryId,
    buildingId: buildingId || undefined,
    roomId: roomId || undefined,
    title: title.trim(),
    description: description.trim(),
    priority,
    locationText: locationText.trim() || undefined,
    latitude: coords.latitude,
    longitude: coords.longitude,
  };

  const report = await reportService.create(payload);

  if (!report?.id) {
    throw new Error("Report berhasil dibuat, tetapi ID report tidak ditemukan.");
  }

  return report;
}

const uploadReportAttachments = async (reportId: string) => {
  for (const attachment of attachments) {
    console.log("UPLOAD ATTACHMENT:", attachment);

    const media = await mediaService.upload({
      uri: attachment.uri,
      fileName: attachment.name,
      mimeType: attachment.mimeType,
      source: getAttachmentMediaSource(attachment.source),
      targetType: "REPORT",
      targetId: reportId,
      usageType: "REPORT_DAMAGE_PHOTO",
    });

    console.log("MEDIA UPLOADED:", media);

    await reportService.addMedia(reportId, {
      mediaId: media.id,
      type: "DAMAGE_PHOTO",
      caption: attachment.name || "Media laporan",
    });

    console.log("REPORT MEDIA ADDED:", media.id);
  }
};

const getRoomNameSnapshot = () => {
  if (!selectedRoom) return undefined;

  if (selectedRoom.code && selectedRoom.name) {
    return `${selectedRoom.code} - ${selectedRoom.name}`;
  }

  return selectedRoom.name || selectedRoom.code || undefined;
};

const saveOffline = async () => {
  const selectedCategory = categoryOptions.find((item) => item.id === categoryId);
const selectedBuilding = buildingOptions.find((item) => item.id === buildingId);
const selectedRoom = roomOptions.find((item) => item.id === roomId);

await saveLocalReport(
  {
    clientLocalId: `offline-${Date.now()}`,

    categoryId,
    categoryName: selectedCategory?.name,

    buildingId,
    buildingName: selectedBuilding?.name,

    roomId,
    roomName:
      selectedRoom?.code && selectedRoom?.name
        ? `${selectedRoom.code} - ${selectedRoom.name}`
        : selectedRoom?.name || selectedRoom?.code,

    title: title.trim(),
    description: description.trim(),
    priority,
    locationText: locationText.trim() || undefined,
    latitude: coords.latitude,
    longitude: coords.longitude,
  },
  attachments[0]?.uri || null
);
};

 const handleSubmit = async () => {
  if (loading) return;

  setFieldErrors({});

  if (!validateForm()) {
    toast.error("Lengkapi data laporan terlebih dahulu");
    return;
  }

  let createdReport: any = null;

  try {
    setLoading(true);

    // STEP 1: CREATE REPORT
    // Kalau step ini gagal, baru simpan offline.
    try {
      createdReport = await submitOnline();
    } catch (createError: any) {
      console.log("CREATE REPORT ERROR FULL:", createError);
      console.log("CREATE REPORT ERROR MESSAGE:", createError?.message);
      console.log("CREATE REPORT ERROR STATUS:", createError?.response?.status);
      console.log("CREATE REPORT ERROR DATA:", createError?.response?.data);

      await saveOffline();

      toast.success("Koneksi/API gagal. Laporan disimpan di Offline Queue.");
      navigation.goBack();
      return;
    }

    const reportId = createdReport?.id;

    if (!reportId) {
      console.log("CREATED REPORT INVALID:", createdReport);
      toast.error("Laporan dibuat, tetapi ID laporan tidak ditemukan.");
      return;
    }

    // STEP 2: UPLOAD MEDIA
    // Kalau media gagal, jangan simpan offline lagi karena report sudah masuk.
    try {
      await uploadReportAttachments(reportId);
    } catch (mediaError: any) {
      console.log("UPLOAD MEDIA AFTER CREATE ERROR FULL:", mediaError);
      console.log("UPLOAD MEDIA AFTER CREATE ERROR MESSAGE:", mediaError?.message);
      console.log("UPLOAD MEDIA AFTER CREATE ERROR STATUS:", mediaError?.response?.status);
      console.log("UPLOAD MEDIA AFTER CREATE ERROR DATA:", mediaError?.response?.data);

      toast.error(
        "Laporan berhasil dibuat, tetapi ada media yang gagal diupload/ditempel."
      );

      navigation.replace("ReportDetail", { id: reportId });
      return;
    }

    toast.success("Laporan berhasil dibuat");
    navigation.replace("ReportDetail", { id: reportId });
  } catch (error: any) {
    // console.log("HANDLE SUBMIT UNKNOWN ERROR:", error);
    toast.error(getApiErrorMessage(error, "Gagal membuat laporan"));
  } finally {
    setLoading(false);
  }
};

  return (
    <Screen>
      <View style={styles.header}>
        <Text style={styles.title}
          testID="create-report-title"
  accessibilityLabel="create-report-title"
        >Buat Laporan</Text>
        <Text style={styles.subtitle}>
          Laporkan kerusakan fasilitas kampus dengan kategori, lokasi, foto, dan
          prioritas penanganan.
        </Text>
      </View>

      <Card>
        <Text style={styles.sectionTitle}>Informasi Laporan</Text>

        <ZodInput
          testID="create-report-title-input"
  accessibilityLabel="create-report-title-input"
          name="title"
          label="Judul"
          value={title}
          onChangeText={(value) => {
            setTitle(value);
            clearFieldError("title");
          }}
          placeholder="Contoh: AC tidak dingin"
          errors={fieldErrors}
          clearError={clearFieldError}
          required
        />

        <ZodInput
          testID="create-report-description-input"
  accessibilityLabel="create-report-description-input"
          name="description"
          label="Deskripsi"
          value={description}
          onChangeText={(value) => {
            setDescription(value);
            clearFieldError("description");
          }}
          placeholder="Jelaskan kerusakan secara detail"
          multiline
          numberOfLines={4}
          textAlignVertical="top"
          style={{ minHeight: 100 }}
          errors={fieldErrors}
          clearError={clearFieldError}
          required
        />
      </Card>

      <Card>
        <Text style={styles.sectionTitle}>Kategori dan Prioritas</Text>

        <SelectorInput
          testID="create-report-category-select"
  accessibilityLabel="create-report-category-select"
    optionTestIDPrefix="create-report-category-option"
          label="Kategori"
          placeholder="Cari dan pilih kategori laporan"
          options={categoryOptions}
          value={categoryOptions.find((item) => item.id === categoryId) ?? null}
          onSelect={(item) => {
            setCategoryId(item.id);
            clearFieldError("categoryId");
          }}
          getLabel={getCategoryLabel}
          getValue={getCategoryValue}
          getDescription={getCategoryDescription}
          error={getFirstError(fieldErrors, "categoryId")}
          emptyText="Kategori tidak ditemukan"
        />

        <SelectorInput
          testID="create-report-priority-select"
  accessibilityLabel="create-report-priority-select"
  optionTestIDPrefix="create-report-priority-option"
          label="Prioritas"
          placeholder="Cari dan pilih prioritas"
          options={PRIORITY_OPTIONS}
          value={selectedPriority}
          onSelect={(item) => setPriority(item.value)}
          getLabel={getPriorityLabel}
          getValue={getPriorityValue}
          getDescription={getPriorityDescription}
          emptyText="Prioritas tidak ditemukan"
        />
      </Card>

      <Card>
        <Text style={styles.sectionTitle}>Lokasi</Text>

        <SelectorInput
          testID="create-report-building-select"
  accessibilityLabel="create-report-building-select"
  optionTestIDPrefix="create-report-building-option"
          label="Gedung"
          placeholder="Cari dan pilih gedung, opsional"
          options={buildingOptions}
          value={buildingOptions.find((item) => item.id === buildingId) ?? null}
          onSelect={(item) => {
            setBuildingId(item.id);
            setRoomId("");
          }}
          getLabel={getBuildingLabel}
          getValue={getBuildingValue}
          getDescription={getBuildingDescription}
          emptyText="Gedung tidak ditemukan"
        />

        <SelectorInput
          testID="create-report-room-select"
  accessibilityLabel="create-report-room-select"
  optionTestIDPrefix="create-report-room-option"
          label="Ruangan"
          placeholder={
            buildingId
              ? "Cari dan pilih ruangan, opsional"
              : "Pilih gedung terlebih dahulu"
          }
          options={roomOptions}
          value={roomOptions.find((item) => item.id === roomId) ?? null}
          onSelect={(item) => setRoomId(item.id)}
          getLabel={getRoomLabel}
          getValue={getRoomValue}
          getDescription={getRoomDescription}
          disabled={!buildingId}
          emptyText="Ruangan tidak ditemukan"
        />

        <ZodInput
          testID="create-report-location-text-input"
  accessibilityLabel="create-report-location-text-input"
          name="locationText"
          label="Keterangan Lokasi"
          value={locationText}
          onChangeText={(value) => {
            setLocationText(value);
            clearFieldError("locationText");
          }}
          placeholder="Contoh: Gedung A, lantai 1, dekat ruang dosen"
          errors={fieldErrors}
          clearError={clearFieldError}
        />

        <View style={styles.locationSummary}>
          <Text style={styles.summaryText}>
            Gedung: {selectedBuilding?.name || "-"}
          </Text>
          <Text style={styles.summaryText}>
            Ruangan:{" "}
            {selectedRoom
              ? selectedRoom.code
                ? `${selectedRoom.code} - ${selectedRoom.name}`
                : selectedRoom.name
              : "-"}
          </Text>
          <Text style={styles.summaryText}>
            GPS:{" "}
            {coords.latitude && coords.longitude
              ? `${coords.latitude}, ${coords.longitude}`
              : "-"}
          </Text>
        </View>

        <Button
          testID="create-report-use-gps-button"
  accessibilityLabel="create-report-use-gps-button"
          title="Gunakan Lokasi Saat Ini"
          variant="secondary"
          onPress={useCurrentLocation}
        />
      </Card>

      <Card>
        <Text style={styles.sectionTitle}>Foto Kerusakan</Text>
        <Text style={styles.helperText}>
          Foto bersifat opsional, tetapi sangat membantu teknisi memahami kondisi
          kerusakan.
        </Text>

        <AttachmentPicker
          testID="create-report-attachment-picker"
  accessibilityLabel="create-report-attachment-picker"
  label="Media Laporan"
  helperText="Upload foto kerusakan dari kamera, galeri, atau file dari perangkat."
  value={attachments}
  onChange={setAttachments}
  maxFiles={3}
/>

       
      </Card>

      <Button
        testID="create-report-submit-button"
  accessibilityLabel="create-report-submit-button"
        title="Kirim Laporan"
        loading={loading}
        disabled={loading}
        onPress={handleSubmit}
      />
    </Screen>
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
  sectionTitle: {
    fontSize: 16,
    fontWeight: "900",
    color: "#0F172A",
    marginBottom: 12,
  },
  helperText: {
    color: "#64748B",
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 12,
  },
  locationSummary: {
    backgroundColor: "#F8FAFC",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 14,
    padding: 12,
    marginBottom: 12,
    gap: 4,
  },
  summaryText: {
    color: "#475569",
    fontSize: 13,
    fontWeight: "700",
  },
  photoActions: {
    gap: 10,
    marginBottom: 12,
  },
  imagePreviewWrap: {
    borderRadius: 16,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    backgroundColor: "#FFFFFF",
  },
  imagePreview: {
    height: 200,
    width: "100%",
  },
  fileInfo: {
    padding: 10,
  },
  fileName: {
    fontSize: 13,
    color: "#0F172A",
    fontWeight: "900",
  },
  fileMeta: {
    marginTop: 2,
    fontSize: 12,
    color: "#64748B",
    fontWeight: "600",
  },
  emptyPhoto: {
    minHeight: 130,
    borderWidth: 1,
    borderStyle: "dashed",
    borderColor: "#CBD5E1",
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F8FAFC",
  },
  emptyPhotoText: {
    color: "#64748B",
    fontWeight: "700",
    fontSize: 13,
  }})