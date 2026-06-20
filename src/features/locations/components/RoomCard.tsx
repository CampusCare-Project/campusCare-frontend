import { Pressable, Text, View } from "react-native";
import type { Room } from "@/api/locations/types";
import { styles } from "../styles";

type Props = {
  room: Room;
  onUpdate: (room: Room) => void;
  onDelete: (room: Room) => void;
};

export function RoomCard({ room, onUpdate, onDelete }: Props) {
  return (
    <View style={styles.roomCard}>
      <View style={styles.roomHeader}>
        <View style={{ flex: 1 }}>
          <Text style={styles.roomName}>{room.name}</Text>
          <Text style={styles.roomMeta}>Kode: {room.code}</Text>

          {room.floorName ? (
            <Text style={styles.roomMeta}>Lantai: {room.floorName}</Text>
          ) : null}

          {room.description ? (
            <Text style={styles.roomDescription}>{room.description}</Text>
          ) : null}
        </View>

        <View style={styles.roomActionColumn}>
          <Pressable
            style={styles.updateMiniButton}
            onPress={() => onUpdate(room)}
          >
            <Text style={styles.updateMiniButtonText}>Update</Text>
          </Pressable>

          <Pressable
            style={styles.deleteMiniButton}
            onPress={() => onDelete(room)}
          >
            <Text style={styles.deleteMiniButtonText}>Hapus</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}