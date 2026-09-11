import {
  View,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';

import {
  useState,
  useEffect,
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

import appointmentsApi from '../services/appointmentsApi';

function parseLocalDate(
  dateString
) {
  if (!dateString) {
    return null;
  }

  const [
    year,
    month,
    day,
  ] = String(
    dateString
  )
    .split('-')
    .map(Number);

  if (
    !year ||
    !month ||
    !day
  ) {
    return null;
  }

  return new Date(
    year,
    month - 1,
    day
  );
}

function dateToLocalString(
  date
) {
  if (!date) {
    return '';
  }

  const year =
    date.getFullYear();

  const month =
    String(
      date.getMonth() + 1
    ).padStart(2, '0');

  const day =
    String(
      date.getDate()
    ).padStart(2, '0');

  return `${year}-${month}-${day}`;
}

export default function BookingScreen() {
  const {
    serviceId,
  } = useLocalSearchParams();

  const {
    services,
    vehicles,
    appointments,
    disabledDates,
    loading,
  } = useBookingData();

  const insets =
    useSafeAreaInsets();

  const [
    selectedService,
    setSelectedService,
  ] = useState(null);

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
    selectedService
  );

  /*
   * Build appointment marks.
   * Cancelled appointments do not block a date mark.
   */
  const markedDates =
    appointments
      .filter(
        (appointment) =>
          appointment?.status !==
          'CANCELLED'
      )
      .reduce(
        (
          result,
          appointment
        ) => {
          const date =
            appointment?.appointmentDate;

          if (date) {
            result[
              date
            ] = {
              ...(result[
                date
              ] || {}),
              marked: true,
              dotColor:
                '#C1272D',
            };
          }

          return result;
        },
        {}
      );

  if (selectedDate) {
    const dateStr =
      dateToLocalString(
        selectedDate
      );

    markedDates[
      dateStr
    ] = {
      ...markedDates[
        dateStr
      ],
      selected: true,
      selectedColor:
        '#C1272D',
    };
  }

  const handleDayPress =
    (day) => {
      if (
        disabledDates.includes(
          day.dateString
        )
      ) {
        return;
      }

      const parsed =
        parseLocalDate(
          day.dateString
        );

      if (!parsed) {
        return;
      }

      setSelectedDate(
        parsed
      );

      setSelectedTime(
        null
      );

      setDatePickerVisible(
        false
      );
    };

  const handleCancelAppointment =
    (appointmentId) => {
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
            onPress:
              async () => {
                try {
                  await appointmentsApi.cancel(
                    appointmentId
                  );

                  Alert.alert(
                    'Cancelled',
                    'Your appointment has been cancelled.'
                  );
                } catch (err) {
                  Alert.alert(
                    'Error',
                    err?.message ||
                      'Failed to cancel the appointment.'
                  );
                }
              },
          },
        ]
      );
    };

  /*
   * Auto-select service from /booking?serviceId=...
   */
  useEffect(() => {
    if (
      !serviceId ||
      services.length === 0
    ) {
      return;
    }

    const matched =
      services.find(
        (service) =>
          String(
            service.id
          ) ===
          String(serviceId)
      );

    if (matched) {
      setSelectedService(
        matched
      );
    }
  }, [
    serviceId,
    services,
  ]);

  /*
   * If a currently-selected date becomes disabled after
   * configuration refresh, clear it.
   */
  useEffect(() => {
    if (!selectedDate) {
      return;
    }

    const dateStr =
      dateToLocalString(
        selectedDate
      );

    if (
      disabledDates.includes(
        dateStr
      )
    ) {
      setSelectedDate(
        null
      );
      setSelectedTime(
        null
      );
    }
  }, [
    disabledDates,
    selectedDate,
    setSelectedTime,
  ]);

  const handleConfirmPress =
    () => {
      const validation =
        validateBooking();

      if (
        !validation.valid
      ) {
        setAvailabilityModal({
          visible: true,
          available: false,
          message:
            validation.message,
        });

        return;
      }

      setConfirmationVisible(
        true
      );
    };

  const handleFinalConfirmation =
    async () => {
      const result =
        await handleBook();

      if (
        !result?.success
      ) {
        return;
      }

      setConfirmationVisible(
        false
      );

      /*
       * The appointment id returned by the create API is required
       * for the Tracking screen.
       */
      if (
        result.appointmentId
      ) {
        router.replace(
          `/tracking?appointmentId=${result.appointmentId}`
        );

        return;
      }

      /*
       * Defensive fallback if the backend returned a success response
       * without the created appointment id.
       */
      Alert.alert(
        'Booking Successful',
        'Your appointment was created, but the tracking number could not be opened automatically.'
      );

      router.replace(
        '/appointments'
      );
    };

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
      edges={[
        'top',
      ]}
    >
      <BookingHeader />

      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={
          false
        }
        contentContainerStyle={{
          paddingBottom:
            insets.bottom +
            120,
        }}
      >
        <View className="px-4">
          <ActiveAppointments
            appointments={
              appointments
            }
            onCancel={
              handleCancelAppointment
            }
          />

          {/* Service type tabs are inside ServiceSelector */}
          <ServiceSelector
            services={
              services
            }
            selectedService={
              selectedService
            }
            onSelect={
              setSelectedService
            }
          />

          <VehicleSelector
            vehicles={
              vehicles
            }
            selectedVehicle={
              selectedVehicle
            }
            onSelect={
              setSelectedVehicle
            }
          />

          <NotesInput
            value={notes}
            onChange={
              setNotes
            }
          />

          <SchedulePicker
            selectedDate={
              selectedDate
            }
            selectedService={
              selectedService
            }
            selectedTime={
              selectedTime
            }
            availableSlots={
              availableSlots
            }
            slotsLoading={
              slotsLoading
            }
            onSelectDate={() =>
              setDatePickerVisible(
                true
              )
            }
            onSelectTime={
              setSelectedTime
            }
          />
        </View>
      </ScrollView>

      {/* Bottom CTA */}
      <View
        className="absolute bottom-0 left-0 right-0 border-t border-border/40 bg-white/90 px-4 pt-3 shadow-lg"
        style={{
          paddingBottom:
            insets.bottom +
            12,
        }}
      >
        <ConfirmButton
          onPress={
            handleConfirmPress
          }
          disabled={
            submitting ||
            !selectedService ||
            !selectedVehicle ||
            !selectedDate ||
            !selectedTime ||
            slotsLoading
          }
          loading={
            submitting
          }
        />
      </View>

      {/* Date picker */}
      <CalendarModal
        visible={
          isDatePickerVisible
        }
        onClose={() =>
          setDatePickerVisible(
            false
          )
        }
        onDayPress={
          handleDayPress
        }
        markedDates={
          markedDates
        }
        disabledDates={
          disabledDates
        }
        primaryColor="#C1272D"
      />

      {/* Detailed booking confirmation */}
      <BookingSummaryModal
        visible={
          confirmationVisible
        }
        onClose={() => {
          if (!submitting) {
            setConfirmationVisible(
              false
            );
          }
        }}
        onConfirm={
          handleFinalConfirmation
        }
        submitting={
          submitting
        }
        service={
          selectedService
        }
        vehicle={
          selectedVehicle
        }
        date={
          selectedDate
        }
        time={
          selectedTime
        }
        notes={notes}
      />

      {/* Availability errors */}
      <AvailabilityModal
        visible={
          availabilityModal.visible
        }
        available={
          availabilityModal.available
        }
        message={
          availabilityModal.message
        }
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