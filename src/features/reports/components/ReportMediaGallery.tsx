import { useEffect, useMemo, useState } from "react";
import {
  Image,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { mediaService } from "@/api/media/service";
import type { MediaAsset } from "@/api/media/types";
import { ENV } from "@/config/env";

type ReportMediaItem = {
  id: string;
  mediaId: string;
  type?: string;
  caption?: string | null;

  media?: MediaAsset;
  asset?: MediaAsset;
  mediaAsset?: MediaAsset;
};

type Props = {
  items?: ReportMediaItem[];
};

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

function normalizeUrl(url?: string | null) {
  if (!url) return null;

  if (
    url.startsWith("http://") ||
    url.startsWith("https://") ||
    url.startsWith("file://") ||
    url.startsWith("data:")
  ) {
    return url;
  }

  if (url.startsWith("/")) {
    return `${ENV.API_BASE_URL}${url}`;
  }

  return `${ENV.API_BASE_URL}/${url}`;
}

function getEmbeddedAsset(item: ReportMediaItem) {
  return item.media || item.asset || item.mediaAsset || null;
}

function isImageAsset(asset?: MediaAsset | null) {
  if (!asset) return false;

  const mimeType = asset.mimeType?.toLowerCase() || "";
  const url = asset.url || "";

  if (mimeType.startsWith("image/")) return true;

  return /\.(jpg|jpeg|png|webp)$/i.test(url);
}

export function ReportMediaGallery({ items = [] }: Props) {
  const [assetsById, setAssetsById] = useState<Record<string, MediaAsset>>({});
  const [loading, setLoading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const mediaIds = useMemo(() => {
    return items
      .map((item) => item.mediaId)
      .filter(Boolean)
      .filter((id, index, arr) => arr.indexOf(id) === index);
  }, [items]);

  useEffect(() => {
    const missingIds = mediaIds.filter((id) => {
      const item = items.find((media) => media.mediaId === id);
      const embedded = item ? getEmbeddedAsset(item) : null;

      return !embedded && !assetsById[id];
    });

    if (missingIds.length === 0) return;

    let alive = true;

    const fetchAssets = async () => {
      try {
        setLoading(true);

        const results = await Promise.all(
          missingIds.map(async (id) => {
            const asset = await mediaService.getById(id);
            return [id, asset] as const;
          })
        );

        if (!alive) return;

        setAssetsById((prev) => {
          const next = { ...prev };

          for (const [id, asset] of results) {
            next[id] = asset;
          }

          return next;
        });
      } catch (error) {
        console.log("FETCH MEDIA ASSETS ERROR:", error);
      } finally {
        if (alive) setLoading(false);
      }
    };

    void fetchAssets();

    return () => {
      alive = false;
    };
  }, [mediaIds, items, assetsById]);

  const mergedItems = items.map((item) => {
    const embeddedAsset = getEmbeddedAsset(item);
    const asset = embeddedAsset || assetsById[item.mediaId] || null;

    return {
      ...item,
      asset,
      imageUrl: normalizeUrl(asset?.url),
    };
  });

  return (
    <Card>
      <Text style={styles.sectionTitle}>Media Laporan</Text>

      {loading ? <Text style={styles.mutedText}>Memuat media...</Text> : null}

      {mergedItems.length === 0 ? (
        <Text style={styles.mutedText}>Belum ada media yang diupload.</Text>
      ) : null}

      <View style={styles.grid}>
        {mergedItems.map((item) => {
          const asset = item.asset;
          const imageUrl = item.imageUrl;
          const canShowImage = imageUrl && isImageAsset(asset);

          return (
            <View key={item.id || item.mediaId} style={styles.mediaCard}>
              {canShowImage ? (
                <Pressable onPress={() => setPreviewUrl(imageUrl)}>
                  <Image
                    source={{ uri: imageUrl }}
                    style={styles.image}
                    resizeMode="cover"
                  />
                </Pressable>
              ) : (
                <View style={styles.noImageBox}>
                  <Text style={styles.noImageText}>
                    {asset ? "Media bukan gambar" : "URL belum tersedia"}
                  </Text>
                </View>
              )}

              <View style={styles.mediaInfo}>
                <Text style={styles.mediaType}>
                  {getMediaTypeLabel(item.type)}
                </Text>

                <Text numberOfLines={1} style={styles.caption}>
                  {item.caption || asset?.originalName || item.mediaId}
                </Text>

                {!asset?.url ? (
                  <Text numberOfLines={1} style={styles.mediaId}>
                    ID: {item.mediaId}
                  </Text>
                ) : null}
              </View>
            </View>
          );
        })}
      </View>

      <Modal
        visible={Boolean(previewUrl)}
        transparent
        animationType="fade"
        onRequestClose={() => setPreviewUrl(null)}
      >
        <View style={styles.modalBackdrop}>
          <Pressable
            style={StyleSheet.absoluteFillObject}
            onPress={() => setPreviewUrl(null)}
          />

          <View style={styles.previewBox}>
            {previewUrl ? (
              <Image
                source={{ uri: previewUrl }}
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
    </Card>
  );
}

const styles = StyleSheet.create({
  sectionTitle: {
    fontSize: 16,
    fontWeight: "900",
    color: "#0F172A",
    marginBottom: 10,
  },
  mutedText: {
    fontSize: 13,
    color: "#64748B",
    lineHeight: 18,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  mediaCard: {
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
  noImageBox: {
    height: 130,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#E2E8F0",
    padding: 10,
  },
  noImageText: {
    fontSize: 12,
    color: "#64748B",
    fontWeight: "800",
    textAlign: "center",
  },
  mediaInfo: {
    padding: 8,
  },
  mediaType: {
    fontSize: 11,
    color: "#2563EB",
    fontWeight: "900",
  },
  caption: {
    marginTop: 2,
    fontSize: 12,
    color: "#475569",
    fontWeight: "700",
  },
  mediaId: {
    marginTop: 2,
    fontSize: 10,
    color: "#94A3B8",
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(15, 23, 42, 0.88)",
    justifyContent: "center",
    padding: 16,
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
});