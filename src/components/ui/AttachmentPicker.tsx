import { useMemo } from "react";
import {
  Alert,
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import * as DocumentPicker from "expo-document-picker";

import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";

export type PickedAttachment = {
  id: string;
  uri: string;
  name: string;
  mimeType: string;
  size?: number | null;
  kind: "image" | "file";
  source: "camera" | "gallery" | "document";
};

type AttachmentPickerProps = {
  label?: string;
  helperText?: string;
  value: PickedAttachment[];
  onChange: (items: PickedAttachment[]) => void;
  maxFiles?: number;
  disabled?: boolean;
  allowCamera?: boolean;
  allowGallery?: boolean;
  allowDocument?: boolean;
};

function createId() {
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function getFileNameFromUri(uri: string) {
  const cleanUri = uri.split("?")[0];
  const parts = cleanUri.split("/");

  return parts[parts.length - 1] || `file-${Date.now()}`;
}

function isImageMime(mimeType?: string | null) {
  return String(mimeType || "").startsWith("image/");
}

function normalizeImageAsset(
  asset: ImagePicker.ImagePickerAsset,
  source: "camera" | "gallery"
): PickedAttachment {
  const mimeType = asset.mimeType || "image/jpeg";
  const fallbackExt = mimeType.includes("png") ? "png" : "jpg";

  return {
    id: createId(),
    uri: asset.uri,
    name:
      asset.fileName ||
      getFileNameFromUri(asset.uri) ||
      `photo-${Date.now()}.${fallbackExt}`,
    mimeType,
    size: asset.fileSize ?? null,
    kind: "image",
    source,
  };
}

function normalizeDocumentAsset(
  asset: DocumentPicker.DocumentPickerAsset
): PickedAttachment {
  const mimeType = asset.mimeType || "application/octet-stream";

  return {
    id: createId(),
    uri: asset.uri,
    name: asset.name || getFileNameFromUri(asset.uri),
    mimeType,
    size: asset.size ?? null,
    kind: isImageMime(mimeType) ? "image" : "file",
    source: "document",
  };
}

function formatSize(size?: number | null) {
  if (!size) return "-";

  if (size < 1024) return `${size} B`;
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;

  return `${(size / 1024 / 1024).toFixed(1)} MB`;
}

export function attachmentToFormDataFile(item: PickedAttachment) {
  return {
    uri: item.uri,
    name: item.name,
    type: item.mimeType,
  } as any;
}

export function AttachmentPicker({
  label = "Lampiran",
  helperText = "Ambil foto dari kamera, pilih gambar dari galeri, atau pilih file dari perangkat.",
  value,
  onChange,
  maxFiles = 5,
  disabled = false,
  allowCamera = true,
  allowGallery = true,
  allowDocument = true,
}: AttachmentPickerProps) {
  const canAddMore = value.length < maxFiles && !disabled;

  const remainingText = useMemo(() => {
    return `${value.length}/${maxFiles} file`;
  }, [value.length, maxFiles]);

 const appendItems = (items: PickedAttachment[]) => {
  const remainingSlot = maxFiles - value.length;

  if (remainingSlot <= 0) {
    Alert.alert("Batas lampiran", `Maksimal hanya ${maxFiles} lampiran.`);
    return;
  }

  const nextItems = items.slice(0, remainingSlot);
  const next = [...value, ...nextItems];

  onChange(next);

  if (items.length > remainingSlot) {
    Alert.alert(
      "Sebagian lampiran tidak ditambahkan",
      `Maksimal hanya ${maxFiles} lampiran.`
    );
  }
};
  const takePhoto = async () => {
    if (!canAddMore) return;

    const permission = await ImagePicker.requestCameraPermissionsAsync();

    if (!permission.granted) {
      Alert.alert(
        "Izin kamera ditolak",
        "Aktifkan izin kamera agar aplikasi bisa mengambil foto."
      );
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: false,
      quality: 0.8,
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
    });

    if (result.canceled) return;

    const items = result.assets.map((asset) =>
      normalizeImageAsset(asset, "camera")
    );

    appendItems(items);
  };

  const pickImage = async () => {
    if (!canAddMore) return;

    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permission.granted) {
      Alert.alert(
        "Izin galeri ditolak",
        "Aktifkan izin galeri agar aplikasi bisa memilih gambar."
      );
      return;
    }

 const result = await ImagePicker.launchImageLibraryAsync({
  allowsEditing: false,
  allowsMultipleSelection: maxFiles > 1,
  selectionLimit: Math.max(1, maxFiles - value.length),
  quality: 0.8,
  mediaTypes: ImagePicker.MediaTypeOptions.Images,
});

    if (result.canceled) return;

    const items = result.assets.map((asset) =>
      normalizeImageAsset(asset, "gallery")
    );

    appendItems(items);
  };

  const pickDocument = async () => {
    if (!canAddMore) return;

   const result = await DocumentPicker.getDocumentAsync({
  multiple: maxFiles > 1,
  copyToCacheDirectory: true,
  type: "*/*",
});

if (result.canceled) return;

const items = result.assets.map(normalizeDocumentAsset);

appendItems(items);
  };

  const openPickerMenu = () => {
    if (!canAddMore) return;

    const options: {
      text: string;
      onPress?: () => void;
      style?: "default" | "cancel" | "destructive";
    }[] = [];

    if (allowCamera) {
      options.push({
        text: "Ambil Foto dari Kamera",
        onPress: takePhoto,
      });
    }

    if (allowGallery) {
      options.push({
        text: "Pilih Gambar dari Galeri",
        onPress: pickImage,
      });
    }

    if (allowDocument) {
      options.push({
        text: "Pilih File dari Perangkat",
        onPress: pickDocument,
      });
    }

    options.push({
      text: "Batal",
      style: "cancel",
    });

    Alert.alert("Pilih Lampiran", "Pilih sumber file yang ingin digunakan.", options);
  };

  const removeItem = (id: string) => {
    onChange(value.filter((item) => item.id !== id));
  };

  const clearAll = () => {
    onChange([]);
  };

  return (
    <Card>
      <View style={styles.header}>
        <View style={{ flex: 1 }}>
          <Text style={styles.label}>{label}</Text>
          <Text style={styles.helper}>{helperText}</Text>
        </View>

        <Text style={styles.counter}>{remainingText}</Text>
      </View>

      <View style={styles.actionRow}>
    <Button
  title={value.length >= maxFiles ? "Lampiran Penuh" : "Tambah Lampiran"}
  variant="secondary"
  disabled={!canAddMore}
  onPress={openPickerMenu}
/>

        {value.length > 0 ? (
          <Pressable
            style={styles.clearButton}
            disabled={disabled}
            onPress={clearAll}
          >
            <Text style={styles.clearButtonText}>Hapus Semua</Text>
          </Pressable>
        ) : null}
      </View>

      {value.length === 0 ? (
        <View style={styles.emptyBox}>
          <Text style={styles.emptyText}>Belum ada lampiran.</Text>
        </View>
      ) : null}

      {value.length > 0 ? (
        <View style={styles.list}>
          {value.map((item) => {
            const isImage = item.kind === "image" || isImageMime(item.mimeType);

            return (
              <View key={item.id} style={styles.item}>
                {isImage ? (
                  <Image
                    source={{ uri: item.uri }}
                    style={styles.preview}
                    resizeMode="cover"
                  />
                ) : (
                  <View style={styles.fileIcon}>
                    <Text style={styles.fileIconText}>FILE</Text>
                  </View>
                )}

                <View style={styles.itemInfo}>
                  <Text numberOfLines={1} style={styles.fileName}>
                    {item.name}
                  </Text>

                  <Text numberOfLines={1} style={styles.fileMeta}>
                    {item.mimeType} • {formatSize(item.size)} • {item.source}
                  </Text>

                  <Text numberOfLines={1} style={styles.uriText}>
                    {item.uri}
                  </Text>
                </View>

                <Pressable
                  style={styles.removeButton}
                  disabled={disabled}
                  onPress={() => removeItem(item.id)}
                >
                  <Text style={styles.removeButtonText}>×</Text>
                </Pressable>
              </View>
            );
          })}
        </View>
      ) : null}
    </Card>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
  },
  label: {
    fontSize: 15,
    fontWeight: "900",
    color: "#0F172A",
  },
  helper: {
    marginTop: 3,
    fontSize: 12,
    color: "#64748B",
    lineHeight: 17,
  },
  counter: {
    fontSize: 12,
    color: "#2563EB",
    fontWeight: "900",
  },
  actionRow: {
    marginTop: 14,
    gap: 10,
  },
  clearButton: {
    minHeight: 42,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#FCA5A5",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FEF2F2",
  },
  clearButtonText: {
    color: "#DC2626",
    fontWeight: "900",
    fontSize: 13,
  },
  emptyBox: {
    marginTop: 14,
    borderWidth: 1,
    borderStyle: "dashed",
    borderColor: "#CBD5E1",
    borderRadius: 14,
    padding: 14,
    backgroundColor: "#F8FAFC",
  },
  emptyText: {
    textAlign: "center",
    color: "#64748B",
    fontWeight: "700",
    fontSize: 13,
  },
  list: {
    marginTop: 14,
    gap: 10,
  },
  item: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    backgroundColor: "#F8FAFC",
    borderRadius: 14,
    padding: 8,
  },
  preview: {
    width: 56,
    height: 56,
    borderRadius: 10,
    backgroundColor: "#E2E8F0",
  },
  fileIcon: {
    width: 56,
    height: 56,
    borderRadius: 10,
    backgroundColor: "#E2E8F0",
    alignItems: "center",
    justifyContent: "center",
  },
  fileIconText: {
    fontSize: 11,
    fontWeight: "900",
    color: "#475569",
  },
  itemInfo: {
    flex: 1,
  },
  fileName: {
    fontSize: 13,
    color: "#0F172A",
    fontWeight: "900",
  },
  fileMeta: {
    marginTop: 3,
    fontSize: 11,
    color: "#64748B",
    fontWeight: "700",
  },
  uriText: {
    marginTop: 2,
    fontSize: 10,
    color: "#94A3B8",
  },
  removeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#FEE2E2",
    alignItems: "center",
    justifyContent: "center",
  },
  removeButtonText: {
    color: "#DC2626",
    fontSize: 20,
    fontWeight: "900",
    lineHeight: 22,
  },
});