import { View, ScrollView, ActivityIndicator, Text, TouchableOpacity, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useState, useMemo } from 'react';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAppointments } from '../hooks/useAppointments';
import AppointmentCard from '../components/appointments/AppointmentCard';
import EmptyState from '../components/appointments/EmptyState';
import FloatingActionButton from '../components/appointments/FloatingActionButton';
import { STATUS_CONFIG } from '../utils/constants';
import { useTheme } from '../context/ThemeContext';

export default function AllAppointmentsScreen() {
  const router = useRouter();
  const { theme } = useTheme();
  const { appointments, loading } = useAppointments();
  const [activeStatus, setActiveStatus] = useState('ALL');
  const [search, setSearch] = useState('');

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

  const filtered = useMemo(() => {
    let data = appointments;
    if (activeStatus !== 'ALL') {
      data = data.filter(apt => apt.status === activeStatus);
    }
    if (search.trim()) {
      const term = search.trim().toLowerCase();
      data = data.filter(apt =>
        apt.vehicle?.make?.toLowerCase().includes(term) ||
        apt.vehicle?.model?.toLowerCase().includes(term) ||
        apt.vehicle?.plateNumber?.toLowerCase().includes(term) ||
        apt.trackingNumber?.toLowerCase().includes(term) ||
        apt.customer?.fullname?.toLowerCase().includes(term)
      );
    }
    // Sort by appointment date descending (most recent first) then by time
    return data.sort((a, b) => {
      const dateA = new Date(a.appointmentDate + 'T' + (a.appointmentTime || '00:00'));
      const dateB = new Date(b.appointmentDate + 'T' + (b.appointmentTime || '00:00'));
      return dateB - dateA;
    });
  }, [appointments, activeStatus, search]);

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center" style={{ backgroundColor: theme.background }}>
        <ActivityIndicator size="large" color={theme.primary} />
        <Text className="mt-4 font-bold text-foreground/50" style={{ color: theme.textSecondary }}>Updating Schedule...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: theme.background }}>
      {/* Header */}
      <View className="px-6 pt-12 pb-4" style={{ backgroundColor: theme.surface }}>
        <View className="flex-row items-center mb-2">
          <TouchableOpacity onPress={() => router.back()} className="mr-4">
            <Ionicons name="arrow-back" size={24} color={theme.text} />
          </TouchableOpacity>
          <Text className="text-xl font-black" style={{ color: theme.text }}>All Appointments</Text>
        </View>

        {/* Search */}
        <View className="flex-row items-center rounded-2xl px-3 border" style={{ backgroundColor: theme.background, borderColor: theme.border }}>
          <Ionicons name="search" size={18} color={theme.textSecondary} />
          <TextInput
            placeholder="Search by vehicle, tracking number, or customer..."
            placeholderTextColor={theme.textSecondary + '80'}
            value={search}
            onChangeText={setSearch}
            className="flex-1 py-3 px-2 text-sm"
            style={{ color: theme.text }}
          />
          {search.length > 0 && (
            <TouchableOpacity onPress={() => setSearch('')}>
              <Ionicons name="close-circle" size={18} color={theme.textSecondary} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Tabs */}
      <View style={{ backgroundColor: theme.surface, height: 48 }} className="px-6">
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ gap: 8, alignItems: 'center' }}
          className="flex-1"
        >
          {statusKeys.map((key) => {
            const isActive = activeStatus === key;
            const count = key === 'ALL' ? appointments.length : appointments.filter(a => a.status === key).length;
            return (
              <TouchableOpacity
                key={key}
                onPress={() => setActiveStatus(key)}
                className={`px-4 py-2 rounded-full ${isActive ? 'bg-primary' : 'bg-muted/30'}`}
              >
                <Text className={`text-xs font-bold ${isActive ? 'text-primary-foreground' : 'text-muted-foreground'}`}>
                  {statusLabels[key]} ({count})
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* List */}
      <ScrollView
        className="flex-1 px-6 pt-2 pb-20"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 40 }}
      >
        {filtered.length === 0 ? (
          <View className="items-center mt-12">
            <Ionicons name="calendar-outline" size={48} color={theme.textSecondary} />
            <Text className="mt-3 text-base font-bold" style={{ color: theme.textSecondary }}>
              {search ? 'No appointments match your search.' : 'No appointments found.'}
            </Text>
          </View>
        ) : (
          filtered.map((apt) => (
            <AppointmentCard key={apt.id} appointment={apt} />
          ))
        )}
      </ScrollView>

      {filtered.length > 0 && <FloatingActionButton />}
    </SafeAreaView>
  );
}