import { View, ScrollView, ActivityIndicator, Text } from 'react-native';
import { useAppointments } from '../hooks/useAppointments';
import AppointmentsHeader from '../components/appointments/AppointmentsHeader';
import AppointmentCard from '../components/appointments/AppointmentCard';
import EmptyState from '../components/appointments/EmptyState';
import FloatingActionButton from '../components/appointments/FloatingActionButton';

export default function AllAppointmentsScreen() {
  const { appointments, loading } = useAppointments();

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-background">
        <ActivityIndicator size="large" color="#C1272D" />
        <Text className="mt-4 font-bold text-foreground/50">Updating Schedule...</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-background">
      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 40 }}
      >
        <View className="px-6 py-6">
          <AppointmentsHeader />

          {appointments.length === 0 ? (
            <EmptyState />
          ) : (
            appointments.map((apt) => (
              <AppointmentCard key={apt.id} appointment={apt} />
            ))
          )}
        </View>
      </ScrollView>

      {appointments.length > 0 && <FloatingActionButton />}
    </View>
  );
}