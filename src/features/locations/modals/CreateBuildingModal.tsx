import { Button } from "@/components/ui/ButtonId";
import { AppModal } from "@/components/ui/appModal";
import { GeoPointInput } from "@/components/ui/GeoPointInput";
import { ZodInput } from "@/components/ui/ZodInput";
import type { ZodFieldErrors } from "@/utils/zodErrors";

type Props = {
  visible: boolean;
  loading: boolean;
  name: string;
  code: string;
  address: string;
  latitude: string;
  longitude: string;
  errors: ZodFieldErrors;
  onClose: () => void;
  onSubmit: () => void;
  setName: (value: string) => void;
  setCode: (value: string) => void;
  setAddress: (value: string) => void;
  setLatitude: (value: string) => void;
  setLongitude: (value: string) => void;
  clearError: (field: string) => void;
};

export function CreateBuildingModal(props: Props) {
  return (
    <AppModal
      visible={props.visible}
      title="Tambah Gedung"
      subtitle="Masukkan data gedung kampus."
      onClose={props.onClose}
      footer={
        <Button
                testID="building-submit-button"
          accessibilityLabel="building-submit-button"
          title="Simpan Gedung"
          onPress={props.onSubmit}
          loading={props.loading}
        />
      }
    >
      <ZodInput
          testID="building-name-input"
        accessibilityLabel="building-name-input"
        name="name"
        label="Nama Gedung"
        value={props.name}
        onChangeText={props.setName}
        placeholder="Contoh: Gedung A"
        errors={props.errors}
        clearError={props.clearError}
        required
      />

      <ZodInput
            testID="building-code-input"
        accessibilityLabel="building-code-input"
        name="code"
        label="Kode Gedung"
        value={props.code}
        onChangeText={props.setCode}
        placeholder="Contoh: A"
        errors={props.errors}
        clearError={props.clearError}
        required
      />

      <ZodInput
            testID="building-address-input"
        accessibilityLabel="building-address-input"
        name="address"
        label="Alamat / Area"
        value={props.address}
        onChangeText={props.setAddress}
        placeholder="Contoh: Area Fakultas Teknik"
        errors={props.errors}
        clearError={props.clearError}
      />

      <GeoPointInput
        latitude={props.latitude}
        longitude={props.longitude}
        onLatitudeChange={props.setLatitude}
        onLongitudeChange={props.setLongitude}
        errors={props.errors}
        latitudeTestID="building-latitude-input"
        longitudeTestID="building-longitude-input"
        clearError={props.clearError}
        onAddressFound={(address) => {
          if (!props.address.trim()) {
            props.setAddress(address);
          }
        }}
      />
    </AppModal>
  );
}