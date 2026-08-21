import { View, Text, TouchableOpacity } from 'react-native';
import {
  ChevronRight,
  FileText,
  ReceiptText,
  CarFront,
  CalendarDays,
} from 'lucide-react-native';

import { useTheme } from '../../context/ThemeContext';

export function EstimateListItem({ item, onPress }) {
  const { theme } = useTheme();

  const vehicle = item.appointment?.vehicle;

  const date = new Date(item.createdAt).toLocaleDateString('en-PH', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  const total = parseFloat(item.grandTotal || 0);

  const statusColor =
    item.status === 'APPROVED'
      ? '#34A853'
      : item.status === 'DECLINED'
        ? '#D64545'
        : '#F59E0B';

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.8}
      className="bg-card rounded-xl mb-3 border border-border overflow-hidden"
    >
      <View className="p-4 flex-row items-center">
        <View className="w-11 h-11 rounded-xl bg-primary/10 items-center justify-center mr-3">
          <FileText size={20} color={theme.primary} />
        </View>

        <View className="flex-1 pr-3">
          <Text
            className="text-xs font-semibold uppercase tracking-[1.2px]"
            style={{ color: theme.primary }}
          >
            Estimate
          </Text>

          {vehicle && (
            <View className="flex-row items-center mt-1">
              <CarFront size={14} color={theme.textSecondary} />

              <Text
                className="text-sm font-semibold ml-1.5"
                style={{ color: theme.text }}
              >
                {vehicle.make} {vehicle.model}
              </Text>
            </View>
          )}

          <Text
            className="text-xs mt-1"
            style={{ color: theme.textSecondary }}
          >
            {date}
          </Text>
        </View>

        <View className="items-end">
          <Text
            className="text-base font-bold"
            style={{ color: theme.text }}
          >
            ₱{total.toLocaleString()}
          </Text>

          <View
            className="px-2.5 min-h-[28px] rounded-full items-center justify-center mt-1.5"
            style={{ backgroundColor: `${statusColor}18` }}
          >
            <Text
              className="text-[10px] font-semibold"
              style={{ color: statusColor }}
            >
              {item.status}
            </Text>
          </View>
        </View>

        <View className="ml-2">
          <ChevronRight size={18} color={theme.textSecondary} />
        </View>
      </View>
    </TouchableOpacity>
  );
}

export function FinalBillListItem({ item, onPress }) {
  const { theme } = useTheme();

  const date = new Date(item.createdAt).toLocaleDateString('en-PH', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  const total = parseFloat(item.grandTotal || 0);

  const statusColor =
    item.status === 'PAID'
      ? '#34A853'
      : item.status === 'PENDING'
        ? '#F59E0B'
        : theme.primary;

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.8}
      className="bg-card rounded-xl mb-3 border border-border overflow-hidden"
    >
      <View className="p-4 flex-row items-center">
        <View className="w-11 h-11 rounded-xl bg-primary/10 items-center justify-center mr-3">
          <ReceiptText size={20} color={theme.primary} />
        </View>

        <View className="flex-1 pr-3">
          <Text
            className="text-xs font-semibold uppercase tracking-[1.2px]"
            style={{ color: theme.primary }}
          >
            Final Bill
          </Text>

          <Text
            className="text-sm font-semibold mt-1"
            style={{ color: theme.text }}
          >
            Invoice #{item.id?.slice(0, 8).toUpperCase()}
          </Text>

          <View className="flex-row items-center mt-1">
            <CalendarDays size={13} color={theme.textSecondary} />

            <Text
              className="text-xs ml-1.5"
              style={{ color: theme.textSecondary }}
            >
              {date}
            </Text>
          </View>
        </View>

        <View className="items-end">
          <Text
            className="text-base font-bold"
            style={{ color: theme.text }}
          >
            ₱{total.toLocaleString()}
          </Text>

          <View
            className="px-2.5 min-h-[28px] rounded-full items-center justify-center mt-1.5"
            style={{ backgroundColor: `${statusColor}18` }}
          >
            <Text
              className="text-[10px] font-semibold"
              style={{ color: statusColor }}
            >
              {item.status}
            </Text>
          </View>
        </View>

        <View className="ml-2">
          <ChevronRight size={18} color={theme.textSecondary} />
        </View>
      </View>
    </TouchableOpacity>
  );
}