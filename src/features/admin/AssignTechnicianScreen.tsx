import { useState } from "react";
import { Alert, Text, View } from "react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";

import { Screen } from "@/components/ui/Screen";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { SelectorInput } from "@/components/ui/selectorInputId";

import { reportService } from "@/api/reports/service";
import { useTechnicians } from "@/api/technicians/hooks";
import type { Technician } from "@/api/technicians/types";

import type { RootStackParamList } from "@/app/router1";

type Props = NativeStackScreenProps<RootStackParamList, "AssignTechnician">;

export function AssignTechnicianScreen({ route, navigation }: Props) {
  const { id } = route.params;

  const { technicians, loading: loadingTechnicians, error } = useTechnicians(true);

  const [selectedTechnician, setSelectedTechnician] =
    useState<Technician | null>(null);

  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    if (!selectedTechnician) {
      return Alert.alert("Validasi", "Pilih teknisi terlebih dahulu.");
    }

    setLoading(true);

    try {
      await reportService.assign(id, {
        technicianId: selectedTechnician.id_user,
        note: note.trim() || undefined,
      });
      
      Alert.alert("Berhasil", "Laporan berhasil ditugaskan.");
      navigation.goBack();
    } catch (e: any) {
      const message =
        e?.response?.data?.message ||
        e?.message ||
        "Assign gagal";

      Alert.alert("Gagal", message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Screen>
      <Text
        testID="assign-technician-title"
        accessibilityLabel="assign-technician-title"
        style={{
          fontSize: 22,
          fontWeight: "700",
          color: "#0F172A",
          marginBottom: 8,
        }}
      >
        Assign Teknisi
      </Text>

      <Text
        style={{
          color: "#64748B",
          marginBottom: 16,
          lineHeight: 20,
        }}
      >
        Pilih teknisi berdasarkan nama. Kamu bisa mengetik nama teknisi untuk
        mencari teknisi yang paling mendekati.
      </Text>

      <SelectorInput<Technician>
  testID="admin-technician-select"
  accessibilityLabel="admin-technician-select"
  optionTestIDPrefix="admin-technician-option"
        label="Teknisi"
        placeholder="Ketik nama teknisi..."
        options={technicians}
        value={selectedTechnician}
        onSelect={setSelectedTechnician}
        loading={loadingTechnicians}
        error={error}
        emptyText="Teknisi tidak ditemukan"
        getValue={(item) => item.id_user}
        getLabel={(item) => item.name}
        getDescription={(item) =>
          `${item.username} • ${item.email}${
            item.department ? ` • ${item.department}` : ""
          }`
        }
      />

      {selectedTechnician ? (
        <View
          style={{
            backgroundColor: "#EFF6FF",
            borderColor: "#BFDBFE",
            borderWidth: 1,
            borderRadius: 12,
            padding: 12,
            marginBottom: 14,
          }}
        >
          <Text style={{ color: "#1E3A8A", fontWeight: "700" }}>
            Teknisi dipilih
          </Text>

          <Text style={{ color: "#1E40AF", marginTop: 4 }}>
            {selectedTechnician.name}
          </Text>

          <Text style={{ color: "#64748B", marginTop: 2 }}>
            ID: {selectedTechnician.id_user}
          </Text>
        </View>
      ) : null}

      <Input
        label="Catatan"
        value={note}
        onChangeText={setNote}
        placeholder="Contoh: Tolong cek AC ruang A-101"
      />

      <Button
        title="Assign"
        onPress={submit}
        loading={loading}
      />
    </Screen>
  );
}