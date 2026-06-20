import { useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { toast } from "sonner-native";

import { Screen } from "@/components/ui/Screen";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

import { reportService } from "@/api/reports/service";
import type { RootStackParamList } from "@/app/router";

type Props = NativeStackScreenProps<RootStackParamList, "VerifyRejectReport">;

type SubmitAction = "VERIFY" | "REJECT" | null;

function getErrorMessage(error: any, fallback: string) {
  return (
    error?.response?.data?.message ||
    error?.response?.data?.error ||
    error?.message ||
    fallback
  );
}

export function VerifyRejectReportScreen({ route, navigation }: Props) {
  const { id } = route.params;

  const [note, setNote] = useState("");
  const [reason, setReason] = useState("");
  const [submitAction, setSubmitAction] = useState<SubmitAction>(null);

  const isVerifying = submitAction === "VERIFY";
  const isRejecting = submitAction === "REJECT";
  const isSubmitting = submitAction !== null;

  const verify = async () => {
    if (isSubmitting) return;

    try {
      setSubmitAction("VERIFY");

      await reportService.verify(id, {
        note: note.trim() || undefined,
      });

      toast.success("Laporan berhasil diverifikasi");
      navigation.goBack();
    } catch (e: any) {
      console.log("VERIFY ERROR STATUS:", e?.response?.status);
      console.log("VERIFY ERROR DATA:", e?.response?.data);

      toast.error(getErrorMessage(e, "Gagal verifikasi laporan"));
    } finally {
      setSubmitAction(null);
    }
  };

  const reject = async () => {
    if (isSubmitting) return;

    const trimmedReason = reason.trim();

    if (!trimmedReason) {
      toast.error("Alasan penolakan wajib diisi");
      return;
    }

    try {
      setSubmitAction("REJECT");

      await reportService.reject(id, {
        reason: trimmedReason,
      });

      toast.success("Laporan berhasil ditolak");
      navigation.goBack();
    } catch (e: any) {
      console.log("REJECT ERROR STATUS:", e?.response?.status);
      console.log("REJECT ERROR DATA:", e?.response?.data);

      toast.error(getErrorMessage(e, "Gagal menolak laporan"));
    } finally {
      setSubmitAction(null);
    }
  };

  return (
    <Screen>
      <View style={styles.header}>
        <Text style={styles.title}>Verifikasi / Tolak Laporan</Text>
        <Text style={styles.subtitle}>
          Periksa laporan terlebih dahulu sebelum memverifikasi atau menolaknya.
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Verifikasi Laporan</Text>

        <Input
          label="Catatan verifikasi"
          value={note}
          onChangeText={setNote}
          placeholder="Contoh: Laporan valid dan siap diproses."
          multiline
          numberOfLines={3}
        />

        <Button
          title="Verifikasi Laporan"
          onPress={verify}
          loading={isVerifying}
          disabled={isSubmitting}
        />
      </View>

      <View style={styles.divider} />

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Tolak Laporan</Text>

        <Input
          label="Alasan penolakan"
          value={reason}
          onChangeText={setReason}
          placeholder="Contoh: Foto tidak jelas / lokasi tidak sesuai."
          multiline
          numberOfLines={4}
        />

        <Button
          title="Tolak Laporan"
          variant="danger"
          onPress={reject}
          loading={isRejecting}
          disabled={isSubmitting}
        />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    marginBottom: 18,
  },
  title: {
    fontSize: 22,
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
    gap: 10,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "900",
    color: "#0F172A",
    marginBottom: 4,
  },
  divider: {
    height: 1,
    backgroundColor: "#E2E8F0",
    marginVertical: 20,
  },
});