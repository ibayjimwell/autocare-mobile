import { View, Text, TouchableOpacity } from 'react-native';
import { ChevronRight, Calendar, Clock, Search, Settings, CheckCircle, XCircle } from 'lucide-react-native';
import { useRouter, Link } from 'expo-router';
import { STATUS_CONFIG } from '../../utils/constants';
import { formatDate, formatTime, getServiceNames } from '../../utils/format';

const getStatusIcon = (statusKey, color) => {
  const props = { size: 18, color };
  switch (statusKey) {
    case 'WAITING_FOR_APPROVAL': return <Clock {...props} />;
    case 'UNDER_INSPECTION': return <Search {...props} />;
    case 'IN_PROGRESS': return <Settings {...props} />;
    case 'PENDING': return <Calendar {...props} />;
    case 'COMPLETED': return <CheckCircle {...props} />;
    case 'CANCELLED': return <XCircle {...props} />;
    default: return <Calendar {...props} />;
  }
};

export default function AppointmentSection({ title, appointments, statusKey, limit = 4, showViewAll = true }) {
  const router = useRouter();
  const status = STATUS_CONFIG[statusKey] || STATUS_CONFIG.PENDING;
  const color = status.color;

  if (appointments.length === 0) {
    return (
      <View className="mb-8">
        <View className="flex-row justify-between items-end mb-2 px-4">
          <Text className="text-lg font-semibold text-foreground">{title}</Text>
          {showViewAll && (
            <Link href="/appointments" asChild>
              <TouchableOpacity className="min-h-[44px] justify-center">
                <Text className="text-sm font-medium text-primary">View All</Text>
              </TouchableOpacity>
            </Link>
          )}
        </View>
        <View className="bg-card rounded-xl mx-4 p-4 py-8 items-center justify-center">
          <CheckCircle size={32} color="#C5C5C7" />
          <Text className="text-center font-normal text-sm text-muted-foreground mt-3">
            No {title.toLowerCase()} appointments.
          </Text>
        </View>
      </View>
    );
  }

  const displayAppointments = limit ? appointments.slice(0, limit) : appointments;

  return (
    <View className="mb-8">
      <View className="flex-row justify-between items-end mb-2 px-4">
        <Text className="text-lg font-semibold text-foreground">{title}</Text>
        {showViewAll && (
          <Link href="/appointments" asChild>
            <TouchableOpacity className="min-h-[44px] justify-center">
              <Text className="text-sm font-medium text-primary">View All</Text>
            </TouchableOpacity>
          </Link>
        )}
      </View>

      <View className="bg-card rounded-xl mx-4 overflow-hidden">
        {displayAppointments.map((appt, index) => {
          const isLast = index === displayAppointments.length - 1;

          return (
            <TouchableOpacity
              key={appt.id}
              activeOpacity={0.7}
              onPress={() => router.push(`/tracking?appointmentId=${appt.id}`)}
              className="bg-card"
            >
              <View className={`flex-row items-center justify-between py-3 pr-4 ml-4 min-h-[60px] ${!isLast ? 'border-b border-border' : ''}`}>

                <View className="flex-row items-center flex-1 pr-2">
                  <View className="w-10 h-10 rounded-lg items-center justify-center mr-3" style={{ backgroundColor: color + '15' }}>
                    {getStatusIcon(statusKey, color)}
                  </View>

                  <View className="flex-1">
                    <Text className="text-base font-medium text-foreground" numberOfLines={1}>
                      {getServiceNames(appt)}
                    </Text>
                    <View className="flex-row items-center mt-1">
                      <Text className="text-sm font-normal text-muted-foreground">
                        {formatDate(appt.appointmentDate)}
                      </Text>
                      <Text className="text-sm font-normal text-muted-foreground mx-1">•</Text>
                      <Text className="text-sm font-normal text-muted-foreground">
                        {formatTime(appt.appointmentTime)}
                      </Text>
                    </View>
                  </View>
                </View>

                <View className="flex-row items-center">
                  <Text className="text-sm font-normal text-muted-foreground mr-2">
                    {appt.vehicle?.model}
                  </Text>
                  <ChevronRight size={20} color="#C5C5C7" />
                </View>

              </View>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}