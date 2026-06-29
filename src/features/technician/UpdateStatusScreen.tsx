import { useState } from "react";
import { Alert, Pressable, Text, View } from "react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";

import { Screen } from "@/components/ui/Screen";
import { Button } from "@/components/ui/ButtonId";
import { Badge } from "@/components/ui/Badge";
import { Input } from "@/components/ui/Input";
import { reportService } from "@/api/reports/service";

import type { RootStackParamList } from "@/app/router1";
import type { ReportStatus } from "@/api/reports/types";

type Props = NativeStackScreenProps<RootStackParamList, "UpdateStatus">;

const STATUS_OPTIONS: ReportStatus[] = [
  "IN_PROGRESS",
  "RESOLVED",
  "CANCELLED",
];

export function UpdateStatusScreen({ route, navigation }: Props) {
  const { id } = route.params;

  const [status, setStatus] = useState<ReportStatus>("IN_PROGRESS");
  const [note, setNote] = useState("");
  const [resolvedNote, setResolvedNote] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    setLoading(true);

    try {
      await reportService.updateStatus(id, {
        status,
        note,
        resolvedNote: status === "RESOLVED" ? resolvedNote : undefined,
      });

      Alert.alert("Berhasil", "Status laporan berhasil diupdate.");
      navigation.goBack();
    } catch (e: any) {
      Alert.alert("Gagal", e?.message || "Update status gagal");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Screen>
      <Text
        testID="technician-update-status-title"
        accessibilityLabel="technician-update-status-title"
        style={{
          fontSize: 22,
          fontWeight: "900",
          color: "#0F172A",
          marginBottom: 12,
        }}
      >
        Update Status
      </Text>

      <Text style={{ fontWeight: "900", marginBottom: 8 }}>Pilih Status</Text>

      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
        {STATUS_OPTIONS.map((s) => (
          <Pressable
            key={s}
            testID={`technician-status-option-${s}`}
            accessibilityLabel={`technician-status-option-${s}`}
            onPress={() => setStatus(s)}
          >
            <Badge label={`${status === s ? "✓ " : ""}${s}`} />
          </Pressable>
        ))}
      </View>

      <Input
        testID="technician-status-note-input"
        accessibilityLabel="technician-status-note-input"
        label="Catatan"
        value={note}
        onChangeText={setNote}
        multiline
      />

      {status === "RESOLVED" ? (
        <Input
          testID="technician-resolved-note-input"
          accessibilityLabel="technician-resolved-note-input"
          label="Catatan penyelesaian"
          value={resolvedNote}
          onChangeText={setResolvedNote}
          multiline
        />
      ) : null}

      <Button
        testID="technician-status-submit-button"
        accessibilityLabel="technician-status-submit-button"
        title="Update Status"
        loading={loading}
        onPress={submit}
      />
    </Screen>
  );
}