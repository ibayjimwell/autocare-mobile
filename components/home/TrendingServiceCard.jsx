import { TouchableOpacity, View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const SERVICE_ICONS = [
  "speedometer", "water", "disc", "car-wrench", "oil",
  "tire", "brake-pads", "engine", "car-wash", "wrench", "car-settings",
];

export default function TrendingServiceCard({ name, duration, price, rank, count, onPress }) {
  const iconName = SERVICE_ICONS[(rank - 1) % SERVICE_ICONS.length];
  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={onPress}
      className="flex-row justify-between items-center p-5 mb-4 rounded-3xl border border-border bg-card"
    >
      <View className="flex-row items-center flex-1">
        <View className="relative">
          <View className="w-12 h-12 rounded-2xl items-center justify-center mr-4 bg-background">
            <Ionicons name={iconName} size={22} color="#C1272D" />
          </View>
          <View className="absolute -top-1 -left-1 w-5 h-5 rounded-full bg-primary items-center justify-center">
            <Text className="text-[9px] font-black text-primary-foreground">#{rank}</Text>
          </View>
        </View>
        <View className="flex-1 ml-2">
          <Text className="text-base font-bold text-foreground" numberOfLines={1}>{name}</Text>
          <View className="flex-row items-center mt-0.5">
            <Text className="text-xs font-bold text-foreground/50">{duration}</Text>
            <View className="w-1 h-1 rounded-full mx-2 bg-foreground/30" />
            <Text className="text-[10px] font-black uppercase text-muted-foreground">
              {count} booking{count !== 1 ? 's' : ''}
            </Text>
          </View>
        </View>
      </View>
      <View className="items-end ml-2">
        <Text className="text-base font-black text-primary">{price}</Text>
        <Text className="text-[10px] font-bold uppercase tracking-tighter text-foreground/40">From</Text>
      </View>
    </TouchableOpacity>
  );
}