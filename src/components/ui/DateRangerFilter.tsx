import { useState } from "react";
import {
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";

import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

type Props = {
  startDate: string;
  endDate: string;
  onChangeStartDate: (value: string) => void;
  onChangeEndDate: (value: string) => void;
  onClear?: () => void;
  errorText?: string | null;
  helperText?: string;
};

function formatDateInput(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function parseDate(value: string) {
  if (!value.trim()) return new Date();

  const date = new Date(`${value}T00:00:00`);

  if (Number.isNaN(date.getTime())) {
    return new Date();
  }

  return date;
}

export function DateRangePickerFilter({
  startDate,
  endDate,
  onChangeStartDate,
  onChangeEndDate,
  onClear,
  errorText,
  helperText = "Pilih rentang tanggal laporan.",
}: Props) {
  const [pickerMode, setPickerMode] = useState<"start" | "end" | null>(null);

  const hasValue = Boolean(startDate.trim() || endDate.trim());

  const openStartPicker = () => {
    setPickerMode("start");
  };

  const openEndPicker = () => {
    setPickerMode("end");
  };

  const closePicker = () => {
    setPickerMode(null);
  };

  const selectedDate =
    pickerMode === "start" ? parseDate(startDate) : parseDate(endDate);

  const handleDateChange = (_event: any, selected?: Date) => {
    if (Platform.OS === "android") {
      closePicker();
    }

    if (!selected) return;

    const formatted = formatDateInput(selected);

    if (pickerMode === "start") {
      onChangeStartDate(formatted);
    }

    if (pickerMode === "end") {
      onChangeEndDate(formatted);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Filter Tanggal</Text>

      {Platform.OS === "web" ? (
        <View style={styles.row}>
          <View style={styles.inputCol}>
            <Input
              label="Tanggal Awal"
              value={startDate}
              onChangeText={onChangeStartDate}
              placeholder="2026-06-01"
              keyboardType="numbers-and-punctuation"
            />
          </View>

          <View style={styles.inputCol}>
            <Input
              label="Tanggal Akhir"
              value={endDate}
              onChangeText={onChangeEndDate}
              placeholder="2026-06-30"
              keyboardType="numbers-and-punctuation"
            />
          </View>
        </View>
      ) : (
        <View style={styles.row}>
          <View style={styles.inputCol}>
            <Text style={styles.label}>Tanggal Awal</Text>
            <Pressable style={styles.dateButton} onPress={openStartPicker}>
              <Text
                style={[
                  styles.dateText,
                  !startDate ? styles.placeholderText : null,
                ]}
              >
                {startDate || "Pilih tanggal awal"}
              </Text>
            </Pressable>
          </View>

          <View style={styles.inputCol}>
            <Text style={styles.label}>Tanggal Akhir</Text>
            <Pressable style={styles.dateButton} onPress={openEndPicker}>
              <Text
                style={[
                  styles.dateText,
                  !endDate ? styles.placeholderText : null,
                ]}
              >
                {endDate || "Pilih tanggal akhir"}
              </Text>
            </Pressable>
          </View>
        </View>
      )}

      {errorText ? (
        <Text style={styles.errorText}>{errorText}</Text>
      ) : (
        <Text style={styles.helperText}>{helperText}</Text>
      )}

      {hasValue && onClear ? (
        <Button
          title="Reset Filter Tanggal"
          variant="secondary"
          onPress={onClear}
        />
      ) : null}

      {pickerMode && Platform.OS !== "web" ? (
        <DateTimePicker
          value={selectedDate}
          mode="date"
          display={Platform.OS === "ios" ? "spinner" : "default"}
          onChange={handleDateChange}
        />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  title: {
    fontSize: 14,
    fontWeight: "900",
    color: "#0F172A",
    marginBottom: 8,
  },
  row: {
    flexDirection: "row",
    gap: 10,
  },
  inputCol: {
    flex: 1,
  },
  label: {
    fontSize: 14,
    fontWeight: "800",
    color: "#334155",
    marginBottom: 6,
  },
  dateButton: {
    minHeight: 48,
    borderWidth: 1,
    borderColor: "#CBD5E1",
    borderRadius: 14,
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 12,
    justifyContent: "center",
  },
  dateText: {
    fontSize: 14,
    color: "#0F172A",
    fontWeight: "700",
  },
  placeholderText: {
    color: "#94A3B8",
    fontWeight: "500",
  },
  helperText: {
    marginTop: 6,
    marginBottom: 10,
    fontSize: 12,
    color: "#64748B",
    lineHeight: 17,
  },
  errorText: {
    marginTop: 6,
    marginBottom: 10,
    fontSize: 12,
    color: "#DC2626",
    fontWeight: "700",
    lineHeight: 17,
  },
});