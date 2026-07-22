import { View, Text } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

export default function TrackingHeader({ appointment }) {
  const isCancelled = appointment?.status === 'CANCELLED';
  return (
    <View className="mb-8 flex-row justify-between items-end">
      <View>
        <Text className="text-[10px] font-black uppercase tracking-[2px] text-foreground/40 mb-1">
          Tracking No.
        </Text>
        <Text className="text-3xl font-heading font-black text-foreground">
          {appointment?.trackingNumber || 'N/A'}
        </Text>
      </View>
      <View className="items-end">
        <View className={`px-4 py-1.5 rounded-full mb-1 ${isCancelled ? 'bg-destructive/20' : 'bg-primary/10'}`}>
          <Text className={`text-[10px] font-black uppercase tracking-widest ${isCancelled ? 'text-destructive' : 'text-primary'}`}>
            {appointment?.status || 'PENDING'}
          </Text>
        </View>
        <Text className="text-[11px] font-medium text-muted-foreground/50">Updated Just Now</Text>
      </View>
    </View>
  );
}