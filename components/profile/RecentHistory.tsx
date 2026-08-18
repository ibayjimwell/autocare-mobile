import { View, Text, TouchableOpacity } from "react-native";
import { Clock, ChevronRight } from "lucide-react-native";
import { router } from "expo-router";
import { formatDate, formatPrice } from "../../utils/format";

interface AppointmentItem {
  id: string;
  serviceType?: { name: string; basePrice: number };
  appointmentDate?: string;
  vehicle?: { make: string; model: string };
}

export default function RecentHistory({ appointments }: { appointments: AppointmentItem[] }) {
  if (appointments.length === 0) {
    return (
      <View className="bg-card mx-4 rounded-xl p-6 items-center justify-center mb-6 min-h-[100px]">
        <Clock size={32} color="#8E8E93" />
        <Text className="mt-3 text-sm font-normal text-muted-foreground">
          No completed services yet
        </Text>
      </View>
    );
  }

  return (
    // "Available Near You" content slot, standardized as an iOS grouped list
    <View className="bg-card mx-4 rounded-xl overflow-hidden mb-6">
      {appointments.map((apt, index) => (
        <TouchableOpacity
          key={apt.id}
          activeOpacity={0.7}
          onPress={() => router.push(`/tracking?appointmentId=${apt.id}`)}
          className="pl-4 bg-card"
        >
          {/* Apply bottom border to all except the last item */}
          <View className={`flex-row justify-between items-center py-3 pr-4 min-h-[60px] ${index !== appointments.length - 1 ? "border-b border-border" : ""}`}>

            {/* Title & Meta Info */}
            <View className="flex-1 justify-center pr-3">
              <Text className="text-base font-semibold text-foreground mb-1">
                {apt.serviceType?.name || 'Service'}
              </Text>
              <Text className="text-sm font-normal text-muted-foreground" numberOfLines={1}>
                {formatDate(apt.appointmentDate)} • {apt.vehicle?.make} {apt.vehicle?.model}
              </Text>
            </View>

            {/* Price & Status */}
            <View className="items-end justify-center ml-2">
              <Text className="text-base font-semibold text-foreground mb-1">
                {formatPrice(apt.serviceType?.basePrice)}
              </Text>
              <Text className="text-xs font-medium text-[#34C759]">
                Completed
              </Text>
            </View>

            {/* Navigation Chevron */}
            <ChevronRight size={20} color="#C7C7CC" className="ml-2" />
          </View>
        </TouchableOpacity>
      ))}
    </View>
  );
}