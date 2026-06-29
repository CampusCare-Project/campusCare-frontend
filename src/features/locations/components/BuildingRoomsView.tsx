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
          <Pressable
                      testID="building-rooms-back-button"
            accessibilityLabel="building-rooms-back-button"
          style={styles.backButton} onPress={onBack}>
            <Text style={styles.backButtonText}>← Kembali</Text>
          </Pressable>

          <Pressable
                      testID="room-create-button"
            accessibilityLabel="room-create-button"
            style={styles.primarySmallButton}
            onPress={() => onCreateRoom(building)}
          >
            <Text style={styles.primarySmallButtonText}>+ Ruangan</Text>
          </Pressable>
        </View>

        <View 
               testID="building-detail-box"
          accessibilityLabel="building-detail-box"
        style={styles.buildingDetailBox}>
          <Text
           testID="building-detail-title"
            accessibilityLabel="building-detail-title"
          style={styles.detailTitle}>{building.name}</Text>
          <Text 
           testID="building-detail-code"
            accessibilityLabel="building-detail-code"
          style={styles.detailMeta}>Kode: {building.code}</Text>
          <Text 
            testID="building-detail-address"
            accessibilityLabel="building-detail-address"
          style={styles.detailMeta}>
            Alamat: {building.address || "-"}
          </Text>
          <Text 
                   testID="building-detail-latitude"
            accessibilityLabel="building-detail-latitude"
          style={styles.detailMeta}>
            Latitude: {building.latitude || "-"}
          </Text>
          <Text 
               testID="building-detail-longitude"
            accessibilityLabel="building-detail-longitude"
          style={styles.detailMeta}>
            Longitude: {building.longitude || "-"}
          </Text>
        </View>

        <View style={styles.buildingActions}>
          <Pressable
               testID="building-detail-update-button"
            accessibilityLabel="building-detail-update-button"
            style={styles.warningSmallButton}
            onPress={() => onUpdateBuilding(building)}
          >
            <Text style={styles.warningSmallButtonText}>Update Gedung</Text>
          </Pressable>

          <Pressable
                      testID="building-detail-delete-button"
            accessibilityLabel="building-detail-delete-button"
            style={styles.dangerSmallButton}
            onPress={() => onDeleteBuilding(building)}
          >
            <Text style={styles.dangerSmallButtonText}>Hapus Gedung</Text>
          </Pressable>
        </View>
      </Card>

      <Text 
         testID="building-rooms-title"
        accessibilityLabel="building-rooms-title"
      style={styles.sectionTitle}>Ruangan di {building.name}</Text>

      {rooms.length === 0 ? (
         <Card>
    <Text 
     testID="room-empty-text"
            accessibilityLabel="room-empty-text"
    style={styles.emptyText}>
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
          renderItem={({ item ,index}) => (
            <RoomCard
              room={item}
              index={index}
              onUpdate={onUpdateRoom}
              onDelete={onDeleteRoom}
            />
          )}
        />
      )}
    </>
  );
}