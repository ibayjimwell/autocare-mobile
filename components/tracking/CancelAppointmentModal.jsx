import React, {
  useEffect,
  useState,
} from 'react';

import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';

import {
  AlertTriangle,
  CalendarDays,
  Clock3,
  X,
} from 'lucide-react-native';

/* ================================================================
   DESIGN TOKENS
================================================================ */

const PRIMARY =
  '#C1272D';

const MUTED =
  '#8E8E93';

const BORDER =
  '#C6C6C8';

const DANGER =
  '#DC2626';

/* ================================================================
   HELPERS
================================================================ */

function parseDate(
  value,
) {
  if (
    !value
  ) {
    return null;
  }

  const normalized =
    String(
      value,
    ).slice(
      0,
      10,
    );

  const parsed =
    new Date(
      `${normalized}T00:00:00`,
    );

  return Number.isNaN(
    parsed.getTime(),
  )
    ? null
    : parsed;
}

function formatAppointmentDate(
  value,
) {
  const date =
    parseDate(
      value,
    );

  if (!date) {
    return 'N/A';
  }

  return date.toLocaleDateString(
    'en-US',
    {
      month:
        'long',

      day:
        'numeric',

      year:
        'numeric',
    },
  );
}

function formatAppointmentTime(
  value,
) {
  if (
    !value
  ) {
    return 'N/A';
  }

  const normalized =
    String(
      value,
    ).slice(
      0,
      5,
    );

  const [
    hoursValue,
    minutesValue,
  ] =
    normalized.split(
      ':',
    );

  const hours =
    Number(
      hoursValue,
    );

  const minutes =
    minutesValue ||
    '00';

  if (
    Number.isNaN(
      hours,
    )
  ) {
    return normalized;
  }

  const suffix =
    hours >= 12
      ? 'PM'
      : 'AM';

  const displayHour =
    hours % 12 ||
    12;

  return `${displayHour}:${minutes} ${suffix}`;
}

/* ================================================================
   PROPS
================================================================ */

export default function CancelAppointmentModal({
  visible,
  appointment,
  loading = false,
  onCancel,
  onConfirm,
}) {
  /* ==============================================================
     CANCELLATION REASON
  ============================================================== */

  const [
    reason,
    setReason,
  ] = useState('');

  /* ==============================================================
     RESET REASON
  ============================================================== */

  useEffect(() => {
    if (
      !visible
    ) {
      setReason('');
    }
  }, [
    visible,
  ]);

  /* ==============================================================
     VALIDATION
  ============================================================== */

  const normalizedReason =
    reason.trim();

  const reasonValid =
    normalizedReason.length >=
    3;

  /* ==============================================================
     SUBMIT
  ============================================================== */

  const handleConfirm =
    () => {
      /*
       * Do not submit while the request is in progress.
       */
      if (
        loading
      ) {
        return;
      }

      /*
       * Cancellation reason is required.
       */
      if (
        !reasonValid
      ) {
        return;
      }

      onConfirm(
        normalizedReason,
      );
    };

  /* ==============================================================
     RENDER
  ============================================================== */

  return (
    <Modal
      visible={
        visible
      }
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={() => {
        if (
          !loading
        ) {
          onCancel();
        }
      }}
    >
      <KeyboardAvoidingView
        className="
          flex-1
        "
        behavior={
          Platform.OS ===
          'ios'
            ? 'padding'
            : undefined
        }
      >
        {/* ========================================================
            BACKDROP
        ========================================================= */}

        <View
          className="
            flex-1
            items-center
            justify-center
            bg-black/60
            px-4
          "
        >
          {/* ======================================================
              MODAL

              IMPORTANT FIX:

              The previous version only had `max-h-[88%]`.

              That does not guarantee a measurable height for the
              flex-based ScrollView.

              Give the sheet an explicit height so the form always
              receives its own area.
          ======================================================= */}

          <View
            className="
              w-full
              overflow-hidden
              rounded-3xl
              bg-background
            "
            style={{
              height:
                '82%',

              maxWidth:
                430,
            }}
          >
            {/* ====================================================
                HEADER
            ===================================================== */}

            <View
              className="
                shrink-0
                border-b
                border-border
                bg-card
                px-5
                pb-4
                pt-5
              "
            >
              <View
                className="
                  flex-row
                  items-start
                "
              >
                {/* Warning icon */}

                <View
                  className="
                    h-12
                    w-12
                    shrink-0
                    items-center
                    justify-center
                    rounded-2xl
                    bg-destructive/10
                  "
                >
                  <AlertTriangle
                    size={
                      25
                    }
                    color={
                      DANGER
                    }
                    strokeWidth={
                      2
                    }
                  />
                </View>

                {/* Title */}

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
                    Cancel Appointment
                  </Text>

                  <Text
                    className="
                      mt-1
                      text-sm
                      leading-5
                      text-muted-foreground
                    "
                  >
                    Are you sure you want to cancel this appointment?
                  </Text>
                </View>

                {/* Close */}

                <TouchableOpacity
                  disabled={
                    loading
                  }
                  onPress={
                    onCancel
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
                  accessibilityRole="button"
                  accessibilityLabel="Close cancellation dialog"
                >
                  <X
                    size={
                      20
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
                SCROLLABLE FORM

                The explicit parent height above guarantees this
                region receives available space.
            ===================================================== */}

            <ScrollView
              className="
                min-h-0
                flex-1
              "
              contentContainerStyle={{
                paddingHorizontal:
                  20,

                paddingTop:
                  16,

                paddingBottom:
                  24,
              }}
              keyboardShouldPersistTaps="handled"
              keyboardDismissMode={
                Platform.OS ===
                'ios'
                  ? 'interactive'
                  : 'on-drag'
              }
              showsVerticalScrollIndicator={
                true
              }
              nestedScrollEnabled
            >
              {/* ==================================================
                  WARNING
              =================================================== */}

              <View
                className="
                  mb-4
                  flex-row
                  items-start
                  rounded-xl
                  border
                  border-destructive/20
                  bg-destructive/5
                  p-4
                "
              >
                <AlertTriangle
                  size={
                    19
                  }
                  color={
                    DANGER
                  }
                  strokeWidth={
                    2
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
                      font-bold
                      text-destructive
                    "
                  >
                    This action cannot be undone
                  </Text>

                  <Text
                    className="
                      mt-1
                      text-xs
                      leading-5
                      text-muted-foreground
                    "
                  >
                    Once this appointment is cancelled, it cannot
                    be restored from the customer app.
                  </Text>
                </View>
              </View>

              {/* ==================================================
                  APPOINTMENT DETAILS
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
                  Appointment Details
                </Text>

                {/* ==================================================
                    DATE
                =================================================== */}

                <View
                  className="
                    mt-4
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
                      strokeWidth={
                        2
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
                        text-[10px]
                        font-semibold
                        uppercase
                        tracking-wider
                        text-muted-foreground
                      "
                    >
                      Date
                    </Text>

                    <Text
                      className="
                        mt-0.5
                        text-sm
                        font-semibold
                        text-foreground
                      "
                    >
                      {formatAppointmentDate(
                        appointment?.appointmentDate,
                      )}
                    </Text>
                  </View>
                </View>

                {/* ==================================================
                    TIME
                =================================================== */}

                <View
                  className="
                    mt-4
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
                    <Clock3
                      size={
                        19
                      }
                      color={
                        MUTED
                      }
                      strokeWidth={
                        2
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
                        text-[10px]
                        font-semibold
                        uppercase
                        tracking-wider
                        text-muted-foreground
                      "
                    >
                      Time
                    </Text>

                    <Text
                      className="
                        mt-0.5
                        text-sm
                        font-semibold
                        text-foreground
                      "
                    >
                      {formatAppointmentTime(
                        appointment?.appointmentTime,
                      )}
                    </Text>
                  </View>
                </View>

                {/* ==================================================
                    TRACKING NUMBER
                =================================================== */}

                {appointment?.trackingNumber && (
                  <View
                    className="
                      mt-4
                      border-t
                      border-border
                      pt-4
                    "
                  >
                    <Text
                      className="
                        text-[10px]
                        font-semibold
                        uppercase
                        tracking-wider
                        text-muted-foreground
                      "
                    >
                      Tracking Number
                    </Text>

                    <Text
                      className="
                        mt-1
                        text-sm
                        font-bold
                        uppercase
                        tracking-wide
                        text-foreground
                      "
                    >
                      #
                      {
                        appointment.trackingNumber
                      }
                    </Text>
                  </View>
                )}
              </View>

              {/* ==================================================
                  CANCELLATION REASON

                  THIS SECTION IS NOW GUARANTEED TO BE VISIBLE.
              =================================================== */}

              <View
                className="
                  mb-4
                "
              >
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
                  Cancellation Reason
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
                  <Text
                    className="
                      text-sm
                      font-semibold
                      text-foreground
                    "
                  >
                    Why are you cancelling?
                  </Text>

                  <Text
                    className="
                      mt-1
                      text-xs
                      leading-5
                      text-muted-foreground
                    "
                  >
                    Please provide a reason so AutoCare can record
                    the cancellation properly.
                  </Text>

                  {/* =================================================
                      REASON INPUT
                  ================================================== */}

                  <TextInput
                    value={
                      reason
                    }
                    onChangeText={
                      setReason
                    }
                    editable={
                      !loading
                    }
                    multiline
                    numberOfLines={
                      5
                    }
                    maxLength={
                      500
                    }
                    textAlignVertical="top"
                    placeholder="Enter cancellation reason..."
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

                  {/* =================================================
                      INPUT FOOTER
                  ================================================== */}

                  <View
                    className="
                      mt-2
                      flex-row
                      items-start
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
                      A cancellation reason is required before the
                      appointment can be cancelled.
                    </Text>

                    <Text
                      className="
                        text-[10px]
                        text-muted-foreground
                      "
                    >
                      {
                        reason.length
                      }
                      /500
                    </Text>
                  </View>

                  {/* =================================================
                      VALIDATION MESSAGE
                  ================================================== */}

                  {reason.length >
                    0 &&
                    !reasonValid && (
                      <Text
                        className="
                          mt-2
                          text-[10px]
                          font-medium
                          text-destructive
                        "
                      >
                        Please enter at least 3 characters.
                      </Text>
                    )}
                </View>
              </View>

              {/* ==================================================
                  FINAL WARNING
              =================================================== */}

              <View
                className="
                  mb-2
                  rounded-xl
                  border
                  border-border
                  bg-muted/20
                  p-4
                "
              >
                <Text
                  className="
                    text-xs
                    leading-5
                    text-muted-foreground
                  "
                >
                  By confirming, you understand that the
                  cancellation is permanent and the appointment
                  cannot be restored through the customer app.
                </Text>
              </View>
            </ScrollView>

            {/* ====================================================
                FOOTER

                This remains outside the ScrollView so the action
                is always accessible.
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
              {/* ==================================================
                  PRIMARY CANCEL BUTTON
              =================================================== */}

              <TouchableOpacity
                disabled={
                  loading ||
                  !reasonValid
                }
                onPress={
                  handleConfirm
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
                    loading ||
                    !reasonValid
                      ? 0.5
                      : 1,
                }}
                accessibilityRole="button"
                accessibilityState={{
                  disabled:
                    loading ||
                    !reasonValid,
                }}
                accessibilityLabel="Cancel appointment"
              >
                {loading ? (
                  <ActivityIndicator
                    size="small"
                    color="#FFFFFF"
                  />
                ) : (
                  <>
                    <AlertTriangle
                      size={
                        19
                      }
                      color="#FFFFFF"
                      strokeWidth={
                        2
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
                      Yes, Cancel Appointment
                    </Text>
                  </>
                )}
              </TouchableOpacity>

              {/* ==================================================
                  SECONDARY ACTION
              =================================================== */}

              <TouchableOpacity
                disabled={
                  loading
                }
                onPress={
                  onCancel
                }
                activeOpacity={
                  0.8
                }
                className="
                  mt-2
                  min-h-[44px]
                  items-center
                  justify-center
                  rounded-xl
                  bg-secondary
                "
                accessibilityRole="button"
                accessibilityLabel="Keep appointment"
              >
                <Text
                  className="
                    text-sm
                    font-semibold
                    text-secondary-foreground
                  "
                >
                  Keep Appointment
                </Text>
              </TouchableOpacity>

              {/* ==================================================
                  BUTTON HELP TEXT
              =================================================== */}

              {!loading &&
                !reasonValid && (
                  <Text
                    className="
                      mt-2
                      text-center
                      text-[10px]
                      leading-4
                      text-muted-foreground
                    "
                  >
                    Enter your cancellation reason above to enable
                    cancellation.
                  </Text>
                )}

              {!loading &&
                reasonValid && (
                  <Text
                    className="
                      mt-2
                      text-center
                      text-[10px]
                      leading-4
                      text-destructive
                    "
                  >
                    This action cannot be undone.
                  </Text>
                )}
            </View>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}