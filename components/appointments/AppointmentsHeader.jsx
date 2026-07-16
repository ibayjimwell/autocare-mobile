import { View, Text } from 'react-native';

export default function AppointmentsHeader() {
  return (
    <View className="mb-6">
      <Text className="text-sm font-bold uppercase tracking-[2px] text-foreground/50">
        Upcoming
      </Text>
      <View className="h-1 w-8 rounded-full bg-primary mt-1" />
    </View>
  );
}