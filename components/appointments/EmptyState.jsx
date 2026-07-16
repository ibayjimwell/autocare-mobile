import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

export default function EmptyState() {
  const router = useRouter();
  return (
    <View className="items-center py-20 px-10 rounded-[40px] border border-dashed border-border">
      <View className="w-20 h-20 rounded-full bg-card items-center justify-center mb-6">
        <Ionicons name="calendar-clear-outline" size={40} color="#666" />
      </View>
      <Text className="text-lg font-black text-foreground text-center">No active bookings</Text>
      <Text className="mt-2 text-center text-sm font-medium text-muted-foreground leading-5">
        Looks like your calendar is clear. Need a checkup or an oil change?
      </Text>
      <TouchableOpacity
        activeOpacity={0.8}
        className="mt-8 px-10 py-4 rounded-2xl bg-primary shadow-lg shadow-primary/20"
        onPress={() => router.push('/booking')}
      >
        <Text className="text-primary-foreground font-black uppercase tracking-widest text-xs">
          Book Appointment
        </Text>
      </TouchableOpacity>
    </View>
  );
}