import {
  View,
  ScrollView,
  ActivityIndicator,
  Text,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useState, useMemo } from 'react';
import { useRouter } from 'expo-router';
import {
  ArrowLeft,
  Search,
  X,
  CalendarDays,
  SlidersHorizontal,
} from 'lucide-react-native';

import { useAppointments } from '../hooks/useAppointments';
import AppointmentCard from '../components/appointments/AppointmentCard';
import EmptyState from '../components/appointments/EmptyState';
import FloatingActionButton from '../components/appointments/FloatingActionButton';
import { useTheme } from '../context/ThemeContext';

export default function AllAppointmentsScreen() {
  const router = useRouter();
  const { theme } = useTheme();
  const { appointments, loading } = useAppointments();

  const [activeStatus, setActiveStatus] = useState('ALL');
  const [search, setSearch] = useState('');

  const statusKeys = [
    'ALL',
    'PENDING',
    'CONFIRMED',
    'UNDER_INSPECTION',
    'WAITING_FOR_APPROVAL',
    'IN_PROGRESS',
    'COMPLETED',
    'CANCELLED',
  ];

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

      data = data.filter(
        apt =>
          apt.vehicle?.make?.toLowerCase().includes(term) ||
          apt.vehicle?.model?.toLowerCase().includes(term) ||
          apt.vehicle?.plateNumber?.toLowerCase().includes(term) ||
          apt.trackingNumber?.toLowerCase().includes(term) ||
          apt.customer?.fullname?.toLowerCase().includes(term)
      );
    }

    // Sort by appointment date descending (most recent first) then by time
    return data.sort((a, b) => {
      const dateA = new Date(
        a.appointmentDate + 'T' + (a.appointmentTime || '00:00')
      );

      const dateB = new Date(
        b.appointmentDate + 'T' + (b.appointmentTime || '00:00')
      );

      return dateB - dateA;
    });
  }, [appointments, activeStatus, search]);

  if (loading) {
    return (
      <SafeAreaView
        className="flex-1 bg-background items-center justify-center"
        style={{ backgroundColor: theme.background }}
      >
        <ActivityIndicator size="large" color={theme.primary} />

        <Text
          className="text-sm font-medium mt-3"
          style={{ color: theme.textSecondary }}
        >
          Updating Schedule...
        </Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      className="flex-1 bg-background"
      style={{ backgroundColor: theme.background }}
      edges={['top']}
    >
      {/* Header */}
      <View className="px-4 pt-3 pb-3 bg-card border-b border-border">
        <View className="flex-row items-center">
          <TouchableOpacity
            onPress={() => router.back()}
            className="w-11 h-11 rounded-full items-center justify-center"
            activeOpacity={0.75}
          >
            <ArrowLeft size={22} color={theme.text} />
          </TouchableOpacity>

          <View className="flex-1 ml-2">
            <Text
              className="text-xl font-bold"
              style={{ color: theme.text }}
            >
              All Appointments
            </Text>

            <Text
              className="text-sm mt-0.5"
              style={{ color: theme.textSecondary }}
            >
              Manage your vehicle service schedule.
            </Text>
          </View>

          <View className="w-11 h-11 rounded-full bg-primary/10 items-center justify-center">
            <CalendarDays size={19} color={theme.primary} />
          </View>
        </View>

        {/* Search */}
        <View className="mt-3 h-[48px] rounded-xl bg-background border border-border flex-row items-center px-3">
          <Search size={18} color={theme.textSecondary} />

          <TextInput
            placeholder="Search by vehicle, tracking number, or customer..."
            placeholderTextColor={`${theme.textSecondary}99`}
            value={search}
            onChangeText={setSearch}
            className="flex-1 px-2 text-sm"
            style={{ color: theme.text }}
            returnKeyType="search"
          />

          {search.length > 0 && (
            <TouchableOpacity
              onPress={() => setSearch('')}
              className="w-9 h-9 items-center justify-center"
              activeOpacity={0.75}
            >
              <X size={17} color={theme.textSecondary} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Status Filters */}
      <View className="bg-card border-b border-border">
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{
            paddingHorizontal: 16,
            paddingVertical: 10,
          }}
        >
          {statusKeys.map(key => {
            const isActive = activeStatus === key;

            const count =
              key === 'ALL'
                ? appointments.length
                : appointments.filter(a => a.status === key).length;

            return (
              <TouchableOpacity
                key={key}
                onPress={() => setActiveStatus(key)}
                className={`min-h-[36px] px-4 rounded-full items-center justify-center mr-2 ${
                  isActive ? 'bg-primary' : 'bg-secondary'
                }`}
                activeOpacity={0.8}
              >
                <Text
                  className="text-xs font-semibold"
                  style={{
                    color: isActive ? '#FFFFFF' : theme.text,
                  }}
                >
                  {statusLabels[key]} ({count})
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Appointment List */}
      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: 16,
          paddingTop: 16,
          paddingBottom: 110,
        }}
      >
        {filtered.length === 0 ? (
          search.trim() || activeStatus !== 'ALL' ? (
            <View className="bg-card rounded-2xl p-7 border border-border items-center mt-2">
              <View className="w-14 h-14 rounded-full bg-primary/10 items-center justify-center">
                <Search size={25} color={theme.primary} />
              </View>

              <Text
                className="text-base font-semibold mt-4"
                style={{ color: theme.text }}
              >
                No appointments found
              </Text>

              <Text
                className="text-sm text-center mt-1 leading-5"
                style={{ color: theme.textSecondary }}
              >
                Try another search term or status filter.
              </Text>
            </View>
          ) : (
            <EmptyState />
          )
        ) : (
          filtered.map(apt => (
            <AppointmentCard
              key={apt.id}
              appointment={apt}
            />
          ))
        )}
      </ScrollView>

      {filtered.length > 0 && <FloatingActionButton />}
    </SafeAreaView>
  );
}