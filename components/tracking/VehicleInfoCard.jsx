import { View, Text } from 'react-native';
import {
  CalendarDays,
  CarFront,
  Clock3,
  FileText,
} from 'lucide-react-native';
import {
  formatDate,
  formatTime12h,
  getServiceNames,
} from '../../utils/format';

export default function VehicleInfoCard({ appointment }) {
  return (
    <View
      className="bg-card rounded-xl mb-6 border border-border overflow-hidden"
      style={{
        shadowColor: '#000',
        shadowOpacity: 0.04,
        shadowRadius: 10,
        shadowOffset: { width: 0, height: 3 },
        elevation: 1,
      }}
    >
      <View className="px-4 py-4">
        <View className="flex-row items-center">
          <View className="w-11 h-11 rounded-full bg-primary/10 items-center justify-center mr-3">
            <CarFront size={21} color="#C1272D" strokeWidth={2} />
          </View>

          <View className="flex-1">
            <Text className="text-lg font-semibold text-foreground">
              {getServiceNames(appointment)}
            </Text>

            <Text className="text-sm text-muted-foreground mt-1">
              {appointment?.vehicle?.make}{' '}
              {appointment?.vehicle?.model}
            </Text>

            <Text className="text-xs text-muted-foreground mt-0.5">
              {appointment?.vehicle?.plateNumber}
            </Text>
          </View>
        </View>
      </View>

      <View className="ml-4 border-t border-border">
        <View className="px-4 py-4 flex-row items-center border-b border-border">
          <CalendarDays size={17} color="#8E8E93" />
          <Text className="ml-3 flex-1 text-sm text-foreground">
            {formatDate(appointment?.appointmentDate)}
          </Text>
        </View>

        <View className="px-4 py-4 flex-row items-center">
          <Clock3 size={17} color="#8E8E93" />
          <Text className="ml-3 flex-1 text-sm text-foreground">
            {formatTime12h(appointment?.appointmentTime)}
          </Text>
        </View>
      </View>

      {appointment?.notes && (
        <View className="ml-4 border-t border-border px-4 py-4 flex-row items-start">
          <FileText size={17} color="#8E8E93" />
          <Text className="ml-3 flex-1 text-sm leading-5 text-muted-foreground">
            {appointment.notes}
          </Text>
        </View>
      )}
    </View>
  );
}