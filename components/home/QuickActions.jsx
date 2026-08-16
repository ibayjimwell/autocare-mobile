import { View, Text } from 'react-native';
import { Calendar, MapPin, Receipt } from 'lucide-react-native';
import ActionItem from './ActionItem';

export default function QuickActions() {
  return (
    <View className="mb-8">
      <Text className="text-lg font-semibold px-4 mb-2 text-foreground">Services</Text>
      <View className="bg-card rounded-xl mx-4 overflow-hidden">
        <ActionItem icon={Calendar} label="Booking" color="#C1272D" path="/booking" />
        <ActionItem icon={MapPin} label="Tracking" color="#6366f1" path="/tracking?appointmentId=dummy" />
        <ActionItem icon={Receipt} label="Payment" color="#10b981" path="/billing" isLast={true} />
      </View>
    </View>
  );
}