// components/booking/BookingModal.jsx
import { View, ScrollView, ActivityIndicator, Alert, Platform, Modal, TouchableOpacity, Text } from 'react-native';
import { useState, useCallback, useEffect } from 'react';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useBookingData } from '../../hooks/useBookingData';
import { useBookingForm } from '../../hooks/useBookingForm';
import BookingHeader from './BookingHeader';
import ActiveAppointments from './ActiveAppointments';
import ServiceSelector from './ServiceSelector';
import VehicleSelector from './VehicleSelector';
import NotesInput from './NotesInput';
import SchedulePicker from './SchedulePicker';
import CalendarModal from './CalendarModal';
import AvailabilityModal from './AvailabilityModal';
import ConfirmButton from './ConfirmButton';
import { dateToTimeString } from '../../utils/format';
import DateTimePicker from '@react-native-community/datetimepicker';
import appointmentsApi from '../../services/appointmentsApi';
import { useBookingModal } from '../../context/BookingModalContext';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';

export default function BookingModal() {
  const { isOpen, closeBookingModal, initialServiceId } = useBookingModal();
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();

  const [selectedDate, setSelectedDate] = useState(null);
  const [isDatePickerVisible, setDatePickerVisible] = useState(false);
  const [showCustomTimePicker, setShowCustomTimePicker] = useState(false);

  const { services, vehicles, appointments, loading } = useBookingData(initialServiceId);

  const [selectedService, setSelectedService] = useState(null);

  const {
    selectedVehicle,
    setSelectedVehicle,
    selectedTime,
    setSelectedTime,
    customTime,
    setCustomTime,
    availableSlots,
    notes,
    setNotes,
    submitting,
    handleBook,
    checkCustomTime,
    availabilityModal,
    setAvailabilityModal,
  } = useBookingForm(selectedDate, selectedService);

  // Auto-select service when initialServiceId is provided
  useEffect(() => {
    if (initialServiceId && services.length > 0) {
      const matched = services.find(s => String(s.id) === String(initialServiceId));
      if (matched) setSelectedService(matched);
    }
  }, [initialServiceId, services]);

  // Marked dates for calendar
  const markedDates = appointments
    .filter(apt => apt.status !== 'CANCELLED')
    .reduce((acc, apt) => {
      acc[apt.appointmentDate] = { marked: true, dotColor: '#C1272D' };
      return acc;
    }, {});

  if (selectedDate) {
    const dateStr = selectedDate.toISOString().split('T')[0];
    markedDates[dateStr] = {
      ...markedDates[dateStr],
      selected: true,
      selectedColor: '#C1272D',
    };
  }

  const handleDayPress = (day) => {
    setSelectedDate(new Date(day.dateString));
    setSelectedTime(null);
    setCustomTime(null);
    setDatePickerVisible(false);
  };

  const handleCustomTimeChange = (event, selectedDateObj) => {
    setShowCustomTimePicker(false);
    if (selectedDateObj) {
      const timeStr = dateToTimeString(selectedDateObj);
      checkCustomTime(timeStr);
    }
  };

  const handleCancelAppointment = (aptId) => {
    Alert.alert('Cancel Appointment', 'Are you sure?', [
      { text: 'No' },
      {
        text: 'Yes',
        style: 'destructive',
        onPress: async () => {
          try {
            await appointmentsApi.cancel(aptId);
            // Reload appointments (the hook will refresh)
          } catch (err) {
            Alert.alert('Error', 'Failed to cancel');
          }
        },
      },
    ]);
  };

  // Reset form when modal closes
  const handleClose = () => {
    setSelectedService(null);
    setSelectedDate(null);
    setSelectedTime(null);
    setCustomTime(null);
    setNotes('');
    closeBookingModal();
  };

  if (!isOpen) return null;

  return (
    <Modal
      visible={isOpen}
      animationType="slide"
      onRequestClose={handleClose}
      transparent
    >
      <SafeAreaView className="flex-1 bg-background" edges={['top']}>
        {/* Header with close button */}
        <View className="flex-row items-center justify-between px-4 pt-4 pb-2 border-b border-border/40">
          <Text className="text-xl font-bold text-foreground">Book Appointment</Text>
          <TouchableOpacity onPress={handleClose} className="p-2">
            <Ionicons name="close" size={28} color={theme.text} />
          </TouchableOpacity>
        </View>

        <ScrollView
          className="flex-1"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: insets.bottom + 120 }}
        >
          <View className="px-4">
            <ActiveAppointments appointments={appointments} onCancel={handleCancelAppointment} />

            <ServiceSelector
              services={services}
              selectedService={selectedService}
              onSelect={setSelectedService}
            />

            <VehicleSelector
              vehicles={vehicles}
              selectedVehicle={selectedVehicle}
              onSelect={setSelectedVehicle}
            />

            <NotesInput value={notes} onChange={setNotes} />

            <SchedulePicker
              selectedDate={selectedDate}
              selectedService={selectedService}
              selectedTime={selectedTime}
              customTime={customTime}
              availableSlots={availableSlots}
              onSelectDate={() => setDatePickerVisible(true)}
              onSelectTime={setSelectedTime}
              onCustomTimePress={() => setShowCustomTimePicker(true)}
            />
          </View>
        </ScrollView>

        {/* Floating Bottom CTA Bar */}
        <View
          className="absolute bottom-0 left-0 right-0 px-4 pt-3 bg-white/85 border-t border-border/40 shadow-lg"
          style={{ paddingBottom: insets.bottom + 12 }}
        >
          <ConfirmButton
            onPress={handleBook}
            disabled={
              submitting ||
              !selectedService ||
              !selectedVehicle ||
              !selectedDate ||
              (!selectedTime && !customTime)
            }
            loading={submitting}
          />
        </View>

        {/* Calendar Modal */}
        <CalendarModal
          visible={isDatePickerVisible}
          onClose={() => setDatePickerVisible(false)}
          onDayPress={handleDayPress}
          markedDates={markedDates}
          primaryColor="#C1272D"
        />

        {/* Custom Time Picker */}
        {showCustomTimePicker && (
          <DateTimePicker
            value={new Date()}
            mode="time"
            is24Hour={false}
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            onChange={handleCustomTimeChange}
          />
        )}

        {/* Availability Feedback */}
        <AvailabilityModal
          visible={availabilityModal.visible}
          available={availabilityModal.available}
          message={availabilityModal.message}
          onClose={() => setAvailabilityModal({ ...availabilityModal, visible: false })}
        />
      </SafeAreaView>
    </Modal>
  );
}