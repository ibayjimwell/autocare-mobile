import {
  View,
  Text,
  TouchableOpacity,
} from 'react-native';

import {
  CalendarDays,
  Clock3,
  CheckCircle2,
} from 'lucide-react-native';

function getSlotValue(
  slot
) {
  if (
    typeof slot ===
    'string'
  ) {
    return slot;
  }

  return (
    slot?.time ||
    slot?.startTime ||
    slot?.appointmentTime ||
    slot?.value ||
    null
  );
}

function isSlotAvailable(
  slot
) {
  if (
    typeof slot ===
    'string'
  ) {
    return true;
  }

  if (
    slot?.available === false
  ) {
    return false;
  }

  if (
    slot?.isAvailable ===
    false
  ) {
    return false;
  }

  return true;
}

function formatTimeLabel(
  value
) {
  if (!value) {
    return '';
  }

  const [
    hourRaw,
    minuteRaw,
  ] = String(value)
    .split(':')
    .map(Number);

  const hour =
    Number(hourRaw) || 0;

  const minute =
    Number(minuteRaw) || 0;

  const suffix =
    hour >= 12
      ? 'PM'
      : 'AM';

  const displayHour =
    hour % 12 || 12;

  return `${displayHour}:${String(
    minute
  ).padStart(2, '0')} ${suffix}`;
}

function formatSelectedDate(
  date
) {
  if (!date) {
    return 'Choose a date';
  }

  return date.toLocaleDateString(
    'en-PH',
    {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }
  );
}

function SlotSkeleton() {
  return (
    <View className="mt-3 flex-row flex-wrap">
      {Array.from({
        length: 6,
      }).map((_, index) => (
        <View
          key={index}
          className="mb-3 mr-2 h-11 w-[30%] min-w-[92px] rounded-xl bg-secondary"
        />
      ))}
    </View>
  );
}

export default function SchedulePicker({
  selectedDate,
  selectedService,
  selectedTime,
  availableSlots,
  slotsLoading,
  onSelectDate,
  onSelectTime,
}) {
  return (
    <View className="mb-6">
      {/* Date */}
      <View className="mb-3 flex-row items-center px-1">
        <View className="mr-2 h-7 w-7 items-center justify-center rounded-full bg-primary/10">
          <CalendarDays
            size={14}
            color="#C1272D"
          />
        </View>

        <Text className="text-lg font-semibold text-foreground">
          Schedule
        </Text>
      </View>

      <View className="overflow-hidden rounded-xl bg-card">
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={onSelectDate}
          className="min-h-[60px] flex-row items-center px-4 py-3"
        >
          <View className="h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
            <CalendarDays
              size={19}
              color="#C1272D"
            />
          </View>

          <View className="ml-3 flex-1">
            <Text className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Date
            </Text>

            <Text className="mt-1 text-base font-semibold text-foreground">
              {formatSelectedDate(
                selectedDate
              )}
            </Text>
          </View>
        </TouchableOpacity>

        <View className="ml-4 h-px bg-border" />

        {/* Times */}
        <View className="px-4 py-4">
          <View className="flex-row items-center">
            <Clock3
              size={17}
              color="#8E8E93"
            />

            <Text className="ml-2 text-sm font-semibold text-foreground">
              Available Times
            </Text>
          </View>

          {!selectedDate ? (
            <Text className="mt-3 text-sm leading-5 text-muted-foreground">
              Select a date to see the available appointment times.
            </Text>
          ) : !selectedService ? (
            <Text className="mt-3 text-sm leading-5 text-muted-foreground">
              Select a service first to load available times.
            </Text>
          ) : slotsLoading ? (
            <SlotSkeleton />
          ) : availableSlots.length === 0 ? (
            <View className="mt-3 rounded-xl bg-secondary px-4 py-4">
              <Text className="text-sm font-medium text-foreground">
                No available times
              </Text>

              <Text className="mt-1 text-xs leading-5 text-muted-foreground">
                Try another date or service.
              </Text>
            </View>
          ) : (
            <View className="mt-3 flex-row flex-wrap">
              {availableSlots.map(
                (slot, index) => {
                  const value =
                    getSlotValue(
                      slot
                    );

                  if (!value) {
                    return null;
                  }

                  const available =
                    isSlotAvailable(
                      slot
                    );

                  const selected =
                    selectedTime ===
                    value;

                  return (
                    <TouchableOpacity
                      key={`${value}-${index}`}
                      activeOpacity={
                        available
                          ? 0.7
                          : 1
                      }
                      disabled={
                        !available
                      }
                      onPress={() =>
                        onSelectTime(
                          value
                        )
                      }
                      className={`mb-3 mr-2 min-h-[44px] min-w-[92px] flex-row items-center justify-center rounded-xl border px-3 ${
                        !available
                          ? 'border-border bg-secondary opacity-45'
                          : selected
                            ? 'border-primary bg-primary'
                            : 'border-border bg-background'
                      }`}
                    >
                      <Text
                        className={`text-sm font-semibold ${
                          !available
                            ? 'text-muted-foreground'
                            : selected
                              ? 'text-white'
                              : 'text-foreground'
                        }`}
                      >
                        {formatTimeLabel(
                          value
                        )}
                      </Text>

                      {selected &&
                        available && (
                          <CheckCircle2
                            size={
                              15
                            }
                            color="#FFFFFF"
                            className="ml-1"
                          />
                        )}
                    </TouchableOpacity>
                  );
                }
              )}
            </View>
          )}
        </View>
      </View>
    </View>
  );
}