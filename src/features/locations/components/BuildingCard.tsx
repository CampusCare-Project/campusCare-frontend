import { Pressable, Text, View } from "react-native";
import { Card } from "@/components/ui/Card";
import type { Building } from "@/api/locations/types";
import { styles } from "../styles";

type Props = {
  building: Building;
  onDetail: (building: Building) => void;
  onUpdate: (building: Building) => void;
  onDelete: (building: Building) => void;
};

export function BuildingCard({
  building,
  onDetail,
  onUpdate,
  onDelete,
}: Props) {
  return (
    <Card>
      <View style={styles.buildingHeader}>
        <View style={styles.buildingIcon}>
          <Text style={styles.buildingIconText}>
            {building.code?.slice(0, 2).toUpperCase()}
          </Text>
        </View>

        <View style={{ flex: 1 }}>
          <Text style={styles.buildingName}>{building.name}</Text>
          <Text style={styles.buildingMeta}>Kode: {building.code}</Text>

          <Text style={styles.buildingMeta}>
            {building.address || "Alamat belum diisi"}
          </Text>
        </View>
      </View>

      <View style={styles.buildingActions}>
        <Pressable
          style={styles.secondaryButton}
          onPress={() => onDetail(building)}
        >
          <Text style={styles.secondaryButtonText}>Detail</Text>
        </Pressable>

        <Pressable
          style={styles.warningSmallButton}
          onPress={() => onUpdate(building)}
        >
          <Text style={styles.warningSmallButtonText}>Update</Text>
        </Pressable>

        <Pressable
          style={styles.dangerSmallButton}
          onPress={() => onDelete(building)}
        >
          <Text style={styles.dangerSmallButtonText}>Hapus</Text>
        </Pressable>
      </View>
    </Card>
  );
}