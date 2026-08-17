You are an expert React Native developer and a master UI/UX designer specializing in Tailwind CSS / NativeWind and iOS Human Interface Guidelines (HIG).

Your task is to RECONSTRUCT the UI of the attached React Native screen or component, using the provided inspiration image as the **primary source for layout, structure, and component composition**, while applying the strict rules of the AutoCare HIG Design System to every element to produce a polished, premium native iOS UI.

DO NOT simply copy the old structure. Rethink the component tree based on the *inspiration image*. The resulting UI must mirror the spatial arrangement and general design of the image but must be composed *entirely* of standardized AutoCare HIG components and styles.

---

### STRICT RULES & CONSTRAINTS

1.  **LAYOUT & COMPOSITION PRIORITIZATION (INSPIRATION IMAGE):**
    *   **Rule:** Replicate the general spatial arrangement, section hierarchy, and positioning of all interactive and display components (buttons, text inputs, cards, headers, sections) as seen in the provided inspiration image.
    *   **Standardization:** Once the layout is defined by the image, each component used in that layout (e.g., a specific card style, a button type, a form field) must be standardized *exactly* according to the AutoCare HIG Design System specs below. For example, if the image shows a form, implement it using standard iOS text inputs and spacing, not a direct clone of the image's perhaps less native controls.

2.  **STRUCTURAL REDESIGN MANDATE (APPLE HIG LAYOUTS):**
    *   **Rule:** While following the *image's composition*, interpret and implement elements using standard iOS structural paradigms defined below. For example, if the image shows a table or sectioned data, implement it using the *Grouped List* structure.
        *   **Grouped Lists:** Instead of floating loose items, group related information into distinct blocks. Wrap them in a card (`bg-card rounded-xl mx-4 overflow-hidden mb-6`) and stack rows inside.
        *   **List Rows:** Items inside a grouped card should be flex rows with a title on the left, value on the right, separated by an inset divider (`border-b border-border ml-4`). The last item in a card must NOT have a bottom border.
        *   **Large Headers:** Replace standard centered headers with an iOS-style left-aligned Large Title (`text-3xl font-bold tracking-tight text-foreground px-4 mb-4`), if present in the overall screen structure suggested by the image or logic.

3.  **SELECTIVE APPLE GLASSMORPHISM & MATERIALS:**
    *   **Rule:** Use Glassmorphism ONLY on floating or overlapping UI elements suggested by the inspiration image (e.g., a sticky navigation bar, a floating action button, a popover modal).
        *   **Sticky/Floating Header Bars:** Translucent blur (`bg-white/80` or `BlurView` from `expo-blur`) with a subtle bottom border (`border-b border-white/20`).
        *   **Fixed Floating Bottom CTA Bars:** Floating above content with translucent background (`bg-white/85` or `BlurView`), subtle top border (`border-t border-border/40`), and light drop shadow.
        *   **Floating Modals / Action Sheets / Floating Badges:** Semi-transparent floating surfaces with subtle light borders (`border border-white/30 shadow-lg`).
    *   **Constraint:** DO NOT apply glassmorphism to standard body text, input fields, or standard scrollable grouped list cards.

4.  **DO NOT TOUCH BUSINESS LOGIC:**
    *   **Rule:** Do NOT alter, remove, or modify any functions, state management (`useState`, `useReducer`), hooks (`useEffect`), API calls, or event handlers (`onPress`, etc.).
    *   **Constraint:** You must maintain all existing data bindings, conditional rendering logic, and functional callbacks, applying them to the newly structured HIG UI components.

5.  **SAFE AREA VIEW MANDATE:**
    *   **Rule:** Ensure the root screen component is wrapped in a `SafeAreaView` from `react-native-safe-area-context` with `flex-1 bg-background`. Proper margins/padding must prevent content from bleeding under the notch or home indicator.

6.  **ICONS:**
    *   **Rule:** Use `lucide-react-native` for all icons. Replace existing icon libraries (Ionicons, FontAwesome, etc.) with the closest equivalent Lucide icon. Standard icon color should be the foreground or muted-foreground color, unless it is a primary action color `#C1272D`.

7.  **AUTOCARE DESIGN SYSTEM (APPLE HIG) SPECIFICATIONS:**
    *   **Screen Backgrounds:** `bg-background` (`#F2F2F7` - iOS Grouped Background).
    *   **Cards / Surface Containers:** `bg-card` (`#FFFFFF` - Pure White).
    *   **Primary Interactivity / CTA:** `bg-primary` / `text-primary` (`#C1272D` - AutoCare Red). Color indicates tapability.
    *   **Secondary Actions:** `bg-secondary` (`#E5E5EA`) with `text-secondary-foreground` (`#000000`).
    *   **Text Hierarchy:**
        *   Primary / Body: `text-foreground` (`#000000`).
        *   Secondary / Captions / Placeholders: `text-muted-foreground` (`#8E8E93`).
        *   Large Titles: `text-3xl font-bold tracking-tight text-foreground`.
        *   Headlines: `text-lg font-semibold text-foreground`.
        *   Body: `text-base font-normal text-foreground`.
        *   Footnotes/Captions: `text-sm font-normal text-muted-foreground`.
    *   **Touch Targets & Spacing:**
        *   All interactive buttons MUST be at least 44x44pt (e.g., `min-h-[44px]` or `py-4`).
        *   Horizontal margins from screen edges: 16px (`px-4` or `mx-4`).
    *   **Border Radius (Squarcles):**
        *   Text inputs: `rounded-lg` (10px).
        *   Cards / primary buttons: `rounded-xl` (14px).
        *   Modals / Bottom sheets / Floating Bars: `rounded-2xl` (20px) or `rounded-3xl` (24px).

---

### EXPECTED OUTPUT
Return the COMPLETE, fully redesigned component code. Do not use placeholders like `// ... rest of the code remains the same`. Keep all imports, logic, and state intact while delivering a stunning, newly architected iOS-native layout that mirrors the composition of the inspiration image while strictly adhering to the AutoCare HIG specifications and tasteful Glassmorphism.

---

### COMPONENT CODE TO REDESIGN:

import { View, ScrollView, ActivityIndicator } from 'react-native';
import { useState, useCallback, useEffect } from 'react';
import { useLocalSearchParams } from 'expo-router';
import { useBookingData } from '../hooks/useBookingData';
import { useBookingForm } from '../hooks/useBookingForm';
import BookingHeader from '../components/booking/BookingHeader';
import ActiveAppointments from '../components/booking/ActiveAppointments';
import ServiceSelector from '../components/booking/ServiceSelector';
import VehicleSelector from '../components/booking/VehicleSelector';
import NotesInput from '../components/booking/NotesInput';
import SchedulePicker from '../components/booking/SchedulePicker';
import CalendarModal from '../components/booking/CalendarModal';
import AvailabilityModal from '../components/booking/AvailabilityModal';
import ConfirmButton from '../components/booking/ConfirmButton';
import { dateToTimeString } from '../utils/format';
import DateTimePicker from '@react-native-community/datetimepicker';
import appointmentsApi from '../services/appointmentsApi';

export default function BookingScreen() {
  const { serviceId } = useLocalSearchParams();
  const { services, vehicles, appointments, loading } = useBookingData(serviceId);

  const [selectedService, setSelectedService] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);
  const [isDatePickerVisible, setDatePickerVisible] = useState(false);
  const [showCustomTimePicker, setShowCustomTimePicker] = useState(false);

  const {
    selectedVehicle,
    setSelectedVehicle,
    selectedTime,
    setSelectedTime,
    customTime,
    setCustomTime,
    availableSlots,
    notes,
    setNotes,
    submitting,
    handleBook,
    checkCustomTime,
    availabilityModal,
    setAvailabilityModal,
  } = useBookingForm(selectedDate, selectedService);

  // Marked dates for calendar
  const markedDates = appointments
    .filter(apt => apt.status !== 'CANCELLED')
    .reduce((acc, apt) => {
      acc[apt.appointmentDate] = { marked: true, dotColor: '#C1272D' };
      return acc;
    }, {});

  if (selectedDate) {
    const dateStr = selectedDate.toISOString().split('T')[0];
    markedDates[dateStr] = {
      ...markedDates[dateStr],
      selected: true,
      selectedColor: '#C1272D',
    };
  }

  const handleDayPress = (day) => {
    setSelectedDate(new Date(day.dateString));
    setSelectedTime(null);
    setCustomTime(null);
    setDatePickerVisible(false);
  };

  const handleCustomTimeChange = (event, selectedDateObj) => {
    setShowCustomTimePicker(false);
    if (selectedDateObj) {
      const timeStr = dateToTimeString(selectedDateObj);
      checkCustomTime(timeStr);
    }
  };

  const handleCancelAppointment = (aptId) => {
    Alert.alert('Cancel Appointment', 'Are you sure?', [
      { text: 'No' },
      {
        text: 'Yes',
        style: 'destructive',
        onPress: async () => {
          try {
            await appointmentsApi.cancel(aptId);
            // Reload appointments
          } catch (err) {
            Alert.alert('Error', 'Failed to cancel');
          }
        },
      },
    ]);
  };

  // Auto-select service when serviceId param and services list are available
  useEffect(() => {
    if (serviceId && services.length > 0) {
      const matched = services.find(s => String(s.id) === String(serviceId));
      if (matched) setSelectedService(matched);
    }
  }, [serviceId, services]);

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-background">
        <ActivityIndicator size="large" color="#C1272D" />
      </View>
    );
  }

  return (
    <ScrollView className="flex-1 bg-background" showsVerticalScrollIndicator={false}>
      <View className="px-6 pt-12 pb-10">
        <BookingHeader />

        <ActiveAppointments appointments={appointments} onCancel={handleCancelAppointment} />

        <ServiceSelector
          services={services}
          selectedService={selectedService}
          onSelect={setSelectedService}
        />

        <VehicleSelector
          vehicles={vehicles}
          selectedVehicle={selectedVehicle}
          onSelect={setSelectedVehicle}
        />

        <NotesInput value={notes} onChange={setNotes} />

        <SchedulePicker
          selectedDate={selectedDate}
          selectedService={selectedService}
          selectedTime={selectedTime}
          customTime={customTime}
          availableSlots={availableSlots}
          onSelectDate={() => setDatePickerVisible(true)}
          onSelectTime={setSelectedTime}
          onCustomTimePress={() => setShowCustomTimePicker(true)}
        />

        <ConfirmButton
          onPress={handleBook}
          disabled={
            submitting ||
            !selectedService ||
            !selectedVehicle ||
            !selectedDate ||
            (!selectedTime && !customTime)
          }
          loading={submitting}
        />
      </View>

      {/* Calendar Modal */}
      <CalendarModal
        visible={isDatePickerVisible}
        onClose={() => setDatePickerVisible(false)}
        onDayPress={handleDayPress}
        markedDates={markedDates}
        primaryColor="#C1272D"
      />

      {/* Custom Time Picker */}
      {showCustomTimePicker && (
        <DateTimePicker
          value={new Date()}
          mode="time"
          is24Hour={false}
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={handleCustomTimeChange}
        />
      )}

      {/* Availability Feedback */}
      <AvailabilityModal
        visible={availabilityModal.visible}
        available={availabilityModal.available}
        message={availabilityModal.message}
        onClose={() => setAvailabilityModal({ ...availabilityModal, visible: false })}
      />
    </ScrollView>
  );
}

import { View, Text } from 'react-native';

export default function BookingHeader() {
  return (
    <View className="mb-8">
      <Text className="text-sm font-bold uppercase tracking-[2px] text-foreground/50">
        Service Center
      </Text>
      <Text className="text-3xl font-heading font-black text-foreground">
        Book <Text className="text-primary">Appointment</Text>
      </Text>
    </View>
  );
}

import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { formatTime12h } from '../../utils/format';

export default function ActiveAppointments({ appointments, onCancel }) {
  const active = appointments.filter(
    a => a.status !== 'CANCELLED' && a.status !== 'COMPLETED'
  );
  if (active.length === 0) return null;

  return (
    <View className="mb-10">
      <Text className="text-xs font-black uppercase tracking-widest mb-4 text-foreground/40">
        Your Active Schedule
      </Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {active.map((apt) => (
          <View
            key={apt.id}
            className="p-5 mr-4 rounded-[32px] border border-border bg-card w-[260px]"
          >
            <View className="flex-row justify-between items-start mb-3">
              <View className="w-10 h-10 rounded-2xl items-center justify-center bg-primary/10">
                <MaterialCommunityIcons name="calendar-check" size={20} color="#C1272D" />
              </View>
              <TouchableOpacity onPress={() => onCancel(apt.id)}>
                <Ionicons name="close-circle-outline" size={22} color="#EF4444" />
              </TouchableOpacity>
            </View>
            <Text className="font-bold text-base text-foreground">
              Service #{apt.id?.toString().slice(-4)}
            </Text>
            <Text className="text-xs font-bold text-foreground/50 mb-4">
              {apt.appointmentDate} • {formatTime12h(apt.appointmentTime)}
            </Text>
            <View className="px-3 py-1.5 rounded-full bg-primary self-start">
              <Text className="text-[10px] font-black uppercase text-primary-foreground">{apt.status}</Text>
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

import { View, Text, TouchableOpacity } from 'react-native';
import RNModal from 'react-native-modal';
import { Ionicons } from '@expo/vector-icons';

export default function AvailabilityModal({ visible, available, message, onClose }) {
  return (
    <RNModal
      isVisible={visible}
      onBackdropPress={onClose}
      backdropOpacity={0.6}
      animationIn="zoomIn"
      animationOut="zoomOut"
    >
      <View className="rounded-[40px] p-8 items-center bg-card">
        <View
          className={`w-16 h-16 rounded-full items-center justify-center mb-4 ${
            available ? 'bg-green-100' : 'bg-red-100'
          }`}
        >
          <Ionicons
            name={available ? 'checkmark-done-circle' : 'alert-circle'}
            size={40}
            color={available ? '#22c55e' : '#EF4444'}
          />
        </View>
        <Text className="text-lg font-black mb-2 text-foreground">
          {available ? 'Spot Available!' : 'Wait a moment'}
        </Text>
        <Text className="text-center font-medium mb-8 text-muted-foreground">
          {message}
        </Text>
        <TouchableOpacity
          activeOpacity={0.8}
          className="w-full py-4 rounded-2xl bg-primary"
          onPress={onClose}
        >
          <Text className="text-primary-foreground text-center font-black uppercase">Continue</Text>
        </TouchableOpacity>
      </View>
    </RNModal>
  );
}

import { View, Text } from 'react-native';

export default function BookingHeader() {
  return (
    <View className="mb-8">
      <Text className="text-sm font-bold uppercase tracking-[2px] text-foreground/50">
        Service Center
      </Text>
      <Text className="text-3xl font-heading font-black text-foreground">
        Book <Text className="text-primary">Appointment</Text>
      </Text>
    </View>
  );
}

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

import { TouchableOpacity, Text, ActivityIndicator } from 'react-native';

export default function ConfirmButton({ onPress, disabled, loading }) {
  return (
    <TouchableOpacity
      activeOpacity={0.9}
      className={`mt-6 py-5 rounded-[30px] bg-primary shadow-xl shadow-primary/20 ${
        disabled ? 'opacity-60' : ''
      }`}
      onPress={onPress}
      disabled={disabled}
    >
      {loading ? (
        <ActivityIndicator color="white" />
      ) : (
        <Text className="text-primary-foreground text-center font-black uppercase tracking-[2px]">
          Confirm Booking
        </Text>
      )}
    </TouchableOpacity>
  );
}

import { View, Text, TextInput } from 'react-native';

export default function NotesInput({ value, onChange }) {
  return (
    <View className="mb-8">
      <View className="flex-row items-center mb-4">
        <View className="w-8 h-8 rounded-full bg-primary items-center justify-center mr-3">
          <Text className="text-white font-black text-xs">4</Text>
        </View>
        <Text className="text-lg font-heading font-black text-foreground">
          Describe the issue (optional)
        </Text>
      </View>
      <TextInput
        className="p-5 rounded-[28px] border border-border bg-card text-foreground"
        placeholder="e.g., Engine noise, AC not cooling, etc."
        placeholderTextColor="#999"
        multiline
        numberOfLines={3}
        value={value}
        onChangeText={onChange}
      />
      <Text className="text-xs mt-2 text-muted-foreground/50">
        Tell us more about your vehicle's condition or special requests.
      </Text>
    </View>
  );
}

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

import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function ServiceSelector({ services, selectedService, onSelect }) {
  return (
    <View className="mb-8">
      <View className="flex-row items-center mb-4">
        <View className="w-8 h-8 rounded-full bg-primary items-center justify-center mr-3">
          <Text className="text-white font-black text-xs">1</Text>
        </View>
        <Text className="text-lg font-heading font-black text-foreground">Select Service</Text>
      </View>
      <View className="space-y-3">
        {services.map((service) => {
          const isSelected = selectedService?.id === service.id;
          return (
            <TouchableOpacity
              key={service.id}
              activeOpacity={0.8}
              className={`p-5 rounded-[28px] border-2 flex-row justify-between items-center ${
                isSelected ? 'bg-primary/10 border-primary' : 'bg-card border-border'
              }`}
              onPress={() => onSelect(service)}
            >
              <View className="flex-1">
                <Text className="text-base font-black text-foreground">{service.name}</Text>
                <View className="flex-row items-center mt-1">
                  <Ionicons name="time-outline" size={12} color="#666" />
                  <Text className="text-xs ml-1 font-bold text-muted-foreground">
                    {service.durationMinutes} min
                  </Text>
                </View>
              </View>
              <Text className="text-lg font-black text-primary">₱{service.basePrice}</Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';

export default function VehicleSelector({ vehicles, selectedVehicle, onSelect }) {
  return (
    <View className="mb-8">
      <View className="flex-row items-center mb-4">
        <View className="w-8 h-8 rounded-full bg-primary items-center justify-center mr-3">
          <Text className="text-white font-black text-xs">2</Text>
        </View>
        <Text className="text-lg font-heading font-black text-foreground">Select Vehicle</Text>
      </View>
      {vehicles.length === 0 ? (
        <View className="p-6 rounded-[28px] border border-dashed border-border items-center">
          <Text className="text-sm font-bold text-foreground/50">No vehicles in your garage</Text>
        </View>
      ) : (
        <View className="space-y-3">
          {vehicles.map((vehicle) => {
            const isSelected = selectedVehicle?.id === vehicle.id;
            return (
              <TouchableOpacity
                key={vehicle.id}
                activeOpacity={0.8}
                className={`p-5 rounded-[28px] border-2 flex-row items-center ${
                  isSelected ? 'bg-primary/10 border-primary' : 'bg-card border-border'
                }`}
                onPress={() => onSelect(vehicle)}
              >
                <View className="w-10 h-10 rounded-2xl bg-background items-center justify-center mr-4 shadow-sm">
                  <MaterialCommunityIcons
                    name="car-side"
                    size={24}
                    color={isSelected ? '#C1272D' : '#666'}
                  />
                </View>
                <View className="flex-1">
                  <Text className="text-base font-black text-foreground">
                    {vehicle.make} {vehicle.model}
                  </Text>
                  <Text className="text-[10px] font-black uppercase tracking-widest text-foreground/40">
                    {vehicle.plateNumber}
                  </Text>
                </View>
                <Ionicons
                  name={isSelected ? 'checkmark-circle' : 'ellipse-outline'}
                  size={24}
                  color={isSelected ? '#C1272D' : '#D9D9D9'}
                />
              </TouchableOpacity>
            );
          })}
        </View>
      )}
    </View>
  );
}

