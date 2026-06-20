import { useState } from "react";
import {
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { toast } from "sonner-native";

import { Screen } from "@/components/ui/Screen";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Input } from "@/components/ui/Input";

import { mediaService } from "@/api/media/service";
import { reportService } from "@/api/reports/service";

import type { RootStackParamList } from "@/app/router";
import type { ReportMediaType } from "@/api/reports/types";
import { getApiErrorMessage } from "@/utils/apiError";

type Props = NativeStackScreenProps<RootStackParamList, "UploadMedia">;

type MediaUsageType =
  | "REPORT_DAMAGE_PHOTO"
  | "REPORT_REPAIR_PROOF"
  | "REPORT_ADDITIONAL_EVIDENCE";

const MEDIA_TYPES: ReportMediaType[] = [
  "DAMAGE_PHOTO",
  "REPAIR_PROOF",
  "ADDITIONAL_EVIDENCE",
];

function getUsageType(type: ReportMediaType): MediaUsageType {
  if (type === "REPAIR_PROOF") {
    return "REPORT_REPAIR_PROOF";
  }

  if (type === "DAMAGE_PHOTO") {
    return "REPORT_DAMAGE_PHOTO";
  }

  return "REPORT_ADDITIONAL_EVIDENCE";
}

function getMediaLabel(type: ReportMediaType) {
  if (type === "DAMAGE_PHOTO") return "Foto Kerusakan";
  if (type === "REPAIR_PROOF") return "Bukti Perbaikan";
  return "Bukti Tambahan";
}

export function UploadMediaScreen({ route, navigation }: Props) {
  const { reportId, mediaType } = route.params;

  const [type, setType] = useState<ReportMediaType>(
    mediaType || "DAMAGE_PHOTO"
  );
  const [caption, setCaption] = useState("");
  const [asset, setAsset] = useState<ImagePicker.ImagePickerAsset | null>(null);
  const [loading, setLoading] = useState(false);

  const pick = async () => {
    try {
      const permission =
        await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (!permission.granted) {
        toast.error("Izin akses galeri diperlukan untuk memilih foto.");
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        quality: 0.75,
      });

      if (!result.canceled && result.assets?.[0]) {
        setAsset(result.assets[0]);
        toast.success("Foto berhasil dipilih");
      }
    } catch (e: any) {
      toast.error(getApiErrorMessage(e, "Gagal memilih foto"));
    }
  };

  const removeImage = () => {
    setAsset(null);
    toast.success("Foto dihapus dari pilihan");
  };

  const submit = async () => {
    if (loading) return;

    if (!asset?.uri) {
      toast.error("Pilih foto terlebih dahulu");
      return;
    }

    try {
      setLoading(true);

      const usageType = getUsageType(type);

      const media = await mediaService.upload({
        uri: asset.uri,
        fileName: asset.fileName,
        mimeType: asset.mimeType,
        source: "GALLERY",
        targetType: "REPORT",
        targetId: reportId,
        usageType,
      });

      await reportService.addMedia(reportId, {
        mediaId: media.id,
        type,
        caption: caption.trim() || undefined,
      });

      toast.success("Media berhasil diupload dan ditempel ke laporan");
      navigation.goBack();
    } catch (e: any) {
      console.log("UPLOAD ERROR STATUS:", e?.response?.status);
      console.log("UPLOAD ERROR DATA:", e?.response?.data);

      toast.error(getApiErrorMessage(e, "Upload gagal"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Screen>
      <View style={styles.header}>
        <Text style={styles.title}>Upload Media</Text>
        <Text style={styles.subtitle}>
          Upload foto kerusakan, bukti perbaikan, atau bukti tambahan untuk
          laporan.
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Jenis Media</Text>

        <View style={styles.badgeWrap}>
          {MEDIA_TYPES.map((item) => {
            const active = type === item;

            return (
              <Pressable
                key={item}
                onPress={() => setType(item)}
                style={styles.badgePressable}
              >
                <Badge
                  label={`${active ? "✓ " : ""}${getMediaLabel(item)}`}
                />
              </Pressable>
            );
          })}
        </View>
      </View>

      <Input
        label="Caption"
        value={caption}
        onChangeText={setCaption}
        placeholder="Contoh: Foto kerusakan plafon di ruang kelas."
        multiline
        numberOfLines={3}
      />

      <View style={styles.pickRow}>
        <Button
          title={asset ? "Ganti Foto" : "Pilih Foto"}
          variant="secondary"
          onPress={pick}
        />

        {asset ? (
          <Button
            title="Hapus"
            variant="danger"
            onPress={removeImage}
          />
        ) : null}
      </View>

      {asset?.uri ? (
        <View style={styles.previewCard}>
          <Image
            source={{ uri: asset.uri }}
            style={styles.previewImage}
            resizeMode="cover"
          />

          <View style={styles.fileInfo}>
            <Text style={styles.fileName}>
              {asset.fileName || "Foto dipilih"}
            </Text>
            <Text style={styles.fileMeta}>
              {asset.mimeType || "image/jpeg"}
            </Text>
          </View>
        </View>
      ) : (
        <View style={styles.emptyPreview}>
          <Text style={styles.emptyText}>Belum ada foto yang dipilih.</Text>
        </View>
      )}

      <Button
        title="Upload Media"
        loading={loading}
        onPress={submit}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    marginBottom: 18,
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
  section: {
    marginBottom: 14,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "900",
    color: "#0F172A",
    marginBottom: 8,
  },
  badgeWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  badgePressable: {
    marginBottom: 4,
  },
  pickRow: {
    flexDirection: "row",
    gap: 10,
    marginTop: 4,
    marginBottom: 14,
  },
  previewCard: {
    borderWidth: 1,
    borderColor: "#E2E8F0",
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    overflow: "hidden",
    marginBottom: 16,
  },
  previewImage: {
    width: "100%",
    height: 220,
  },
  fileInfo: {
    padding: 12,
  },
  fileName: {
    fontSize: 13,
    fontWeight: "900",
    color: "#0F172A",
  },
  fileMeta: {
    marginTop: 3,
    fontSize: 12,
    color: "#64748B",
  },
  emptyPreview: {
    minHeight: 140,
    borderWidth: 1,
    borderStyle: "dashed",
    borderColor: "#CBD5E1",
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
    backgroundColor: "#F8FAFC",
  },
  emptyText: {
    fontSize: 13,
    color: "#64748B",
    fontWeight: "700",
  },
});