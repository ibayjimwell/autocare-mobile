import {
  useEffect,
  useState,
} from 'react';

import {
  useAuth,
} from '../context/AuthContext';

import appointmentsApi from '../services/appointmentsApi';

function dateToLocalString(
  date
) {
  if (!date) return '';

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

export function useBookingForm(
  selectedDate,
  selectedServices
) {
  const {
    user,
  } = useAuth();

  const customerId =
    user?.id;

  // Stable dependency: choosing another service should update available slots,
  // without recreating the effect on unrelated renders.
  const serviceIds = Array.isArray(selectedServices)
    ? Array.from(new Set(selectedServices.map((service) => service?.id).filter(Boolean)))
    : selectedServices?.id
      ? [selectedServices.id]
      : [];
  const serviceIdsKey = serviceIds.join(',');

  const [
    selectedVehicle,
    setSelectedVehicle,
  ] = useState(null);

  const [
    selectedTime,
    setSelectedTime,
  ] = useState(null);

  const [
    availableSlots,
    setAvailableSlots,
  ] = useState([]);

  const [
    slotsLoading,
    setSlotsLoading,
  ] = useState(false);

  const [
    notes,
    setNotes,
  ] = useState('');

  const [
    submitting,
    setSubmitting,
  ] = useState(false);

  const [
    availabilityModal,
    setAvailabilityModal,
  ] = useState({
    visible: false,
    available: false,
    message: '',
  });

  useEffect(() => {
    let cancelled =
      false;

    if (
      !selectedDate ||
      serviceIds.length === 0
    ) {
      setAvailableSlots([]);
      setSlotsLoading(false);
      setSelectedTime(null);

      return () => {
        cancelled = true;
      };
    }

    const fetchSlots =
      async () => {
        setSlotsLoading(
          true
        );
        setAvailableSlots([]);
        setSelectedTime(
          null
        );

        try {
          const dateStr =
            dateToLocalString(
              selectedDate
            );

          const res =
            await appointmentsApi.getAvailableSlots(
              dateStr,
              serviceIds
            );

          const data =
            res?.data?.data ||
            res?.data ||
            res ||
            [];

          if (!cancelled) {
            setAvailableSlots(
              Array.isArray(
                data
              )
                ? data
                : []
            );
          }
        } catch (err) {
          console.error(
            'Available slots error:',
            err
          );

          if (!cancelled) {
            setAvailableSlots([]);
          }
        } finally {
          if (!cancelled) {
            setSlotsLoading(
              false
            );
          }
        }
      };

    fetchSlots();

    return () => {
      cancelled = true;
    };
  }, [
    selectedDate,
    serviceIdsKey,
  ]);

  const validateBooking =
    () => {
      if (
        serviceIds.length === 0 ||
        !selectedVehicle ||
        !selectedDate ||
        !selectedTime
      ) {
        return {
          valid: false,
          message:
            'Please select at least one service, a vehicle, date, and available time.',
        };
      }

      if (selectedServices?.some?.((service) => service?.active === false) ||
          selectedServices?.active === false) {
        return {
          valid: false,
          message: 'This service is no longer available for booking. Please select another service.',
        };
      }

      if (!customerId) {
        return {
          valid: false,
          message:
            'Customer not identified.',
        };
      }

      return {
        valid: true,
        message: '',
      };
    };

  const handleBook =
    async ({
      duplicateAction = null,
      existingAppointmentId = null,
    } = {}) => {
      const validation =
        validateBooking();

      if (!validation.valid) {
        setAvailabilityModal({
          visible: true,
          available: false,
          message:
            validation.message,
        });

        return {
          success: false,
          appointment: null,
        };
      }

      setSubmitting(true);

      try {
        const dateStr =
          dateToLocalString(
            selectedDate
          );

        const response =
          await appointmentsApi.create({
            customerId,
            vehicleId:
              selectedVehicle.id,
            serviceIds,
            appointmentDate:
              dateStr,
            appointmentTime:
              selectedTime,
            notes,
            duplicateAction,
            existingAppointmentId,
          });

        if (
          response?.error &&
          response?.errorCode === 'APPOINTMENT_DUPLICATE'
        ) {
          return {
            success: false,
            duplicate: true,
            conflict: response,
            appointment: null,
            message:
              response.errorMessage ||
              'This appointment already exists.',
          };
        }

        if (response?.error) {
          const message =
            response?.errorMessage ||
            response?.message ||
            'Booking failed.';

          setAvailabilityModal({
            visible: true,
            available: false,
            message,
          });

          return {
            success: false,
            appointment: null,
            message,
          };
        }

        const appointment =
          response?.data?.data ||
          response?.data?.appointment ||
          response?.data ||
          response?.appointment ||
          null;

        /*
         * Some APIs return:
         * { data: { id } }
         *
         * Others return:
         * { data: { appointment: { id } } }
         *
         * Support both without changing the backend contract.
         */
        const appointmentId =
          appointment?.id ||
          appointment?.appointment?.id ||
          response?.data?.id ||
          response?.id ||
          null;

        const normalizedAppointment =
          appointmentId
            ? {
                ...(appointment &&
                typeof appointment ===
                  'object'
                  ? appointment
                  : {}),
                id: appointmentId,
              }
            : null;

        setSelectedVehicle(
          null
        );
        setSelectedTime(
          null
        );
        setNotes('');

        return {
          success: true,
          appointment:
            normalizedAppointment,
          appointmentId,
        };
      } catch (err) {
        const errorData =
          err?.response?.data ||
          err?.data ||
          err?.response ||
          null;

        if (
          errorData?.error &&
          errorData?.errorCode ===
            'APPOINTMENT_DUPLICATE'
        ) {
          return {
            success: false,
            duplicate: true,
            conflict: errorData,
            appointment: null,
            message:
              errorData.errorMessage ||
              'This appointment already exists.',
          };
        }

        const message =
          errorData?.message ||
          errorData?.errorMessage ||
          err?.message ||
          'Booking failed.';

        setAvailabilityModal({
          visible: true,
          available: false,
          message,
        });

        return {
          success: false,
          appointment: null,
          message,
        };
      } finally {
        setSubmitting(false);
      }
    };

  return {
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
  };
}

