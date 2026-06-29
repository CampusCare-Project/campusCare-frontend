import { useMemo, useState } from "react";
import { Pressable, Text, View } from "react-native";
import { toast } from "sonner-native";
import { SearchInput } from "@/components/ui/SearchInput";
import { searchInFields } from "@/utils/search";
import { DashboardLayout } from "@/layouts/DashboardLayout";
import { ConfirmModal } from "@/components/ui/ConfirmModal";

import { useZodFormErrors } from "@/api/hooks/useZodFormErrors";
import { useLocations } from "@/api/locations/hooks";
import { locationService } from "@/api/locations/service";
import type { Building, Room } from "@/api/locations/types";

import { getApiErrorMessage } from "@/utils/apiError";
import {
  isInvalidNumberInput,
  toNumberOrUndefined,
} from "@/utils/formValue";

import { BuildingListView } from "./components/BuildingListView";
import { BuildingRoomsView } from "./components/BuildingRoomsView";

import { CreateBuildingModal } from "./modals/CreateBuildingModal";
import { CreateRoomModal } from "./modals/CreateRoomModal";
import { UpdateBuildingModal } from "./modals/UpdateBuildingModal";
import { UpdateRoomModal } from "./modals/UpdateRoomModal";

import { styles } from "./styles";
// import { toInputValue } from "../../utils";

 function toInputValue(value: string | number | null | undefined) {
  if (value === null || value === undefined) {
    return "";
  }

  return String(value);
}

type ViewMode = "BUILDING_LIST" | "BUILDING_ROOMS";

export function LocationScreen() {
  const { buildings, rooms, fetchBuildings, fetchRooms } = useLocations(true);
const [searchQuery, setSearchQuery] = useState("");
  const buildingErrors = useZodFormErrors();
  const roomErrors = useZodFormErrors();
  const updateBuildingErrors = useZodFormErrors();
  const updateRoomErrors = useZodFormErrors();

  const [viewMode, setViewMode] = useState<ViewMode>("BUILDING_LIST");
  const [roomViewBuilding, setRoomViewBuilding] = useState<Building | null>(
    null
  );

  const [createBuildingVisible, setCreateBuildingVisible] = useState(false);
  const [createRoomVisible, setCreateRoomVisible] = useState(false);
  const [updateBuildingVisible, setUpdateBuildingVisible] = useState(false);
  const [updateRoomVisible, setUpdateRoomVisible] = useState(false);

  const [deleteBuildingTarget, setDeleteBuildingTarget] =
    useState<Building | null>(null);
  const [deleteRoomTarget, setDeleteRoomTarget] = useState<Room | null>(null);

  const [submittingBuilding, setSubmittingBuilding] = useState(false);
  const [submittingRoom, setSubmittingRoom] = useState(false);
  const [submittingUpdateBuilding, setSubmittingUpdateBuilding] =
    useState(false);
  const [submittingUpdateRoom, setSubmittingUpdateRoom] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const [buildingName, setBuildingName] = useState("");
  const [buildingCode, setBuildingCode] = useState("");
  const [buildingAddress, setBuildingAddress] = useState("");
  const [buildingLatitude, setBuildingLatitude] = useState("");
  const [buildingLongitude, setBuildingLongitude] = useState("");

  const [roomBuilding, setRoomBuilding] = useState<Building | null>(null);
  const [roomName, setRoomName] = useState("");
  const [roomCode, setRoomCode] = useState("");
  const [roomFloorName, setRoomFloorName] = useState("");
  const [roomDescription, setRoomDescription] = useState("");

  const [updateBuildingTarget, setUpdateBuildingTarget] =
    useState<Building | null>(null);
  const [updateBuildingName, setUpdateBuildingName] = useState("");
  const [updateBuildingCode, setUpdateBuildingCode] = useState("");
  const [updateBuildingAddress, setUpdateBuildingAddress] = useState("");
  const [updateBuildingLatitude, setUpdateBuildingLatitude] = useState("");
  const [updateBuildingLongitude, setUpdateBuildingLongitude] = useState("");

  const [updateRoomTarget, setUpdateRoomTarget] = useState<Room | null>(null);
  const [updateRoomBuilding, setUpdateRoomBuilding] =
    useState<Building | null>(null);
  const [updateRoomName, setUpdateRoomName] = useState("");
  const [updateRoomCode, setUpdateRoomCode] = useState("");
  const [updateRoomFloorName, setUpdateRoomFloorName] = useState("");
  const [updateRoomDescription, setUpdateRoomDescription] = useState("");

  
  const filteredBuildings = useMemo(() => {
  const query = searchQuery.trim();

  if (!query) {
    return buildings;
  }

  return buildings.filter((building) => {
    const buildingRooms = rooms.filter((room) => {
      return room.buildingId === building.id;
    });

    const roomFields = buildingRooms.flatMap((room) => [
      room.name,
      room.code,
      room.floorName,
      room.description,
    ]);

    return searchInFields(query, [
      building.name,
      building.code,
      building.address,
      building.latitude,
      building.longitude,
      ...roomFields,
    ]);
  });
}, [buildings, rooms, searchQuery]);

const selectedBuildingRooms = useMemo(() => {
  if (!roomViewBuilding) {
    return [];
  }

  const currentRooms = rooms.filter((room: Room) => {
    return room.buildingId === roomViewBuilding.id;
  });

  const query = searchQuery.trim();

  if (!query) {
    return currentRooms;
  }

  return currentRooms.filter((room) => {
    return searchInFields(query, [
      room.name,
      room.code,
      room.floorName,
      room.description,
      roomViewBuilding.name,
      roomViewBuilding.code,
      roomViewBuilding.address,
    ]);
  });
}, [rooms, roomViewBuilding, searchQuery]);

 
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

  const openCreateRoom = (building?: Building) => {
    if (building) {
      setRoomBuilding(building);
    }

    roomErrors.clearAllErrors();
    setCreateRoomVisible(true);
  };

  const createBuilding = async () => {
    try {
      setSubmittingBuilding(true);
      buildingErrors.clearAllErrors();

      if (isInvalidNumberInput(buildingLatitude)) {
        return toast.error("Latitude harus berupa angka.");
      }

      if (isInvalidNumberInput(buildingLongitude)) {
        return toast.error("Longitude harus berupa angka.");
      }

      await locationService.createBuilding({
        name: buildingName.trim(),
        code: buildingCode.trim(),
        address: buildingAddress.trim() || undefined,
        latitude: Number(buildingLatitude),
        longitude: Number(buildingLongitude),
      });

      resetBuildingForm();
      setCreateBuildingVisible(false);
      await fetchBuildings();

      toast.success("Gedung berhasil ditambah");
    } catch (e: any) {
      const parsed = buildingErrors.setFromApiError(e);
      toast.error(parsed.message || getApiErrorMessage(e, "Gagal menambah gedung"));
    } finally {
      setSubmittingBuilding(false);
    }
  };

  const createRoom = async () => {
    try {
      setSubmittingRoom(true);
      roomErrors.clearAllErrors();

      await locationService.createRoom({
        buildingId: roomBuilding?.id || "",
        name: roomName.trim(),
        code: roomCode.trim(),
        floorName: roomFloorName.trim() || undefined,
        description: roomDescription.trim() || undefined,
      });

      const createdForBuildingId = roomBuilding?.id;

      resetRoomForm();
      setCreateRoomVisible(false);

      if (viewMode === "BUILDING_ROOMS" && roomViewBuilding) {
        await fetchRooms(roomViewBuilding.id);
      } else if (createdForBuildingId) {
        await fetchRooms(createdForBuildingId);
      }

      toast.success("Ruangan berhasil ditambah");
    } catch (e: any) {
      const parsed = roomErrors.setFromApiError(e);
      toast.error(parsed.message || getApiErrorMessage(e, "Gagal menambah ruangan"));
    } finally {
      setSubmittingRoom(false);
    }
  };

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

      const updated = await locationService.updateBuilding(
        updateBuildingTarget.id,
        {
          name: updateBuildingName.trim(),
          code: updateBuildingCode.trim(),
          address: updateBuildingAddress.trim() || undefined,
          latitude: Number(updateBuildingLatitude),
          longitude: Number(updateBuildingLongitude),
        }
      );

      setUpdateBuildingVisible(false);
      setUpdateBuildingTarget(null);

      if (roomViewBuilding?.id === updated.id) {
        setRoomViewBuilding(updated);
      }

      await fetchBuildings();

      toast.success("Gedung berhasil diperbarui");
    } catch (e: any) {
      const parsed = updateBuildingErrors.setFromApiError(e);
      toast.error(parsed.message || "Gagal memperbarui gedung");
    } finally {
      setSubmittingUpdateBuilding(false);
    }
  };

  const openUpdateRoom = (room: Room) => {
    updateRoomErrors.clearAllErrors();

    const currentBuilding =
      buildings.find((building) => building.id === room.buildingId) ?? null;

    setUpdateRoomTarget(room);
    setUpdateRoomBuilding(currentBuilding);
    setUpdateRoomName(room.name ?? "");
    setUpdateRoomCode(room.code ?? "");
    setUpdateRoomFloorName(room.floorName ?? "");
    setUpdateRoomDescription(room.description ?? "");

    setUpdateRoomVisible(true);
  };

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

  const deleteBuilding = async () => {
    if (!deleteBuildingTarget) return;

    try {
      setDeleting(true);

      await locationService.deleteBuilding(deleteBuildingTarget.id);

      if (roomViewBuilding?.id === deleteBuildingTarget.id) {
        setViewMode("BUILDING_LIST");
        setRoomViewBuilding(null);
      }

      setDeleteBuildingTarget(null);

      await fetchBuildings();
      await fetchRooms();

      toast.success("Gedung berhasil dihapus");
    } catch (e: any) {
      toast.error(getApiErrorMessage(e, "Gagal menghapus gedung"));
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

      setDeleteRoomTarget(null);

      if (viewMode === "BUILDING_ROOMS" && roomViewBuilding) {
        await fetchRooms(roomViewBuilding.id);
      } else {
        await fetchRooms(buildingId);
      }

      toast.success("Ruangan berhasil dihapus");
    } catch (e: any) {
      toast.error(getApiErrorMessage(e, "Gagal menghapus ruangan"));
    } finally {
      setDeleting(false);
    }
  };

  return (
    <DashboardLayout title="Lokasi Kampus">
      <View style={styles.topBar}>
         <Text
        testID="locations-title"
        accessibilityLabel="locations-title"
        style={styles.pageTitle}
      >
        Manajemen Lokasi
      </Text>
        <Text style={styles.pageSubtitle}>
          Kelola gedung dan ruangan yang digunakan pada laporan CampusCare.
        </Text>
      </View>

     {viewMode === "BUILDING_LIST" ? (
  <View style={styles.actionRow}>
    <Pressable
          testID="building-create-button"
          accessibilityLabel="building-create-button"
      style={styles.actionButton}
      onPress={() => setCreateBuildingVisible(true)}
    >
      <Text style={styles.actionButtonText}>+ Gedung</Text>
    </Pressable>

    <Pressable
              testID="room-create-button"
          accessibilityLabel="room-create-button"
      style={[styles.actionButton, styles.actionButtonDark]}
      onPress={() => openCreateRoom()}
    >
      <Text style={styles.actionButtonText}>+ Ruangan</Text>
    </Pressable>
  </View>
) : null}

<SearchInput
      testID="locations-search-input"
      accessibilityLabel="locations-search-input"
  value={searchQuery}
  onChangeText={setSearchQuery}
  placeholder={
    viewMode === "BUILDING_LIST"
      ? "Cari gedung, ruangan, lantai..."
      : "Cari ruangan, kode, lantai..."
  }
  helperText={
    searchQuery.trim()
      ? `Hasil pencarian untuk "${searchQuery}"`
      : "Cari berdasarkan nama, kode, alamat, ruangan, atau lantai."
  }
/>

      {viewMode === "BUILDING_LIST" ? (
        <BuildingListView
          buildings={filteredBuildings}
          roomCount={rooms.length}
          searchQuery={searchQuery}
          onDetail={openBuildingRoomsView}
          onUpdate={openUpdateBuilding}
          onDelete={setDeleteBuildingTarget}
        />
      ) : roomViewBuilding ? (
        <BuildingRoomsView
          building={roomViewBuilding}
          rooms={selectedBuildingRooms}
          searchQuery={searchQuery}
          onBack={backToBuildingList}
          onCreateRoom={openCreateRoom}
          onUpdateBuilding={openUpdateBuilding}
          onDeleteBuilding={setDeleteBuildingTarget}
          onUpdateRoom={openUpdateRoom}
          onDeleteRoom={setDeleteRoomTarget}
        />
      ) : null}

      <CreateBuildingModal
        visible={createBuildingVisible}
        loading={submittingBuilding}
        name={buildingName}
        code={buildingCode}
        address={buildingAddress}
        latitude={buildingLatitude}
        longitude={buildingLongitude}
        errors={buildingErrors.fieldErrors}
        clearError={buildingErrors.clearFieldError}
        setName={setBuildingName}
        setCode={setBuildingCode}
        setAddress={setBuildingAddress}
        setLatitude={setBuildingLatitude}
        setLongitude={setBuildingLongitude}
        onSubmit={createBuilding}
        onClose={() => {
          setCreateBuildingVisible(false);
          buildingErrors.clearAllErrors();
        }}
      />

      <CreateRoomModal
        visible={createRoomVisible}
        loading={submittingRoom}
        buildings={buildings}
        building={roomBuilding}
        name={roomName}
        code={roomCode}
        floorName={roomFloorName}
        description={roomDescription}
        errors={roomErrors.fieldErrors}
        clearError={roomErrors.clearFieldError}
        setBuilding={setRoomBuilding}
        setName={setRoomName}
        setCode={setRoomCode}
        setFloorName={setRoomFloorName}
        setDescription={setRoomDescription}
        onSubmit={createRoom}
        onClose={() => {
          setCreateRoomVisible(false);
          roomErrors.clearAllErrors();
        }}
      />

      <UpdateBuildingModal
        visible={updateBuildingVisible}
        loading={submittingUpdateBuilding}
        name={updateBuildingName}
        code={updateBuildingCode}
        address={updateBuildingAddress}
        latitude={updateBuildingLatitude}
        longitude={updateBuildingLongitude}
        errors={updateBuildingErrors.fieldErrors}
        clearError={updateBuildingErrors.clearFieldError}
        setName={setUpdateBuildingName}
        setCode={setUpdateBuildingCode}
        setAddress={setUpdateBuildingAddress}
        setLatitude={setUpdateBuildingLatitude}
        setLongitude={setUpdateBuildingLongitude}
        onSubmit={updateBuilding}
        onClose={() => {
          setUpdateBuildingVisible(false);
          setUpdateBuildingTarget(null);
          updateBuildingErrors.clearAllErrors();
        }}
      />

      <UpdateRoomModal
        visible={updateRoomVisible}
        loading={submittingUpdateRoom}
        buildings={buildings}
        building={updateRoomBuilding}
        name={updateRoomName}
        code={updateRoomCode}
        floorName={updateRoomFloorName}
        description={updateRoomDescription}
        errors={updateRoomErrors.fieldErrors}
        clearError={updateRoomErrors.clearFieldError}
        setBuilding={setUpdateRoomBuilding}
        setName={setUpdateRoomName}
        setCode={setUpdateRoomCode}
        setFloorName={setUpdateRoomFloorName}
        setDescription={setUpdateRoomDescription}
        onSubmit={updateRoom}
        onClose={() => {
          setUpdateRoomVisible(false);
          setUpdateRoomTarget(null);
          updateRoomErrors.clearAllErrors();
        }}
      />

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