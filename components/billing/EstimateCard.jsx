
import {
  View,
  Text,
  TouchableOpacity,
} from 'react-native';

import {
  ChevronRight,
  FileText,
  CarFront,
  CalendarDays,
  Clock3,
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

export default function EstimateCard({
  item,
  onPress,
}) {
  const { theme } = useTheme();

  const appointment = item?.appointment;
  const vehicle = appointment?.vehicle;

  const trackingNumber = getTrackingNumber(item);

  const date = formatDate(item?.createdAt);
  const total = formatCurrency(item?.grandTotal);

  const normalizedStatus = String(
    item?.status || ''
  ).toUpperCase();

  const statusColor = {
    WAITING_FOR_APPROVAL: '#F59E0B',
    APPROVED: '#34A853',
    DECLINED: '#D64545',
  }[normalizedStatus] || '#8E8E93';

  const statusLabel = {
    WAITING_FOR_APPROVAL: 'Waiting Approval',
    APPROVED: 'Approved',
    DECLINED: 'Declined',
  }[normalizedStatus] || normalizedStatus || 'Unknown';

  const vehicleName = [
    vehicle?.make,
    vehicle?.model,
  ]
    .filter(Boolean)
    .join(' ') || 'Vehicle';

  const scheduleDate =
    appointment?.appointmentDate || '—';

  const scheduleTime =
    appointment?.appointmentTime || '—';

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
                <FileText
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
                  Estimate
                </Text>

                <Text
                  className="text-xs mt-0.5"
                  style={{
                    color: theme.textSecondary,
                  }}
                >
                  Generated {date}
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
          {vehicle && vehicle.id ? (
            <View className="flex-row items-center px-3 py-3 border-b border-border">
              <CarFront
                size={17}
                color={theme.textSecondary}
              />

              <View className="flex-1 ml-3">
                <Text
                  className="text-sm font-semibold"
                  style={{
                    color: theme.text,
                  }}
                >
                  {vehicleName}
                </Text>

                <Text
                  className="text-xs mt-0.5"
                  style={{
                    color: theme.textSecondary,
                  }}
                >
                  {vehicle.plateNumber || 'No plate number'}
                </Text>
              </View>
            </View>
          ) : null}

          <View className="flex-row items-center px-3 py-3 border-b border-border">
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
            <Clock3
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
                Schedule
              </Text>

              <Text
                className="text-sm font-medium mt-0.5"
                style={{
                  color: theme.text,
                }}
              >
                {scheduleDate} • {scheduleTime}
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
          Review estimate
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
