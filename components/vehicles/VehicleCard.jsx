import { View, Text, TouchableOpacity, Image } from "react-native";
import { Pencil, Trash2 } from "lucide-react-native";

const VEHICLE_IMAGE =
  'https://images.pexels.com/photos/170811/pexels-photo-170811.jpeg?auto=compress&cs=tinysrgb&w=400';

export default function VehicleCard({ vehicle, onEdit, onDelete }) {
  return (
    <View className="w-[48%] mb-4 bg-card rounded-xl overflow-hidden border border-border/50 shadow-sm">
      {/* Image hero */}
      <View className="h-[110px] w-full">
        <Image 
          source={{ uri: VEHICLE_IMAGE }} 
          className="w-full h-full" 
          resizeMode="cover" 
        />

        {/* Floating circular edit action */}
        <TouchableOpacity
          onPress={onEdit}
          activeOpacity={0.7}
          className="absolute top-2 right-2 min-h-[44px] min-w-[44px] items-center justify-center"
        >
          <View className="w-9 h-9 rounded-full bg-black/30 border border-white/30 items-center justify-center">
            <Pencil size={16} color="#FFFFFF" />
          </View>
        </TouchableOpacity>
      </View>

      {/* White spec body */}
      <View className="p-3">
        <Text className="text-base font-semibold text-foreground" numberOfLines={1}>
          {vehicle.make} {vehicle.model}
        </Text>
        <Text className="text-sm font-normal text-muted-foreground mt-0.5">
          {vehicle.year ? `${vehicle.year} Model` : "Year not set"}
        </Text>

        {/* Bottom row */}
        <View className="flex-row items-center justify-between mt-3">
          <View className="px-2 py-1 rounded-md bg-secondary">
            <Text className="text-[11px] font-semibold uppercase tracking-wide text-secondary-foreground">
              {vehicle.plateNumber}
            </Text>
          </View>
          <TouchableOpacity
            onPress={onDelete}
            activeOpacity={0.7}
            className="min-h-[44px] min-w-[44px] items-center justify-center -mr-2 -mb-1"
          >
            <View className="w-9 h-9 rounded-full bg-primary/10 items-center justify-center">
              <Trash2 size={16} color="#C1272D" />
            </View>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}