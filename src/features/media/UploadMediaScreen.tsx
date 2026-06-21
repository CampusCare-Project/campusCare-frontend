import { useState } from "react";
import {
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { toast } from "sonner-native";

import { Screen } from "@/components/ui/Screen";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Input } from "@/components/ui/Input";
import {
  AttachmentPicker,
  type PickedAttachment,
} from "@/components/ui/AttachmentPicker";

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

function getUploadSource(source: PickedAttachment["source"]) {
  if (source === "camera") return "CAMERA";
  if (source === "gallery") return "GALLERY";

  return "UPLOAD";
}

export function UploadMediaScreen({ route, navigation }: Props) {
  const { reportId, mediaType } = route.params;

  const [type, setType] = useState<ReportMediaType>(
    mediaType || "DAMAGE_PHOTO"
  );
  const [caption, setCaption] = useState("");
  const [attachments, setAttachments] = useState<PickedAttachment[]>([]);
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    if (loading) return;

    if (attachments.length === 0) {
      toast.error("Pilih foto atau file terlebih dahulu");
      return;
    }

    try {
      setLoading(true);

      const usageType = getUsageType(type);

      for (const attachment of attachments) {
        console.log("UPLOAD MEDIA ATTACHMENT:", attachment);

        const media = await mediaService.upload({
          uri: attachment.uri,
          fileName: attachment.name,
          mimeType: attachment.mimeType,
          source: getUploadSource(attachment.source),
          targetType: "REPORT",
          targetId: reportId,
          usageType,
        });

        console.log("UPLOAD MEDIA RESULT:", media);

        await reportService.addMedia(reportId, {
          mediaId: media.id,
          type,
          caption:
            caption.trim() ||
            attachment.name ||
            getMediaLabel(type),
        });
      }

      toast.success("Media berhasil diupload dan ditempel ke laporan");
      navigation.goBack();
    } catch (e: any) {
      console.log("UPLOAD ERROR FULL:", e);
      console.log("UPLOAD ERROR MESSAGE:", e?.message);
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
          laporan. Bisa dari kamera, galeri, atau file perangkat.
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
                disabled={loading}
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

      <AttachmentPicker
        label="Lampiran Media"
        helperText="Maksimal 3 lampiran. Bisa ambil foto dari kamera, pilih gambar dari galeri, atau pilih file dari perangkat."
        value={attachments}
        onChange={setAttachments}
        maxFiles={3}
        disabled={loading}
      />

      <Button
        title={
          attachments.length > 0
            ? `Upload ${attachments.length} Media`
            : "Upload Media"
        }
        loading={loading}
        disabled={loading}
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
});