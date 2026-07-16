import { View, Text } from 'react-native';

export default function BookingHeader() {
  return (
    <View className="mb-8">
      <Text className="text-sm font-bold uppercase tracking-[2px] text-foreground/50">
        Service Center
      </Text>
      <Text className="text-3xl font-heading font-black text-foreground">
        Book <Text className="text-primary">Appointment</Text>
      </Text>
    </View>
  );
}