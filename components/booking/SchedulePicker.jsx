import { View, Text, TouchableOpacity } from 'react-native';
import { Calendar, CalendarClock, ChevronRight, Clock } from 'lucide-react-native';
import { formatTime12h } from '../../utils/format';

export default function SchedulePicker({
  selectedDate,
  selectedService,
  selectedTime,
  customTime,
  availableSlots,
  onSelectDate,
  onSelectTime,
  onCustomTimePress,
}) {
  return (
    <View className="mb-6">
      <View className="flex-row items-center px-1 mb-3">
        <View className="w-7 h-7 rounded-full bg-primary/10 items-center justify-center mr-2">
          <CalendarClock size={14} color="#C1272D" />
        </View>
        <Text className="text-lg font-semibold text-foreground">Choose Schedule</Text>
      </View>

      <View className="bg-card rounded-xl overflow-hidden">
        {/* Date picker row — iOS settings style */}
        <TouchableOpacity
          activeOpacity={0.6}
          className="flex-row items-center px-4 py-3.5 min-h-[44px]"
          onPress={onSelectDate}
        >
          <View className="w-8 h-8 rounded-lg bg-primary/10 items-center justify-center mr-3">
            <Calendar size={16} color="#C1272D" />
          </View>
          <Text className="flex-1 text-base font-normal text-foreground">Date</Text>
          <Text className="text-base font-normal text-muted-foreground mr-1">
            {selectedDate ? selectedDate.toDateString() : 'Choose Date'}
          </Text>
          <ChevronRight size={18} color="#C7C7CC" />
        </TouchableOpacity>

        <View className="h-px bg-border ml-4" />

        {/* Time slots */}
        {!selectedDate || !selectedService ? (
          <View className="px-4 py-6 items-center">
            <Text className="text-sm font-normal text-muted-foreground text-center">
              Select a service and date to view available time slots
            </Text>
          </View>
        ) : (
          <View className="px-4 py-4">
            {availableSlots.length === 0 ? (
              <Text className="text-center w-full py-4 text-base font-medium text-destructive">
                No slots available today
              </Text>
            ) : (
              <View className="flex-row flex-wrap justify-between">
                {availableSlots.map((slot) => (
                  <TouchableOpacity
                    key={slot.time}
                    activeOpacity={0.7}
                    className={`w-[23%] min-h-[44px] mb-2.5 rounded-lg items-center justify-center border ${
                      !slot.available ? 'opacity-30' : ''
                    } ${
                      selectedTime === slot.time && !customTime
                        ? 'bg-primary border-primary'
                        : 'bg-background border-border'
                    }`}
                    onPress={() => {
                      if (slot.available) {
                        onSelectTime(slot.time);
                      }
                    }}
                    disabled={!slot.available}
                  >
                    <Text
                      className={`text-xs font-semibold ${
                        selectedTime === slot.time && !customTime
                          ? 'text-primary-foreground'
                          : 'text-foreground'
                      }`}
                    >
                      {formatTime12h(slot.time)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}

            {/* Custom time */}
            <TouchableOpacity
              activeOpacity={0.7}
              className={`flex-row items-center justify-center min-h-[44px] py-3 rounded-lg border border-dashed mt-1.5 ${
                customTime ? 'bg-primary/10' : 'bg-transparent'
              }`}
              style={{ borderColor: '#C1272D66' }}
              onPress={onCustomTimePress}
            >
              <Clock size={16} color="#C1272D" />
              <Text className="ml-2 text-sm font-semibold text-primary">
                {customTime ? `Custom: ${formatTime12h(customTime)}` : 'Pick Custom Time'}
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </View>
  );
}