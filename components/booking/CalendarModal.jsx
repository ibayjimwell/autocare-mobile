import {
  View,
  Text,
  TouchableOpacity,
  Modal,
} from 'react-native';

import {
  X,
} from 'lucide-react-native';

import {
  Calendar,
} from 'react-native-calendars';

function getTodayString() {
  const today =
    new Date();

  const year =
    today.getFullYear();

  const month =
    String(
      today.getMonth() + 1
    ).padStart(2, '0');

  const day =
    String(
      today.getDate()
    ).padStart(2, '0');

  return `${year}-${month}-${day}`;
}

export default function CalendarModal({
  visible,
  onClose,
  onDayPress,
  markedDates,
  primaryColor,
  disabledDates = [],
}) {
  const disabledDateMap =
    disabledDates.reduce(
      (
        result,
        date
      ) => {
        result[date] = {
          disabled: true,
          disableTouchEvent: true,
          selected: false,
          marked: false,
        };

        return result;
      },
      {}
    );

  const mergedMarkedDates = {
    ...disabledDateMap,
    ...markedDates,
  };

  /*
   * Disabled dates must always win over normal marks.
   * Re-apply the disabled state after markedDates are merged.
   */
  disabledDates.forEach(
    (date) => {
      mergedMarkedDates[
        date
      ] = {
        ...(mergedMarkedDates[
          date
        ] || {}),
        disabled: true,
        disableTouchEvent: true,
        selected: false,
        marked: false,
      };
    }
  );

  return (
    <Modal
      animationType="slide"
      transparent
      visible={visible}
      onRequestClose={
        onClose
      }
    >
      <View className="flex-1 justify-end bg-black/40">
        <View className="rounded-t-3xl bg-card px-4 pb-10 pt-3">
          <View className="mb-4 h-1 w-9 self-center rounded-full bg-foreground/10" />

          <View className="mb-4 flex-row items-center justify-between px-1">
            <Text className="text-lg font-semibold text-foreground">
              Select Date
            </Text>

            <TouchableOpacity
              onPress={onClose}
              hitSlop={8}
              className="min-h-[44px] min-w-[44px] items-center justify-center"
            >
              <X
                size={22}
                color="#8E8E93"
              />
            </TouchableOpacity>
          </View>

          <Calendar
            onDayPress={onDayPress}
            markedDates={
              mergedMarkedDates
            }
            minDate={getTodayString()}
            theme={{
              calendarBackground:
                'transparent',

              textSectionTitleColor:
                '#8E8E93',

              selectedDayBackgroundColor:
                primaryColor ||
                '#C1272D',

              selectedDayTextColor:
                '#FFFFFF',

              todayTextColor:
                '#C1272D',

              dayTextColor:
                '#000000',

              textDisabledColor:
                '#C7C7CC',

              monthTextColor:
                '#000000',

              arrowColor:
                primaryColor ||
                '#C1272D',

              textDayFontWeight:
                '500',

              textMonthFontWeight:
                '700',
            }}
          />
        </View>
      </View>
    </Modal>
  );
}