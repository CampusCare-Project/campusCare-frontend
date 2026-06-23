import { useMemo, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { toast } from "sonner-native";

import { Screen } from "@/components/ui/Screen";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { ZodInput } from "@/components/ui/ZodInput";
import { SelectorInput } from "@/components/ui/selectorInput";

import { useAuth } from "@/api/auth/hooks";
import { useUsers } from "@/api/users/hooks";
import type { AddUserPayload } from "@/api/users/types";

import type { RootStackParamList } from "@/app/router";
import type { ZodFieldErrors } from "@/utils/zodErrors";
import { getApiErrorMessage } from "@/utils/apiError";

type Props = NativeStackScreenProps<RootStackParamList, "AddUser">;

type RoleOption = {
  label: string;
  value: AddUserPayload["role"];
  description: string;
};

const ROLE_OPTIONS: RoleOption[] = [
  {
    label: "Mahasiswa",
    value: "STUDENT",
    description: "User mahasiswa yang dapat membuat laporan.",
  },
  {
    label: "Staff",
    value: "STAFF",
    description: "User staff yang dapat membuat laporan.",
  },
  {
    label: "Teknisi",
    value: "TECHNICIAN",
    description: "User teknisi yang dapat menangani laporan.",
  },
];

function getFirstError(errors: ZodFieldErrors, field: string) {
  return errors[field]?.[0] || null;
}

export function AddUserScreen({ navigation }: Props) {
  const { user } = useAuth();

  const { addUser, saving } = useUsers(undefined, false);

  const [username, setUsername] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [passwordHash, setPasswordHash] = useState("");
  const [role, setRole] = useState<AddUserPayload["role"]>("STUDENT");

  const [fieldErrors, setFieldErrors] = useState<ZodFieldErrors>({});

  const selectedRole = useMemo(() => {
    return ROLE_OPTIONS.find((item) => item.value === role) || ROLE_OPTIONS[0];
  }, [role]);

  const clearFieldError = (fieldName: string) => {
    setFieldErrors((prev) => {
      if (!prev[fieldName]) return prev;

      const next = { ...prev };
      delete next[fieldName];

      return next;
    });
  };

  const validateForm = () => {
    const errors: ZodFieldErrors = {};

    if (!username.trim()) {
      errors.username = ["Username wajib diisi"];
    }

    if (!name.trim()) {
      errors.name = ["Nama lengkap wajib diisi"];
    }

    if (!email.trim()) {
      errors.email = ["Email wajib diisi"];
    } else if (!email.includes("@")) {
      errors.email = ["Format email tidak valid"];
    }

    if (!passwordHash.trim()) {
      errors.passwordHash = ["Password wajib diisi"];
    } else if (passwordHash.length < 6) {
      errors.passwordHash = ["Password minimal 6 karakter"];
    }

    if (!role) {
      errors.role = ["Role wajib dipilih"];
    }

    setFieldErrors(errors);

    return Object.keys(errors).length === 0;
  };

  const submit = async () => {
    if (saving) return;

    if (user?.role !== "ADMIN") {
      toast.error("Hanya ADMIN yang dapat menambahkan user.");
      return;
    }

    setFieldErrors({});

    if (!validateForm()) {
      toast.error("Lengkapi data user terlebih dahulu");
      return;
    }

    try {
      await addUser({
        username: username.trim(),
        name: name.trim(),
        email: email.trim(),
        passwordHash,
        role,
      });

      toast.success("User berhasil ditambahkan");
      navigation.goBack();
    } catch (error: any) {
      console.log("ADD USER ERROR STATUS:", error?.response?.status);
      console.log("ADD USER ERROR DATA:", error?.response?.data);

      toast.error(getApiErrorMessage(error, "Gagal menambahkan user"));
    }
  };

  return (
    <Screen>
      <View style={styles.header}>
        <Text style={styles.title}>Tambah User</Text>

        <Text style={styles.subtitle}>
          Tambahkan user baru untuk role Mahasiswa, Staff, atau Teknisi. Role
          Admin tidak dapat dibuat dari halaman ini.
        </Text>
      </View>

      <Card>
        <Text style={styles.sectionTitle}>Identitas User</Text>

        <ZodInput
          name="username"
          label="Username"
          value={username}
          onChangeText={(value) => {
            setUsername(value);
            clearFieldError("username");
          }}
          placeholder="Contoh: teknisi01"
          autoCapitalize="none"
          errors={fieldErrors}
          clearError={clearFieldError}
          required
        />

        <ZodInput
          name="name"
          label="Nama Lengkap"
          value={name}
          onChangeText={(value) => {
            setName(value);
            clearFieldError("name");
          }}
          placeholder="Contoh: Budi Santoso"
          errors={fieldErrors}
          clearError={clearFieldError}
          required
        />

        <ZodInput
          name="email"
          label="Email"
          value={email}
          onChangeText={(value) => {
            setEmail(value);
            clearFieldError("email");
          }}
          placeholder="Contoh: budi@example.com"
          keyboardType="email-address"
          autoCapitalize="none"
          errors={fieldErrors}
          clearError={clearFieldError}
          required
        />

        <ZodInput
          name="passwordHash"
          label="Password Awal"
          value={passwordHash}
          onChangeText={(value) => {
            setPasswordHash(value);
            clearFieldError("passwordHash");
          }}
          placeholder="Masukkan password awal"
          secureTextEntry
          errors={fieldErrors}
          clearError={clearFieldError}
          required
        />
      </Card>

      <Card>
        <Text style={styles.sectionTitle}>Role User</Text>

        <SelectorInput
          label="Role"
          placeholder="Pilih role user"
          options={ROLE_OPTIONS}
          value={selectedRole}
          onSelect={(item) => {
            setRole(item.value);
            clearFieldError("role");
          }}
          getLabel={(item) => item.label}
          getValue={(item) => item.value}
          getDescription={(item) => item.description}
          error={getFirstError(fieldErrors, "role")}
          emptyText="Role tidak ditemukan"
        />
      </Card>

      <Button
        title="Tambah User"
        loading={saving}
        disabled={saving}
        onPress={submit}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    marginBottom: 16,
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
  sectionTitle: {
    fontSize: 16,
    fontWeight: "900",
    color: "#0F172A",
    marginBottom: 12,
  },
});