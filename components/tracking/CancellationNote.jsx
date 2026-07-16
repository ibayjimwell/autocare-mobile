import { View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function CancellationNote({ notes }) {
  return (
    <View className="p-8 rounded-[32px] mb-8 border border-destructive/30 bg-destructive/5 items-center">
      <Ionicons name="alert-circle" size={40} color="#EF4444" />
      <Text className="text-xl font-heading font-black mt-3 mb-1 text-destructive">Order Cancelled</Text>
      <Text className="text-sm text-center font-medium leading-5 text-foreground/70">{notes || 'This appointment was cancelled.'}</Text>
    </View>
  );
}