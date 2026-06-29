// import { Button } from "@/components/ui/Button";
import { Button } from "@/components/ui/ButtonId";
import { AppModal } from "@/components/ui/appModal";
import { ZodInput } from "@/components/ui/ZodInput";
import type { ZodFieldErrors } from "@/utils/zodErrors";

type Props = {
  visible: boolean;
  loading: boolean;

  name: string;
  slug: string;
  description: string;
  defaultSlaHours: string;

  errors: ZodFieldErrors;

  onClose: () => void;
  onSubmit: () => void;

  setName: (value: string) => void;
  setSlug: (value: string) => void;
  setDescription: (value: string) => void;
  setDefaultSlaHours: (value: string) => void;

  clearError: (field: string) => void;
};

export function CreateCategoryModal({
  visible,
  loading,
  name,
  slug,
  description,
  defaultSlaHours,
  errors,
  onClose,
  onSubmit,
  setName,
  setSlug,
  setDescription,
  setDefaultSlaHours,
  clearError,
}: Props) {
  return (
    <AppModal
      visible={visible}
      title="Tambah Kategori"
      subtitle="Masukkan kategori masalah yang dapat dipilih saat membuat laporan."
      onClose={onClose}
      footer={
        <Button
          testID="category-submit-button"
          accessibilityLabel="category-submit-button"
          title="Simpan Kategori"
          onPress={onSubmit}
          loading={loading}
        />
      }
    >
      <ZodInput
        testID="category-name-input"
        accessibilityLabel="category-name-input"
        name="name"
        label="Nama Kategori"
        value={name}
        onChangeText={setName}
        placeholder="Contoh: AC"
        errors={errors}
        clearError={clearError}
        required
      />

      <ZodInput
        testID="category-slug-input"
        accessibilityLabel="category-slug-input"
        name="slug"
        label="Slug"
        value={slug}
        onChangeText={setSlug}
        placeholder="Contoh: ac"
        autoCapitalize="none"
        errors={errors}
        clearError={clearError}
        required
      />

      <ZodInput
        testID="category-description-input"
        accessibilityLabel="category-description-input"
        name="description"
        label="Deskripsi"
        value={description}
        onChangeText={setDescription}
        placeholder="Contoh: Masalah pendingin ruangan seperti AC tidak dingin atau bocor."
        errors={errors}
        clearError={clearError}
        multiline
        numberOfLines={3}
        textAlignVertical="top"
        style={{
          minHeight: 90,
        }}
      />

      <ZodInput
        testID="category-sla-input"
        accessibilityLabel="category-sla-input"
        name="defaultSlaHours"
        label="SLA Default"
        value={defaultSlaHours}
        onChangeText={setDefaultSlaHours}
        placeholder="Kosongkan untuk otomatis 72 jam"
        keyboardType="numeric"
        errors={errors}
        clearError={clearError}
        helperText="Opsional. Jika kosong, sistem otomatis menggunakan 72 jam."
      />
    </AppModal>
  );
}