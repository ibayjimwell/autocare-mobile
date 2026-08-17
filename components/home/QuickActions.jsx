import { View, Text, TouchableOpacity } from 'react-native';
import { Calendar, MapPin, Receipt } from 'lucide-react-native';
import { Link } from 'expo-router';
import ActionItem from './ActionItem';

export default function QuickActions() {
  return (
    <View className="mb-8">
      <View className="flex-row justify-between items-end mb-2 px-4">
        <Text className="text-lg font-semibold text-foreground">Services</Text>
        <Link href="/services" asChild>
          <TouchableOpacity className="min-h-[44px] justify-center">
            <Text className="text-sm font-medium text-primary">See All</Text>
          </TouchableOpacity>
        </Link>
      </View>

      {/* Horizontal tiles — mirrors the "Top Brands" row */}
      <View className="flex-row px-4">
        <ActionItem icon={Calendar} label="Booking" color="#C1272D" path="/booking" />
        <ActionItem icon={MapPin} label="Tracking" color="#6366f1" path="/tracking?appointmentId=dummy" />
        <ActionItem icon={Receipt} label="Payment" color="#10b981" path="/billing" isLast={true} />
      </View>
    </View>
  );
}