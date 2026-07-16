import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter, Link } from 'expo-router';
import { STATUS_CONFIG } from '../../utils/constants';
import { formatDate, formatTime } from '../../utils/format';

export default function AppointmentSection({ title, appointments, statusKey }) {
  const router = useRouter();
  const status = STATUS_CONFIG[statusKey] || STATUS_CONFIG.PENDING;
  const color = status.color;

  if (appointments.length === 0) {
    return (
      <View className="px-6 mt-2">
        <View className="flex-row justify-between items-end mb-4 px-1">
          <Text className="text-lg font-heading font-black text-foreground">{title}</Text>
          <Link href="/appointments">
            <Text className="text-xs font-bold uppercase tracking-wider text-primary">View All</Text>
          </Link>
        </View>
        <View className="p-6 rounded-[28px] items-center border border-dashed border-border bg-card mb-3">
          <Ionicons name="checkmark-circle-outline" size={24} color="#666" />
          <Text className="text-center font-bold text-sm text-muted-foreground mt-2">No vehicles {title.toLowerCase()}.</Text>
        </View>
      </View>
    );
  }

  return (
    <View className="px-6 mt-2">
      <View className="flex-row justify-between items-end mb-4 px-1">
        <Text className="text-lg font-heading font-black text-foreground">{title}</Text>
        <Link href="/appointments">
          <Text className="text-xs font-bold uppercase tracking-wider text-primary">View All</Text>
        </Link>
      </View>
      {appointments.map(appt => (
        <TouchableOpacity
          key={appt.id}
          activeOpacity={0.8}
          onPress={() => router.push(`/tracking?appointmentId=${appt.id}`)}
          className="p-5 rounded-[28px] border border-border bg-card mb-3"
        >
          <View className="flex-row justify-between items-start mb-4">
            <View className="flex-row items-center flex-1">
              <View className="w-12 h-12 rounded-2xl items-center justify-center mr-4" style={{ backgroundColor: color + '20' }}>
                <MaterialCommunityIcons name={status.icon} size={26} color={color} />
              </View>
              <View className="flex-1 mr-2">
                <Text className="text-lg font-black text-foreground" numberOfLines={1}>{appt.serviceType?.name || 'Service'}</Text>
                <Text className="text-xs font-bold text-foreground/50">{appt.vehicle?.make} {appt.vehicle?.model}</Text>
              </View>
            </View>
            <View className="px-3 py-1 rounded-lg" style={{ backgroundColor: color + '20' }}>
              <Text className="text-[10px] font-black" style={{ color }}>{status.label}</Text>
            </View>
          </View>
          <View className="flex-row items-center justify-between pt-4 border-t border-border">
            <View className="flex-row">
              <View className="flex-row items-center mr-4">
                <Ionicons name="calendar-clear" size={14} color={color} />
                <Text className="text-[13px] ml-1.5 font-bold text-muted-foreground">{formatDate(appt.appointmentDate)}</Text>
              </View>
              <View className="flex-row items-center">
                <Ionicons name="time" size={14} color={color} />
                <Text className="text-[13px] ml-1.5 font-bold text-muted-foreground">{formatTime(appt.appointmentTime)}</Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={18} color="#666" />
          </View>
        </TouchableOpacity>
      ))}
    </View>
  );
}