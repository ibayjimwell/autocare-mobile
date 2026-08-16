import { TouchableOpacity, View, Text } from 'react-native';
import { Car, ChevronRight } from 'lucide-react-native';

export default function VehicleCard({ name, plate, year, isLast }) {
  return (
    <TouchableOpacity activeOpacity={0.7} className="bg-card">
      <View className={`flex-row items-center justify-between py-3 pr-4 ml-4 min-h-[44px] ${!isLast ? 'border-b border-border' : ''}`}>
        <View className="flex-row items-center flex-1">
          <View className="w-8 h-8 rounded-lg items-center justify-center bg-secondary mr-3">
            <Car size={18} color="#000000" />
          </View>
          <View>
            <Text className="text-base font-normal text-foreground" numberOfLines={1}>
              {year} {name}
            </Text>
            <Text className="text-sm font-normal text-muted-foreground uppercase tracking-widest mt-0.5">
              {plate}
            </Text>
          </View>
        </View>
        <ChevronRight size={20} color="#C5C5C7" />
      </View>
    </TouchableOpacity>
  );
}