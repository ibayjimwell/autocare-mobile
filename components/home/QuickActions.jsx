import { View, Text } from 'react-native';
import ActionItem from './ActionItem';

export default function QuickActions() {
  return (
    <View className="px-6 mt-8">
      <Text className="text-lg font-heading font-black mb-4 px-1 text-foreground">Services</Text>
      <View className="flex-row justify-between">
        <ActionItem icon="calendar" label="Booking" color="#C1272D" path="/booking" />
        <ActionItem icon="location" label="Tracking" color="#6366f1" path="/tracking?appointmentId=dummy" />
        <ActionItem icon="receipt" label="Payment" color="#10b981" path="/billing" />
      </View>
    </View>
  );
}