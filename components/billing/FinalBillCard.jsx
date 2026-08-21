import { View, Text, TouchableOpacity } from 'react-native';
import {
  ChevronRight,
  ReceiptText,
  CalendarDays,
  CarFront,
  Hash,
} from 'lucide-react-native';

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

  const statusColors = {
    PENDING: '#F59E0B',
    HOLD: '#8B5CF6',
    OFFICIAL: theme.primary,
    PAID: '#34A853',
  };

  const statusLabels = {
    PENDING: 'Pending',
    HOLD: 'On Hold',
    OFFICIAL: 'Official',
    PAID: 'Paid',
  };

  const statusColor = statusColors[item.status] || '#8E8E93';
  const statusLabel = statusLabels[item.status] || item.status;

  return (
    <TouchableOpacity
      onPress={onPress}
      className="bg-card rounded-xl mb-3 border border-border overflow-hidden"
      activeOpacity={0.8}
    >
      <View className="p-4">
        <View className="flex-row items-start justify-between">
          <View className="flex-1 pr-3">
            <View className="flex-row items-center mb-2">
              <View className="w-9 h-9 rounded-xl bg-primary/10 items-center justify-center mr-2.5">
                <ReceiptText size={18} color={theme.primary} />
              </View>

              <View>
                <Text
                  className="text-xs font-semibold uppercase tracking-[1.2px]"
                  style={{ color: theme.primary }}
                >
                  Final Bill
                </Text>

                <Text
                  className="text-xs mt-0.5"
                  style={{ color: theme.textSecondary }}
                >
                  Bill generated {date}
                </Text>
              </View>
            </View>

            <Text
              className="text-2xl font-bold"
              style={{ color: theme.text }}
            >
              ₱
              {total.toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </Text>
          </View>

          <View
            className="px-3 min-h-[30px] rounded-full items-center justify-center"
            style={{ backgroundColor: `${statusColor}18` }}
          >
            <Text
              className="text-xs font-semibold"
              style={{ color: statusColor }}
            >
              {statusLabel}
            </Text>
          </View>
        </View>

        <View className="mt-4 rounded-xl bg-background overflow-hidden">
          <View className="flex-row items-center px-3 py-3 border-b border-border">
            <Hash size={17} color={theme.textSecondary} />

            <View className="flex-1 ml-3">
              <Text
                className="text-xs"
                style={{ color: theme.textSecondary }}
              >
                Invoice
              </Text>

              <Text
                className="text-sm font-semibold mt-0.5"
                style={{ color: theme.text }}
              >
                #{item.id?.slice(0, 8).toUpperCase()}
              </Text>
            </View>
          </View>

          <View className="flex-row items-center px-3 py-3 border-b border-border">
            <CarFront size={17} color={theme.textSecondary} />

            <View className="flex-1 ml-3">
              <Text
                className="text-xs"
                style={{ color: theme.textSecondary }}
              >
                Appointment
              </Text>

              <Text
                className="text-sm font-medium mt-0.5"
                style={{ color: theme.text }}
              >
                #{item.appointment?.trackingNumber || 'N/A'}
              </Text>
            </View>
          </View>

          <View className="flex-row items-center px-3 py-3">
            <CalendarDays size={17} color={theme.textSecondary} />

            <View className="flex-1 ml-3">
              <Text
                className="text-xs"
                style={{ color: theme.textSecondary }}
              >
                Estimate & billing
              </Text>

              <Text
                className="text-sm font-medium mt-0.5"
                style={{ color: theme.text }}
              >
                Estimate ₱{estimateTotal.toFixed(2)}
              </Text>

              <Text
                className="text-xs mt-0.5"
                style={{ color: theme.textSecondary }}
              >
                Estimated {estimateDate}
              </Text>
            </View>
          </View>

          {item.estimateId && (
            <View className="px-3 py-3 border-t border-border">
              <Text
                className="text-xs"
                style={{ color: theme.textSecondary }}
              >
                Estimate ID
              </Text>

              <Text
                className="text-sm font-medium mt-0.5"
                style={{ color: theme.text }}
              >
                {item.estimateId.slice(0, 8).toUpperCase()}
              </Text>
            </View>
          )}
        </View>
      </View>

      <View className="min-h-[44px] px-4 flex-row items-center justify-between border-t border-border">
        <Text
          className="text-sm font-semibold"
          style={{ color: theme.primary }}
        >
          Open invoice
        </Text>

        <View className="w-8 h-8 items-center justify-center">
          <ChevronRight size={19} color={theme.primary} />
        </View>
      </View>
    </TouchableOpacity>
  );
}