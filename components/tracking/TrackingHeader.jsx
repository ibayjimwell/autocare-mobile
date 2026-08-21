import { View, Text } from 'react-native';
import {
  CarFront,
  CircleCheck,
  Clock3,
  XCircle,
} from 'lucide-react-native';

const getStatusPresentation = (status) => {
  switch (status) {
    case 'CANCELLED':
      return {
        label: 'Cancelled',
        icon: XCircle,
        badgeClass: 'bg-white/15 border border-white/20',
      };

    case 'COMPLETED':
      return {
        label: 'Completed',
        icon: CircleCheck,
        badgeClass: 'bg-white/15 border border-white/20',
      };

    case 'IN_PROGRESS':
      return {
        label: 'In Progress',
        icon: CarFront,
        badgeClass: 'bg-white/15 border border-white/20',
      };

    default:
      return {
        label: status || 'Pending',
        icon: Clock3,
        badgeClass: 'bg-white/15 border border-white/20',
      };
  }
};

export default function TrackingHeader({ appointment }) {
  const isCancelled = appointment?.status === 'CANCELLED';
  const presentation = getStatusPresentation(appointment?.status);
  const StatusIcon = presentation.icon;

  return (
    <View
      className="bg-primary rounded-3xl mb-6 overflow-hidden"
      style={{
        shadowColor: '#C1272D',
        shadowOpacity: 0.2,
        shadowRadius: 18,
        shadowOffset: { width: 0, height: 8 },
        elevation: 5,
      }}
    >
      <View className="px-5 pt-5 pb-6">
        <View className="flex-row items-center justify-between mb-7">
          <View className="w-11 h-11 rounded-full bg-white/15 border border-white/20 items-center justify-center">
            <CarFront size={20} color="#FFFFFF" strokeWidth={2} />
          </View>

          <View
            className={`min-h-[44px] px-4 rounded-full flex-row items-center ${presentation.badgeClass}`}
          >
            <StatusIcon size={15} color="#FFFFFF" strokeWidth={2} />
            <Text className="ml-2 text-xs font-semibold text-white">
              {presentation.label}
            </Text>
          </View>
        </View>

        <Text className="text-sm font-normal text-white/70">
          Tracking number
        </Text>

        <Text className="text-3xl font-bold tracking-tight text-white mt-1">
          {appointment?.trackingNumber || 'N/A'}
        </Text>

        <View className="mt-5 pt-4 border-t border-white/20 flex-row items-center justify-between">
          <View className="flex-1 pr-3">
            <Text className="text-xs text-white/70">
              Service progress
            </Text>
            <Text className="text-sm font-semibold text-white mt-1">
              {isCancelled
                ? 'Appointment cancelled'
                : 'Your service is being tracked'}
            </Text>
          </View>

          <Text className="text-xs font-medium text-white/70">
            Updated now
          </Text>
        </View>
      </View>
    </View>
  );
}