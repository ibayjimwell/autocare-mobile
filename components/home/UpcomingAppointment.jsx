import { View, Text, TouchableOpacity } from 'react-native';
import { Calendar, Clock, CheckCircle, ArrowRight } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { STATUS_CONFIG } from '../../utils/constants';
import { formatDate, formatTime, getServiceNames } from '../../utils/format';

export default function UpcomingAppointment({ appointment }) {
  const router = useRouter();

  if (!appointment) {
    return (
      <View className="bg-card rounded-xl mx-4 p-6 items-center">
        <Calendar size={32} color="#C5C5C7" />
        <Text className="text-center font-normal text-sm text-muted-foreground mt-3 mb-5">
          No active bookings.
        </Text>
        <TouchableOpacity
          className="w-full bg-primary rounded-xl py-3 items-center min-h-[44px]"
          onPress={() => router.push('/booking')}
        >
          <Text className="text-white font-semibold text-base">Book Now</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const status = STATUS_CONFIG[appointment.status] || STATUS_CONFIG.PENDING;

  return (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={() => router.push(`/tracking?appointmentId=${appointment.id}`)}
      className="bg-card rounded-xl mx-4 p-3 flex-row items-center border border-border"
    >
      {/* Left thumbnail — takes the place of the map thumbnail in the inspiration */}
      <View
        className="w-16 h-16 rounded-lg items-center justify-center mr-3"
        style={{ backgroundColor: status.color + '15' }}
      >
        <CheckCircle size={28} color={status.color} />
      </View>

      {/* Middle text block */}
      <View className="flex-1 mr-3">
        <Text
          className="text-xs font-semibold uppercase tracking-wider mb-0.5"
          style={{ color: status.color }}
        >
          {status.label}
        </Text>
        <Text className="text-base font-semibold text-foreground" numberOfLines={1}>
          {getServiceNames(appointment)}
        </Text>
        <Text className="text-sm font-normal text-muted-foreground mt-0.5" numberOfLines={1}>
          {appointment.vehicle?.make} {appointment.vehicle?.model}
        </Text>
        <View className="flex-row items-center mt-1.5">
          <Calendar size={12} color="#8E8E93" />
          <Text className="text-sm font-normal text-muted-foreground ml-1 mr-2.5">
            {formatDate(appointment.appointmentDate)}
          </Text>
          <Clock size={12} color="#8E8E93" />
          <Text className="text-sm font-normal text-muted-foreground ml-1">
            {formatTime(appointment.appointmentTime)}
          </Text>
        </View>
      </View>

      {/* Circular primary CTA — mirrors the round arrow button */}
      <View className="w-11 h-11 rounded-full bg-primary items-center justify-center min-h-[44px] min-w-[44px]">
        <ArrowRight size={20} color="#FFFFFF" />
      </View>
    </TouchableOpacity>
  );
}