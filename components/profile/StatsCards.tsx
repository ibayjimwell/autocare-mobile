import { View, Text } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";

interface StatsCardsProps {
  vehicles: number;
  visits: number;
}

export default function StatsCards({ vehicles, visits }: StatsCardsProps) {
  return (
    <View className="flex-row gap-4 mb-10">
      <View className="flex-1 p-6 rounded-[32px] items-center border border-border bg-card">
        <MaterialCommunityIcons name="car-multiple" size={24} color="#C1272D" />
        <Text className="text-3xl font-black mt-2 text-foreground">{vehicles}</Text>
        <Text className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/40">Vehicles</Text>
      </View>
      <View className="flex-1 p-6 rounded-[32px] items-center border border-border bg-card">
        <MaterialCommunityIcons name="calendar-check-outline" size={24} color="#C1272D" />
        <Text className="text-3xl font-black mt-2 text-foreground">{visits}</Text>
        <Text className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/40">Service Visits</Text>
      </View>
    </View>
  );
}