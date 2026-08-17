import { TouchableOpacity, View, Text, Image } from 'react-native';
import { Car, ChevronRight } from 'lucide-react-native';

const VEHICLE_IMAGE =
  'https://images.pexels.com/photos/170811/pexels-photo-170811.jpeg?auto=compress&cs=tinysrgb&w=400';

export default function VehicleCard({ name, plate, year, isLast }) {
  return (
    <TouchableOpacity
      activeOpacity={0.7}
      className={`w-44 bg-card rounded-xl overflow-hidden border border-border ${!isLast ? 'mr-3' : ''}`}
    >
      <Image source={{ uri: VEHICLE_IMAGE }} className="w-full h-24" resizeMode="cover" />

      <View className="p-3">
        <View className="flex-row items-center justify-between">
          <Text className="text-base font-medium text-foreground flex-1 mr-1" numberOfLines={1}>
            {year} {name}
          </Text>
          <ChevronRight size={16} color="#C5C5C7" />
        </View>
        <View className="flex-row items-center mt-1">
          <Car size={12} color="#8E8E93" />
          <Text className="text-sm font-normal text-muted-foreground uppercase tracking-widest ml-1.5">
            {plate}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}