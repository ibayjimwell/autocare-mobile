import { View, Text } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { formatDate, formatTime12h } from '../../utils/format';

export default function VehicleInfoCard({ appointment }) {
  return (
    <View className="p-6 rounded-[32px] mb-8 border border-border bg-card shadow-sm">
      <View className="flex-row items-center mb-4">
        <View className="w-12 h-12 rounded-2xl items-center justify-center bg-primary/10 mr-4">
          <MaterialCommunityIcons name="car-cog" size={24} color="#C1272D" />
        </View>
        <View className="flex-1">
          <Text className="text-lg font-black text-foreground">{appointment?.serviceType?.name || 'Maintenance Service'}</Text>
          <Text className="text-xs font-bold text-muted-foreground">
            {appointment?.vehicle?.make} {appointment?.vehicle?.model} • {appointment?.vehicle?.plateNumber}
          </Text>
        </View>
      </View>
      <View className="flex-row justify-between pt-4 border-t border-border">
        <View className="flex-row items-center">
          <Ionicons name="calendar-outline" size={14} color="#666" />
          <Text className="text-xs font-bold ml-2 text-foreground">{formatDate(appointment?.appointmentDate)}</Text>
        </View>
        <View className="flex-row items-center">
          <Ionicons name="time-outline" size={14} color="#666" />
          <Text className="text-xs font-bold ml-2 text-foreground">{formatTime12h(appointment?.appointmentTime)}</Text>
        </View>
      </View>
      {appointment?.notes && (
        <View className="flex-row items-start pt-2 mt-2 border-t border-border">
          <Ionicons name="document-text-outline" size={18} color="#666" style={{ marginRight: 8 }} />
          <Text className="flex-1 text-xs leading-5 font-medium text-muted-foreground">{appointment.notes}</Text>
        </View>
      )}
    </View>
  );
}