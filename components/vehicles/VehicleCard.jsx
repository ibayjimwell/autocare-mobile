import { View, Text, TouchableOpacity } from "react-native";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";

export default function VehicleCard({ vehicle, onEdit, onDelete }) {
  return (
    <View className="p-5 mb-4 rounded-3xl border border-border bg-card flex-row items-center">
      {/* Car Icon */}
      <View className="w-14 h-14 rounded-2xl items-center justify-center bg-primary/10 mr-4">
        <MaterialCommunityIcons name="car-hatchback" size={30} color="#C1272D" />
      </View>

      {/* Info */}
      <View className="flex-1">
        <Text className="text-lg font-heading font-black text-foreground">
          {vehicle.make} {vehicle.model}
        </Text>
        <View className="flex-row items-center mt-1">
          <Text className="text-[11px] font-bold uppercase tracking-widest py-0.5 px-2 rounded-md bg-background text-muted-foreground mr-2">
            {vehicle.plateNumber}
          </Text>
          {vehicle.year && (
            <Text className="text-xs font-bold text-foreground/40">
              • {vehicle.year}
            </Text>
          )}
        </View>
      </View>

      {/* Actions */}
      <View className="flex-row space-x-2">
        <TouchableOpacity
          onPress={onEdit}
          className="w-10 h-10 rounded-full items-center justify-center bg-background"
        >
          <Ionicons name="pencil-outline" size={18} color="#1A1A1A" />
        </TouchableOpacity>
        <TouchableOpacity
          onPress={onDelete}
          className="w-10 h-10 rounded-full items-center justify-center bg-destructive/10"
        >
          <Ionicons name="trash-outline" size={18} color="#EF4444" />
        </TouchableOpacity>
      </View>
    </View>
  );
}