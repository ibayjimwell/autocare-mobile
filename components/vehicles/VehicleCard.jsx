import { View, Text, TouchableOpacity, Image } from 'react-native';
import { CarFront, Pencil, Trash2 } from 'lucide-react-native';

export default function VehicleCard({ vehicle, onEdit, onDelete }) {
  return (
    <View className="mb-4 w-[48%] overflow-hidden rounded-xl border border-border bg-card shadow-sm">
      <View className="relative h-[132px] bg-[#202126]">
        {vehicle.imageUrl ? (
          <Image source={{ uri: vehicle.imageUrl }} className="h-full w-full" resizeMode="cover"
            accessibilityLabel={`${vehicle.make} ${vehicle.model} photo`} />
        ) : (
          <View className="h-full items-center justify-center">
            <CarFront size={45} color="#FFFFFF" strokeWidth={1.25} />
            <Text className="mt-2 text-[11px] text-white/60">No photo added</Text>
          </View>
        )}
        <TouchableOpacity onPress={onEdit} accessibilityLabel={`Edit ${vehicle.make} ${vehicle.model}`}
          className="absolute right-2 top-2 h-11 w-11 items-center justify-center rounded-full bg-black/55" activeOpacity={0.75}>
          <Pencil size={18} color="#FFFFFF" />
        </TouchableOpacity>
      </View>
      <View className="p-3">
        <Text className="text-base font-semibold text-foreground" numberOfLines={2}>{vehicle.make} {vehicle.model}</Text>
        <Text className="mt-1 text-xs text-muted-foreground">{vehicle.year ? `${vehicle.year} Model` : 'Year not set'}</Text>
        <View className="mt-3 flex-row items-center justify-between">
          <View className="min-w-0 flex-1 rounded-md bg-secondary px-2 py-1">
            <Text className="text-[11px] font-semibold uppercase tracking-wide text-secondary-foreground" numberOfLines={1}>{vehicle.plateNumber}</Text>
          </View>
          <TouchableOpacity onPress={onDelete} accessibilityLabel={`Remove ${vehicle.make} ${vehicle.model}`}
            className="ml-1 h-11 w-11 items-center justify-center" activeOpacity={0.7}>
            <Trash2 size={18} color="#C1272D" />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}
