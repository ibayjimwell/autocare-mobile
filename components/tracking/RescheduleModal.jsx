import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';

import {
  Modal,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert,
  Platform,
} from 'react-native';

import DateTimePicker from '@react-native-community/datetimepicker';

import {
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  Clock3,
  FileText,
  Info,
  X,
  XCircle,
} from 'lucide-react-native';

import appointmentsApi from '../../services/appointmentsApi';

import {
  useRescheduleRequests,
} from '../../hooks/useRescheduleRequests';

import RescheduleConfirmationModal from './RescheduleConfirmationModal';

/* ================================================================
   DESIGN TOKENS
================================================================ */

const PRIMARY = '#C1272D';

const MUTED = '#8E8E93';

const BORDER = '#C6C6C8';

const DANGER = '#DC2626';

const WARNING = '#D97706';

/* ================================================================
   DATE HELPERS
================================================================ */

function parseDate(value) {
  if (!value) {
    return new Date();
  }

  if (value instanceof Date) {
    return value;
  }

  const dateValue = String(value).slice(0, 10);

  const parsed = new Date(
    `${dateValue}T00:00:00`,
  );

  if (Number.isNaN(parsed.getTime())) {
    return new Date();
  }

  return parsed;
}

function toDateString(date) {
  const year = date.getFullYear();

  const month = String(
    date.getMonth() + 1,
  ).padStart(2, '0');

  const day = String(
    date.getDate(),
  ).padStart(2, '0');

  return `${year}-${month}-${day}`;
}

function formatDate(value) {
  if (!value) {
    return 'N/A';
  }

  const date =
    value instanceof Date
      ? value
      : parseDate(value);

  return date.toLocaleDateString(
    'en-US',
    {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    },
  );
}

function normalizeTime(value) {
  return String(
    value || '',
  ).slice(0, 5);
}

function formatTime(value) {
  if (!value) {
    return 'Select a time';
  }

  const normalized =
    normalizeTime(value);

  const parts =
    normalized.split(':');

  const hours =
    Number(parts[0]);

  const minutes =
    parts[1] || '00';

  if (Number.isNaN(hours)) {
    return normalized;
  }

  const suffix =
    hours >= 12
      ? 'PM'
      : 'AM';

  const displayHour =
    hours % 12 || 12;

  return `${displayHour}:${minutes} ${suffix}`;
}

/* ================================================================
   SERVICE HELPERS
================================================================ */

function extractServiceIds(
  services,
) {
  if (
    !Array.isArray(
      services,
    )
  ) {
    return [];
  }

  return services
    .map(
      (
        service,
      ) => {
        if (
          typeof service ===
          'string'
        ) {
          return service;
        }

        return (
          service?.id ||
          service?.serviceId ||
          null
        );
      },
    )
    .filter(
      (
        id,
      ) =>
        typeof id ===
          'string' &&
        id.length > 0,
    );
}

/* ================================================================
   SLOT HELPERS
================================================================ */

function normalizeAvailableSlots(
  response,
) {
  const rawSlots =
    Array.isArray(
      response?.data,
    )
      ? response.data
      : [];

  const normalized =
    rawSlots
      .map(
        (
          slot,
        ) => {
          if (
            typeof slot ===
            'string'
          ) {
            return {
              time:
                normalizeTime(
                  slot,
                ),
              available:
                true,
            };
          }

          if (!slot) {
            return null;
          }

          return {
            time:
              normalizeTime(
                slot.time ||
                  slot.appointmentTime ||
                  slot.startTime,
              ),
            available:
              slot.available !==
              false,
          };
        },
      )
      .filter(
        (
          slot,
        ) =>
          !!slot?.time,
      );

  return Array.from(
    new Map(
      normalized.map(
        (
          slot,
        ) => [
          slot.time,
          slot,
        ],
      ),
    ).values(),
  );
}

/* ================================================================
   PROPS
================================================================ */

export default function RescheduleModal({
  visible,
  onClose,
  appointment,
  onSuccess,
}) {
  /* ==============================================================
     REALTIME RESCHEDULE STATE
  ============================================================== */

  const {
    pendingRequest,
    loadRequests,
  } =
    useRescheduleRequests(
      appointment?.id,
    );

  /* ==============================================================
     FORM STATE
  ============================================================== */

  const [
    newDate,
    setNewDate,
  ] = useState(
    parseDate(
      appointment?.appointmentDate,
    ),
  );

  const [
    newTime,
    setNewTime,
  ] = useState(
    normalizeTime(
      appointment?.appointmentTime,
    ),
  );

  const [
    reason,
    setReason,
  ] = useState('');

  /* ==============================================================
     AVAILABILITY
  ============================================================== */

  const [
    availableSlots,
    setAvailableSlots,
  ] = useState([]);

  const [
    slotsLoading,
    setSlotsLoading,
  ] = useState(false);

  const [
    slotsError,
    setSlotsError,
  ] = useState(null);

  /* ==============================================================
     DATE PICKER
  ============================================================== */

  const [
    datePickerVisible,
    setDatePickerVisible,
  ] = useState(false);

  /* ==============================================================
     CONFIRMATION
  ============================================================== */

  const [
    confirmationVisible,
    setConfirmationVisible,
  ] = useState(false);

  /* ==============================================================
     SUBMIT
  ============================================================== */

  const [
    submitting,
    setSubmitting,
  ] = useState(false);

  /* ==============================================================
     MINIMUM DATE
  ============================================================== */

  const minimumDate =
    useMemo(() => {
      const today =
        new Date();

      today.setHours(
        0,
        0,
        0,
        0,
      );

      return today;
    }, []);

  /* ==============================================================
     SERVICE IDS
  ============================================================== */

  const serviceIds =
    useMemo(
      () =>
        extractServiceIds(
          appointment?.services,
        ),
      [
        appointment?.services,
      ],
    );

  /* ==============================================================
     RESET FORM WHEN OPENING
  ============================================================== */

  useEffect(() => {
    if (!visible) {
      return;
    }

    setNewDate(
      parseDate(
        appointment?.appointmentDate,
      ),
    );

    setNewTime(
      normalizeTime(
        appointment?.appointmentTime,
      ),
    );

    setReason('');

    setAvailableSlots([]);

    setSlotsError(null);

    setDatePickerVisible(
      false,
    );

    setConfirmationVisible(
      false,
    );

    setSubmitting(false);
  }, [
    visible,
    appointment?.appointmentDate,
    appointment?.appointmentTime,
  ]);

  /* ==============================================================
     LOAD AVAILABLE SLOTS
  ============================================================== */

  const loadAvailableSlots =
    useCallback(
      async (
        date,
      ) => {
        if (
          !date ||
          serviceIds.length ===
            0
        ) {
          setAvailableSlots(
            [],
          );

          setSlotsError(
            null,
          );

          return;
        }

        const requestDate =
          toDateString(
            date,
          );

        setSlotsLoading(
          true,
        );

        setSlotsError(
          null,
        );

        try {
          const serviceId =
            serviceIds[0];

          const response =
            await appointmentsApi.getAvailableSlots(
              requestDate,
              serviceId,
            );

          if (
            response?.error
          ) {
            throw new Error(
              response.errorMessage ||
                'Unable to load available appointment times.',
            );
          }

          const slots =
            normalizeAvailableSlots(
              response,
            );

          setAvailableSlots(
            slots,
          );

          /*
           * Clear the selected time if the currently selected
           * time isn't available on the selected date.
           */
          const selectedStillAvailable =
            slots.some(
              (
                slot,
              ) =>
                slot.time ===
                  normalizeTime(
                    newTime,
                  ) &&
                slot.available,
            );

          if (
            !selectedStillAvailable
          ) {
            setNewTime('');
          }
        } catch (
          error
        ) {
          console.error(
            '[RescheduleModal] Failed to load available slots:',
            error,
          );

          setAvailableSlots(
            [],
          );

          setSlotsError(
            error?.message ||
              'Failed to load available appointment times.',
          );

          setNewTime('');
        } finally {
          setSlotsLoading(
            false,
          );
        }
      },
      [
        serviceIds,
        newTime,
      ],
    );

  /* ==============================================================
     RELOAD SLOTS WHEN DATE CHANGES
  ============================================================== */

  useEffect(() => {
    if (
      !visible ||
      !newDate
    ) {
      return;
    }

    void loadAvailableSlots(
      newDate,
    );
  }, [
    visible,
    newDate,
    loadAvailableSlots,
  ]);

  /* ==============================================================
     SAME SCHEDULE CHECK
  ============================================================== */

  const isSameSchedule =
    useMemo(() => {
      const currentDate =
        appointment?.appointmentDate ||
        '';

      const currentTime =
        normalizeTime(
          appointment?.appointmentTime,
        );

      const selectedDate =
        newDate
          ? toDateString(
              newDate,
            )
          : '';

      const selectedTime =
        normalizeTime(
          newTime,
        );

      return (
        currentDate ===
          selectedDate &&
        currentTime ===
          selectedTime
      );
    }, [
      appointment?.appointmentDate,
      appointment?.appointmentTime,
      newDate,
      newTime,
    ]);

  /* ==============================================================
     VALIDATION
  ============================================================== */

  const validationError =
    useMemo(() => {
      if (
        pendingRequest
      ) {
        return 'A reschedule request is already pending for this appointment.';
      }

      if (!newDate) {
        return 'Please select a new appointment date.';
      }

      if (!newTime) {
        return 'Please select a new appointment time.';
      }

      if (
        isSameSchedule
      ) {
        return 'Please select a different date or time from the current appointment.';
      }

      if (!reason.trim()) {
        return 'Please provide a reason for the reschedule.';
      }

      if (
        reason.trim().length <
        3
      ) {
        return 'Please provide a more detailed reason for the reschedule.';
      }

      return null;
    }, [
      pendingRequest,
      newDate,
      newTime,
      isSameSchedule,
      reason,
    ]);

  /* ==============================================================
     DATE PICKER
  ============================================================== */

  const openDatePicker =
    useCallback(() => {
      if (
        pendingRequest ||
        submitting
      ) {
        return;
      }

      setDatePickerVisible(
        true,
      );
    }, [
      pendingRequest,
      submitting,
    ]);

  const handleDateChange =
    useCallback(
      (
        _event,
        selectedDate,
      ) => {
        if (
          Platform.OS !==
          'ios'
        ) {
          setDatePickerVisible(
            false,
          );
        }

        if (
          !selectedDate
        ) {
          return;
        }

        const normalized =
          new Date(
            selectedDate,
          );

        normalized.setHours(
          0,
          0,
          0,
          0,
        );

        setNewDate(
          normalized,
        );

        /*
         * Changing dates always requires selecting a time
         * from the newly loaded availability.
         */
        setNewTime('');
      },
      [],
    );

  /* ==============================================================
     SELECT TIME
  ============================================================== */

  const handleSelectTime =
    useCallback(
      (
        slot,
      ) => {
        if (
          !slot?.available ||
          pendingRequest ||
          submitting
        ) {
          return;
        }

        setNewTime(
          normalizeTime(
            slot.time,
          ),
        );
      },
      [
        pendingRequest,
        submitting,
      ],
    );

  /* ==============================================================
     OPEN SEND CONFIRMATION
  ============================================================== */

  const beginSubmit =
    useCallback(() => {
      if (
        pendingRequest
      ) {
        Alert.alert(
          'Request Pending',
          'There is already a pending reschedule request for this appointment.',
        );

        return;
      }

      if (
        slotsLoading
      ) {
        return;
      }

      if (
        validationError
      ) {
        Alert.alert(
          'Complete Reschedule Details',
          validationError,
        );

        return;
      }

      setConfirmationVisible(
        true,
      );
    }, [
      pendingRequest,
      slotsLoading,
      validationError,
    ]);

  /* ==============================================================
     CONFIRMED SUBMISSION
  ============================================================== */

  const handleSubmitConfirmed =
    useCallback(
      async () => {
        if (
          submitting ||
          !appointment?.id ||
          !newDate ||
          !newTime
        ) {
          return;
        }

        setSubmitting(
          true,
        );

        try {
          const dateString =
            toDateString(
              newDate,
            );

          const response =
            await appointmentsApi.createRescheduleRequest(
              appointment.id,
              dateString,
              normalizeTime(
                newTime,
              ),
              reason.trim(),
            );

          if (
            response?.error
          ) {
            throw new Error(
              response.errorMessage ||
                'Failed to send reschedule request.',
            );
          }

          /*
           * Immediately synchronize local request state.
           *
           * Realtime will also detect the INSERT.
           */
          await loadRequests();

          setConfirmationVisible(
            false,
          );

          onSuccess?.();

          onClose?.();

          Alert.alert(
            'Request Sent',
            'Your reschedule request has been sent to AutoCare for approval.',
          );
        } catch (
          error
        ) {
          console.error(
            '[RescheduleModal] Failed to submit reschedule request:',
            error,
          );

          Alert.alert(
            'Unable to Send Request',
            error?.message ||
              'Something went wrong while sending your reschedule request.',
          );
        } finally {
          setSubmitting(
            false,
          );
        }
      },
      [
        submitting,
        appointment?.id,
        newDate,
        newTime,
        reason,
        loadRequests,
        onSuccess,
        onClose,
      ],
    );

  /* ==============================================================
     CLOSE MODAL
  ============================================================== */

  const handleClose =
    useCallback(() => {
      if (
        submitting
      ) {
        return;
      }

      setDatePickerVisible(
        false,
      );

      setConfirmationVisible(
        false,
      );

      onClose?.();
    }, [
      submitting,
      onClose,
    ]);

  /* ==============================================================
     RENDER
  ============================================================== */

  return (
    <>
      {/* ==========================================================
          MAIN RESCHEDULE MODAL
      =========================================================== */}

      <Modal
        visible={
          visible
        }
        transparent
        animationType="slide"
        statusBarTranslucent
        onRequestClose={
          handleClose
        }
      >
        <View
          className="
            flex-1
            justify-end
            bg-black/60
          "
        >
          {/* ======================================================
              BOTTOM SHEET

              IMPORTANT FIX:
              Give the sheet an explicit height.

              The previous version relied only on maxHeight,
              which allowed the flex-based ScrollView in the
              middle to collapse.

              This explicit height guarantees a real area exists
              for the form.
          ======================================================= */}

          <View
            className="
              w-full
              h-[88%]
              flex-shrink
              overflow-hidden
              rounded-t-[32px]
              bg-background
            "
          >
            {/* ====================================================
                DRAG HANDLE + HEADER
            ===================================================== */}

            <View
              className="
                shrink-0
                border-b
                border-border
                bg-background
                px-5
                pb-4
                pt-3
              "
            >
              {/* Drag handle */}
              <View
                className="
                  mb-4
                  h-1.5
                  w-12
                  self-center
                  rounded-full
                  bg-muted
                "
              />

              <View
                className="
                  flex-row
                  items-start
                "
              >
                {/* Icon */}
                <View
                  className="
                    h-12
                    w-12
                    shrink-0
                    items-center
                    justify-center
                    rounded-2xl
                    bg-primary/10
                  "
                >
                  <CalendarDays
                    size={
                      24
                    }
                    color={
                      PRIMARY
                    }
                    strokeWidth={
                      2
                    }
                  />
                </View>

                {/* Heading */}
                <View
                  className="
                    ml-3
                    min-w-0
                    flex-1
                  "
                >
                  <Text
                    className="
                      text-xl
                      font-bold
                      tracking-tight
                      text-foreground
                    "
                  >
                    Reschedule Appointment
                  </Text>

                  <Text
                    className="
                      mt-1
                      text-sm
                      leading-5
                      text-muted-foreground
                    "
                  >
                    Select a new schedule and tell AutoCare why you
                    need to reschedule.
                  </Text>
                </View>

                {/* Close */}
                <TouchableOpacity
                  disabled={
                    submitting
                  }
                  onPress={
                    handleClose
                  }
                  activeOpacity={
                    0.8
                  }
                  className="
                    ml-2
                    h-11
                    w-11
                    shrink-0
                    items-center
                    justify-center
                    rounded-full
                    bg-muted/40
                  "
                >
                  <X
                    size={
                      21
                    }
                    color={
                      MUTED
                    }
                    strokeWidth={
                      2
                    }
                  />
                </TouchableOpacity>
              </View>
            </View>

            {/* ====================================================
                FORM CONTENT

                IMPORTANT:
                This ScrollView now definitely receives space
                because the parent sheet has an explicit height.
            ===================================================== */}

            <ScrollView
              className="
                flex-1
                min-h-0
              "
              contentContainerStyle={{
                paddingHorizontal:
                  20,
                paddingTop:
                  16,
                paddingBottom:
                  24,
              }}
              showsVerticalScrollIndicator={
                false
              }
              keyboardShouldPersistTaps="handled"
              nestedScrollEnabled
              alwaysBounceVertical
            >
              {/* ==================================================
                  PENDING REQUEST
              =================================================== */}

              {pendingRequest && (
                <View
                  className="
                    mb-4
                    rounded-xl
                    border
                    border-amber-300
                    bg-amber-50
                    p-4
                  "
                >
                  <View
                    className="
                      flex-row
                      items-start
                    "
                  >
                    <View
                      className="
                        h-9
                        w-9
                        shrink-0
                        items-center
                        justify-center
                        rounded-full
                        bg-amber-500/15
                      "
                    >
                      <Clock3
                        size={
                          18
                        }
                        color={
                          WARNING
                        }
                      />
                    </View>

                    <View
                      className="
                        ml-3
                        min-w-0
                        flex-1
                      "
                    >
                      <Text
                        className="
                          text-sm
                          font-bold
                          text-amber-800
                        "
                      >
                        Reschedule Request Pending
                      </Text>

                      <Text
                        className="
                          mt-1
                          text-xs
                          leading-5
                          text-amber-700
                        "
                      >
                        You already have a reschedule request waiting
                        for AutoCare approval.
                      </Text>

                      <View
                        className="
                          mt-3
                          rounded-lg
                          bg-amber-500/10
                          p-3
                        "
                      >
                        <Text
                          className="
                            text-[10px]
                            font-semibold
                            uppercase
                            tracking-wider
                            text-amber-700
                          "
                        >
                          Requested Schedule
                        </Text>

                        <Text
                          className="
                            mt-1
                            text-sm
                            font-bold
                            text-amber-900
                          "
                        >
                          {formatDate(
                            pendingRequest.newAppointmentDate,
                          )}
                        </Text>

                        <Text
                          className="
                            mt-0.5
                            text-xs
                            text-amber-800
                          "
                        >
                          {formatTime(
                            pendingRequest.newAppointmentTime,
                          )}
                        </Text>
                      </View>
                    </View>
                  </View>
                </View>
              )}

              {/* ==================================================
                  CURRENT APPOINTMENT
              =================================================== */}

              <View
                className="
                  mb-4
                  rounded-xl
                  border
                  border-border
                  bg-card
                  p-4
                "
              >
                <Text
                  className="
                    text-[10px]
                    font-bold
                    uppercase
                    tracking-wider
                    text-muted-foreground
                  "
                >
                  Current Appointment
                </Text>

                <View
                  className="
                    mt-3
                    flex-row
                    items-center
                  "
                >
                  <View
                    className="
                      h-10
                      w-10
                      shrink-0
                      items-center
                      justify-center
                      rounded-xl
                      bg-muted/50
                    "
                  >
                    <CalendarDays
                      size={
                        19
                      }
                      color={
                        MUTED
                      }
                    />
                  </View>

                  <View
                    className="
                      ml-3
                      min-w-0
                      flex-1
                    "
                  >
                    <Text
                      className="
                        text-sm
                        font-semibold
                        text-foreground
                      "
                    >
                      {formatDate(
                        appointment?.appointmentDate,
                      )}
                    </Text>

                    <Text
                      className="
                        mt-1
                        text-xs
                        text-muted-foreground
                      "
                    >
                      {formatTime(
                        appointment?.appointmentTime,
                      )}
                    </Text>
                  </View>
                </View>
              </View>

              {/* ==================================================
                  NEW DATE
              =================================================== */}

              <View className="mb-4">
                <Text
                  className="
                    mb-2
                    text-[10px]
                    font-bold
                    uppercase
                    tracking-wider
                    text-muted-foreground
                  "
                >
                  New Appointment Date
                </Text>

                <TouchableOpacity
                  disabled={
                    !!pendingRequest ||
                    submitting
                  }
                  onPress={
                    openDatePicker
                  }
                  activeOpacity={
                    0.8
                  }
                  className="
                    min-h-[56px]
                    flex-row
                    items-center
                    rounded-xl
                    border
                    border-border
                    bg-card
                    px-4
                  "
                >
                  <View
                    className="
                      h-10
                      w-10
                      shrink-0
                      items-center
                      justify-center
                      rounded-xl
                      bg-primary/10
                    "
                  >
                    <CalendarDays
                      size={
                        19
                      }
                      color={
                        PRIMARY
                      }
                    />
                  </View>

                  <View
                    className="
                      ml-3
                      min-w-0
                      flex-1
                    "
                  >
                    <Text
                      className="
                        text-sm
                        font-semibold
                        text-foreground
                      "
                    >
                      {formatDate(
                        newDate,
                      )}
                    </Text>

                    <Text
                      className="
                        mt-0.5
                        text-xs
                        text-muted-foreground
                      "
                    >
                      Tap to choose another date
                    </Text>
                  </View>

                  <ArrowRight
                    size={
                      19
                    }
                    color={
                      MUTED
                    }
                  />
                </TouchableOpacity>
              </View>

              {/* ==================================================
                  TIME
              =================================================== */}

              <View className="mb-4">
                <View
                  className="
                    mb-2
                    flex-row
                    items-center
                    justify-between
                  "
                >
                  <Text
                    className="
                      text-[10px]
                      font-bold
                      uppercase
                      tracking-wider
                      text-muted-foreground
                    "
                  >
                    New Appointment Time
                  </Text>

                  {newTime && (
                    <Text
                      className="
                        text-xs
                        font-semibold
                        text-primary
                      "
                    >
                      {formatTime(
                        newTime,
                      )}
                    </Text>
                  )}
                </View>

                {slotsLoading ? (
                  <View
                    className="
                      flex-row
                      flex-wrap
                    "
                  >
                    {Array.from({
                      length: 8,
                    }).map(
                      (
                        _,
                        index,
                      ) => (
                        <View
                          key={
                            index
                          }
                          className="
                            mr-2
                            mb-2
                            h-12
                            w-[31%]
                            animate-pulse
                            rounded-xl
                            bg-muted
                          "
                        />
                      ),
                    )}
                  </View>
                ) : slotsError ? (
                  <View
                    className="
                      rounded-xl
                      border
                      border-destructive/20
                      bg-destructive/5
                      p-4
                    "
                  >
                    <View
                      className="
                        flex-row
                        items-start
                      "
                    >
                      <XCircle
                        size={
                          19
                        }
                        color={
                          DANGER
                        }
                      />

                      <View
                        className="
                          ml-3
                          flex-1
                        "
                      >
                        <Text
                          className="
                            text-sm
                            font-semibold
                            text-destructive
                          "
                        >
                          Unable to load time slots
                        </Text>

                        <Text
                          className="
                            mt-1
                            text-xs
                            leading-5
                            text-muted-foreground
                          "
                        >
                          {slotsError}
                        </Text>
                      </View>
                    </View>

                    <TouchableOpacity
                      disabled={
                        slotsLoading
                      }
                      onPress={() =>
                        loadAvailableSlots(
                          newDate,
                        )
                      }
                      activeOpacity={
                        0.8
                      }
                      className="
                        mt-3
                        min-h-[44px]
                        items-center
                        justify-center
                        rounded-xl
                        bg-secondary
                      "
                    >
                      <Text
                        className="
                          text-sm
                          font-semibold
                          text-secondary-foreground
                        "
                      >
                        Try Again
                      </Text>
                    </TouchableOpacity>
                  </View>
                ) : availableSlots.length ===
                  0 ? (
                  <View
                    className="
                      rounded-xl
                      border
                      border-dashed
                      border-border
                      bg-card
                      p-5
                    "
                  >
                    <Clock3
                      size={
                        22
                      }
                      color={
                        MUTED
                      }
                    />

                    <Text
                      className="
                        mt-2
                        text-sm
                        font-semibold
                        text-foreground
                      "
                    >
                      No available time slots
                    </Text>

                    <Text
                      className="
                        mt-1
                        text-xs
                        leading-5
                        text-muted-foreground
                      "
                    >
                      Choose another date to see available appointment
                      times.
                    </Text>
                  </View>
                ) : (
                  <View
                    className="
                      flex-row
                      flex-wrap
                    "
                  >
                    {availableSlots.map(
                      (
                        slot,
                      ) => {
                        const selected =
                          normalizeTime(
                            newTime,
                          ) ===
                          normalizeTime(
                            slot.time,
                          );

                        const disabled =
                          !slot.available ||
                          !!pendingRequest ||
                          submitting;

                        return (
                          <TouchableOpacity
                            key={
                              slot.time
                            }
                            disabled={
                              disabled
                            }
                            onPress={() =>
                              handleSelectTime(
                                slot,
                              )
                            }
                            activeOpacity={
                              0.8
                            }
                            className="
                              mr-2
                              mb-2
                              min-h-[48px]
                              w-[31%]
                              items-center
                              justify-center
                              rounded-xl
                              border
                              px-2
                            "
                            style={{
                              borderColor:
                                selected
                                  ? PRIMARY
                                  : disabled
                                    ? '#D9D9DD'
                                    : BORDER,

                              backgroundColor:
                                selected
                                  ? PRIMARY
                                  : disabled
                                    ? '#F2F2F7'
                                    : '#FFFFFF',

                              opacity:
                                disabled &&
                                !selected
                                  ? 0.55
                                  : 1,
                            }}
                          >
                            {selected ? (
                              <View
                                className="
                                  flex-row
                                  items-center
                                "
                              >
                                <CheckCircle2
                                  size={
                                    15
                                  }
                                  color="#FFFFFF"
                                />

                                <Text
                                  className="
                                    ml-1
                                    text-xs
                                    font-semibold
                                    text-white
                                  "
                                >
                                  {formatTime(
                                    slot.time,
                                  )}
                                </Text>
                              </View>
                            ) : (
                              <Text
                                className="
                                  text-xs
                                  font-semibold
                                  text-foreground
                                "
                              >
                                {formatTime(
                                  slot.time,
                                )}
                              </Text>
                            )}
                          </TouchableOpacity>
                        );
                      },
                    )}
                  </View>
                )}
              </View>

              {/* ==================================================
                  REASON
              =================================================== */}

              <View className="mb-4">
                <Text
                  className="
                    mb-2
                    text-[10px]
                    font-bold
                    uppercase
                    tracking-wider
                    text-muted-foreground
                  "
                >
                  Reschedule Reason
                </Text>

                <View
                  className="
                    rounded-xl
                    border
                    border-border
                    bg-card
                    p-4
                  "
                >
                  <View
                    className="
                      flex-row
                      items-center
                    "
                  >
                    <View
                      className="
                        h-9
                        w-9
                        shrink-0
                        items-center
                        justify-center
                        rounded-xl
                        bg-primary/10
                      "
                    >
                      <FileText
                        size={
                          17
                        }
                        color={
                          PRIMARY
                        }
                      />
                    </View>

                    <View
                      className="
                        ml-3
                        flex-1
                      "
                    >
                      <Text
                        className="
                          text-sm
                          font-semibold
                          text-foreground
                        "
                      >
                        Why do you need to reschedule?
                      </Text>

                      <Text
                        className="
                          mt-0.5
                          text-[10px]
                          text-muted-foreground
                        "
                      >
                        Please provide a clear reason.
                      </Text>
                    </View>
                  </View>

                  <TextInput
                    value={
                      reason
                    }
                    onChangeText={
                      setReason
                    }
                    editable={
                      !pendingRequest &&
                      !submitting
                    }
                    multiline
                    maxLength={
                      500
                    }
                    numberOfLines={
                      5
                    }
                    textAlignVertical="top"
                    placeholder="Explain why you need a different schedule..."
                    placeholderTextColor={
                      MUTED
                    }
                    className="
                      mt-3
                      min-h-[120px]
                      rounded-lg
                      border
                      border-border
                      bg-background
                      px-4
                      py-3
                      text-base
                      text-foreground
                    "
                  />

                  <View
                    className="
                      mt-2
                      flex-row
                      items-center
                      justify-between
                    "
                  >
                    <Text
                      className="
                        flex-1
                        pr-3
                        text-[10px]
                        leading-4
                        text-muted-foreground
                      "
                    >
                      Your reason will be sent to AutoCare with the
                      request.
                    </Text>

                    <Text
                      className="
                        text-[10px]
                        text-muted-foreground
                      "
                    >
                      {reason.length}/500
                    </Text>
                  </View>
                </View>
              </View>

              {/* ==================================================
                  INFORMATION
              =================================================== */}

              <View
                className="
                  mb-4
                  flex-row
                  items-start
                  rounded-xl
                  border
                  border-border
                  bg-muted/20
                  p-4
                "
              >
                <Info
                  size={
                    19
                  }
                  color={
                    MUTED
                  }
                />

                <Text
                  className="
                    ml-3
                    flex-1
                    text-xs
                    leading-5
                    text-muted-foreground
                  "
                >
                  Your current appointment will remain unchanged
                  until AutoCare approves your reschedule request.
                </Text>
              </View>
            </ScrollView>

            {/* ====================================================
                FOOTER / PRIMARY ACTION
            ===================================================== */}

            <View
              className="
                shrink-0
                border-t
                border-border
                bg-background
                px-5
                pb-6
                pt-4
              "
            >
              <TouchableOpacity
                disabled={
                  !!pendingRequest ||
                  !!validationError ||
                  slotsLoading ||
                  submitting
                }
                onPress={
                  beginSubmit
                }
                activeOpacity={
                  0.85
                }
                className="
                  min-h-[56px]
                  w-full
                  flex-row
                  items-center
                  justify-center
                  rounded-xl
                  bg-primary
                  px-4
                "
                style={{
                  opacity:
                    pendingRequest ||
                    validationError ||
                    slotsLoading ||
                    submitting
                      ? 0.5
                      : 1,
                }}
              >
                {submitting ? (
                  <ActivityIndicator
                    size="small"
                    color="#FFFFFF"
                  />
                ) : (
                  <>
                    <CheckCircle2
                      size={
                        20
                      }
                      color="#FFFFFF"
                      strokeWidth={
                        2.2
                      }
                    />

                    <Text
                      className="
                        ml-2
                        text-sm
                        font-semibold
                        text-white
                      "
                    >
                      Review & Send Request
                    </Text>
                  </>
                )}
              </TouchableOpacity>

              {!pendingRequest &&
                validationError && (
                  <Text
                    className="
                      mt-2
                      text-center
                      text-[10px]
                      leading-4
                      text-muted-foreground
                    "
                  >
                    Select a new date, available time, and provide a
                    reason before continuing.
                  </Text>
                )}
            </View>
          </View>
        </View>

        {/* ========================================================
            DATE PICKER OVERLAY
        ========================================================= */}

        {datePickerVisible && (
          <View
            className="
              absolute
              inset-0
              items-center
              justify-center
              bg-black/45
              px-5
            "
          >
            <View
              className="
                w-full
                overflow-hidden
                rounded-3xl
                bg-card
              "
            >
              {/* Header */}
              <View
                className="
                  border-b
                  border-border
                  p-4
                "
              >
                <Text
                  className="
                    text-lg
                    font-bold
                    text-foreground
                  "
                >
                  Select Date
                </Text>

                <Text
                  className="
                    mt-1
                    text-xs
                    text-muted-foreground
                  "
                >
                  Choose a new appointment date.
                </Text>
              </View>

              {/* Picker */}
              <View
                className="
                  items-center
                  justify-center
                  p-4
                "
              >
                <DateTimePicker
                  value={
                    newDate ||
                    minimumDate
                  }
                  mode="date"
                  minimumDate={
                    minimumDate
                  }
                  display={
                    Platform.OS ===
                    'ios'
                      ? 'inline'
                      : 'default'
                  }
                  onChange={
                    handleDateChange
                  }
                />
              </View>

              {/* iOS Done */}
              {Platform.OS ===
                'ios' && (
                <View
                  className="
                    border-t
                    border-border
                    p-3
                  "
                >
                  <TouchableOpacity
                    onPress={() =>
                      setDatePickerVisible(
                        false,
                      )
                    }
                    activeOpacity={
                      0.8
                    }
                    className="
                      min-h-[44px]
                      items-center
                      justify-center
                      rounded-xl
                      bg-primary
                    "
                  >
                    <Text
                      className="
                        text-sm
                        font-semibold
                        text-white
                      "
                    >
                      Done
                    </Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          </View>
        )}
      </Modal>

      {/* ==========================================================
          SEND CONFIRMATION MODAL
      =========================================================== */}

      <RescheduleConfirmationModal
        visible={
          confirmationVisible
        }
        mode="SEND"
        request={{
          id: 'draft',

          appointmentId:
            appointment?.id,

          requestedBy:
            'customer',

          newAppointmentDate:
            newDate
              ? toDateString(
                  newDate,
                )
              : '',

          newAppointmentTime:
            normalizeTime(
              newTime,
            ),

          reason:
            reason.trim(),

          status:
            'PENDING',
        }}
        currentDate={
          appointment?.appointmentDate
        }
        currentTime={
          appointment?.appointmentTime
        }
        onCancel={() =>
          setConfirmationVisible(
            false,
          )
        }
        onConfirm={
          handleSubmitConfirmed
        }
        loading={
          submitting
        }
      />
    </>
  );
}