import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { format } from 'date-fns';

const getStatusIcon = (status) => {
  switch (status) {
    case 'IN_PROGRESS':
      return <Ionicons name="construct" size={16} color="#f59e0b" />;
    case 'DONE':
      return <Ionicons name="checkmark-circle" size={16} color="#22c55e" />;
    default:
      return <Ionicons name="time-outline" size={16} color="#6b7280" />;
  }
};

const getStatusLabel = (status) => {
  switch (status) {
    case 'IN_PROGRESS':
      return 'In Progress';
    case 'DONE':
      return 'Done';
    default:
      return 'Waiting';
  }
};

export default function QueueSection({ queue, loading, error, appointmentId }) {
  const [expanded, setExpanded] = useState(false);

  if (loading) {
    return (
      <View className="bg-card rounded-2xl p-4 border border-border">
        <ActivityIndicator size="small" color="#C1272D" />
      </View>
    );
  }

  if (error) {
    return (
      <View className="bg-card rounded-2xl p-4 border border-border">
        <Text className="text-sm text-destructive">{error}</Text>
      </View>
    );
  }

  if (!queue || queue.length === 0) {
    return (
      <View className="bg-card rounded-2xl p-4 border border-border">
        <Text className="text-sm text-muted-foreground">No vehicles in queue for this date.</Text>
      </View>
    );
  }

  // Find the user's position
  const myEntry = queue.find((item) => item.appointmentId === appointmentId);
  const myPosition = myEntry ? myEntry.queueNumber : null;
  const total = queue.length;

  return (
    <View className="bg-card rounded-2xl border border-border overflow-hidden">
      {/* Header with position and expand toggle */}
      <TouchableOpacity
        onPress={() => setExpanded(!expanded)}
        className="flex-row items-center justify-between p-4"
        activeOpacity={0.7}
      >
        <View className="flex-1">
          <View className="flex-row items-center gap-2">
            <Ionicons name="list-outline" size={20} color="#C1272D" />
            <Text className="text-base font-heading font-bold text-foreground">Service Queue</Text>
          </View>
          {myPosition !== null && (
            <Text className="text-sm text-muted-foreground mt-1">
              Your position: <Text className="font-bold text-primary">#{myPosition}</Text> of {total}
            </Text>
          )}
        </View>
        <Ionicons
          name={expanded ? 'chevron-up' : 'chevron-down'}
          size={24}
          color="#6b7280"
        />
      </TouchableOpacity>

      {/* Expanded queue list */}
      {expanded && (
        <View className="px-4 pb-4 space-y-3">
          {queue.map((item) => {
            const isMine = item.appointmentId === appointmentId;
            return (
              <View
                key={item.queueId}
                className={`flex-row items-center gap-3 p-3 rounded-xl border ${
                  isMine
                    ? 'bg-primary/5 border-primary'
                    : 'bg-muted/10 border-border'
                }`}
              >
                <View className="w-10 h-10 rounded-full bg-muted items-center justify-center">
                  <Text className={`text-sm font-black ${isMine ? 'text-primary' : 'text-foreground'}`}>
                    #{item.queueNumber}
                  </Text>
                </View>
                <View className="flex-1">
                  <Text className={`text-sm font-medium ${isMine ? 'text-primary' : 'text-foreground'}`}>
                    {item.customer?.fullname || 'Customer'}
                  </Text>
                  <Text className="text-xs text-muted-foreground">
                    {item.vehicle?.make} {item.vehicle?.model} • {item.vehicle?.plateNumber}
                  </Text>
                  <Text className="text-xs text-muted-foreground mt-0.5">
                    {item.appointmentTime ? format(new Date(`2000-01-01T${item.appointmentTime}`), 'h:mm a') : ''}
                  </Text>
                </View>
                <View className="flex-row items-center gap-1">
                  {getStatusIcon(item.queueStatus)}
                  <Text className="text-[10px] font-bold uppercase text-muted-foreground">
                    {getStatusLabel(item.queueStatus)}
                  </Text>
                </View>
                {isMine && (
                  <View className="bg-primary px-2 py-0.5 rounded-full">
                    <Text className="text-[8px] font-black text-white uppercase">You</Text>
                  </View>
                )}
              </View>
            );
          })}
        </View>
      )}
    </View>
  );
}