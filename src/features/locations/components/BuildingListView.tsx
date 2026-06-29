import { FlatList, Text, View } from "react-native";
import { Card } from "@/components/ui/Card";
import type { Building } from "@/api/locations/types";
import { BuildingCard } from "./BuildingCard";
import { styles } from "../styles";

type Props = {
  buildings: Building[];
  roomCount: number;
    searchQuery?: string;
  onDetail: (building: Building) => void;
  onUpdate: (building: Building) => void;
  onDelete: (building: Building) => void;
};

export function BuildingListView({
  buildings,
  roomCount,
  searchQuery = "",
  onDetail,
  onUpdate,
  onDelete,
}: Props) {
  return (
    <>
      <View style={styles.summaryRow}>
        <View
                 testID="building-summary-card"
          accessibilityLabel="building-summary-card"
        style={styles.summaryCard}>
          <Text
    testID="building-summary-count"
            accessibilityLabel="building-summary-count"
          style={styles.summaryValue}>{buildings.length}</Text>
          <Text style={styles.summaryLabel}>Gedung</Text>
        </View>

        <View
                 testID="room-summary-card"
          accessibilityLabel="room-summary-card"
        style={styles.summaryCard}>
          <Text
              testID="room-summary-count"
            accessibilityLabel="room-summary-count"
          style={styles.summaryValue}>{roomCount}</Text>
          <Text style={styles.summaryLabel}>Ruangan aktif</Text>
        </View>
      </View>

      <Text 
           testID="building-list-title"
        accessibilityLabel="building-list-title"
      style={styles.sectionTitle}>Daftar Gedung</Text>

      {buildings.length === 0 ? (
         <Card>
    <Text
        testID="building-empty-text"
            accessibilityLabel="building-empty-text"
    style={styles.emptyText}>
      {searchQuery.trim()
        ? "Tidak ada gedung atau ruangan yang cocok dengan pencarian."
        : "Belum ada data gedung. Tambahkan gedung terlebih dahulu."}
    </Text>
  </Card>
      ) : (
        <FlatList
          scrollEnabled={false}
          data={buildings}
          keyExtractor={(item) => item.id}
          renderItem={({ item ,index}) => (
            <BuildingCard
              building={item}
              index={index}
              onDetail={onDetail}
              onUpdate={onUpdate}
              onDelete={onDelete}
            />
          )}
        />
      )}
    </>
  );
}