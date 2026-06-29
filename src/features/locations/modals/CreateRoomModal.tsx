import { Text } from "react-native";
import { Button } from "@/components/ui/ButtonId";
import { AppModal } from "@/components/ui/appModal";
import { SelectorInput } from "@/components/ui/selectorInputId";
import { ZodInput } from "@/components/ui/ZodInput";
import type { Building } from "@/api/locations/types";
import type { ZodFieldErrors } from "@/utils/zodErrors";

type Props = {
  visible: boolean;
  loading: boolean;
  buildings: Building[];
  building: Building | null;
  name: string;
  code: string;
  floorName: string;
  description: string;
  errors: ZodFieldErrors;
  onClose: () => void;
  onSubmit: () => void;
  setBuilding: (building: Building | null) => void;
  setName: (value: string) => void;
  setCode: (value: string) => void;
  setFloorName: (value: string) => void;
  setDescription: (value: string) => void;
  clearError: (field: string) => void;
};

export function CreateRoomModal(props: Props) {
  return (
    <AppModal
      visible={props.visible}
      title="Tambah Ruangan"
      subtitle="Pilih gedung lalu masukkan data ruangan."
      onClose={props.onClose}
      footer={
        <Button
             testID="room-submit-button"
          accessibilityLabel="room-submit-button"
          title="Simpan Ruangan"
          onPress={props.onSubmit}
          loading={props.loading}
        />
      }
    >
      <SelectorInput<Building>
                testID="room-building-select"
        accessibilityLabel="room-building-select"
        optionTestIDPrefix="room-building-option"
        label="Gedung"
        placeholder="Ketik nama gedung..."
        options={props.buildings}
        value={props.building}
        onSelect={(item) => {
          props.clearError("buildingId");
          props.setBuilding(item);
        }}
        emptyText="Gedung tidak ditemukan"
        getValue={(item) => item.id}
        getLabel={(item) => item.name}
        getDescription={(item) =>
          `${item.code}${item.address ? ` • ${item.address}` : ""}`
        }
      />

      {props.errors.buildingId?.[0] ? (
        <Text
          testID="room-building-error"
          accessibilityLabel="room-building-error"
          style={{
            color: "#DC2626",
            fontSize: 12,
            fontWeight: "600",
            marginTop: -8,
            marginBottom: 12,
          }}
        >
          {props.errors.buildingId[0]}
        </Text>
      ) : null}

      <ZodInput
          testID="room-name-input"
        accessibilityLabel="room-name-input"
        name="name"
        label="Nama Ruangan"
        value={props.name}
        onChangeText={props.setName}
        placeholder="Contoh: Ruang A-101"
        errors={props.errors}
        clearError={props.clearError}
        required
      />

      <ZodInput
        testID="room-code-input"
        accessibilityLabel="room-code-input"
        name="code"
        label="Kode Ruangan"
        value={props.code}
        onChangeText={props.setCode}
        placeholder="Contoh: A-101"
        errors={props.errors}
        clearError={props.clearError}
        required
      />

      <ZodInput
              testID="room-floor-input"
        accessibilityLabel="room-floor-input"
        name="floorName"
        label="Lantai"
        value={props.floorName}
        onChangeText={props.setFloorName}
        placeholder="Contoh: Lantai 1"
        errors={props.errors}
        clearError={props.clearError}
      />

      <ZodInput
      testID="room-description-input"
        accessibilityLabel="room-description-input"
        name="description"
        label="Deskripsi"
        value={props.description}
        onChangeText={props.setDescription}
        placeholder="Contoh: Ruang kelas reguler"
        errors={props.errors}
        clearError={props.clearError}
        multiline
        numberOfLines={3}
        textAlignVertical="top"
        style={{ minHeight: 90 }}
      />
    </AppModal>
  );
}