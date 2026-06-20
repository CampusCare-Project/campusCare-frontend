import { Button } from "@/components/ui/Button";
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
          title="Simpan Gedung"
          onPress={props.onSubmit}
          loading={props.loading}
        />
      }
    >
      <ZodInput
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
        onAddressFound={(address) => {
          if (!props.address.trim()) {
            props.setAddress(address);
          }
        }}
      />
    </AppModal>
  );
}