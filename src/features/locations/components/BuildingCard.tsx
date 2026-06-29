import { Pressable, Text, View } from "react-native";
import { Card } from "@/components/ui/Card";
import type { Building } from "@/api/locations/types";
import { styles } from "../styles";

type Props = {
  building: Building;
  index: number;
  onDetail: (building: Building) => void;
  onUpdate: (building: Building) => void;
  onDelete: (building: Building) => void;
};

export function BuildingCard({
  building,
  index,
  onDetail,
  onUpdate,
  onDelete,
}: Props) {
  return (
      <View
      testID={`building-card-${index}`}
      accessibilityLabel={`building-card-${index}`}
    >
    <Card>
      <View style={styles.buildingHeader}>
        <View 
                    testID={`building-icon-${index}`}
            accessibilityLabel={`building-icon-${index}`}
        style={styles.buildingIcon}>
          <Text style={styles.buildingIconText}>
            {building.code?.slice(0, 2).toUpperCase()}
          </Text>
        </View>

        <View style={{ flex: 1 }}>
          <Text
                        testID={`building-name-${index}`}
              accessibilityLabel={`building-name-${index}`}
          style={styles.buildingName}>{building.name}</Text>
          <Text
             testID={`building-code-${index}`}
              accessibilityLabel={`building-code-${index}`}
          style={styles.buildingMeta}>Kode: {building.code}</Text>

          <Text 
           testID={`building-address-${index}`}
              accessibilityLabel={`building-address-${index}`}
          style={styles.buildingMeta}>
            {building.address || "Alamat belum diisi"}
          </Text>
        </View>
      </View>

      <View style={styles.buildingActions}>
        <Pressable
         testID={`building-detail-button-${index}`}
            accessibilityLabel={`building-detail-button-${index}`}
          style={styles.secondaryButton}
          onPress={() => onDetail(building)}
        >
          <Text style={styles.secondaryButtonText}>Detail</Text>
        </Pressable>

        <Pressable
                testID={`building-update-button-${index}`}
            accessibilityLabel={`building-update-button-${index}`}
          style={styles.warningSmallButton}
          onPress={() => onUpdate(building)}
        >
          <Text style={styles.warningSmallButtonText}>Update</Text>
        </Pressable>

        <Pressable
          testID={`building-delete-button-${index}`}
            accessibilityLabel={`building-delete-button-${index}`}
          style={styles.dangerSmallButton}
          onPress={() => onDelete(building)}
        >
          <Text style={styles.dangerSmallButtonText}>Hapus</Text>
        </Pressable>
      </View>
    </Card>
    </View>
  );
}