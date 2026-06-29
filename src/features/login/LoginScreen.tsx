import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { toast } from "sonner-native";

import { AuthLayout } from "@/layouts/AuthLayout";
// import { Button } from "@/components/ui/Button";
import { Button } from "@/components/ui/ButtonId";

import { ZodInput } from "@/components/ui/ZodInput";

import { useAuth } from "@/api/auth/hooks";
import type { RootStackParamList } from "@/app/router1";
import type { ZodFieldErrors } from "@/utils/zodErrors";
import { getApiErrorMessage } from "@/utils/apiError";

type Props = NativeStackScreenProps<RootStackParamList, "Login">;

export function LoginScreen({ navigation }: Props) {
  const { login } = useAuth();

  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<ZodFieldErrors>({});
  const [generalError, setGeneralError] = useState<string | null>(null);

  const clearFieldError = (fieldName: string) => {
    setFieldErrors((prev) => {
      if (!prev[fieldName]) return prev;

      const next = { ...prev };
      delete next[fieldName];

      return next;
    });
  };

  const clearErrors = () => {
    setFieldErrors({});
    setGeneralError(null);
  };

  const validateForm = () => {
    const errors: ZodFieldErrors = {};

    if (!identifier.trim()) {
      errors.identifier = ["Username, email, atau nama wajib diisi"];
    }

    if (!password.trim()) {
      errors.password = ["Password wajib diisi"];
    }

    setFieldErrors(errors);

    return Object.keys(errors).length === 0;
  };

  const handleLogin = async () => {
    if (submitting) return;

    clearErrors();

    if (!validateForm()) {
      toast.error("Lengkapi data login terlebih dahulu");
      return;
    }

    try {
      setSubmitting(true);

      await login(identifier.trim(), password);

      toast.success("Login berhasil");
    } catch (error: any) {
      const message = getApiErrorMessage(
        error,
        "Login gagal. Cek username/email dan password."
      );

      setGeneralError(message);

      setFieldErrors({
        password: [message],
      });

      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthLayout title="Masuk">
      <View style={styles.header}>
        <Text style={styles.title}>Selamat datang 👋</Text>
        <Text style={styles.subtitle}>
          Masuk ke akun CampusCare untuk mengelola laporan, notifikasi, dan data
          perbaikan.
        </Text>
      </View>

      {generalError ? (
        <View style={styles.errorBox}>
          <Text style={styles.errorText}>{generalError}</Text>
        </View>
      ) : null}

      <ZodInput
      testID="login-identifier-input"
      accessibilityLabel="login-identifier-input"
        name="identifier"
        label="Username / Email / Nama"
        value={identifier}
        onChangeText={(value) => {
          setIdentifier(value);
          setGeneralError(null);
          clearFieldError("identifier");
        }}
        placeholder="admin / email@kampus.ac.id"
        autoCapitalize="none"
        autoCorrect={false}
        errors={fieldErrors}
        clearError={clearFieldError}
        required
      />

      <ZodInput
       testID="login-password-input"
  accessibilityLabel="login-password-input"
        name="password"
        label="Password"
        value={password}
        onChangeText={(value) => {
          setPassword(value);
          setGeneralError(null);
          clearFieldError("password");
        }}
        placeholder="Masukkan password"
        secureTextEntry
        errors={fieldErrors}
        clearError={clearFieldError}
        required
      />

      <Button
        testID="login-submit-button"
        accessibilityLabel="login-submit-button"
        title="Masuk"
        onPress={handleLogin}
        loading={submitting}
        disabled={submitting}
      />

      {/* <View style={styles.footer}>
        <Text style={styles.footerText}>Belum punya akun?</Text>

        <Pressable
          onPress={() => navigation.navigate("Register")}
          disabled={submitting}
        >
          <Text style={styles.registerText}>Register</Text>
        </Pressable>
      </View> */}
    </AuthLayout>
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
    marginTop: 6,
    fontSize: 14,
    color: "#64748B",
    lineHeight: 20,
  },
  errorBox: {
    backgroundColor: "#FEF2F2",
    borderWidth: 1,
    borderColor: "#FECACA",
    borderRadius: 14,
    padding: 12,
    marginBottom: 14,
  },
  errorText: {
    color: "#B91C1C",
    fontSize: 13,
    fontWeight: "700",
    lineHeight: 18,
  },
  footer: {
    marginTop: 18,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 6,
  },
  footerText: {
    fontSize: 14,
    color: "#64748B",
    fontWeight: "600",
  },
  registerText: {
    fontSize: 14,
    color: "#2563EB",
    fontWeight: "900",
  },
});