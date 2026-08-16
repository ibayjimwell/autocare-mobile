import { View, Text } from "react-native";
import { Car, CalendarCheck } from "lucide-react-native";

export default function StatsCards({ vehicles, visits }) {
  return (
    <View className="flex-row mx-4 gap-4 mb-6">
      {/* Widget-style Stacked Cards */}
      <View className="flex-1 bg-card rounded-xl p-4 items-start shadow-sm">
        <Car size={24} color="#C1272D" className="mb-2" />
        <Text className="text-2xl font-bold tracking-tight text-foreground">
          {vehicles}
        </Text>
        <Text className="text-sm font-normal text-muted-foreground mt-0.5">
          Vehicles
        </Text>
      </View>

      <View className="flex-1 bg-card rounded-xl p-4 items-start shadow-sm">
        <CalendarCheck size={24} color="#C1272D" className="mb-2" />
        <Text className="text-2xl font-bold tracking-tight text-foreground">
          {visits}
        </Text>
        <Text className="text-sm font-normal text-muted-foreground mt-0.5">
          Service Visits
        </Text>
      </View>
    </View>
  );
}