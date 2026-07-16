import { View, ScrollView, ActivityIndicator } from 'react-native';
import { useState, useCallback, useEffect } from 'react';
import { useLocalSearchParams } from 'expo-router';
import { useBookingData } from '../hooks/useBookingData';
import { useBookingForm } from '../hooks/useBookingForm';
import BookingHeader from '../components/booking/BookingHeader';
import ActiveAppointments from '../components/booking/ActiveAppointments';
import ServiceSelector from '../components/booking/ServiceSelector';
import VehicleSelector from '../components/booking/VehicleSelector';
import NotesInput from '../components/booking/NotesInput';
import SchedulePicker from '../components/booking/SchedulePicker';
import CalendarModal from '../components/booking/CalendarModal';
import AvailabilityModal from '../components/booking/AvailabilityModal';
import ConfirmButton from '../components/booking/ConfirmButton';
import { dateToTimeString } from '../utils/format';
import DateTimePicker from '@react-native-community/datetimepicker';
import appointmentsApi from '../services/appointmentsApi';

export default function BookingScreen() {
  const { serviceId } = useLocalSearchParams();
  const { services, vehicles, appointments, loading } = useBookingData(serviceId);

  const [selectedService, setSelectedService] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);
  const [isDatePickerVisible, setDatePickerVisible] = useState(false);
  const [showCustomTimePicker, setShowCustomTimePicker] = useState(false);

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
            // Reload appointments
          } catch (err) {
            Alert.alert('Error', 'Failed to cancel');
          }
        },
      },
    ]);
  };

  // Auto-select service when serviceId param and services list are available
  useEffect(() => {
    if (serviceId && services.length > 0) {
      const matched = services.find(s => String(s.id) === String(serviceId));
      if (matched) setSelectedService(matched);
    }
  }, [serviceId, services]);

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-background">
        <ActivityIndicator size="large" color="#C1272D" />
      </View>
    );
  }

  return (
    <ScrollView className="flex-1 bg-background" showsVerticalScrollIndicator={false}>
      <View className="px-6 pt-12 pb-10">
        <BookingHeader />

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
    </ScrollView>
  );
}