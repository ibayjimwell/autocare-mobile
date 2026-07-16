import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { formatTime12h } from '../../utils/format';

export default function ActiveAppointments({ appointments, onCancel }) {
  const active = appointments.filter(
    a => a.status !== 'CANCELLED' && a.status !== 'COMPLETED'
  );
  if (active.length === 0) return null;

  return (
    <View className="mb-10">
      <Text className="text-xs font-black uppercase tracking-widest mb-4 text-foreground/40">
        Your Active Schedule
      </Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {active.map((apt) => (
          <View
            key={apt.id}
            className="p-5 mr-4 rounded-[32px] border border-border bg-card w-[260px]"
          >
            <View className="flex-row justify-between items-start mb-3">
              <View className="w-10 h-10 rounded-2xl items-center justify-center bg-primary/10">
                <MaterialCommunityIcons name="calendar-check" size={20} color="#C1272D" />
              </View>
              <TouchableOpacity onPress={() => onCancel(apt.id)}>
                <Ionicons name="close-circle-outline" size={22} color="#EF4444" />
              </TouchableOpacity>
            </View>
            <Text className="font-bold text-base text-foreground">
              Service #{apt.id?.toString().slice(-4)}
            </Text>
            <Text className="text-xs font-bold text-foreground/50 mb-4">
              {apt.appointmentDate} • {formatTime12h(apt.appointmentTime)}
            </Text>
            <View className="px-3 py-1.5 rounded-full bg-primary self-start">
              <Text className="text-[10px] font-black uppercase text-primary-foreground">{apt.status}</Text>
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}