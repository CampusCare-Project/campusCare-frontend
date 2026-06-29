import { useEffect } from "react";
import { FlatList, Pressable, Text, View } from "react-native";
import type { BottomTabScreenProps } from "@react-navigation/bottom-tabs";

import { DashboardLayout } from "@/layouts/DashboardLayout";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { useReports } from "@/api/reports/hooks";
import type { MainTabParamList } from "@/app/router1";

type Props = BottomTabScreenProps<MainTabParamList, "Technician">;

export function TechnicianTasksScreen({ navigation }: Props) {
  const { items, fetchReports } = useReports();

  useEffect(() => {
    void fetchReports({ limit: 100 });
  }, []);

  return (
    <DashboardLayout title="Tugas Teknisi">
      <Text
        testID="technician-tasks-title"
        accessibilityLabel="technician-tasks-title"
        style={{
          fontSize: 24,
          fontWeight: "900",
          color: "#0F172A",
          marginBottom: 12,
        }}
      >
        Tugas Teknisi
      </Text>

      <FlatList
        scrollEnabled={false}
        data={items}
        keyExtractor={(i) => i.id}
        renderItem={({ item, index }) => (
          <Pressable
            testID={`technician-task-detail-button-${index}`}
            accessibilityLabel={`technician-task-detail-button-${index}`}
            onPress={() =>
              (navigation as any)
                .getParent()
                ?.navigate("ReportDetail", { id: item.id })
            }
          >
            <View
              testID={`technician-task-card-${index}`}
              accessibilityLabel={`technician-task-card-${index}`}
            >
              <Card>
                <Text
                  testID={`technician-task-title-${index}`}
                  accessibilityLabel={`technician-task-title-${index}`}
                  style={{ fontWeight: "900" }}
                >
                  {item.title}
                </Text>

                <Badge label={item.status} />

                <Text
                  testID={`technician-task-location-${index}`}
                  accessibilityLabel={`technician-task-location-${index}`}
                >
                  {item.locationText || "-"}
                </Text>
              </Card>
            </View>
          </Pressable>
        )}
      />
    </DashboardLayout>
  );
}