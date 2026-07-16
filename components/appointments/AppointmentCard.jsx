import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { formatDate, formatTime } from '../../utils/format';
import { getStatusConfig } from '../../utils/appointments';

export default function AppointmentCard({ appointment }) {
  const router = useRouter();
  const statusConfig = getStatusConfig(appointment.status);
  const iconColor = statusConfig.color;
  const badgeBg = statusConfig.color + '20'; // add opacity

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={() => router.push(`/tracking?appointmentId=${appointment.id}`)}
      className="p-5 mb-5 rounded-[28px] border border-border bg-card shadow-sm"
    >
      {/* Top Row */}
      <View className="flex-row justify-between items-start mb-4">
        <View className="flex-row items-center flex-1">
          <View
            className="w-12 h-12 rounded-2xl items-center justify-center mr-4"
            style={{ backgroundColor: badgeBg }}
          >
            <MaterialCommunityIcons name={statusConfig.icon} size={26} color={iconColor} />
          </View>
          <View className="flex-1 mr-2">
            <Text className="text-lg font-heading font-black text-foreground" numberOfLines={1}>
              {appointment.serviceType?.name || 'Service'}
            </Text>
            <Text className="text-xs font-bold text-foreground/50">
              {appointment.vehicle?.make} {appointment.vehicle?.model}
            </Text>
          </View>
        </View>

        {/* Status Badge */}
        <View className="px-3 py-1 rounded-lg" style={{ backgroundColor: badgeBg }}>
          <Text className="text-[10px] font-black" style={{ color: iconColor }}>
            {statusConfig.label}
          </Text>
        </View>
      </View>

      {/* Bottom Row: Date + Time */}
      <View className="flex-row items-center justify-between pt-4 border-t border-border">
        <View className="flex-row items-center flex-1">
          <View className="flex-row items-center mr-4">
            <Ionicons name="calendar-clear" size={14} color={iconColor} />
            <Text className="text-[13px] ml-1.5 font-bold text-muted-foreground">
              {formatDate(appointment.appointmentDate)}
            </Text>
          </View>
          <View className="flex-row items-center">
            <Ionicons name="time" size={14} color={iconColor} />
            <Text className="text-[13px] ml-1.5 font-bold text-muted-foreground">
              {formatTime(appointment.appointmentTime)}
            </Text>
          </View>
        </View>
        <Ionicons name="chevron-forward" size={18} color="#666" />
      </View>
    </TouchableOpacity>
  );
}