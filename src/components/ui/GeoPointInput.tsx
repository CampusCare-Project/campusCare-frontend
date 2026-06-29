import React, { useState } from "react";
import { ActivityIndicator, Alert, Pressable, StyleSheet, Text, View } from "react-native";
import * as Location from "expo-location";

import { ZodInput } from "@/components/ui/ZodInput";
import type { ZodFieldErrors } from "@/utils/zodErrors";

type GeoPointInputProps = {
  latitude: string;
  longitude: string;
  onLatitudeChange: (value: string) => void;
  onLongitudeChange: (value: string) => void;

  errors?: ZodFieldErrors;
  clearError?: (fieldName: string) => void;

  latitudeName?: string;
  longitudeName?: string;

  onAddressFound?: (address: string) => void;
  enableReverseGeocode?: boolean;
    latitudeTestID?: string;
  longitudeTestID?: string;
};

export function GeoPointInput({
  latitude,
  longitude,
  onLatitudeChange,
  onLongitudeChange,
  errors = {},
  clearError,
  latitudeName = "latitude",
  longitudeName = "longitude",
  onAddressFound,
  latitudeTestID,
  longitudeTestID,
  enableReverseGeocode = true,
}: GeoPointInputProps) {
  const [loading, setLoading] = useState(false);

  const getCurrentLocation = async () => {
    try {
      setLoading(true);

      const permission = await Location.requestForegroundPermissionsAsync();

      if (permission.status !== "granted") {
        Alert.alert(
          "Izin lokasi ditolak",
          "Aktifkan izin lokasi agar aplikasi dapat mengambil latitude dan longitude otomatis."
        );
        return;
      }

      const position = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });

      const lat = String(position.coords.latitude);
      const lng = String(position.coords.longitude);

      onLatitudeChange(lat);
      onLongitudeChange(lng);

      clearError?.(latitudeName);
      clearError?.(longitudeName);

      if (enableReverseGeocode && onAddressFound) {
        try {
          const addresses = await Location.reverseGeocodeAsync({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });

          const first = addresses[0];

          if (first) {
            const formatted = [
              first.name,
              first.street,
              first.district,
              first.city,
              first.region,
              first.postalCode,
            ]
              .filter(Boolean)
              .join(", ");

            if (formatted) {
              onAddressFound(formatted);
            }
          }
        } catch {
          // Reverse geocode gagal tidak masalah.
          // Latitude dan longitude tetap berhasil diambil.
        }
      }

      Alert.alert("Berhasil", "Lokasi berhasil diambil.");
    } catch (error: any) {
      Alert.alert(
        "Gagal mengambil lokasi",
        error?.message || "Pastikan GPS aktif dan izin lokasi diberikan."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <View style={{ flex: 1 }}>
          <Text style={styles.title}>Koordinat Gedung</Text>
          <Text style={styles.subtitle}>
            Isi manual atau ambil otomatis dari GPS perangkat.
          </Text>
        </View>

        <Pressable
          style={[styles.locationButton, loading && styles.locationButtonDisabled]}
          onPress={getCurrentLocation}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#FFFFFF" size="small" />
          ) : (
            <Text style={styles.locationButtonText}>Gunakan GPS</Text>
          )}
        </Pressable>
      </View>

      <ZodInput
        name={latitudeName}
        label="Latitude"
        value={latitude}
        onChangeText={onLatitudeChange}
        placeholder="Contoh: -7.596551"
        keyboardType="numeric"
        errors={errors}
          testID={latitudeTestID}
  accessibilityLabel={latitudeTestID}
        clearError={clearError}
      />

      <ZodInput
        name={longitudeName}
        label="Longitude"
        value={longitude}
        onChangeText={onLongitudeChange}
        placeholder="Contoh: 110.950721"
        keyboardType="numeric"
        errors={errors}
             testID={longitudeTestID}
  accessibilityLabel={longitudeTestID}
        clearError={clearError}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 6,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 12,
  },
  title: {
    fontSize: 15,
    fontWeight: "900",
    color: "#0F172A",
  },
  subtitle: {
    marginTop: 3,
    fontSize: 12,
    color: "#64748B",
    lineHeight: 17,
  },
  locationButton: {
    backgroundColor: "#2563EB",
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 12,
    minWidth: 105,
    alignItems: "center",
  },
  locationButtonDisabled: {
    backgroundColor: "#94A3B8",
  },
  locationButtonText: {
    color: "#FFFFFF",
    fontWeight: "800",
    fontSize: 12,
  },
});