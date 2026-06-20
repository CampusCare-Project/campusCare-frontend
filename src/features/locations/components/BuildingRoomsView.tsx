import { FlatList, Pressable, Text, View } from "react-native";
import { Card } from "@/components/ui/Card";
import type { Building, Room } from "@/api/locations/types";
import { RoomCard } from "./RoomCard";
import { styles } from "../styles";

type Props = {
  building: Building;
  rooms: Room[];
  searchQuery?: string;
  onBack: () => void;
  onCreateRoom: (building: Building) => void;
  onUpdateBuilding: (building: Building) => void;
  onDeleteBuilding: (building: Building) => void;
  onUpdateRoom: (room: Room) => void;
  onDeleteRoom: (room: Room) => void;
};

export function BuildingRoomsView({
  building,
  rooms,
  searchQuery = "",
  onBack,
  onCreateRoom,
  onUpdateBuilding,
  onDeleteBuilding,
  onUpdateRoom,
  onDeleteRoom,
}: Props) {
  return (
    <>
      <Card>
        <View style={styles.detailHeader}>
          <Pressable style={styles.backButton} onPress={onBack}>
            <Text style={styles.backButtonText}>← Kembali</Text>
          </Pressable>

          <Pressable
            style={styles.primarySmallButton}
            onPress={() => onCreateRoom(building)}
          >
            <Text style={styles.primarySmallButtonText}>+ Ruangan</Text>
          </Pressable>
        </View>

        <View style={styles.buildingDetailBox}>
          <Text style={styles.detailTitle}>{building.name}</Text>
          <Text style={styles.detailMeta}>Kode: {building.code}</Text>
          <Text style={styles.detailMeta}>
            Alamat: {building.address || "-"}
          </Text>
          <Text style={styles.detailMeta}>
            Latitude: {building.latitude || "-"}
          </Text>
          <Text style={styles.detailMeta}>
            Longitude: {building.longitude || "-"}
          </Text>
        </View>

        <View style={styles.buildingActions}>
          <Pressable
            style={styles.warningSmallButton}
            onPress={() => onUpdateBuilding(building)}
          >
            <Text style={styles.warningSmallButtonText}>Update Gedung</Text>
          </Pressable>

          <Pressable
            style={styles.dangerSmallButton}
            onPress={() => onDeleteBuilding(building)}
          >
            <Text style={styles.dangerSmallButtonText}>Hapus Gedung</Text>
          </Pressable>
        </View>
      </Card>

      <Text style={styles.sectionTitle}>Ruangan di {building.name}</Text>

      {rooms.length === 0 ? (
         <Card>
    <Text style={styles.emptyText}>
      {searchQuery.trim()
        ? "Tidak ada ruangan yang cocok dengan pencarian."
        : "Belum ada ruangan pada gedung ini."}
    </Text>
  </Card>
      ) : (
        <FlatList
          scrollEnabled={false}
          data={rooms}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <RoomCard
              room={item}
              onUpdate={onUpdateRoom}
              onDelete={onDeleteRoom}
            />
          )}
        />
      )}
    </>
  );
}