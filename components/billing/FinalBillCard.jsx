
import {
  View,
  Text,
  TouchableOpacity,
} from 'react-native';

import {
  ChevronRight,
  ReceiptText,
  CalendarDays,
  CarFront,
  Hash,
} from 'lucide-react-native';

import { useTheme } from '../../context/ThemeContext';

function formatCurrency(value) {
  const amount = Number(value);

  if (!Number.isFinite(amount)) {
    return '0.00';
  }

  return amount.toLocaleString('en-PH', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function formatDate(value) {
  if (!value) {
    return '—';
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return '—';
  }

  return date.toLocaleDateString('en-PH', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function getTrackingNumber(item) {
  const trackingNumber =
    item?.appointment?.trackingNumber;

  if (
    trackingNumber === null ||
    trackingNumber === undefined ||
    String(trackingNumber).trim() === ''
  ) {
    return null;
  }

  return String(trackingNumber).trim();
}

function getEstimateTotal(item) {
  const value = item?.estimate?.grandTotal;

  if (
    value === null ||
    value === undefined ||
    value === ''
  ) {
    return null;
  }

  const amount = Number(value);

  if (!Number.isFinite(amount)) {
    return null;
  }

  return formatCurrency(amount);
}

export default function FinalBillCard({
  item,
  onPress,
}) {
  const { theme } = useTheme();

  const date = formatDate(item?.createdAt);

  const total = formatCurrency(item?.grandTotal);

  const estimateTotal = getEstimateTotal(item);

  const trackingNumber = getTrackingNumber(item);

  const normalizedStatus = String(
    item?.status || ''
  ).toUpperCase();

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

  const statusColor =
    statusColors[normalizedStatus] || '#8E8E93';

  const statusLabel =
    statusLabels[normalizedStatus] ||
    normalizedStatus ||
    'Unknown';

  const invoiceNumber = item?.id
    ? String(item.id).slice(0, 8).toUpperCase()
    : '—';

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={!onPress}
      className="bg-card rounded-xl mb-3 border border-border overflow-hidden"
      activeOpacity={0.8}
    >
      <View className="p-4">
        <View className="flex-row items-start justify-between">
          <View className="flex-1 pr-3">
            <View className="flex-row items-center mb-2">
              <View className="w-9 h-9 rounded-xl bg-primary/10 items-center justify-center mr-2.5">
                <ReceiptText
                  size={18}
                  color={theme.primary}
                />
              </View>

              <View>
                <Text
                  className="text-xs font-semibold uppercase tracking-[1.2px]"
                  style={{
                    color: theme.primary,
                  }}
                >
                  Final Cost
                </Text>

                <Text
                  className="text-xs mt-0.5"
                  style={{
                    color: theme.textSecondary,
                  }}
                >
                  Bill generated {date}
                </Text>
              </View>
            </View>

            <Text
              className="text-2xl font-bold"
              style={{
                color: theme.text,
              }}
            >
              ₱{total}
            </Text>
          </View>

          <View
            className="px-3 min-h-[30px] rounded-full items-center justify-center"
            style={{
              backgroundColor: `${statusColor}18`,
            }}
          >
            <Text
              className="text-xs font-semibold"
              style={{
                color: statusColor,
              }}
            >
              {statusLabel}
            </Text>
          </View>
        </View>

        <View className="mt-4 rounded-xl bg-background overflow-hidden">
          <View className="flex-row items-center px-3 py-3 border-b border-border">
            <Hash
              size={17}
              color={theme.textSecondary}
            />

            <View className="flex-1 ml-3">
              <Text
                className="text-xs"
                style={{
                  color: theme.textSecondary,
                }}
              >
                Invoice
              </Text>

              <Text
                className="text-sm font-semibold mt-0.5"
                style={{
                  color: theme.text,
                }}
              >
                #{invoiceNumber}
              </Text>
            </View>
          </View>

          <View className="flex-row items-center px-3 py-3 border-b border-border">
            <CarFront
              size={17}
              color={theme.textSecondary}
            />

            <View className="flex-1 ml-3">
              <Text
                className="text-xs"
                style={{
                  color: theme.textSecondary,
                }}
              >
                Appointment
              </Text>

              <Text
                className="text-sm font-medium mt-0.5"
                style={{
                  color: theme.text,
                }}
              >
                {trackingNumber
                  ? `#${trackingNumber}`
                  : 'Tracking number unavailable'}
              </Text>
            </View>
          </View>

          <View className="flex-row items-center px-3 py-3">
            <CalendarDays
              size={17}
              color={theme.textSecondary}
            />

            <View className="flex-1 ml-3">
              <Text
                className="text-xs"
                style={{
                  color: theme.textSecondary,
                }}
              >
                Estimate & Billing
              </Text>

              <Text
                className="text-sm font-semibold mt-1"
                style={{
                  color: theme.text,
                }}
              >
                {estimateTotal !== null
                  ? `Estimate ₱${estimateTotal}`
                  : 'Estimate total unavailable'}
              </Text>

              <Text
                className="text-xs mt-1"
                style={{
                  color: theme.textSecondary,
                }}
              >
                Final Cost ₱{total}
              </Text>
            </View>
          </View>
        </View>
      </View>

      <View className="min-h-[44px] px-4 flex-row items-center justify-between border-t border-border">
        <Text
          className="text-sm font-semibold"
          style={{
            color: theme.primary,
          }}
        >
          {normalizedStatus === 'PAID'
            ? 'View receipt'
            : 'Open invoice'}
        </Text>

        <View className="w-8 h-8 items-center justify-center">
          <ChevronRight
            size={19}
            color={theme.primary}
          />
        </View>
      </View>
    </TouchableOpacity>
  );
}
