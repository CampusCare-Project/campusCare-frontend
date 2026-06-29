import { Pressable, Text, View } from "react-native";
import type { Room } from "@/api/locations/types";
import { styles } from "../styles";

type Props = {
  room: Room;
   index: number;
  onUpdate: (room: Room) => void;
  onDelete: (room: Room) => void;
};

export function RoomCard({ room,index, onUpdate, onDelete }: Props) {
  return (
    <View
      testID={`room-card-${index}`}
      accessibilityLabel={`room-card-${index}`}
    style={styles.roomCard}>
      <View style={styles.roomHeader}>
        <View style={{ flex: 1 }}>
          <Text 
                      testID={`room-name-${index}`}
            accessibilityLabel={`room-name-${index}`}
          style={styles.roomName}>{room.name}</Text>
          <Text 
              testID={`room-code-${index}`}
            accessibilityLabel={`room-code-${index}`}
          style={styles.roomMeta}>Kode: {room.code}</Text>

          {room.floorName ? (
            <Text
              testID={`room-floor-${index}`}
              accessibilityLabel={`room-floor-${index}`}
            style={styles.roomMeta}>Lantai: {room.floorName}</Text>
          ) : null}

          {room.description ? (
            <Text
                          testID={`room-description-${index}`}
              accessibilityLabel={`room-description-${index}`}
            style={styles.roomDescription}>{room.description}</Text>
          ) : null}
        </View>

        <View style={styles.roomActionColumn}>
          <Pressable
             testID={`room-update-button-${index}`}
            accessibilityLabel={`room-update-button-${index}`}
            style={styles.updateMiniButton}
            onPress={() => onUpdate(room)}
          >
            <Text style={styles.updateMiniButtonText}>Update</Text>
          </Pressable>

          <Pressable
               testID={`room-delete-button-${index}`}
            accessibilityLabel={`room-delete-button-${index}`}
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