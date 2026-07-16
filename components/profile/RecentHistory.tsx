import { View, Text, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
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
      <View className="p-8 mb-10 rounded-[28px] border border-dashed border-border bg-card items-center">
        <Ionicons name="time-outline" size={32} color="#666" />
        <Text className="mt-3 text-sm font-bold text-muted-foreground/60">No completed services yet</Text>
      </View>
    );
  }

  return (
    <>
      {appointments.map((apt) => (
        <TouchableOpacity
          key={apt.id}
          activeOpacity={0.8}
          onPress={() => router.push(`/tracking?appointmentId=${apt.id}`)}
          className="p-5 mb-3 rounded-[28px] border border-border bg-card shadow-sm"
        >
          <View className="flex-row justify-between items-start">
            <View className="flex-1 mr-4">
              <View className="px-2 py-0.5 rounded-md bg-green-500/15 self-start mb-2">
                <Text className="text-[9px] font-black uppercase tracking-tight text-green-500">COMPLETED</Text>
              </View>
              <Text className="text-base font-bold text-foreground mb-1">
                {apt.serviceType?.name || 'Service'}
              </Text>
              <View className="flex-row items-center">
                <Ionicons name="calendar-outline" size={12} color="#666" />
                <Text className="text-xs font-medium ml-1 text-muted-foreground/60">
                  {formatDate(apt.appointmentDate)}
                </Text>
              </View>
              <Text className="text-[10px] font-bold mt-1 uppercase text-foreground/40">
                {apt.vehicle?.make} {apt.vehicle?.model}
              </Text>
            </View>
            <Text className="text-lg font-black text-primary">
              {formatPrice(apt.serviceType?.basePrice)}
            </Text>
          </View>
        </TouchableOpacity>
      ))}
    </>
  );
}