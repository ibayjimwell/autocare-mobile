// components/tracking/RescheduleModal.jsx
import React, { useState, useEffect } from 'react';
import { Modal, View, Text, TouchableOpacity, ActivityIndicator, Alert, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { format } from 'date-fns';
import { useTheme } from '../../context/ThemeContext';
import appointmentsApi from '../../services/appointmentsApi';
import { useRescheduleRequests } from '../../hooks/useRescheduleRequests';

export default function RescheduleModal({ visible, onClose, appointment, onSuccess }) {
  const { theme } = useTheme();
  const { pendingRequest, loading: requestsLoading } = useRescheduleRequests(appointment?.id);
  const [newDate, setNewDate] = useState(new Date());
  const [newTime, setNewTime] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [reason, setReason] = useState('');

  useEffect(() => {
    if (visible && appointment) {
      const date = new Date(appointment.appointmentDate + 'T' + (appointment.appointmentTime || '00:00'));
      setNewDate(date);
      setNewTime(date);
    }
  }, [visible, appointment]);

  const handleSubmit = async () => {
    const dateStr = format(newDate, 'yyyy-MM-dd');
    const timeStr = format(newTime, 'HH:mm');
    if (!dateStr || !timeStr) {
      setError('Please select a date and time.');
      return;
    }
    if (pendingRequest) {
      Alert.alert('Pending Request', 'There is already a pending reschedule request for this appointment.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const res = await appointmentsApi.createRescheduleRequest(appointment.id, dateStr, timeStr, reason);
      if (res.error) {
        setError(res.errorMessage || 'Failed to request reschedule.');
      } else {
        Alert.alert('Success', 'Reschedule request sent. Waiting for approval.');
        onSuccess();
        onClose();
      }
    } catch (err) {
      setError(err.message || 'Network error.');
    } finally {
      setLoading(false);
    }
  };

  if (pendingRequest) {
    return (
      <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
        <SafeAreaView className="flex-1 bg-black/50 justify-end">
          <View className="bg-white rounded-t-3xl min-h-[40%] max-h-[60%] p-5">
            <View className="flex-row items-center justify-between mb-4">
              <Text className="text-xl font-bold text-foreground">Reschedule Appointment</Text>
              <TouchableOpacity onPress={onClose} className="p-2">
                <Ionicons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>
            <View className="bg-amber-50 border border-amber-200 rounded-xl p-4">
              <Text className="text-amber-700 font-medium">Pending Reschedule Request</Text>
              <Text className="text-xs text-amber-600 mt-1">
                {pendingRequest.requestedBy === 'staff' ? 'Staff requested' : 'You requested'} to reschedule to {format(new Date(pendingRequest.newAppointmentDate), 'MMM d, yyyy')} at {pendingRequest.newAppointmentTime}.
              </Text>
              <Text className="text-xs text-amber-600 mt-1">Status: Pending approval.</Text>
            </View>
            <TouchableOpacity onPress={onClose} className="mt-4 py-3 bg-primary rounded-xl items-center">
              <Text className="text-white font-bold">Close</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </Modal>
    );
  }

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <SafeAreaView className="flex-1 bg-black/50 justify-end">
        <View className="bg-white rounded-t-3xl min-h-[50%] max-h-[80%]">
          <View className="flex-row items-center justify-between px-5 pt-4 pb-3 border-b border-slate-200">
            <Text className="text-xl font-bold text-foreground">Reschedule Appointment</Text>
            <TouchableOpacity onPress={onClose} className="p-2">
              <Ionicons name="close" size={24} color="#666" />
            </TouchableOpacity>
          </View>

          <View className="p-5">
            <Text className="text-sm text-muted-foreground mb-4">
              Current: {format(new Date(appointment?.appointmentDate), 'MMM d, yyyy')} at {appointment?.appointmentTime}
            </Text>

            {error && (
              <View className="bg-red-50 p-3 rounded-xl mb-3">
                <Text className="text-red-600 text-sm">{error}</Text>
              </View>
            )}

            <TouchableOpacity
              onPress={() => setShowDatePicker(true)}
              className="flex-row items-center justify-between p-3 border border-border rounded-xl mb-3"
            >
              <Text className="text-foreground">Date</Text>
              <Text className="font-bold text-primary">{format(newDate, 'MMM d, yyyy')}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setShowTimePicker(true)}
              className="flex-row items-center justify-between p-3 border border-border rounded-xl mb-3"
            >
              <Text className="text-foreground">Time</Text>
              <Text className="font-bold text-primary">{format(newTime, 'h:mm a')}</Text>
            </TouchableOpacity>

            <TextInput
              value={reason}
              onChangeText={setReason}
              placeholder="Reason (optional)"
              className="border border-border rounded-xl p-3 text-sm mb-4"
            />

            <TouchableOpacity
              onPress={handleSubmit}
              disabled={loading}
              className="bg-primary py-4 rounded-xl items-center"
            >
              {loading ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text className="text-white font-bold text-lg">Send Request</Text>
              )}
            </TouchableOpacity>
          </View>

          {showDatePicker && (
            <DateTimePicker
              value={newDate}
              mode="date"
              display="spinner"
              onChange={(event, selectedDate) => {
                setShowDatePicker(false);
                if (selectedDate) setNewDate(selectedDate);
              }}
              minimumDate={new Date()}
            />
          )}

          {showTimePicker && (
            <DateTimePicker
              value={newTime}
              mode="time"
              is24Hour={false}
              display="spinner"
              onChange={(event, selectedTime) => {
                setShowTimePicker(false);
                if (selectedTime) setNewTime(selectedTime);
              }}
            />
          )}
        </View>
      </SafeAreaView>
    </Modal>
  );
}