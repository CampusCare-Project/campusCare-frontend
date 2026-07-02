import { useState } from "react";
import { Alert, Pressable, Text, View } from "react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";

import { Screen } from "@/components/ui/Screen";
import { Button } from "@/components/ui/ButtonId";
import { Badge } from "@/components/ui/Badge";
import { Input } from "@/components/ui/Input";

import { reportService } from "@/api/reports/service";
import type { RootStackParamList } from "@/app/router";
import type { NoteVisibility } from "@/api/reports/types";

type Props = NativeStackScreenProps<RootStackParamList, "RepairNote">;

export function RepairNoteScreen({ route, navigation }: Props) {
  const { id } = route.params;

  const [note, setNote] = useState("");
  const [visibility, setVisibility] = useState<NoteVisibility>("PUBLIC");
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    setLoading(true);

    try {
      await reportService.addNote(id, { note, visibility });

      Alert.alert("Berhasil", "Catatan disimpan.");
      navigation.goBack();
    } catch (e: any) {
      Alert.alert("Gagal", e?.message || "Gagal menyimpan catatan");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Screen>
      <Text
        testID="repair-note-title"
        accessibilityLabel="repair-note-title"
        style={{ fontWeight: "900", fontSize: 20 }}
      >
        Catatan Perbaikan
      </Text>

      <Input
        testID="technician-repair-note-input"
        accessibilityLabel="technician-repair-note-input"
        label="Catatan perbaikan"
        value={note}
        onChangeText={setNote}
        multiline
        numberOfLines={5}
      />

      <Text
        testID="technician-repair-note-visibility-title"
        accessibilityLabel="technician-repair-note-visibility-title"
        style={{ fontWeight: "900" }}
      >
        Visibility
      </Text>

      <View style={{ flexDirection: "row", gap: 8 }}>
        {(["PUBLIC", "INTERNAL"] as NoteVisibility[]).map((v) => (
          <Pressable
            key={v}
            testID={`technician-repair-note-visibility-${v.toLowerCase()}-button`}
            accessibilityLabel={`technician-repair-note-visibility-${v.toLowerCase()}-button`}
            onPress={() => setVisibility(v)}
          >
            <Badge label={`${visibility === v ? "✓ " : ""}${v}`} />
          </Pressable>
        ))}
      </View>

      <Button
        testID="technician-repair-note-submit-button"
        accessibilityLabel="technician-repair-note-submit-button"
        title="Simpan Catatan"
        onPress={submit}
        loading={loading}
      />
    </Screen>
  );
}