import { useMemo, useState } from "react";
import {
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { toast } from "sonner-native";

import { DashboardLayout } from "@/layouts/DashboardLayout";
import { Card } from "@/components/ui/Card";
import { SearchInput } from "@/components/ui/SearchInput";
import { ConfirmModal } from "@/components/ui/ConfirmModal";

import { useCategories } from "@/api/categories/hooks";
import { categoryService } from "@/api/categories/service";
import type { Category } from "@/api/categories/types";
import { useZodFormErrors } from "@/api/hooks/useZodFormErrors";

import { getApiErrorMessage } from "@/utils/apiError";
import { searchInFields } from "@/utils/search";

import { CreateCategoryModal } from "./modals/CreateCategoryModal";
import { UpdateCategoryModal } from "./modals/UpdateCategoryModal";

export function CategoryScreen() {
  const { items, fetchCategories } = useCategories(true);

  const createErrors = useZodFormErrors();
  const updateErrors = useZodFormErrors();

  const [searchQuery, setSearchQuery] = useState("");

  const [createVisible, setCreateVisible] = useState(false);
  const [updateVisible, setUpdateVisible] = useState(false);

  const [deleteTarget, setDeleteTarget] = useState<Category | null>(null);
  const [updateTarget, setUpdateTarget] = useState<Category | null>(null);

  const [submittingCreate, setSubmittingCreate] = useState(false);
  const [submittingUpdate, setSubmittingUpdate] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [defaultSlaHours, setDefaultSlaHours] = useState("");

  const [updateName, setUpdateName] = useState("");
  const [updateSlug, setUpdateSlug] = useState("");
  const [updateDescription, setUpdateDescription] = useState("");
  const [updateDefaultSlaHours, setUpdateDefaultSlaHours] = useState("");

  const categories = useMemo(() => {
    return (items ?? []).filter((item) => item.isActive !== false);
  }, [items]);

  const filteredCategories = useMemo(() => {
    const query = searchQuery.trim();

    if (!query) {
      return categories;
    }

    return categories.filter((item) => {
      return searchInFields(query, [
        item.name,
        item.slug,
        item.description,
        item.defaultSlaHours,
      ]);
    });
  }, [categories, searchQuery]);

  const resetCreateForm = () => {
    setName("");
    setSlug("");
    setDescription("");
    setDefaultSlaHours("");
  };

  const openCreateModal = () => {
    createErrors.clearAllErrors();
    setCreateVisible(true);
  };

  const closeCreateModal = () => {
    setCreateVisible(false);
    createErrors.clearAllErrors();
  };

  const create = async () => {
    try {
      setSubmittingCreate(true);
      createErrors.clearAllErrors();

      const trimmedSla = defaultSlaHours.trim();

      if (trimmedSla && Number.isNaN(Number(trimmedSla))) {
        return toast.error("SLA default harus berupa angka.");
      }

      await categoryService.create({
        name: name.trim(),
        slug: slug.trim(),
        description: description.trim() || undefined,
        defaultSlaHours: trimmedSla ? Number(trimmedSla) : 72,
      });

      resetCreateForm();
      setCreateVisible(false);
      await fetchCategories();

      toast.success("Kategori berhasil ditambahkan");
    } catch (e: any) {
      const parsed = createErrors.setFromApiError(e);

      toast.error(
        parsed.message || getApiErrorMessage(e, "Gagal membuat kategori")
      );
    } finally {
      setSubmittingCreate(false);
    }
  };

  const openUpdateModal = (category: Category) => {
    updateErrors.clearAllErrors();

    setUpdateTarget(category);
    setUpdateName(category.name ?? "");
    setUpdateSlug(category.slug ?? "");
    setUpdateDescription(category.description ?? "");
    setUpdateDefaultSlaHours(String(category.defaultSlaHours ?? 72));

    setUpdateVisible(true);
  };

  const closeUpdateModal = () => {
    setUpdateVisible(false);
    setUpdateTarget(null);
    updateErrors.clearAllErrors();
  };

  const update = async () => {
    if (!updateTarget) return;

    try {
      setSubmittingUpdate(true);
      updateErrors.clearAllErrors();

      const trimmedSla = updateDefaultSlaHours.trim();

      if (trimmedSla && Number.isNaN(Number(trimmedSla))) {
        return toast.error("SLA default harus berupa angka.");
      }

      await categoryService.update(updateTarget.id, {
        name: updateName.trim(),
        slug: updateSlug.trim(),
        description: updateDescription.trim() || undefined,
        defaultSlaHours: trimmedSla ? Number(trimmedSla) : 72,
      });

      setUpdateVisible(false);
      setUpdateTarget(null);

      await fetchCategories();

      toast.success("Kategori berhasil diperbarui");
    } catch (e: any) {
      const parsed = updateErrors.setFromApiError(e);

      toast.error(
        parsed.message || getApiErrorMessage(e, "Gagal memperbarui kategori")
      );
    } finally {
      setSubmittingUpdate(false);
    }
  };

  const deleteCategory = async () => {
    if (!deleteTarget) return;

    try {
      setDeleting(true);

      await categoryService.delete(deleteTarget.id);

      setDeleteTarget(null);
      await fetchCategories();

      toast.success("Kategori berhasil dihapus");
    } catch (e: any) {
      toast.error(getApiErrorMessage(e, "Gagal menghapus kategori"));
    } finally {
      setDeleting(false);
    }
  };

  return (
    <DashboardLayout title="Kategori Masalah">
      <View style={styles.header}>
        <View style={{ flex: 1 }}   
            testID="categories-title"
            accessibilityLabel="categories-title">
          <Text style={styles.pageTitle}>Pengelolaan category</Text>
          <Text style={styles.pageSubtitle}>
            Kelola kategori laporan seperti AC, listrik, jaringan, fasilitas,
            dan kategori kerusakan lainnya.
          </Text>
        </View>

        <Pressable
                  testID="category-create-button"
          accessibilityLabel="category-create-button"
        style={styles.addButton} onPress={openCreateModal}>
          <Text style={styles.addButtonText}>+ Kategori</Text>
        </Pressable>
      </View>

      <SearchInput
        testID="categories-search-input"
        accessibilityLabel="categories-search-input"
        value={searchQuery}
        onChangeText={setSearchQuery}
        placeholder="Cari nama, slug, deskripsi, atau SLA..."
        helperText={
          searchQuery.trim()
            ? `Hasil pencarian untuk "${searchQuery}"`
            : "Cari berdasarkan nama kategori, slug, deskripsi, atau jam SLA."
        }
      />

      <View style={styles.summaryRow}>
        <Card>
          <Text style={styles.summaryValue}>{categories.length}</Text>
          <Text style={styles.summaryLabel}>Total Kategori</Text>
        </Card>

        <Card>
          <Text style={styles.summaryValue}>{filteredCategories.length}</Text>
          <Text style={styles.summaryLabel}>Ditampilkan</Text>
        </Card>
      </View>

      <Text style={styles.sectionTitle}>Daftar Kategori</Text>

      {filteredCategories.length === 0 ? (
        <Card>
          <Text style={styles.emptyText}>
            {searchQuery.trim()
              ? "Tidak ada kategori yang cocok dengan pencarian."
              : "Belum ada kategori masalah. Tambahkan kategori terlebih dahulu."}
          </Text>
        </Card>
      ) : (
        <FlatList
          scrollEnabled={false}
          data={filteredCategories}
          keyExtractor={(item) => item.id}
          renderItem={({ item,index }) => (
            <View>
                            testID={`category-card-${index}`}
              accessibilityLabel={`category-card-${index}`}
          
            <Card>
              <View style={styles.categoryHeader}>
                <View style={styles.categoryIcon}>
                  <Text style={styles.categoryIconText}>
                    {item.name?.slice(0, 2).toUpperCase()}
                  </Text>
                </View>

                <View style={{ flex: 1 }}>
                  <Text style={styles.categoryName}>{item.name}</Text>
                  <Text style={styles.categorySlug}>/{item.slug}</Text>
                </View>

                <View style={styles.slaBadge}>
                  <Text style={styles.slaBadgeText}>
                    {item.defaultSlaHours ?? 72} jam
                  </Text>
                </View>
              </View>

              <Text style={styles.description}>
                {item.description || "Tidak ada deskripsi."}
              </Text>

              <View style={styles.cardActions}>
                <Pressable
                  style={styles.updateButton}
                  onPress={() => openUpdateModal(item)}
                >
                  <Text style={styles.updateButtonText}>Update</Text>
                </Pressable>

                <Pressable
                  style={styles.deleteButton}
                  onPress={() => setDeleteTarget(item)}
                >
                  <Text style={styles.deleteButtonText}>Hapus</Text>
                </Pressable>
              </View>
            </Card>
              </View>
          )}
        />
      )}

      <CreateCategoryModal
        visible={createVisible}
        loading={submittingCreate}
        name={name}
        slug={slug}
        description={description}
        defaultSlaHours={defaultSlaHours}
        errors={createErrors.fieldErrors}
        clearError={createErrors.clearFieldError}
        setName={setName}
        setSlug={setSlug}
        setDescription={setDescription}
        setDefaultSlaHours={setDefaultSlaHours}
        onSubmit={create}
        onClose={closeCreateModal}
      />

      <UpdateCategoryModal
        visible={updateVisible}
        loading={submittingUpdate}
        name={updateName}
        slug={updateSlug}
        description={updateDescription}
        defaultSlaHours={updateDefaultSlaHours}
        errors={updateErrors.fieldErrors}
        clearError={updateErrors.clearFieldError}
        setName={setUpdateName}
        setSlug={setUpdateSlug}
        setDescription={setUpdateDescription}
        setDefaultSlaHours={setUpdateDefaultSlaHours}
        onSubmit={update}
        onClose={closeUpdateModal}
      />

      <ConfirmModal
        visible={Boolean(deleteTarget)}
        title="Hapus Kategori?"
        message={
          deleteTarget
            ? `Kategori "${deleteTarget.name}" akan dinonaktifkan. Kategori ini tidak akan ditampilkan lagi pada daftar kategori aktif.`
            : ""
        }
        confirmText="Hapus Kategori"
        cancelText="Batal"
        danger
        loading={deleting}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={deleteCategory}
      />
    </DashboardLayout>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
    marginBottom: 16,
  },
  pageTitle: {
    fontSize: 24,
    fontWeight: "900",
    color: "#0F172A",
  },
  pageSubtitle: {
    marginTop: 4,
    fontSize: 14,
    color: "#64748B",
    lineHeight: 20,
  },
  addButton: {
    backgroundColor: "#2563EB",
    paddingHorizontal: 14,
    paddingVertical: 11,
    borderRadius: 14,
    alignItems: "center",
  },
  addButtonText: {
    color: "#FFFFFF",
    fontWeight: "900",
    fontSize: 13,
  },
  summaryRow: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 16,
  },
  summaryValue: {
    fontSize: 22,
    fontWeight: "900",
    color: "#0F172A",
  },
  summaryLabel: {
    marginTop: 2,
    fontSize: 13,
    color: "#64748B",
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: "900",
    color: "#0F172A",
    marginBottom: 10,
  },
  categoryHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  categoryIcon: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: "#EFF6FF",
    alignItems: "center",
    justifyContent: "center",
  },
  categoryIconText: {
    color: "#2563EB",
    fontWeight: "900",
    fontSize: 14,
  },
  categoryName: {
    fontSize: 17,
    fontWeight: "900",
    color: "#0F172A",
  },
  categorySlug: {
    marginTop: 3,
    fontSize: 13,
    color: "#64748B",
    fontWeight: "700",
  },
  slaBadge: {
    backgroundColor: "#DCFCE7",
    borderWidth: 1,
    borderColor: "#86EFAC",
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 999,
  },
  slaBadgeText: {
    color: "#166534",
    fontSize: 12,
    fontWeight: "900",
  },
  description: {
    marginTop: 12,
    fontSize: 13,
    color: "#475569",
    lineHeight: 19,
  },
  cardActions: {
    flexDirection: "row",
    gap: 10,
    marginTop: 14,
  },
  updateButton: {
    flex: 1,
    backgroundColor: "#F59E0B",
    paddingVertical: 10,
    borderRadius: 12,
    alignItems: "center",
  },
  updateButtonText: {
    color: "#FFFFFF",
    fontWeight: "900",
  },
  deleteButton: {
    flex: 1,
    backgroundColor: "#DC2626",
    paddingVertical: 10,
    borderRadius: 12,
    alignItems: "center",
  },
  deleteButtonText: {
    color: "#FFFFFF",
    fontWeight: "900",
  },
  emptyText: {
    fontSize: 13,
    color: "#64748B",
    lineHeight: 19,
  },
});