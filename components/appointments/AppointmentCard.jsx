import { View, Text, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import {
  ChevronRight,
  CalendarDays,
  Clock3,
  CarFront,
  UserRound,
  Hash,
  ClipboardCheck,
  Wrench,
  SearchCheck,
  FileCheck2,
  CircleCheck,
  CircleX,
} from 'lucide-react-native';

import {
  formatDate,
  formatTime,
  getServiceNames,
} from '../../utils/format';
import { getStatusConfig } from '../../utils/appointments';
import { useTheme } from '../../context/ThemeContext';

const statusIcons = {
  PENDING: Clock3,
  CONFIRMED: CalendarDays,
  UNDER_INSPECTION: SearchCheck,
  WAITING_FOR_APPROVAL: FileCheck2,
  IN_PROGRESS: Wrench,
  COMPLETED: CircleCheck,
  CANCELLED: CircleX,
};

export default function AppointmentCard({ appointment }) {
  const router = useRouter();
  const { theme } = useTheme();

  const statusConfig = getStatusConfig(appointment.status);

  const iconColor = statusConfig.color;
  const badgeBg = `${statusConfig.color}18`;

  const StatusIcon =
    statusIcons[appointment.status] || ClipboardCheck;

  const serviceNames = getServiceNames(appointment);

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={() =>
        router.push(`/tracking?appointmentId=${appointment.id}`)
      }
      className="bg-card rounded-xl mb-3 border border-border overflow-hidden"
    >
      <View className="p-4">
        {/* Top section */}
        <View className="flex-row items-start">
          <View
            className="w-11 h-11 rounded-xl items-center justify-center mr-3"
            style={{ backgroundColor: badgeBg }}
          >
            <StatusIcon
              size={20}
              color={iconColor}
              strokeWidth={2.1}
            />
          </View>

          <View className="flex-1 pr-2">
            <Text
              className="text-xs font-semibold uppercase tracking-[1.2px]"
              style={{ color: theme.primary }}
            >
              Appointment
            </Text>

            <Text
              className="text-base font-semibold mt-1"
              style={{ color: theme.text }}
              numberOfLines={2}
            >
              {serviceNames}
            </Text>

            {appointment.vehicle && (
              <View className="flex-row items-center mt-1.5">
                <CarFront
                  size={14}
                  color={theme.textSecondary}
                />

                <Text
                  className="text-sm ml-1.5"
                  style={{ color: theme.textSecondary }}
                  numberOfLines={1}
                >
                  {appointment.vehicle.make}{' '}
                  {appointment.vehicle.model}
                </Text>
              </View>
            )}
          </View>

          {/* Status badge */}
          <View
            className="px-3 min-h-[30px] rounded-full items-center justify-center"
            style={{ backgroundColor: badgeBg }}
          >
            <Text
              className="text-xs font-semibold"
              style={{ color: iconColor }}
            >
              {statusConfig.label}
            </Text>
          </View>
        </View>

        {/* Information rows */}
        <View className="mt-4 rounded-xl bg-background overflow-hidden">
          {/* Appointment date */}
          <View className="flex-row items-center min-h-[48px] px-3 border-b border-border">
            <CalendarDays
              size={17}
              color={theme.textSecondary}
            />

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
                {formatDate(appointment.appointmentDate)}
              </Text>
            </View>

            <View className="flex-row items-center">
              <Clock3
                size={14}
                color={theme.textSecondary}
              />

              <Text
                className="text-xs font-medium ml-1.5"
                style={{ color: theme.textSecondary }}
              >
                {formatTime(appointment.appointmentTime)}
              </Text>
            </View>
          </View>

          {/* Vehicle / plate */}
          {appointment.vehicle && (
            <View className="flex-row items-center min-h-[48px] px-3 border-b border-border">
              <CarFront
                size={17}
                color={theme.textSecondary}
              />

              <View className="flex-1 ml-3">
                <Text
                  className="text-xs"
                  style={{ color: theme.textSecondary }}
                >
                  Vehicle
                </Text>

                <Text
                  className="text-sm font-medium mt-0.5"
                  style={{ color: theme.text }}
                >
                  {appointment.vehicle.make}{' '}
                  {appointment.vehicle.model}
                </Text>
              </View>

              {appointment.vehicle.plateNumber && (
                <View className="bg-card rounded-lg px-2.5 py-1.5">
                  <Text
                    className="text-xs font-semibold"
                    style={{ color: theme.text }}
                  >
                    {appointment.vehicle.plateNumber}
                  </Text>
                </View>
              )}
            </View>
          )}

          {/* Customer */}
          {appointment.customer?.fullname && (
            <View className="flex-row items-center min-h-[48px] px-3 border-b border-border">
              <UserRound
                size={17}
                color={theme.textSecondary}
              />

              <View className="flex-1 ml-3">
                <Text
                  className="text-xs"
                  style={{ color: theme.textSecondary }}
                >
                  Customer
                </Text>

                <Text
                  className="text-sm font-medium mt-0.5"
                  style={{ color: theme.text }}
                  numberOfLines={1}
                >
                  {appointment.customer.fullname}
                </Text>
              </View>
            </View>
          )}

          {/* Tracking */}
          <View className="flex-row items-center min-h-[48px] px-3">
            <Hash
              size={17}
              color={theme.textSecondary}
            />

            <View className="flex-1 ml-3">
              <Text
                className="text-xs"
                style={{ color: theme.textSecondary }}
              >
                Tracking number
              </Text>

              <Text
                className="text-sm font-medium mt-0.5"
                style={{ color: theme.text }}
              >
                #{appointment.trackingNumber || 'N/A'}
              </Text>
            </View>
          </View>
        </View>
      </View>

      {/* Bottom action row */}
      <View className="min-h-[44px] px-4 flex-row items-center justify-between border-t border-border">
        <Text
          className="text-sm font-semibold"
          style={{ color: theme.primary }}
        >
          View appointment
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