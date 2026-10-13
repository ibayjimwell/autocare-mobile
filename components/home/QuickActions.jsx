
import { View, Text } from 'react-native';
import {
  Calendar,
  MapPin,
  Receipt,
} from 'lucide-react-native';
import { useRouter } from 'expo-router';
import ActionItem from './ActionItem';

export default function QuickActions({
  activeTrackingAppointment,
}) {
  const router = useRouter();

  /*
   * Accept either an appointment object or
   * an appointment ID for compatibility.
   */
  const appointmentId =
    activeTrackingAppointment &&
    typeof activeTrackingAppointment === 'object'
      ? activeTrackingAppointment.id
      : activeTrackingAppointment;

  /*
   * Navigate directly to the active appointment.
   * If no appointment is active, open the
   * appointments list instead.
   */
  const handleTrackingPress = () => {
    if (appointmentId) {
      router.push({
        pathname: '/tracking',
        params: {
          appointmentId: String(appointmentId),
        },
      });

      return;
    }

    router.push('/appointments');
  };

  return (
    <View className="mb-8">
      <View className="mb-2 flex-row items-end justify-between px-4">
        <Text className="text-lg font-semibold text-foreground">
          Services
        </Text>
      </View>

      <View className="flex-row px-4">
        <ActionItem
          icon={Calendar}
          label="Booking"
          color="#C1272D"
          path="/booking"
        />

        <ActionItem
          icon={MapPin}
          label="Tracking"
          color="#6366F1"
          onPress={handleTrackingPress}
        />

        <ActionItem
          icon={Receipt}
          label="Payment"
          color="#10B981"
          path="/billing"
          isLast={true}
        />
      </View>
    </View>
  );
}
