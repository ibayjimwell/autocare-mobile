import { View, Text } from 'react-native';

export default function BookingHeader() {
  return (
    <View className="px-4 pt-2 mb-4">
      <Text className="text-3xl font-bold tracking-tight text-foreground">
        Book <Text className="text-primary">Appointment</Text>
      </Text>
      <Text className="text-sm font-normal text-muted-foreground mt-2">
        Schedule your vehicle service in a few taps.
      </Text>
    </View>
  );
}