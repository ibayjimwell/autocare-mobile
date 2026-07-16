import { useState, useEffect } from 'react';
import { Alert } from 'react-native';
import { useAuth } from '../context/AuthContext';
import appointmentsApi from '../services/appointmentsApi';

export function useBookingForm(selectedDate, selectedService) {
  const { user } = useAuth();
  const customerId = user?.id;

  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);
  const [customTime, setCustomTime] = useState(null);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [availabilityModal, setAvailabilityModal] = useState({
    visible: false,
    available: false,
    message: '',
  });

  // Load available slots when date or service changes
  useEffect(() => {
    if (!selectedDate || !selectedService) {
      setAvailableSlots([]);
      return;
    }
    const fetchSlots = async () => {
      try {
        const dateStr = selectedDate.toISOString().split('T')[0];
        const res = await appointmentsApi.getAvailableSlots(dateStr, selectedService.id);
        setAvailableSlots(res.data || []);
      } catch (err) {
        console.error(err);
        setAvailableSlots([]);
      }
    };
    fetchSlots();
    setSelectedTime(null);
    setCustomTime(null);
  }, [selectedDate, selectedService]);

  const checkCustomTime = async (timeStr) => {
    if (!selectedDate || !selectedService) {
      setAvailabilityModal({ visible: true, available: false, message: 'Please select a date and service first.' });
      return;
    }
    const dateStr = selectedDate.toISOString().split('T')[0];
    try {
      const res = await appointmentsApi.checkAvailability(dateStr, timeStr, selectedService.id);
      if (res.data?.available) {
        setCustomTime(timeStr);
        setSelectedTime(null);
        setAvailabilityModal({ visible: true, available: true, message: 'This time is available!' });
      } else {
        setAvailabilityModal({ visible: true, available: false, message: 'Slot unavailable.' });
      }
    } catch (err) {
      setAvailabilityModal({ visible: true, available: false, message: 'Error checking availability.' });
    }
  };

  const handleBook = async () => {
    const finalTime = customTime || selectedTime;
    if (!selectedService || !selectedVehicle || !selectedDate || !finalTime) {
      Alert.alert('Incomplete', 'Please fill all required fields.');
      return false;
    }
    if (!customerId) {
      Alert.alert('Error', 'Customer not identified.');
      return false;
    }

    setSubmitting(true);
    try {
      const dateStr = selectedDate.toISOString().split('T')[0];
      await appointmentsApi.create({
        customerId,
        vehicleId: selectedVehicle.id,
        serviceId: selectedService.id,       // single service, will be wrapped in array
        appointmentDate: dateStr,
        appointmentTime: finalTime,
        notes,
      });
      Alert.alert('Success', 'Appointment booked!');
      // Reset form
      setSelectedVehicle(null);
      setSelectedTime(null);
      setCustomTime(null);
      setNotes('');
      return true;
    } catch (err) {
      const msg = err?.response?.data?.message || err.message || 'Booking failed';
      setAvailabilityModal({ visible: true, available: false, message: msg });
      return false;
    } finally {
      setSubmitting(false);
    }
  };

  return {
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
  };
}