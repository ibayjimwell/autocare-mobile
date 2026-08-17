import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { CalendarCheck, XCircle } from 'lucide-react-native';
import { formatTime12h } from '../../utils/format';

export default function ActiveAppointments({ appointments, onCancel }) {
  const active = appointments.filter(
    a => a.status !== 'CANCELLED' && a.status !== 'COMPLETED'
  );
  if (active.length === 0) return null;

  return (
    <View className="mb-6">
      <View className="flex-row items-center justify-between px-1 mb-3">
        <Text className="text-lg font-semibold text-foreground">Your Active Schedule</Text>
        <Text className="text-sm font-normal text-muted-foreground">
          {active.length} upcoming
        </Text>
      </View>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingRight: 16 }}
      >
        {active.map((apt) => (
          <View
            key={apt.id}
            className="p-4 mr-3 rounded-xl border border-border bg-card w-[260px] shadow-sm"
          >
            <View className="flex-row justify-between items-start mb-3">
              <View className="w-10 h-10 rounded-xl items-center justify-center bg-primary/10">
                <CalendarCheck size={20} color="#C1272D" />
              </View>
              <TouchableOpacity
                onPress={() => onCancel(apt.id)}
                hitSlop={8}
                className="min-h-[44px] min-w-[44px] items-center justify-center -mt-2 -mr-2"
              >
                <XCircle size={22} color="#FF3B30" />
              </TouchableOpacity>
            </View>
            <Text className="text-base font-semibold text-foreground">
              Service #{apt.id?.toString().slice(-4)}
            </Text>
            <Text className="text-sm font-normal text-muted-foreground mb-3">
              {apt.appointmentDate} • {formatTime12h(apt.appointmentTime)}
            </Text>
            <View className="px-2.5 py-1 rounded-full bg-primary/10 self-start">
              <Text className="text-[11px] font-semibold uppercase tracking-wide text-primary">
                {apt.status}
              </Text>
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}