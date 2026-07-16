import { View, Text, TouchableOpacity, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Calendar } from 'react-native-calendars';

export default function CalendarModal({ visible, onClose, onDayPress, markedDates, primaryColor }) {
  return (
    <Modal animationType="slide" transparent visible={visible} onRequestClose={onClose}>
      <View className="flex-1 justify-end bg-black/60">
        <View className="rounded-t-[40px] p-8 pb-12 bg-card">
          <View className="w-12 h-1.5 rounded-full self-center mb-6 bg-foreground/10" />
          <View className="flex-row justify-between items-center mb-6">
            <Text className="text-xl font-heading font-black text-foreground">Select Date</Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close-circle" size={28} color="#666" />
            </TouchableOpacity>
          </View>
          <Calendar
            onDayPress={onDayPress}
            markedDates={markedDates}
            minDate={new Date().toISOString().split('T')[0]}
            theme={{
              calendarBackground: 'transparent',
              textSectionTitleColor: '#666',
              selectedDayBackgroundColor: '#C1272D',
              selectedDayTextColor: '#fff',
              todayTextColor: '#C1272D',
              dayTextColor: '#1A1A1A',
              textDisabledColor: '#999',
              monthTextColor: '#1A1A1A',
              arrowColor: '#C1272D',
              textDayFontWeight: '700',
              textMonthFontWeight: '900',
            }}
          />
        </View>
      </View>
    </Modal>
  );
}