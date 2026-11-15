
import {
  View,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';

import {
  useState,
  useEffect,
  useRef,
} from 'react';

import {
  useLocalSearchParams,
  router,
} from 'expo-router';

import {
  SafeAreaView,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';

import {
  useBookingData,
} from '../hooks/useBookingData';

import {
  useBookingForm,
} from '../hooks/useBookingForm';

import BookingHeader from '../components/booking/BookingHeader';
import ActiveAppointments from '../components/booking/ActiveAppointments';
import ServiceSelector from '../components/booking/ServiceSelector';
import VehicleSelector from '../components/booking/VehicleSelector';
import NotesInput from '../components/booking/NotesInput';
import SchedulePicker from '../components/booking/SchedulePicker';
import CalendarModal from '../components/booking/CalendarModal';
import AvailabilityModal from '../components/booking/AvailabilityModal';
import BookingSummaryModal from '../components/booking/BookingSummaryModal';
import ConfirmButton from '../components/booking/ConfirmButton';
import DoubleBookingModal from '../components/booking/DoubleBookingModal';

import appointmentsApi from '../services/appointmentsApi';

function parseLocalDate(dateString) {
  if (!dateString) {
    return null;
  }

  const [year, month, day] = String(dateString)
    .split('-')
    .map(Number);

  if (!year || !month || !day) {
    return null;
  }

  return new Date(year, month - 1, day);
}

function dateToLocalString(date) {
  if (!date) {
    return '';
  }

  const year = date.getFullYear();

  const month = String(
    date.getMonth() + 1,
  ).padStart(2, '0');

  const day = String(
    date.getDate(),
  ).padStart(2, '0');

  return `${year}-${month}-${day}`;
}

export default function BookingScreen() {
  const { serviceId } = useLocalSearchParams();

  const {
    services,
    vehicles,
    appointments,
    disabledDates,
    loading,
  } = useBookingData();

  const insets = useSafeAreaInsets();

  /*
   * Multiple services can be selected from
   * PMS, REPAIR, and DIAGNOSTIC.
   */
  const [
    selectedServices,
    setSelectedServices,
  ] = useState([]);

  const toggleService = (service) => {
    if (!service?.id || service.active === false) {
      return;
    }

    setSelectedServices((previous) => {
      const exists = previous.some(
        (item) =>
          String(item.id) === String(service.id),
      );

      return exists
        ? previous.filter(
            (item) =>
              String(item.id) !== String(service.id),
          )
        : [...previous, service];
    });
  };

  const [
    selectedDate,
    setSelectedDate,
  ] = useState(null);

  const [
    isDatePickerVisible,
    setDatePickerVisible,
  ] = useState(false);

  const [
    confirmationVisible,
    setConfirmationVisible,
  ] = useState(false);

  const [
    doubleBookingConflict,
    setDoubleBookingConflict,
  ] = useState(null);

  const [
    mergingDoubleBooking,
    setMergingDoubleBooking,
  ] = useState(false);

  const {
    selectedVehicle,
    setSelectedVehicle,

    selectedTime,
    setSelectedTime,

    availableSlots,
    slotsLoading,

    notes,
    setNotes,

    submitting,

    validateBooking,
    handleBook,

    availabilityModal,
    setAvailabilityModal,
  } = useBookingForm(
    selectedDate,
    selectedServices,
  );

  /*
   * Build appointment calendar markings.
   * Cancelled appointments are excluded.
   */
  const markedDates = appointments
    .filter(
      (appointment) =>
        appointment?.status !== 'CANCELLED',
    )
    .reduce((result, appointment) => {
      const date = appointment?.appointmentDate;

      if (date) {
        result[date] = {
          ...(result[date] || {}),
          marked: true,
          dotColor: '#C1272D',
        };
      }

      return result;
    }, {});

  if (selectedDate) {
    const dateStr =
      dateToLocalString(selectedDate);

    markedDates[dateStr] = {
      ...markedDates[dateStr],
      selected: true,
      selectedColor: '#C1272D',
    };
  }

  /*
   * Date picker selection.
   */
  const handleDayPress = (day) => {
    if (
      disabledDates.includes(day.dateString)
    ) {
      return;
    }

    const parsed =
      parseLocalDate(day.dateString);

    if (!parsed) {
      return;
    }

    setSelectedDate(parsed);
    setSelectedTime(null);
    setDatePickerVisible(false);
  };

  /*
   * Appointment cancellation.
   */
  const handleCancelAppointment = (appointmentId) => {
    Alert.alert(
      'Cancel Appointment',
      'Are you sure you want to cancel this appointment?',
      [
        {
          text: 'No',
          style: 'cancel',
        },
        {
          text: 'Yes',
          style: 'destructive',
          onPress: async () => {
            try {
              await appointmentsApi.cancel(
                appointmentId,
              );

              Alert.alert(
                'Cancelled',
                'Your appointment has been cancelled.',
              );
            } catch (err) {
              Alert.alert(
                'Error',
                err?.message ||
                  'Failed to cancel the appointment.',
              );
            }
          },
        },
      ],
    );
  };

  /*
   * Pre-select a service opened from
   * the Services catalog.
   *
   * Previously selected services are preserved.
   */
  const initializedDeepLinkRef = useRef(null);

  useEffect(() => {
    const requestedId = Array.isArray(serviceId)
      ? serviceId[0]
      : serviceId;

    if (
      !requestedId ||
      services.length === 0
    ) {
      return;
    }

    if (
      initializedDeepLinkRef.current ===
      String(requestedId)
    ) {
      return;
    }

    const matched = services.find(
      (service) =>
        String(service.id) === String(requestedId),
    );

    if (
      matched &&
      matched.active !== false
    ) {
      initializedDeepLinkRef.current =
        String(requestedId);

      setSelectedServices((previous) =>
        previous.some(
          (item) =>
            String(item.id) === String(matched.id),
        )
          ? previous
          : [...previous, matched],
      );
    }
  }, [serviceId, services]);

  /*
   * Synchronize selected services
   * with the latest catalog data.
   */
  useEffect(() => {
    if (loading) {
      return;
    }

    setSelectedServices((previous) => {
      const next = previous
        .map((selected) =>
          services.find(
            (service) =>
              String(service.id) ===
              String(selected.id),
          ),
        )
        .filter(
          (service) =>
            service &&
            service.active !== false,
        );

      const hasChanged =
        next.length !== previous.length ||
        next.some((service, index) => {
          const selected = previous[index];

          return [
            'id',
            'name',
            'basePrice',
            'durationMinutes',
            'estimatedDuration',
            'type',
            'subcategory',
            'isLaborInclude',
            'active',
          ].some(
            (key) =>
              service[key] !== selected[key],
          );
        });

      return hasChanged ? next : previous;
    });
  }, [services, loading]);

  /*
   * Clear the selected date if it
   * becomes disabled after refresh.
   */
  useEffect(() => {
    if (!selectedDate) {
      return;
    }

    const dateStr =
      dateToLocalString(selectedDate);

    if (
      disabledDates.includes(dateStr)
    ) {
      setSelectedDate(null);
      setSelectedTime(null);
    }
  }, [
    disabledDates,
    selectedDate,
    setSelectedTime,
  ]);

  /*
   * Validate before opening
   * the booking confirmation modal.
   */
  const handleConfirmPress = () => {
    const validation =
      validateBooking();

    if (!validation.valid) {
      setAvailabilityModal({
        visible: true,
        available: false,
        message: validation.message,
      });

      return;
    }

    setConfirmationVisible(true);
  };

  /*
   * Final booking confirmation.
   */
  const handleFinalConfirmation = async () => {
    const result = await handleBook();

    if (result?.duplicate) {
      setConfirmationVisible(false);

      setDoubleBookingConflict(
        result.conflict || null,
      );

      return;
    }

    if (!result?.success) {
      return;
    }

    setConfirmationVisible(false);

    if (result.appointmentId) {
      router.replace(
        `/tracking?appointmentId=${result.appointmentId}`,
      );

      return;
    }

    Alert.alert(
      'Booking Successful',
      'Your appointment was created, but the tracking number could not be opened automatically.',
    );

    router.replace('/appointments');
  };

  /*
   * Merge services into an existing
   * appointment when permitted.
   */
  const handleMergeDoubleBooking = async () => {
    if (
      !doubleBookingConflict
        ?.existingAppointment?.id
    ) {
      return;
    }

    setMergingDoubleBooking(true);

    try {
      const result = await handleBook({
        duplicateAction: 'MERGE_SERVICES',
        existingAppointmentId:
          doubleBookingConflict
            .existingAppointment.id,
      });

      if (!result?.success) {
        return;
      }

      setDoubleBookingConflict(null);

      if (result.appointmentId) {
        router.replace(
          `/tracking?appointmentId=${result.appointmentId}`,
        );

        return;
      }

      router.replace('/appointments');
    } finally {
      setMergingDoubleBooking(false);
    }
  };

  /*
   * Loading state.
   */
  if (loading) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-background">
        <ActivityIndicator
          size="large"
          color="#C1272D"
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      className="flex-1 bg-background"
      edges={['top']}
    >
      {/* Booking header */}
      <BookingHeader />

      {/*
       * Parent booking screen scroll.
       *
       * nestedScrollEnabled allows the Services
       * and Vehicle pickers to scroll independently,
       * especially on Android.
       *
       * The overall screen still scrolls for
       * appointments, notes, and scheduling.
       */}
      <ScrollView
        className="flex-1"
        nestedScrollEnabled={true}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{
          paddingBottom:
            insets.bottom + 120,
        }}
      >
        <View className="px-4">
          {/* Active appointments */}
          <ActiveAppointments
            appointments={appointments}
            onCancel={handleCancelAppointment}
          />

          {/*
           * Independently scrollable
           * Service Selector.
           *
           * Filter tabs remain above the
           * bounded service list.
           */}
          <ServiceSelector
            services={services}
            selectedServices={selectedServices}
            onSelect={toggleService}
          />

          {/*
           * Independently scrollable
           * Vehicle Selector.
           */}
          <VehicleSelector
            vehicles={vehicles}
            selectedVehicle={selectedVehicle}
            onSelect={setSelectedVehicle}
          />

          {/* Booking notes */}
          <NotesInput
            value={notes}
            onChange={setNotes}
          />

          {/* Booking schedule */}
          <SchedulePicker
            selectedDate={selectedDate}
            selectedServices={selectedServices}
            selectedTime={selectedTime}
            availableSlots={availableSlots}
            slotsLoading={slotsLoading}
            onSelectDate={() =>
              setDatePickerVisible(true)
            }
            onSelectTime={setSelectedTime}
          />
        </View>
      </ScrollView>

      {/* Fixed bottom booking button */}
      <View
        className="absolute bottom-0 left-0 right-0 border-t border-border/40 bg-white/90 px-4 pt-3 shadow-lg"
        style={{
          paddingBottom:
            insets.bottom + 12,
        }}
      >
        <ConfirmButton
          onPress={handleConfirmPress}
          disabled={
            submitting ||
            selectedServices.length === 0 ||
            !selectedVehicle ||
            !selectedDate ||
            !selectedTime ||
            slotsLoading
          }
          loading={submitting}
        />
      </View>

      {/* Date picker modal */}
      <CalendarModal
        visible={isDatePickerVisible}
        onClose={() =>
          setDatePickerVisible(false)
        }
        onDayPress={handleDayPress}
        markedDates={markedDates}
        disabledDates={disabledDates}
        primaryColor="#C1272D"
      />

      {/* Detailed booking confirmation */}
      <BookingSummaryModal
        visible={confirmationVisible}
        onClose={() => {
          if (!submitting) {
            setConfirmationVisible(false);
          }
        }}
        onConfirm={handleFinalConfirmation}
        submitting={submitting}
        services={selectedServices}
        vehicle={selectedVehicle}
        date={selectedDate}
        time={selectedTime}
        notes={notes}
      />

      {/* Double-booking resolution */}
      <DoubleBookingModal
        visible={Boolean(
          doubleBookingConflict,
        )}
        conflict={doubleBookingConflict}
        merging={mergingDoubleBooking}
        onClose={() => {
          if (!mergingDoubleBooking) {
            setDoubleBookingConflict(null);
          }
        }}
        onMerge={handleMergeDoubleBooking}
      />

      {/* Availability error modal */}
      <AvailabilityModal
        visible={availabilityModal.visible}
        available={availabilityModal.available}
        message={availabilityModal.message}
        onClose={() =>
          setAvailabilityModal({
            ...availabilityModal,
            visible: false,
          })
        }
      />
    </SafeAreaView>
  );
}
