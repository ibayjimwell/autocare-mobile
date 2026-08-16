import { View, Text, TouchableOpacity } from "react-native";
import { Car, Pencil, Trash2 } from "lucide-react-native";

export default function VehicleCard({ vehicle, onEdit, onDelete, isLast }) {
  return (
    <View className="flex-row items-center pl-4 bg-card">
      {/* Icon Area */}
      <View className="w-10 h-10 rounded-lg items-center justify-center bg-secondary mr-3">
        <Car size={20} color="#000000" />
      </View>

      {/* Content & Actions (Inset Border) */}
      <View className={`flex-1 flex-row items-center py-3 pr-4 min-h-[60px] ${!isLast ? "border-b border-border" : ""}`}>
        
        {/* Info Area */}
        <View className="flex-1 justify-center">
          <Text className="text-base font-semibold text-foreground">
            {vehicle.make} {vehicle.model}
          </Text>
          <Text className="text-sm font-normal text-muted-foreground mt-0.5">
            {vehicle.plateNumber}
            {vehicle.year ? ` • ${vehicle.year}` : ""}
          </Text>
        </View>

        {/* Action Area */}
        <View className="flex-row items-center ml-2">
          <TouchableOpacity
            onPress={onEdit}
            activeOpacity={0.7}
            className="items-center justify-center min-h-[44px] min-w-[44px]"
          >
            <Pencil size={20} color="#8E8E93" />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={onDelete}
            activeOpacity={0.7}
            className="items-center justify-center min-h-[44px] min-w-[44px] ml-1"
          >
            <Trash2 size={20} color="#C1272D" />
          </TouchableOpacity>
        </View>
        
      </View>
    </View>
  );
}