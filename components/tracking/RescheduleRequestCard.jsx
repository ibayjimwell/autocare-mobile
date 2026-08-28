// components/tracking/RescheduleRequestCard.jsx
import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, TextInput, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { format } from 'date-fns';
import { useTheme } from '../../context/ThemeContext';

export default function RescheduleRequestCard({ request, onApprove, onReject }) {
  const { theme } = useTheme();
  const [loading, setLoading] = useState(false);
  const [rejectModalVisible, setRejectModalVisible] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const isPending = request.status === 'PENDING';
  const isCustomerRequest = request.requestedBy === 'customer';

  const handleApprove = async () => {
    setLoading(true);
    await onApprove(request.id);
    setLoading(false);
  };

  const handleReject = async () => {
    if (!rejectionReason.trim()) {
      alert('Please provide a reason for rejection.');
      return;
    }
    setLoading(true);
    await onReject(request.id, rejectionReason.trim());
    setLoading(false);
    setRejectModalVisible(false);
    setRejectionReason('');
  };

  if (!isPending) {
    return (
      <View className="bg-card rounded-xl p-4 mb-3 border border-border">
        <View className="flex-row items-center justify-between">
          <View className="flex-1">
            <Text className="text-sm font-semibold text-foreground">Reschedule Request</Text>
            <Text className="text-xs text-muted-foreground mt-0.5">
              {request.requestedBy === 'staff' ? 'Staff requested' : 'You requested'} to reschedule to {format(new Date(request.newAppointmentDate), 'MMM d, yyyy')} at {request.newAppointmentTime}
            </Text>
            {request.reason && <Text className="text-xs text-muted-foreground mt-1 italic">Reason: {request.reason}</Text>}
            <Text className="text-xs text-muted-foreground mt-1">
              Status: <Text className="font-bold">{request.status}</Text>
            </Text>
          </View>
          <View className="w-8 h-8 rounded-full items-center justify-center">
            {request.status === 'APPROVED' ? (
              <Ionicons name="checkmark-circle" size={24} color="#22c55e" />
            ) : request.status === 'REJECTED' ? (
              <Ionicons name="close-circle" size={24} color="#ef4444" />
            ) : null}
          </View>
        </View>
      </View>
    );
  }

  return (
    <>
      <View className="bg-card rounded-xl p-4 mb-3 border border-primary bg-amber-50/10">
        <View className="flex-row items-start">
          <View className="flex-1">
            <Text className="text-sm font-semibold text-foreground">Pending Reschedule Request</Text>
            <Text className="text-xs text-muted-foreground mt-0.5">
              {request.requestedBy === 'staff' ? 'Staff requested' : 'You requested'} to reschedule to {format(new Date(request.newAppointmentDate), 'MMM d, yyyy')} at {request.newAppointmentTime}
            </Text>
            {request.reason && (
              <Text className="text-xs text-muted-foreground mt-1 italic">Reason: {request.reason}</Text>
            )}
          </View>
        </View>

        {/* Show Approve/Reject only if staff requested (customer can act) */}
        {request.requestedBy === 'staff' && (
          <View className="flex-row gap-2 mt-3">
            <TouchableOpacity
              onPress={handleApprove}
              disabled={loading}
              className="flex-1 bg-green-500 py-2 rounded-xl items-center"
            >
              {loading ? <ActivityIndicator color="white" /> : <Text className="text-white font-bold text-xs">Approve</Text>}
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setRejectModalVisible(true)}
              disabled={loading}
              className="flex-1 bg-red-500 py-2 rounded-xl items-center"
            >
              <Text className="text-white font-bold text-xs">Reject</Text>
            </TouchableOpacity>
          </View>
        )}
        {request.requestedBy === 'customer' && (
          <View className="mt-2">
            <Text className="text-xs text-muted-foreground">Waiting for staff response...</Text>
          </View>
        )}
      </View>

      {/* Reject Modal */}
      <Modal visible={rejectModalVisible} transparent animationType="slide" onRequestClose={() => setRejectModalVisible(false)}>
        <View className="flex-1 bg-black/50 justify-end">
          <View className="bg-white rounded-t-3xl p-5">
            <Text className="text-xl font-bold text-foreground mb-2">Reject Reschedule</Text>
            <Text className="text-sm text-muted-foreground mb-4">Please provide a reason for rejecting this request.</Text>
            <TextInput
              value={rejectionReason}
              onChangeText={setRejectionReason}
              placeholder="Enter reason..."
              className="border border-border rounded-xl p-3 text-sm mb-4"
              multiline
              numberOfLines={3}
            />
            <View className="flex-row gap-3">
              <TouchableOpacity onPress={() => setRejectModalVisible(false)} className="flex-1 py-3 rounded-xl border border-border items-center">
                <Text className="font-bold">Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={handleReject} className="flex-1 py-3 rounded-xl bg-red-500 items-center">
                <Text className="text-white font-bold">Confirm Reject</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
}