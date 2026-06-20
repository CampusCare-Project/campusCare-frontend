import { useMemo, useState } from "react";
import {
  Alert,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useZodFormErrors } from "@/api/hooks/useZodFormErrors";
import { ZodInput } from "@/components/ui/ZodInput";
import { toNumberOrUndefined,isInvalidNumberInput } from "@/utils/formValue";
import { GeoPointInput } from "@/components/ui/GeoPointInput";
import { DashboardLayout } from "@/layouts/DashboardLayout";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { AppModal } from "@/components/ui/appModal";
import { SelectorInput } from "@/components/ui/selectorInput";
import { ConfirmModal } from "@/components/ui/ConfirmModal";
import type { Building, Room } from "@/api/locations/types";
import { toast } from "sonner-native";
import { getApiErrorMessage } from "@/utils/apiError";
import { useLocations } from "@/api/locations/hooks";
import { locationService } from "@/api/locations/service";

function toInputValue(value: string | number | null | undefined) {
  if (value === null || value === undefined) {
    return "";
  }

  return String(value);
}

export function LocationScreen() {
  const { buildings, rooms, fetchBuildings, fetchRooms } = useLocations(true);

  const [createBuildingVisible, setCreateBuildingVisible] = useState(false);
  const [createRoomVisible, setCreateRoomVisible] = useState(false);
  const [detailVisible, setDetailVisible] = useState(false);

  const [selectedBuilding, setSelectedBuilding] = useState<Building | null>(
    null
  );
  const [expandedBuildingId, setExpandedBuildingId] = useState<string | null>(
    null
  );
// open detail gedung


  const [buildingName, setBuildingName] = useState("");
  const [buildingCode, setBuildingCode] = useState("");
  const [buildingAddress, setBuildingAddress] = useState("");

  const [roomBuilding, setRoomBuilding] = useState<Building | null>(null);
  const [roomName, setRoomName] = useState("");
  const [roomCode, setRoomCode] = useState("");
  const [roomFloorName, setRoomFloorName] = useState("");
  const [roomDescription, setRoomDescription] = useState("");

  const [submittingBuilding, setSubmittingBuilding] = useState(false);
  const [submittingRoom, setSubmittingRoom] = useState(false);
// For update
const updateBuildingErrors = useZodFormErrors();
const updateRoomErrors = useZodFormErrors();

const [updateBuildingVisible, setUpdateBuildingVisible] = useState(false);
const [updateRoomVisible, setUpdateRoomVisible] = useState(false);

const [updateBuildingTarget, setUpdateBuildingTarget] =
  useState<Building | null>(null);

const [updateRoomTarget, setUpdateRoomTarget] =
  useState<Room | null>(null);

const [updateBuildingName, setUpdateBuildingName] = useState("");
const [updateBuildingCode, setUpdateBuildingCode] = useState("");
const [updateBuildingAddress, setUpdateBuildingAddress] = useState("");
const [updateBuildingLatitude, setUpdateBuildingLatitude] = useState("");
const [updateBuildingLongitude, setUpdateBuildingLongitude] = useState("");

const [updateRoomBuilding, setUpdateRoomBuilding] =
  useState<Building | null>(null);

const [updateRoomName, setUpdateRoomName] = useState("");
const [updateRoomCode, setUpdateRoomCode] = useState("");
const [updateRoomFloorName, setUpdateRoomFloorName] = useState("");
const [updateRoomDescription, setUpdateRoomDescription] = useState("");

const [submittingUpdateBuilding, setSubmittingUpdateBuilding] = useState(false);
const [submittingUpdateRoom, setSubmittingUpdateRoom] = useState(false);
// open modal update buiilding

const openUpdateBuilding = (building: Building) => {
  updateBuildingErrors.clearAllErrors();

  setUpdateBuildingTarget(building);
  setUpdateBuildingName(building.name ?? "");
  setUpdateBuildingCode(building.code ?? "");
  setUpdateBuildingAddress(building.address ?? "");
  setUpdateBuildingLatitude(toInputValue(building.latitude));
  setUpdateBuildingLongitude(toInputValue(building.longitude));

  setUpdateBuildingVisible(true);
};
// building update
const updateBuilding = async () => {
  if (!updateBuildingTarget) return;

  try {
    setSubmittingUpdateBuilding(true);
    updateBuildingErrors.clearAllErrors();

    if (isInvalidNumberInput(updateBuildingLatitude)) {
      return toast.error("Latitude harus berupa angka.");
    }

    if (isInvalidNumberInput(updateBuildingLongitude)) {
      return toast.error("Longitude harus berupa angka.");
    }

    await locationService.updateBuilding(updateBuildingTarget.id, {
      name: updateBuildingName.trim(),
      code: updateBuildingCode.trim(),
      address: updateBuildingAddress.trim() || undefined,
      latitude: Number(updateBuildingLatitude),
      longitude: Number(updateBuildingLongitude),
    });

    setUpdateBuildingVisible(false);
    setUpdateBuildingTarget(null);

    await fetchBuildings();

    toast.success("Gedung berhasil diperbarui");
  } catch (e: any) {
    const parsed = updateBuildingErrors.setFromApiError(e);

    toast.error(parsed.message || "Gagal memperbarui gedung");
  } finally {
    setSubmittingUpdateBuilding(false);
  }
};
// update room modal
const openUpdateRoom = (room: Room) => {
  updateRoomErrors.clearAllErrors();

  const currentBuilding =
    buildings.find((building: Building) => building.id === room.buildingId) ??
    null;

  setUpdateRoomTarget(room);
  setUpdateRoomBuilding(currentBuilding);
  setUpdateRoomName(room.name ?? "");
  setUpdateRoomCode(room.code ?? "");
  setUpdateRoomFloorName(room.floorName ?? "");
  setUpdateRoomDescription(room.description ?? "");

  setUpdateRoomVisible(true);
};
// submit update room
const updateRoom = async () => {
  if (!updateRoomTarget) return;

  try {
    setSubmittingUpdateRoom(true);
    updateRoomErrors.clearAllErrors();

    await locationService.updateRoom(updateRoomTarget.id, {
      buildingId: updateRoomBuilding?.id || "",
      name: updateRoomName.trim(),
      code: updateRoomCode.trim(),
      floorName: updateRoomFloorName.trim() || undefined,
      description: updateRoomDescription.trim() || undefined,
    });

    const refreshBuildingId =
      updateRoomBuilding?.id || updateRoomTarget.buildingId;

    setUpdateRoomVisible(false);
    setUpdateRoomTarget(null);

  if (viewMode === "BUILDING_ROOMS" && roomViewBuilding) {
  await fetchRooms(roomViewBuilding.id);
} else {
  await fetchRooms(updateRoomBuilding?.id || updateRoomTarget.buildingId);
}

    toast.success("Ruangan berhasil diperbarui");
  } catch (e: any) {
    const parsed = updateRoomErrors.setFromApiError(e);

    toast.error(parsed.message || "Gagal memperbarui ruangan");
  } finally {
    setSubmittingUpdateRoom(false);
  }
};
  // for dlete
  const [deleteBuildingTarget, setDeleteBuildingTarget] =
  useState<Building | null>(null);

const [deleteRoomTarget, setDeleteRoomTarget] =
  useState<Room | null>(null);

const [deleting, setDeleting] = useState(false);

const deleteBuilding = async () => {
  if (!deleteBuildingTarget) return;

  try {
    setDeleting(true);

    await locationService.deleteBuilding(deleteBuildingTarget.id);
 toast.success("Gedung berhasil dihapus");
if (roomViewBuilding?.id === deleteBuildingTarget.id) {
  setViewMode("BUILDING_LIST");
  setRoomViewBuilding(null);
}

await fetchBuildings();
await fetchRooms();

    setDeleteBuildingTarget(null);

    await fetchBuildings();
    await fetchRooms();

    // Alert.alert("Berhasil", "Gedung berhasil dihapus.");
  } catch (e: any) {
     const message = getApiErrorMessage(
      e,
      "Gagal menghapus gedung"
    );

    toast.error(message);
  } finally {
    setDeleting(false);
  }
};
const deleteRoom = async () => {
  if (!deleteRoomTarget) return;

  try {
    setDeleting(true);

    const buildingId = deleteRoomTarget.buildingId;

    await locationService.deleteRoom(deleteRoomTarget.id);
    toast.success("Ruangan berhasil dihapus");
    setDeleteRoomTarget(null);

  if (viewMode === "BUILDING_ROOMS" && roomViewBuilding) {
  await fetchRooms(roomViewBuilding.id);
} else if (expandedBuildingId) {
  await fetchRooms(expandedBuildingId);
} else {
  await fetchRooms(buildingId);
}

    // Alert.alert("Berhasil", "Ruangan berhasil dihapus.");
  } catch (e: any) {
    const message = getApiErrorMessage(
      e,
      "Gagal menghapus ruangan"
    );
    toast.error(message);
  } finally {
    setDeleting(false);
  }
};
  // for building
  // const selectedBuildingRooms = useMemo(() => {
  //   if (!expandedBuildingId) return [];

  //   return rooms.filter((room: Room) => {
  //     return room.buildingId === expandedBuildingId;
  //   });
  // }, [rooms, expandedBuildingId]);

  // for errol
  const {
  fieldErrors,
  setFromApiError,
  clearFieldError,
  clearAllErrors,
} = useZodFormErrors();

const roomErrors = useZodFormErrors();

const [buildingLatitude, setBuildingLatitude] = useState("");
const [buildingLongitude, setBuildingLongitude] = useState("");

const resetBuildingForm = () => {
  setBuildingName("");
  setBuildingCode("");
  setBuildingAddress("");
  setBuildingLatitude("");
  setBuildingLongitude("");
};

  const resetRoomForm = () => {
    setRoomBuilding(null);
    setRoomName("");
    setRoomCode("");
    setRoomFloorName("");
    setRoomDescription("");
  };

  const createBuilding = async () => {
  try {
    clearAllErrors();

   await locationService.createBuilding({
  name: buildingName.trim(),
  code: buildingCode.trim(),
  address: buildingAddress.trim() || undefined,
  latitude: Number(buildingLatitude),
  longitude: Number(buildingLongitude),
});
 toast.success("Gedung berhasil Ditambah");

    setBuildingName("");
    setBuildingCode("");
    setBuildingAddress("");
    setBuildingLatitude("");
    setBuildingLongitude("");

    resetBuildingForm();
    setCreateBuildingVisible(false);
    await fetchBuildings();

  } catch (e: any) {
    const message = getApiErrorMessage(
      e,
      "Gagal menambah Gedung"
    );
    toast.error(message);
  }
};

  const createRoom = async () => {
  try {
    setSubmittingRoom(true);
    roomErrors.clearAllErrors();

    await locationService.createRoom({
      buildingId: roomBuilding?.id || "",
      name: roomName,
      code: roomCode,
      floorName: roomFloorName || undefined,
      description: roomDescription || undefined,
    });
 toast.success("Ruangan berhasil Ditambah");

    const selectedBuildingId = roomBuilding?.id;

    setRoomBuilding(null);
    setRoomName("");
    setRoomCode("");
    setRoomFloorName("");
    setRoomDescription("");

    setCreateRoomVisible(false);
if (viewMode === "BUILDING_ROOMS" && roomViewBuilding) {
  await fetchRooms(roomViewBuilding.id);
} else if (roomBuilding?.id) {
  await fetchRooms(roomBuilding.id);
}
    if (selectedBuildingId) {
      await fetchRooms(selectedBuildingId);
      setExpandedBuildingId(selectedBuildingId);
    }
  } catch (e: any) {
    const message = getApiErrorMessage(
      e,
      "Gagal menambah ruangan"
    );
    toast.error(message);
  } finally {
    setSubmittingRoom(false);
  }
};

  const toggleBuilding = async (building: Building) => {
    if (expandedBuildingId === building.id) {
      setExpandedBuildingId(null);
      return;
    }

    setExpandedBuildingId(building.id);
    setSelectedBuilding(building);

    await fetchRooms(building.id);
  };

  const openDetail = async (building: Building) => {
    setSelectedBuilding(building);
    setExpandedBuildingId(building.id);
    await fetchRooms(building.id);
    setDetailVisible(true);
  };
const [viewMode, setViewMode] = useState<"BUILDING_LIST" | "BUILDING_ROOMS">(
  "BUILDING_LIST"
);

// building details rooms
const [roomViewBuilding, setRoomViewBuilding] = useState<Building | null>(null);

const openBuildingRoomsView = async (building: Building) => {
  setRoomViewBuilding(building);
  setViewMode("BUILDING_ROOMS");

  await fetchRooms(building.id);
};
const backToBuildingList = async () => {
  setViewMode("BUILDING_LIST");
  setRoomViewBuilding(null);

  await fetchBuildings();
};
const selectedBuildingRooms = useMemo(() => {
  if (!roomViewBuilding) return [];

  return rooms.filter((room: Room) => room.buildingId === roomViewBuilding.id);
}, [rooms, roomViewBuilding]);
const renderBuildingListView = () => {
  return (
    <>
      <View style={styles.summaryRow}>
        <View style={styles.summaryCard}>
          <Text style={styles.summaryValue}>{buildings.length}</Text>
          <Text style={styles.summaryLabel}>Gedung</Text>
        </View>

        <View style={styles.summaryCard}>
          <Text style={styles.summaryValue}>{rooms.length}</Text>
          <Text style={styles.summaryLabel}>Ruangan aktif</Text>
        </View>
      </View>

      <Text style={styles.sectionTitle}>Daftar Gedung</Text>

      {buildings.length === 0 ? (
        <Card>
          <Text style={styles.emptyText}>
            Belum ada data gedung. Tambahkan gedung terlebih dahulu.
          </Text>
        </Card>
      ) : (
        <FlatList
          scrollEnabled={false}
          data={buildings}
          keyExtractor={(item) => item.id}
          renderItem={renderBuildingCard}
        />
      )}
    </>
  );
};
const renderBuildingRoomsView = () => {
  if (!roomViewBuilding) {
    return null;
  }

  return (
    <>
      <Card>
        <View style={styles.detailHeader}>
          <Pressable style={styles.backButton} onPress={backToBuildingList}>
            <Text style={styles.backButtonText}>← Kembali</Text>
          </Pressable>

          <Pressable
            style={styles.primarySmallButton}
            onPress={() => {
              setRoomBuilding(roomViewBuilding);
              setCreateRoomVisible(true);
            }}
          >
            <Text style={styles.primarySmallButtonText}>+ Ruangan</Text>
          </Pressable>
        </View>

        <View style={styles.buildingDetailBox}>
          <Text style={styles.detailTitle}>{roomViewBuilding.name}</Text>

          <Text style={styles.detailMeta}>Kode: {roomViewBuilding.code}</Text>

          <Text style={styles.detailMeta}>
            Alamat: {roomViewBuilding.address || "-"}
          </Text>

          <Text style={styles.detailMeta}>
            Latitude: {roomViewBuilding.latitude || "-"}
          </Text>

          <Text style={styles.detailMeta}>
            Longitude: {roomViewBuilding.longitude || "-"}
          </Text>
        </View>

        <View style={styles.buildingActions}>
          <Pressable
            style={styles.warningSmallButton}
            onPress={() => openUpdateBuilding(roomViewBuilding)}
          >
            <Text style={styles.warningSmallButtonText}>Update Gedung</Text>
          </Pressable>

          <Pressable
            style={styles.dangerSmallButton}
            onPress={() => setDeleteBuildingTarget(roomViewBuilding)}
          >
            <Text style={styles.dangerSmallButtonText}>Hapus Gedung</Text>
          </Pressable>
        </View>
      </Card>

      <Text style={styles.sectionTitle}>Ruangan di {roomViewBuilding.name}</Text>

      {selectedBuildingRooms.length === 0 ? (
        <Card>
          <Text style={styles.emptyText}>
            Belum ada ruangan pada gedung ini.
          </Text>
        </Card>
      ) : (
        <FlatList
          scrollEnabled={false}
          data={selectedBuildingRooms}
          keyExtractor={(item) => item.id}
          renderItem={renderRoomCard}
        />
      )}
    </>
  );
};
  const renderRoomCard = ({ item }: { item: Room }) => {
  return (
    <View style={styles.roomCard}>
      <View style={styles.roomHeader}>
        <View style={{ flex: 1 }}>
          <Text style={styles.roomName}>{item.name}</Text>
          <Text style={styles.roomMeta}>Kode: {item.code}</Text>

          {item.floorName ? (
            <Text style={styles.roomMeta}>Lantai: {item.floorName}</Text>
          ) : null}

          {item.description ? (
            <Text style={styles.roomDescription}>{item.description}</Text>
          ) : null}
        </View>

        <View style={styles.roomActionColumn}>
          <Pressable
            style={styles.updateMiniButton}
            onPress={() => openUpdateRoom(item)}
          >
            <Text style={styles.updateMiniButtonText}>Update</Text>
          </Pressable>

          <Pressable
            style={styles.deleteMiniButton}
            onPress={() => setDeleteRoomTarget(item)}
          >
            <Text style={styles.deleteMiniButtonText}>Hapus</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
};

  const renderBuildingCard = ({ item }: { item: Building }) => {
    const expanded = expandedBuildingId === item.id;

    return (
      <Card>
        <Pressable onPress={() => toggleBuilding(item)}>
          <View style={styles.buildingHeader}>
            <View style={styles.buildingIcon}>
              <Text style={styles.buildingIconText}>
                {item.code?.slice(0, 2).toUpperCase()}
              </Text>
            </View>

            <View style={{ flex: 1 }}>
              <Text style={styles.buildingName}>{item.name}</Text>
              <Text style={styles.buildingMeta}>Kode: {item.code}</Text>

              {item.address ? (
                <Text style={styles.buildingMeta}>{item.address}</Text>
              ) : (
                <Text style={styles.buildingMeta}>Alamat belum diisi</Text>
              )}
            </View>

            <Text style={styles.expandIcon}>{expanded ? "⌃" : "⌄"}</Text>
          </View>
        </Pressable>

       <View style={[styles.buildingActions, { flexWrap: "wrap" }]}>
 <Pressable
  style={styles.secondaryButton}
  onPress={() => openBuildingRoomsView(item)}
>
  <Text style={styles.secondaryButtonText}>Detail</Text>
</Pressable>

  <Pressable
    style={styles.warningSmallButton}
    onPress={() => openUpdateBuilding(item)}
  >
    <Text style={styles.warningSmallButtonText}>Update</Text>
  </Pressable>



  <Pressable
    style={styles.dangerSmallButton}
    onPress={() => setDeleteBuildingTarget(item)}
  >
    <Text style={styles.dangerSmallButtonText}>Hapus</Text>
  </Pressable>
  
</View>

        {expanded ? (
          <View style={styles.roomsSection}>
            <Text style={styles.roomsTitle}>Ruangan di {item.name}</Text>

            {selectedBuildingRooms.length === 0 ? (
              <View style={styles.emptyRooms}>
                <Text style={styles.emptyText}>Belum ada ruangan.</Text>
              </View>
            ) : (
              <FlatList
                scrollEnabled={false}
                data={selectedBuildingRooms}
                keyExtractor={(room) => room.id}
                renderItem={renderRoomCard}
              />
            )}
          </View>
        ) : null}
      </Card>
    );
  };

  return (
    <DashboardLayout title="Lokasi Kampus">
    <View style={styles.topBar}>
      <View style={{ flex: 1 }}>
        <Text style={styles.pageTitle}>Manajemen Lokasi</Text>
        <Text style={styles.pageSubtitle}>
          Kelola gedung dan ruangan yang digunakan pada laporan CampusCare.
        </Text>
      </View>
    </View>

    {viewMode === "BUILDING_LIST" ? (
      <View style={styles.actionRow}>
        <Pressable
          style={styles.actionButton}
          onPress={() => setCreateBuildingVisible(true)}
        >
          <Text style={styles.actionButtonText}>+ Gedung</Text>
        </Pressable>

        <Pressable
          style={[styles.actionButton, styles.actionButtonDark]}
          onPress={() => setCreateRoomVisible(true)}
        >
          <Text style={styles.actionButtonText}>+ Ruangan</Text>
        </Pressable>
      </View>
    ) : null}

    {viewMode === "BUILDING_LIST"
      ? renderBuildingListView()
      : renderBuildingRoomsView()}
     <AppModal
  visible={createBuildingVisible}
  title="Tambah Gedung"
  subtitle="Masukkan data gedung kampus."
  onClose={() => {
    setCreateBuildingVisible(false);
    clearAllErrors();
  }}
  footer={
    <Button
      title="Simpan Gedung"
      onPress={createBuilding}
      loading={submittingBuilding}
    />
  }
>
  <ZodInput
    name="name"
    label="Nama Gedung"
    value={buildingName}
    onChangeText={setBuildingName}
    placeholder="Contoh: Gedung A"
    errors={fieldErrors}
    clearError={clearFieldError}
    required
  />

  <ZodInput
    name="code"
    label="Kode Gedung"
    value={buildingCode}
    onChangeText={setBuildingCode}
    placeholder="Contoh: A"
    errors={fieldErrors}
    clearError={clearFieldError}
    required
  />

  <ZodInput
    name="address"
    label="Alamat / Area"
    value={buildingAddress}
    onChangeText={setBuildingAddress}
    placeholder="Contoh: Area Fakultas Teknik"
    errors={fieldErrors}
    clearError={clearFieldError}
  />

  <GeoPointInput
    latitude={buildingLatitude}
    longitude={buildingLongitude}
    onLatitudeChange={setBuildingLatitude}
    onLongitudeChange={setBuildingLongitude}
    errors={fieldErrors}
    clearError={clearFieldError}
    onAddressFound={(address) => {
      if (!buildingAddress.trim()) {
        setBuildingAddress(address);
      }
    }}
  />
</AppModal>
    <AppModal
  visible={updateBuildingVisible}
  title="Update Gedung"
  subtitle="Perbarui data gedung kampus."
  onClose={() => {
    setUpdateBuildingVisible(false);
    setUpdateBuildingTarget(null);
    updateBuildingErrors.clearAllErrors();
  }}
  footer={
    <Button
      title="Simpan Perubahan"
      onPress={updateBuilding}
      loading={submittingUpdateBuilding}
    />
  }
>
  <ZodInput
    name="name"
    label="Nama Gedung"
    value={updateBuildingName}
    onChangeText={setUpdateBuildingName}
    placeholder="Contoh: Gedung A"
    errors={updateBuildingErrors.fieldErrors}
    clearError={updateBuildingErrors.clearFieldError}
    required
  />

  <ZodInput
    name="code"
    label="Kode Gedung"
    value={updateBuildingCode}
    onChangeText={setUpdateBuildingCode}
    placeholder="Contoh: A"
    errors={updateBuildingErrors.fieldErrors}
    clearError={updateBuildingErrors.clearFieldError}
    required
  />

  <ZodInput
    name="address"
    label="Alamat / Area"
    value={updateBuildingAddress}
    onChangeText={setUpdateBuildingAddress}
    placeholder="Contoh: Area Fakultas Teknik"
    errors={updateBuildingErrors.fieldErrors}
    clearError={updateBuildingErrors.clearFieldError}
  />

  <GeoPointInput
    latitude={updateBuildingLatitude}
    longitude={updateBuildingLongitude}
    onLatitudeChange={setUpdateBuildingLatitude}
    onLongitudeChange={setUpdateBuildingLongitude}
    errors={updateBuildingErrors.fieldErrors}
    clearError={updateBuildingErrors.clearFieldError}
    onAddressFound={(address) => {
      if (!updateBuildingAddress.trim()) {
        setUpdateBuildingAddress(address);
      }
    }}
  />
</AppModal>

     <AppModal
  visible={createRoomVisible}
  title="Tambah Ruangan"
  subtitle="Pilih gedung lalu masukkan data ruangan."
  onClose={() => {
    setCreateRoomVisible(false);
    roomErrors.clearAllErrors();
  }}
  footer={
    <Button
      title="Simpan Ruangan"
      onPress={createRoom}
      loading={submittingRoom}
    />
  }
>
  <SelectorInput<Building>
    label="Gedung"
    placeholder="Ketik nama gedung..."
    options={buildings}
    value={roomBuilding}
    onSelect={(item) => {
      roomErrors.clearFieldError("buildingId");
      setRoomBuilding(item);
    }}
    emptyText="Gedung tidak ditemukan"
    getValue={(item) => item.id}
    getLabel={(item) => item.name}
    getDescription={(item) =>
      `${item.code}${item.address ? ` • ${item.address}` : ""}`
    }
  />

  {roomErrors.fieldErrors.buildingId?.[0] ? (
    <Text
      style={{
        color: "#DC2626",
        fontSize: 12,
        fontWeight: "600",
        marginTop: -8,
        marginBottom: 12,
      }}
    >
      {roomErrors.fieldErrors.buildingId[0]}
    </Text>
  ) : null}

  <ZodInput
    name="name"
    label="Nama Ruangan"
    value={roomName}
    onChangeText={setRoomName}
    placeholder="Contoh: Ruang A-101"
    errors={roomErrors.fieldErrors}
    clearError={roomErrors.clearFieldError}
    required
  />

  <ZodInput
    name="code"
    label="Kode Ruangan"
    value={roomCode}
    onChangeText={setRoomCode}
    placeholder="Contoh: A-101"
    errors={roomErrors.fieldErrors}
    clearError={roomErrors.clearFieldError}
    required
  />

  <ZodInput
    name="floorName"
    label="Lantai"
    value={roomFloorName}
    onChangeText={setRoomFloorName}
    placeholder="Contoh: Lantai 1"
    errors={roomErrors.fieldErrors}
    clearError={roomErrors.clearFieldError}
  />

  <ZodInput
    name="description"
    label="Deskripsi"
    value={roomDescription}
    onChangeText={setRoomDescription}
    placeholder="Contoh: Ruang kelas reguler dekat tangga utama"
    errors={roomErrors.fieldErrors}
    clearError={roomErrors.clearFieldError}
    multiline
    numberOfLines={3}
    textAlignVertical="top"
    style={{
      minHeight: 90,
    }}
  />
</AppModal>
<AppModal
  visible={updateRoomVisible}
  title="Update Ruangan"
  subtitle="Perbarui data ruangan kampus."
  onClose={() => {
    setUpdateRoomVisible(false);
    setUpdateRoomTarget(null);
    updateRoomErrors.clearAllErrors();
  }}
  footer={
    <Button
      title="Simpan Perubahan"
      onPress={updateRoom}
      loading={submittingUpdateRoom}
    />
  }
>
  <SelectorInput<Building>
    label="Gedung"
    placeholder="Ketik nama gedung..."
    options={buildings}
    value={updateRoomBuilding}
    onSelect={(item) => {
      updateRoomErrors.clearFieldError("buildingId");
      setUpdateRoomBuilding(item);
    }}
    emptyText="Gedung tidak ditemukan"
    getValue={(item) => item.id}
    getLabel={(item) => item.name}
    getDescription={(item) =>
      `${item.code}${item.address ? ` • ${item.address}` : ""}`
    }
  />

  {updateRoomErrors.fieldErrors.buildingId?.[0] ? (
    <Text
      style={{
        color: "#DC2626",
        fontSize: 12,
        fontWeight: "600",
        marginTop: -8,
        marginBottom: 12,
      }}
    >
      {updateRoomErrors.fieldErrors.buildingId[0]}
    </Text>
  ) : null}

  <ZodInput
    name="name"
    label="Nama Ruangan"
    value={updateRoomName}
    onChangeText={setUpdateRoomName}
    placeholder="Contoh: Ruang A-101"
    errors={updateRoomErrors.fieldErrors}
    clearError={updateRoomErrors.clearFieldError}
    required
  />

  <ZodInput
    name="code"
    label="Kode Ruangan"
    value={updateRoomCode}
    onChangeText={setUpdateRoomCode}
    placeholder="Contoh: A-101"
    errors={updateRoomErrors.fieldErrors}
    clearError={updateRoomErrors.clearFieldError}
    required
  />

  <ZodInput
    name="floorName"
    label="Lantai"
    value={updateRoomFloorName}
    onChangeText={setUpdateRoomFloorName}
    placeholder="Contoh: Lantai 1"
    errors={updateRoomErrors.fieldErrors}
    clearError={updateRoomErrors.clearFieldError}
  />

  <ZodInput
    name="description"
    label="Deskripsi"
    value={updateRoomDescription}
    onChangeText={setUpdateRoomDescription}
    placeholder="Contoh: Ruang kelas reguler dekat tangga utama"
    errors={updateRoomErrors.fieldErrors}
    clearError={updateRoomErrors.clearFieldError}
    multiline
    numberOfLines={3}
    textAlignVertical="top"
    style={{
      minHeight: 90,
    }}
  />
</AppModal>
      <AppModal
        visible={detailVisible}
        title="Detail Gedung"
        subtitle="Informasi gedung dan ruangan yang terdaftar."
        onClose={() => setDetailVisible(false)}
      >
        {selectedBuilding ? (
          <View>
            <Text style={styles.detailTitle}>{selectedBuilding.name}</Text>

            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Kode</Text>
              <Text style={styles.detailValue}>{selectedBuilding.code}</Text>
            </View>

            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Alamat</Text>
              <Text style={styles.detailValue}>
                {selectedBuilding.address || "-"}
              </Text>
            </View>

            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Latitude</Text>
              <Text style={styles.detailValue}>
                {selectedBuilding.latitude || "-"}
              </Text>
            </View>

            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Longitude</Text>
              <Text style={styles.detailValue}>
                {selectedBuilding.longitude || "-"}
              </Text>
            </View>

            <Text style={[styles.sectionTitle, { marginTop: 18 }]}>
              Ruangan
            </Text>

            {selectedBuildingRooms.length === 0 ? (
              <Text style={styles.emptyText}>Belum ada ruangan.</Text>
            ) : (
              <FlatList
                scrollEnabled={false}
                data={selectedBuildingRooms}
                keyExtractor={(room) => room.id}
                renderItem={renderRoomCard}
              />
            )}
          </View>
        ) : null}
      </AppModal>
      <ConfirmModal
  visible={Boolean(deleteBuildingTarget)}
  title="Hapus Gedung?"
  message={
    deleteBuildingTarget
      ? `Gedung "${deleteBuildingTarget.name}" akan dihapus. Jika gedung masih memiliki laporan aktif, proses akan ditolak oleh sistem.`
      : ""
  }
  confirmText="Hapus Gedung"
  cancelText="Batal"
  danger
  loading={deleting}
  onCancel={() => setDeleteBuildingTarget(null)}
  onConfirm={deleteBuilding}
/>

<ConfirmModal
  visible={Boolean(deleteRoomTarget)}
  title="Hapus Ruangan?"
  message={
    deleteRoomTarget
      ? `Ruangan "${deleteRoomTarget.name}" akan dihapus. Jika ruangan masih memiliki laporan aktif, proses akan ditolak oleh sistem.`
      : ""
  }
  confirmText="Hapus Ruangan"
  cancelText="Batal"
  danger
  loading={deleting}
  onCancel={() => setDeleteRoomTarget(null)}
  onConfirm={deleteRoom}
/>
    </DashboardLayout>
  );
}

const styles = StyleSheet.create({
  topBar: {
    marginBottom: 14,
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
  actionRow: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 14,
  },
  actionButton: {
    flex: 1,
    backgroundColor: "#2563EB",
    paddingVertical: 12,
    borderRadius: 14,
    alignItems: "center",
  },
  actionButtonDark: {
    backgroundColor: "#0F172A",
  },
  actionButtonText: {
    color: "#FFFFFF",
    fontWeight: "800",
    fontSize: 14,
  },
  summaryRow: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 18,
  },
  summaryCard: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 16,
    padding: 14,
  },
  summaryValue: {
    fontSize: 24,
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
  buildingHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  buildingIcon: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: "#EFF6FF",
    alignItems: "center",
    justifyContent: "center",
  },
  buildingIconText: {
    color: "#2563EB",
    fontWeight: "900",
    fontSize: 14,
  },
  buildingName: {
    fontSize: 17,
    fontWeight: "900",
    color: "#0F172A",
  },
  buildingMeta: {
    marginTop: 3,
    fontSize: 13,
    color: "#64748B",
  },
  expandIcon: {
    fontSize: 24,
    color: "#64748B",
    fontWeight: "900",
  },
  buildingActions: {
    flexDirection: "row",
    gap: 10,
    marginTop: 14,
  },
  secondaryButton: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#CBD5E1",
    paddingVertical: 10,
    borderRadius: 12,
    alignItems: "center",
  },
  secondaryButtonText: {
    color: "#334155",
    fontWeight: "800",
  },
  primarySmallButton: {
    flex: 1,
    backgroundColor: "#2563EB",
    paddingVertical: 10,
    borderRadius: 12,
    alignItems: "center",
  },
  primarySmallButtonText: {
    color: "#FFFFFF",
    fontWeight: "800",
  },
  roomsSection: {
    marginTop: 16,
    borderTopWidth: 1,
    borderTopColor: "#E2E8F0",
    paddingTop: 14,
  },
  roomsTitle: {
    fontSize: 15,
    fontWeight: "900",
    color: "#0F172A",
    marginBottom: 10,
  },
  roomCard: {
    backgroundColor: "#F8FAFC",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 14,
    padding: 12,
    marginBottom: 10,
  },
  roomName: {
    fontSize: 15,
    fontWeight: "900",
    color: "#0F172A",
  },
  roomMeta: {
    marginTop: 3,
    fontSize: 13,
    color: "#64748B",
  },
  roomDescription: {
    marginTop: 6,
    fontSize: 13,
    color: "#334155",
    lineHeight: 18,
  },
  emptyRooms: {
    backgroundColor: "#F1F5F9",
    borderRadius: 12,
    padding: 12,
  },
  emptyText: {
    color: "#64748B",
    fontSize: 13,
    lineHeight: 18,
  },
  detailTitle: {
    fontSize: 20,
    fontWeight: "900",
    color: "#0F172A",
    marginBottom: 14,
  },
  detailRow: {
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#E2E8F0",
  },
  detailLabel: {
    fontSize: 12,
    fontWeight: "800",
    color: "#64748B",
    marginBottom: 4,
  },
  detailValue: {
    fontSize: 14,
    color: "#0F172A",
    fontWeight: "600",
  },
  roomHeader: {
  flexDirection: "row",
  alignItems: "flex-start",
  gap: 10,
},

deleteMiniButton: {
  backgroundColor: "#FEE2E2",
  borderWidth: 1,
  borderColor: "#FCA5A5",
  paddingHorizontal: 10,
  paddingVertical: 7,
  borderRadius: 10,
},

deleteMiniButtonText: {
  color: "#B91C1C",
  fontSize: 12,
  fontWeight: "800",
},

dangerSmallButton: {
  flex: 1,
  backgroundColor: "#DC2626",
  paddingVertical: 10,
  borderRadius: 12,
  alignItems: "center",
},

dangerSmallButtonText: {
  color: "#FFFFFF",
  fontWeight: "800",
},warningSmallButton: {
  flex: 1,
  backgroundColor: "#F59E0B",
  paddingVertical: 10,
  borderRadius: 12,
  alignItems: "center",
},

warningSmallButtonText: {
  color: "#FFFFFF",
  fontWeight: "800",
},

roomActionColumn: {
  gap: 8,
  alignItems: "flex-end",
},

updateMiniButton: {
  backgroundColor: "#FEF3C7",
  borderWidth: 1,
  borderColor: "#FCD34D",
  paddingHorizontal: 10,
  paddingVertical: 7,
  borderRadius: 10,
},

updateMiniButtonText: {
  color: "#92400E",
  fontSize: 12,
  fontWeight: "800",
},
detailHeader: {
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "space-between",
  gap: 10,
  marginBottom: 14,
},

backButton: {
  backgroundColor: "#F1F5F9",
  borderWidth: 1,
  borderColor: "#CBD5E1",
  paddingHorizontal: 14,
  paddingVertical: 10,
  borderRadius: 12,
},

backButtonText: {
  color: "#334155",
  fontWeight: "900",
},

buildingDetailBox: {
  backgroundColor: "#F8FAFC",
  borderWidth: 1,
  borderColor: "#E2E8F0",
  borderRadius: 14,
  padding: 14,
},

detailMeta: {
  fontSize: 13,
  color: "#64748B",
  marginTop: 4,
},
});