import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import {
  BusFront,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Clock3,
  Construction,
  ListOrdered,
} from 'lucide-react-native';
import { format } from 'date-fns';

const getStatusIcon = (status) => {
  switch (status) {
    case 'IN_PROGRESS':
      return <Construction size={16} color="#F59E0B" strokeWidth={2} />;

    case 'DONE':
      return <CheckCircle2 size={16} color="#10B981" strokeWidth={2} />;

    default:
      return <Clock3 size={16} color="#8E8E93" strokeWidth={2} />;
  }
};

const getStatusLabel = (status) => {
  switch (status) {
    case 'IN_PROGRESS':
      return 'In progress';

    case 'DONE':
      return 'Done';

    default:
      return 'Waiting';
  }
};

export default function QueueSection({
  queue,
  loading,
  error,
  appointmentId,
}) {
  const [expanded, setExpanded] = useState(false);

  if (loading) {
    return (
      <View className="bg-card rounded-xl border border-border mb-6 p-5">
        <View className="flex-row items-center">
          <View className="w-11 h-11 rounded-full bg-secondary items-center justify-center mr-3">
            <BusFront size={20} color="#C1272D" />
          </View>
          <Text className="flex-1 text-base font-semibold text-foreground">
            Service Queue
          </Text>
          <ActivityIndicator size="small" color="#C1272D" />
        </View>
      </View>
    );
  }

  if (error) {
    return (
      <View className="bg-card rounded-xl border border-border mb-6 p-4">
        <Text className="text-sm font-medium text-primary">
          {error}
        </Text>
      </View>
    );
  }

  if (!queue || queue.length === 0) {
    return (
      <View className="bg-card rounded-xl border border-border mb-6 p-4 flex-row items-center">
        <View className="w-11 h-11 rounded-full bg-secondary items-center justify-center mr-3">
          <ListOrdered size={20} color="#8E8E93" />
        </View>

        <View className="flex-1">
          <Text className="text-base font-semibold text-foreground">
            Service Queue
          </Text>

          <Text className="text-sm text-muted-foreground mt-1">
            No vehicles are queued for this date.
          </Text>
        </View>
      </View>
    );
  }

  // Find the user's position
  const myEntry = queue.find(
    item => item.appointmentId === appointmentId
  );

  const myPosition = myEntry ? myEntry.queueNumber : null;
  const total = queue.length;

  return (
    <View className="bg-card rounded-xl border border-border overflow-hidden mb-6">
      <TouchableOpacity
        onPress={() => setExpanded(!expanded)}
        activeOpacity={0.8}
        className="min-h-[72px] px-4 py-3 flex-row items-center"
      >
        <View className="w-11 h-11 rounded-full bg-primary/10 items-center justify-center mr-3">
          <ListOrdered size={21} color="#C1272D" strokeWidth={2} />
        </View>

        <View className="flex-1">
          <Text className="text-base font-semibold text-foreground">
            Service Queue
          </Text>

          {myPosition !== null && (
            <Text className="text-sm text-muted-foreground mt-1">
              Your position:{' '}
              <Text className="font-semibold text-primary">
                #{myPosition}
              </Text>{' '}
              of {total}
            </Text>
          )}
        </View>

        {expanded ? (
          <ChevronUp size={21} color="#8E8E93" />
        ) : (
          <ChevronDown size={21} color="#8E8E93" />
        )}
      </TouchableOpacity>

      {expanded && (
        <View className="ml-4 border-t border-border px-4 py-4">
          {queue.map((item) => {
            const isMine = item.appointmentId === appointmentId;

            return (
              <View
                key={item.queueId}
                className="py-4 flex-row items-center border-b border-border"
              >
                <View
                  className="w-11 h-11 rounded-full items-center justify-center mr-3"
                  style={{
                    backgroundColor: isMine
                      ? 'rgba(193,39,45,0.10)'
                      : '#E5E5EA',
                  }}
                >
                  <Text
                    className="text-sm font-semibold"
                    style={{
                      color: isMine ? '#C1272D' : '#000000',
                    }}
                  >
                    #{item.queueNumber}
                  </Text>
                </View>

                <View className="flex-1 pr-2">
                  <Text
                    className="text-sm font-medium"
                    style={{
                      color: isMine ? '#C1272D' : '#000000',
                    }}
                  >
                    {item.customer?.fullname || 'Customer'}
                  </Text>

                  <Text className="text-xs text-muted-foreground mt-1">
                    {item.vehicle?.make} {item.vehicle?.model}
                  </Text>

                  <Text className="text-xs text-muted-foreground mt-0.5">
                    {item.vehicle?.plateNumber}
                  </Text>

                  <Text className="text-xs text-muted-foreground mt-0.5">
                    {item.appointmentTime
                      ? format(
                          new Date(
                            `2000-01-01T${item.appointmentTime}`
                          ),
                          'h:mm a'
                        )
                      : ''}
                  </Text>
                </View>

                <View className="items-end">
                  <View className="flex-row items-center">
                    {getStatusIcon(item.queueStatus)}

                    <Text className="text-xs font-medium text-muted-foreground ml-1">
                      {getStatusLabel(item.queueStatus)}
                    </Text>
                  </View>

                  {isMine && (
                    <View className="mt-2 px-2.5 min-h-[24px] rounded-full bg-primary items-center justify-center">
                      <Text className="text-[10px] font-semibold text-white">
                        You
                      </Text>
                    </View>
                  )}
                </View>
              </View>
            );
          })}
        </View>
      )}
    </View>
  );
}