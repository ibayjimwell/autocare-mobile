import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
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
    <View className="mb-8">
      <View className="flex-row items-center mb-4">
        <View className="w-8 h-8 rounded-full bg-primary items-center justify-center mr-3">
          <Text className="text-white font-black text-xs">3</Text>
        </View>
        <Text className="text-lg font-heading font-black text-foreground">Choose Schedule</Text>
      </View>

      {/* Date picker button */}
      <TouchableOpacity
        className="p-5 rounded-[28px] flex-row justify-between items-center mb-4 border border-border bg-card"
        onPress={onSelectDate}
      >
        <View className="flex-row items-center">
          <Ionicons name="calendar" size={20} color="#C1272D" />
          <Text className={`ml-3 font-bold ${selectedDate ? 'text-foreground' : 'text-muted-foreground'}`}>
            {selectedDate ? selectedDate.toDateString() : 'Choose Date'}
          </Text>
        </View>
        <Ionicons name="chevron-forward" size={18} color="#666" />
      </TouchableOpacity>

      {/* Time slots */}
      {!selectedDate || !selectedService ? (
        <View className="p-8 items-center bg-muted/50 rounded-[28px]">
          <Text className="text-xs font-black uppercase tracking-widest text-foreground/30 text-center">
            Complete steps 1 & 2 to view slots
          </Text>
        </View>
      ) : (
        <>
          {availableSlots.length === 0 ? (
            <Text className="text-center w-full py-4 font-bold text-destructive">
              No slots available today
            </Text>
          ) : (
            <View className="flex-row flex-wrap justify-between">
              {availableSlots.map((slot) => (
                <TouchableOpacity
                  key={slot.time}
                  activeOpacity={0.7}
                  className={`w-[23%] py-4 mb-3 rounded-2xl items-center border border-border ${
                    !slot.available && 'opacity-30'
                  } ${
                    selectedTime === slot.time && !customTime
                      ? 'bg-primary'
                      : 'bg-card'
                  }`}
                  onPress={() => {
                    if (slot.available) {
                      onSelectTime(slot.time);
                    }
                  }}
                  disabled={!slot.available}
                >
                  <Text
                    className={`text-[10px] font-black ${
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
            activeOpacity={0.8}
            className={`flex-row items-center justify-center p-4 rounded-2xl border-2 border-dashed mt-2 ${
              customTime ? 'bg-primary/10' : 'bg-transparent'
            }`}
            style={{ borderColor: '#C1272D40' }}
            onPress={onCustomTimePress}
          >
            <Ionicons name="time" size={18} color="#C1272D" />
            <Text className="ml-2 font-black text-xs uppercase tracking-widest text-primary">
              {customTime ? `Custom: ${formatTime12h(customTime)}` : 'Pick Custom Time'}
            </Text>
          </TouchableOpacity>
        </>
      )}
    </View>
  );
}