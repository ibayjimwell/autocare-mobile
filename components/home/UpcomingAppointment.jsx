import { View, Text, TouchableOpacity } from 'react-native';
import { Calendar, ChevronRight, CheckCircle, Clock } from 'lucide-react-native';
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
      className="bg-card rounded-xl mx-4 p-4 shadow-sm"
    >
      <View className="flex-row justify-between items-start mb-4">
        <View className="flex-1 mr-4">
          <Text className="text-sm font-medium text-muted-foreground mb-1 uppercase tracking-wider" style={{ color: status.color }}>
            {status.label}
          </Text>
          <Text className="text-xl font-semibold text-foreground" numberOfLines={1}>
            {getServiceNames(appointment)}
          </Text>
          <Text className="text-base font-normal text-muted-foreground mt-1">
            {appointment.vehicle?.make} {appointment.vehicle?.model}
          </Text>
        </View>
        <View className="w-12 h-12 rounded-full items-center justify-center bg-secondary">
          <CheckCircle size={24} color={status.color} />
        </View>
      </View>
      
      <View className="flex-row items-center justify-between pt-4 border-t border-border">
        <View className="flex-row items-center">
          <View className="flex-row items-center mr-4">
            <Calendar size={16} color="#8E8E93" />
            <Text className="text-sm ml-2 font-medium text-foreground">
              {formatDate(appointment.appointmentDate)}
            </Text>
          </View>
          <View className="flex-row items-center">
            <Clock size={16} color="#8E8E93" />
            <Text className="text-sm ml-2 font-medium text-foreground">
              {formatTime(appointment.appointmentTime)}
            </Text>
          </View>
        </View>
        <ChevronRight size={20} color="#C5C5C7" />
      </View>
    </TouchableOpacity>
  );
}