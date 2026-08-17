import { TouchableOpacity, View, Text } from 'react-native';
import { Gauge, Droplets, Disc, Wrench, Fuel, CircleDashed, Wrench as Hammer, Settings, ChevronRight } from 'lucide-react-native';

const SERVICE_ICONS = [Gauge, Droplets, Disc, Wrench, Fuel, CircleDashed, Hammer, Settings];

export default function TrendingServiceCard({ name, duration, price, rank, count, onPress, isLast }) {
  const IconComponent = SERVICE_ICONS[(rank - 1) % SERVICE_ICONS.length];

  return (
    <TouchableOpacity activeOpacity={0.7} onPress={onPress} className="bg-card">
      <View className={`flex-row items-center justify-between py-3 pr-4 ml-4 min-h-[60px] ${!isLast ? 'border-b border-border' : ''}`}>

        <View className="flex-row items-center flex-1">
          <View className="w-8 h-8 rounded-lg items-center justify-center bg-secondary mr-3">
            <IconComponent size={18} color="#000000" />
          </View>

          <View className="flex-1 pr-2">
            <Text className="text-base font-medium text-foreground" numberOfLines={1}>
              {name}
            </Text>
            <Text className="text-sm font-normal text-muted-foreground mt-0.5">
              {price} • {duration}
            </Text>
          </View>
        </View>

        <View className="flex-row items-center">
          <View className="bg-secondary rounded-full px-2 py-0.5 mr-2">
            <Text className="text-xs font-semibold text-muted-foreground">
              #{rank}
            </Text>
          </View>
          <ChevronRight size={20} color="#C5C5C7" />
        </View>

      </View>
    </TouchableOpacity>
  );
}