import { useMemo, useState } from "react";
import { StyleSheet, Text, View } from "react-native";

import { AppModal } from "@/components/ui/appModal";
import { Button } from "@/components/ui/ButtonId";
import { ZodInput } from "@/components/ui/ZodInput";
import { SelectorInput } from "@/components/ui/selectorInputId";

import type { AddUserPayload } from "@/api/users/types";
import type { ZodFieldErrors } from "@/utils/zodErrors";

type AddUserModalProps = {
  visible: boolean;
  saving?: boolean;
  onClose: () => void;
  onSubmit: (payload: AddUserPayload) => Promise<void>;
};

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

export function AddUserModal({
  visible,
  saving = false,
  onClose,
  onSubmit,
}: AddUserModalProps) {
  const [username, setUsername] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [passwordHash, setPasswordHash] = useState("");
  const [role, setRole] = useState<AddUserPayload["role"]>("STUDENT");

  const [fieldErrors, setFieldErrors] = useState<ZodFieldErrors>({});

  const selectedRole = useMemo(() => {
    return ROLE_OPTIONS.find((item) => item.value === role) || ROLE_OPTIONS[0];
  }, [role]);

  const resetForm = () => {
    setUsername("");
    setName("");
    setEmail("");
    setPasswordHash("");
    setRole("STUDENT");
    setFieldErrors({});
  };

  const closeModal = () => {
    if (saving) return;

    resetForm();
    onClose();
  };

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

    setFieldErrors({});

    if (!validateForm()) return;

    await onSubmit({
      username: username.trim(),
      name: name.trim(),
      email: email.trim(),
      passwordHash,
      role,
    });

    resetForm();
  };

  return (
    <AppModal
      visible={visible}
      title="Tambah User"
      subtitle="Tambahkan user baru dengan role Mahasiswa, Staff, atau Teknisi."
      onClose={closeModal}
      footer={
        <View style={styles.footerRow}>
          <Button
            testID="users-add-cancel-button"
      accessibilityLabel="users-add-cancel-button"
            title="Batal"
            variant="secondary"
            disabled={saving}
            onPress={closeModal}
          />

          <Button
             testID="users-add-submit-button"
      accessibilityLabel="users-add-submit-button"
            title="Simpan User"
            loading={saving}
            disabled={saving}
            onPress={submit}
          />
        </View>
      }
    >
      <Text style={styles.sectionTitle}>Identitas User</Text>
<Text
  testID="users-add-modal-title"
  accessibilityLabel="users-add-modal-title"
  style={styles.modalTitle}
>
  Tambah User
</Text>
      <ZodInput
        testID="users-add-username-input"
  accessibilityLabel="users-add-username-input"
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
        testID="users-add-name-input"
  accessibilityLabel="users-add-name-input"
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
        testID="users-add-email-input"
  accessibilityLabel="users-add-email-input"
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
        testID="users-add-password-input"
  accessibilityLabel="users-add-password-input"
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

      <Text style={styles.sectionTitle}>Role User</Text>

      <SelectorInput
        testID="users-add-role-select"
  accessibilityLabel="users-add-role-select"
  optionTestIDPrefix="users-add-role-option"
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

      <Text style={styles.note}>
        Catatan: role ADMIN tidak dapat dibuat melalui fitur ini.
      </Text>
    </AppModal>
  );
}

const styles = StyleSheet.create({
  sectionTitle: {
    fontSize: 15,
    fontWeight: "900",
    color: "#0F172A",
    marginBottom: 10,
    marginTop: 4,
  },
  note: {
    marginTop: 10,
    fontSize: 12,
    color: "#64748B",
    lineHeight: 18,
    fontWeight: "700",
  },
  footerRow: {
    flexDirection: "row",
    gap: 10,
  },
  modalTitle: {
  fontSize: 18,
  fontWeight: "900",
  color: "#0F172A",
  marginBottom: 12,
},
});
