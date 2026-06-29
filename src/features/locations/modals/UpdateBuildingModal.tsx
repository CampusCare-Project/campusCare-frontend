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

export function UpdateBuildingModal(props: Props) {
  return (
    <AppModal
      visible={props.visible}
      title="Update Gedung"
      subtitle="Perbarui data gedung kampus."
      onClose={props.onClose}
      footer={
        <Button
            testID="building-update-submit-button"
          accessibilityLabel="building-update-submit-button"
          title="Simpan Perubahan"
          onPress={props.onSubmit}
          loading={props.loading}
        />
      }
    >
      <ZodInput
         testID="building-update-name-input"
        accessibilityLabel="building-update-name-input"
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
             testID="building-update-code-input"
        accessibilityLabel="building-update-code-input"
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
        testID="building-update-address-input"
        accessibilityLabel="building-update-address-input"
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
        clearError={props.clearError}
                latitudeTestID="building-update-latitude-input"
        longitudeTestID="building-update-longitude-input"
        onAddressFound={(address) => {
          if (!props.address.trim()) {
            props.setAddress(address);
          }
        }}
      />
    </AppModal>
  );
}