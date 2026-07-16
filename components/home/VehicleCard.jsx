import { TouchableOpacity, View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function VehicleCard({ name, plate, year }) {
  return (
    <TouchableOpacity
      activeOpacity={0.8}
      className="mr-4 p-5 rounded-[28px] w-44 h-32 justify-between border border-border bg-card"
    >
      <View className="w-10 h-10 rounded-xl items-center justify-center bg-primary/10">
        <Ionicons name="car" size={20} color="#C1272D" />
      </View>
      <View>
        <Text className="text-sm font-bold text-foreground" numberOfLines={1}>{name}</Text>
        <Text className="text-[10px] font-bold uppercase tracking-widest text-foreground/50">{plate}</Text>
      </View>
    </TouchableOpacity>
  );
}