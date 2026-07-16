import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { STATUS_CONFIG } from '../../utils/constants';
import { formatDate, formatTime } from '../../utils/format';

export default function UpcomingAppointment({ appointment }) {
  const router = useRouter();
  if (!appointment) {
    return (
      <View className="p-8 rounded-[28px] items-center border border-dashed border-border bg-card">
        <View className="w-16 h-16 rounded-full bg-muted items-center justify-center mb-4">
          <Ionicons name="calendar-outline" size={32} color="#666" />
        </View>
        <Text className="text-center font-bold text-muted-foreground mb-4">No active bookings.</Text>
        <TouchableOpacity
          className="px-8 py-3 rounded-2xl bg-primary"
          onPress={() => router.push('/booking')}
        >
          <Text className="text-primary-foreground font-black text-xs uppercase tracking-widest">Book Now</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const status = STATUS_CONFIG[appointment.status] || STATUS_CONFIG.PENDING;
  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={() => router.push(`/tracking?appointmentId=${appointment.id}`)}
      className="p-5 rounded-[28px] border border-border bg-card"
    >
      <View className="flex-row justify-between items-start mb-4">
        <View className="flex-row items-center flex-1">
          <View className="w-12 h-12 rounded-2xl items-center justify-center mr-4" style={{ backgroundColor: status.color + '20' }}>
            <MaterialCommunityIcons name={status.icon} size={26} color={status.color} />
          </View>
          <View className="flex-1 mr-2">
            <Text className="text-lg font-black text-foreground" numberOfLines={1}>{appointment.serviceType?.name || 'Service'}</Text>
            <Text className="text-xs font-bold text-foreground/50">{appointment.vehicle?.make} {appointment.vehicle?.model}</Text>
          </View>
        </View>
        <View className="px-3 py-1 rounded-lg" style={{ backgroundColor: status.color + '20' }}>
          <Text className="text-[10px] font-black" style={{ color: status.color }}>{status.label}</Text>
        </View>
      </View>
      <View className="flex-row items-center justify-between pt-4 border-t border-border">
        <View className="flex-row">
          <View className="flex-row items-center mr-4">
            <Ionicons name="calendar-clear" size={14} color={status.color} />
            <Text className="text-[13px] ml-1.5 font-bold text-muted-foreground">{formatDate(appointment.appointmentDate)}</Text>
          </View>
          <View className="flex-row items-center">
            <Ionicons name="time" size={14} color={status.color} />
            <Text className="text-[13px] ml-1.5 font-bold text-muted-foreground">{formatTime(appointment.appointmentTime)}</Text>
          </View>
        </View>
        <Ionicons name="chevron-forward" size={18} color="#666" />
      </View>
    </TouchableOpacity>
  );
}