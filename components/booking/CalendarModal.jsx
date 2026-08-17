import { View, Text, TouchableOpacity, Modal } from 'react-native';
import { X } from 'lucide-react-native';
import { Calendar } from 'react-native-calendars';

export default function CalendarModal({ visible, onClose, onDayPress, markedDates, primaryColor }) {
  return (
    <Modal animationType="slide" transparent visible={visible} onRequestClose={onClose}>
      <View className="flex-1 justify-end bg-black/40">
        <View className="rounded-t-3xl px-4 pt-3 pb-10 bg-card">
          <View className="w-9 h-1 rounded-full self-center mb-4 bg-foreground/10" />
          <View className="flex-row justify-between items-center mb-4 px-1">
            <Text className="text-lg font-semibold text-foreground">Select Date</Text>
            <TouchableOpacity
              onPress={onClose}
              hitSlop={8}
              className="min-h-[44px] min-w-[44px] items-center justify-center"
            >
              <X size={22} color="#8E8E93" />
            </TouchableOpacity>
          </View>
          <Calendar
            onDayPress={onDayPress}
            markedDates={markedDates}
            minDate={new Date().toISOString().split('T')[0]}
            theme={{
              calendarBackground: 'transparent',
              textSectionTitleColor: '#8E8E93',
              selectedDayBackgroundColor: '#C1272D',
              selectedDayTextColor: '#FFFFFF',
              todayTextColor: '#C1272D',
              dayTextColor: '#000000',
              textDisabledColor: '#C7C7CC',
              monthTextColor: '#000000',
              arrowColor: '#C1272D',
              textDayFontWeight: '500',
              textMonthFontWeight: '700',
            }}
          />
        </View>
      </View>
    </Modal>
  );
}