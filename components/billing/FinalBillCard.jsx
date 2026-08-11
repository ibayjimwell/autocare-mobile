import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';

export default function FinalBillCard({ item, onPress }) {
  const { theme } = useTheme();
  const date = new Date(item.createdAt).toLocaleDateString('en-PH', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
  const total = parseFloat(item.grandTotal || 0);
  const estimateTotal = parseFloat(item.estimate?.grandTotal || 0);
  const estimateDate = item.estimate?.createdAt
    ? new Date(item.estimate.createdAt).toLocaleDateString('en-PH', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })
    : 'N/A';

  const statusColor = {
    PENDING: '#f59e0b',
    PAID: '#10b981',
    CANCELLED: '#ef4444',
  }[item.status] || '#6b7280';

  const statusLabel = item.status || 'Pending';

  return (
    <TouchableOpacity
      onPress={onPress}
      className="p-5 rounded-2xl mb-3 border"
      style={{ backgroundColor: theme.background, borderColor: theme.border }}
      activeOpacity={0.7}
    >
      {/* Grand Total */}
      <View className="flex-row justify-between items-start mb-3">
        <View>
          <Text className="text-xs font-black uppercase tracking-wider" style={{ color: theme.primary }}>
            Final Bill
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
        <Text className="text-sm font-bold" style={{ color: theme.text }}>
          Invoice #{item.id?.slice(0, 8).toUpperCase()}
        </Text>
        <Text className="text-xs" style={{ color: theme.textSecondary }}>
          Appointment #{item.appointment?.trackingNumber || 'N/A'} • {item.appointment?.appointmentDate} at {item.appointment?.appointmentTime}
        </Text>
        <Text className="text-xs" style={{ color: theme.textSecondary }}>
          Estimate Total: ₱{estimateTotal.toFixed(2)} • Generated: {estimateDate}
        </Text>
        <Text className="text-xs" style={{ color: theme.textSecondary }}>
          Bill Generated: {date}
        </Text>
        {item.estimateId && (
          <Text className="text-xs" style={{ color: theme.textSecondary }}>
            Estimate ID: {item.estimateId.slice(0, 8).toUpperCase()}
          </Text>
        )}
      </View>

      <View className="flex-row justify-end mt-3">
        <Ionicons name="chevron-forward" size={18} color={theme.border} />
      </View>
    </TouchableOpacity>
  );
}