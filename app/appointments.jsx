import { View, ScrollView, ActivityIndicator, Text, TouchableOpacity } from 'react-native';
import { useState } from 'react';
import { useAppointments } from '../hooks/useAppointments';
import AppointmentsHeader from '../components/appointments/AppointmentsHeader';
import AppointmentCard from '../components/appointments/AppointmentCard';
import EmptyState from '../components/appointments/EmptyState';
import FloatingActionButton from '../components/appointments/FloatingActionButton';
import { STATUS_CONFIG } from '../utils/constants';

export default function AllAppointmentsScreen() {
  const { appointments, loading } = useAppointments();
  const [activeStatus, setActiveStatus] = useState('ALL');

  const statusKeys = ['ALL', 'PENDING', 'CONFIRMED', 'UNDER_INSPECTION', 'WAITING_FOR_APPROVAL', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'];
  const statusLabels = {
    ALL: 'All',
    PENDING: 'Pending',
    CONFIRMED: 'Confirmed',
    UNDER_INSPECTION: 'Under Inspection',
    WAITING_FOR_APPROVAL: 'Waiting Approval',
    IN_PROGRESS: 'In Progress',
    COMPLETED: 'Completed',
    CANCELLED: 'Cancelled',
  };

  const filtered = activeStatus === 'ALL'
    ? appointments
    : appointments.filter(apt => apt.status === activeStatus);

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

          {/* Tabs */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            className="mb-6"
            contentContainerStyle={{ paddingRight: 16 }}
          >
            {statusKeys.map((key) => {
              const isActive = activeStatus === key;
              const count = key === 'ALL' ? appointments.length : appointments.filter(a => a.status === key).length;
              return (
                <TouchableOpacity
                  key={key}
                  onPress={() => setActiveStatus(key)}
                  className={`px-4 py-2 mr-2 rounded-full ${isActive ? 'bg-primary' : 'bg-muted/30'}`}
                >
                  <Text className={`text-xs font-bold ${isActive ? 'text-primary-foreground' : 'text-muted-foreground'}`}>
                    {statusLabels[key]} ({count})
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          {filtered.length === 0 ? (
            <EmptyState />
          ) : (
            filtered.map((apt) => (
              <AppointmentCard key={apt.id} appointment={apt} />
            ))
          )}
        </View>
      </ScrollView>

      {filtered.length > 0 && <FloatingActionButton />}
    </View>
  );
}