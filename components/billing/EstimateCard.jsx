import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';

export default function EstimateCard({ item, onPress }) {
  const { theme } = useTheme();
  const vehicle = item.appointment?.vehicle;
  const date = new Date(item.createdAt).toLocaleDateString('en-PH', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
  const total = parseFloat(item.grandTotal || 0);

  const statusColor = {
    WAITING_FOR_APPROVAL: '#f59e0b',
    APPROVED: '#10b981',
    DECLINED: '#ef4444',
  }[item.status] || '#6b7280';

  const statusLabel = {
    WAITING_FOR_APPROVAL: 'Waiting Approval',
    APPROVED: 'Approved',
    DECLINED: 'Declined',
  }[item.status] || item.status;

  return (
    <TouchableOpacity
      onPress={onPress}
      className="p-5 rounded-2xl mb-3 border"
      style={{ backgroundColor: theme.background, borderColor: theme.border }}
      activeOpacity={0.7}
    >
      {/* Grand Total – big and bold */}
      <View className="flex-row justify-between items-start mb-3">
        <View>
          <Text className="text-xs font-black uppercase tracking-wider" style={{ color: theme.primary }}>
            Estimate
          </Text>
          <Text className="text-2xl font-black" style={{ color: theme.text }}>
            ₱{total.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </Text>
        </View>
        <View
          className="px-3 py-1 rounded-full"
          style={{ backgroundColor: statusColor + '20' }}
        >
          <Text className="text-[10px] font-black" style={{ color: statusColor }}>
            {statusLabel}
          </Text>
        </View>
      </View>

      {/* Details */}
      <View className="space-y-1">
        {vehicle && (
          <Text className="text-sm font-bold" style={{ color: theme.text }}>
            {vehicle.make} {vehicle.model} • {vehicle.plateNumber}
          </Text>
        )}
        <Text className="text-xs" style={{ color: theme.textSecondary }}>
          Appointment #{item.appointment?.trackingNumber || 'N/A'} • {item.appointment?.appointmentDate} at {item.appointment?.appointmentTime}
        </Text>
        <Text className="text-xs" style={{ color: theme.textSecondary }}>
          Generated: {date}
        </Text>
      </View>

      <View className="flex-row justify-end mt-3">
        <Ionicons name="chevron-forward" size={18} color={theme.border} />
      </View>
    </TouchableOpacity>
  );
}