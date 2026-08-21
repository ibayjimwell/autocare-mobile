import { View, Text, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { CalendarDays, ArrowRight } from 'lucide-react-native';

import { useTheme } from '../../context/ThemeContext';

export default function EmptyState() {
  const router = useRouter();
  const { theme } = useTheme();

  return (
    <View className="bg-card rounded-2xl p-7 border border-border items-center mt-2">
      <View className="w-14 h-14 rounded-full bg-primary/10 items-center justify-center">
        <CalendarDays
          size={25}
          color={theme.primary}
          strokeWidth={2}
        />
      </View>

      <Text
        className="text-lg font-semibold mt-4 text-center"
        style={{ color: theme.text }}
      >
        No active bookings
      </Text>

      <Text
        className="text-sm text-center mt-1 leading-5"
        style={{ color: theme.textSecondary }}
      >
        Looks like your calendar is clear. Need a checkup or an oil change?
      </Text>

      <TouchableOpacity
        activeOpacity={0.8}
        onPress={() => router.push('/booking')}
        className="min-h-[48px] px-5 rounded-xl bg-primary mt-6 flex-row items-center justify-center"
      >
        <Text className="text-sm font-semibold text-white">
          Book Appointment
        </Text>

        <ArrowRight
          size={17}
          color="#FFFFFF"
          style={{ marginLeft: 8 }}
        />
      </TouchableOpacity>
    </View>
  );
}