import React from 'react';

import {
  Modal,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';

import {
  AlertTriangle,
  ArrowRight,
  CalendarDays,
  Clock3,
  FileText,
  CheckCircle2,
  XCircle,
  ShieldAlert,
} from 'lucide-react-native';

/* ================================================================
   COLORS
================================================================ */

const PRIMARY =
  '#C1272D';

const SUCCESS =
  '#16A34A';

const DESTRUCTIVE =
  '#DC2626';

const WARNING =
  '#D97706';

const MUTED =
  '#8E8E93';

/* ================================================================
   DATE FORMATTER
================================================================ */

function formatScheduleDate(
  date,
) {
  if (
    !date
  ) {
    return 'N/A';
  }

  try {
    return new Date(
      `${date}T00:00:00`,
    ).toLocaleDateString(
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
  } catch {
    return date;
  }
}

/* ================================================================
   TIME FORMATTER
================================================================ */

function formatScheduleTime(
  time,
) {
  if (
    !time
  ) {
    return 'N/A';
  }

  const normalized =
    String(
      time,
    ).slice(
      0,
      5,
    );

  const [
    hourText,
    minuteText,
  ] =
    normalized.split(
      ':',
    );

  const hours =
    Number(
      hourText,
    );

  if (
    Number.isNaN(
      hours,
    )
  ) {
    return normalized;
  }

  const minutes =
    minuteText ||
    '00';

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
   DETAIL ROW
================================================================ */

function DetailRow({
  icon,
  label,
  value,
  accent = false,
}) {
  return (
    <View
      className="
        flex-row
        items-start
        border-b
        border-border
        py-3
      "
    >
      <View
        className="
          mr-3
          mt-0.5
          h-10
          w-10
          shrink-0
          items-center
          justify-center
          rounded-xl
          bg-muted/40
        "
      >
        {icon}
      </View>

      <View
        className="
          min-w-0
          flex-1
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
          {label}
        </Text>

        <Text
          className={`
            mt-1
            text-sm
            font-semibold
            ${
              accent
                ? 'text-primary'
                : 'text-foreground'
            }
          `}
        >
          {value ||
            'N/A'}
        </Text>
      </View>
    </View>
  );
}

/* ================================================================
   COMPONENT
================================================================ */

export default function RescheduleConfirmationModal({
  visible,

  mode = 'SEND',

  request,

  currentDate,

  currentTime,

  previousDate,

  previousTime,

  onCancel,

  onConfirm,

  loading = false,
}) {
  if (
    !request
  ) {
    return null;
  }

  const isSend =
    mode ===
    'SEND';

  const isApproved =
    mode ===
    'APPROVED';

  const isRejected =
    mode ===
    'REJECTED';

  /*
   * When staff approves, the appointment itself may already have
   * been updated by the time this modal renders.
   *
   * previousDate / previousTime are therefore preferred for the
   * old schedule.
   */
  const oldDate =
    previousDate ||
    currentDate;

  const oldTime =
    previousTime ||
    currentTime;

  const accentColor =
    isApproved
      ? SUCCESS
      : isRejected
        ? DESTRUCTIVE
        : PRIMARY;

  const title =
    isSend
      ? 'Confirm Reschedule'
      : isApproved
        ? 'Reschedule Approved'
        : 'Reschedule Declined';

  const description =
    isSend
      ? 'Review the requested schedule before sending it to AutoCare.'
      : isApproved
        ? 'AutoCare approved your reschedule request.'
        : 'AutoCare declined your reschedule request.';

  return (
    <Modal
      visible={
        visible
      }
      transparent
      animationType="slide"
      onRequestClose={() => {
        if (
          !loading
        ) {
          onCancel?.();
        }
      }}
    >
      <View
        className="
          flex-1
          justify-end
          bg-black/60
        "
      >
        <View
          className="
            max-h-[94%]
            overflow-hidden
            rounded-t-[32px]
            bg-background
          "
        >
          {/* ======================================================
              HEADER
          ======================================================= */}

          <View
            className="
              shrink-0
              border-b
              border-border
              px-5
              pb-4
              pt-4
            "
          >
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
              <View
                className="
                  mr-3
                  h-12
                  w-12
                  shrink-0
                  items-center
                  justify-center
                  rounded-2xl
                "
                style={{
                  backgroundColor:
                    `${accentColor}15`,
                }}
              >
                {isApproved ? (
                  <CheckCircle2
                    size={
                      24
                    }
                    color={
                      SUCCESS
                    }
                    strokeWidth={
                      2.2
                    }
                  />
                ) : isRejected ? (
                  <XCircle
                    size={
                      24
                    }
                    color={
                      DESTRUCTIVE
                    }
                    strokeWidth={
                      2.2
                    }
                  />
                ) : (
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
                )}
              </View>

              <View
                className="
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
                  {title}
                </Text>

                <Text
                  className="
                    mt-1
                    text-sm
                    leading-5
                    text-muted-foreground
                  "
                >
                  {description}
                </Text>
              </View>
            </View>
          </View>

          {/* ======================================================
              SCROLLABLE CONTENT
          ======================================================= */}

          <ScrollView
            className="
              min-h-0
              flex-1
            "
            contentContainerStyle={{
              paddingHorizontal:
                20,
              paddingVertical:
                16,
              paddingBottom:
                20,
            }}
            showsVerticalScrollIndicator={
              false
            }
            nestedScrollEnabled
          >
            {/* ====================================================
                SEND WARNING
            ===================================================== */}

            {isSend && (
              <View
                className="
                  mb-4
                  rounded-2xl
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
                  <AlertTriangle
                    size={
                      20
                    }
                    color={
                      WARNING
                    }
                    strokeWidth={
                      2.2
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
                        text-amber-800
                      "
                    >
                      This action can't be undone
                    </Text>

                    <Text
                      className="
                        mt-1
                        text-xs
                        leading-5
                        text-amber-700
                      "
                    >
                      Once sent, this reschedule request cannot
                      be edited. AutoCare will review the request
                      and decide whether the new schedule can be
                      accepted.
                    </Text>
                  </View>
                </View>
              </View>
            )}

            {/* ====================================================
                RESULT SUMMARY
            ===================================================== */}

            {!isSend && (
              <View
                className="
                  mb-4
                  rounded-2xl
                  p-4
                "
                style={{
                  backgroundColor:
                    isApproved
                      ? '#DCFCE7'
                      : '#FEE2E2',
                }}
              >
                <View
                  className="
                    flex-row
                    items-start
                  "
                >
                  {isApproved ? (
                    <CheckCircle2
                      size={
                        21
                      }
                      color={
                        SUCCESS
                      }
                      strokeWidth={
                        2.2
                      }
                    />
                  ) : (
                    <XCircle
                      size={
                        21
                      }
                      color={
                        DESTRUCTIVE
                      }
                      strokeWidth={
                        2.2
                      }
                    />
                  )}

                  <View
                    className="
                      ml-3
                      flex-1
                    "
                  >
                    <Text
                      className={`
                        text-sm
                        font-bold
                        ${
                          isApproved
                            ? 'text-green-800'
                            : 'text-red-800'
                        }
                      `}
                    >
                      {isApproved
                        ? 'Your appointment has been rescheduled.'
                        : 'Your reschedule request was declined.'}
                    </Text>

                    {!isApproved &&
                      request.rejectionReason && (
                        <View
                          className="
                            mt-3
                            border-t
                            border-red-200
                            pt-2
                          "
                        >
                          <Text
                            className="
                              text-[10px]
                              font-bold
                              uppercase
                              tracking-wider
                              text-red-700
                            "
                          >
                            Rejection Reason
                          </Text>

                          <Text
                            className="
                              mt-1
                              text-xs
                              leading-5
                              text-red-700
                            "
                          >
                            {
                              request.rejectionReason
                            }
                          </Text>
                        </View>
                      )}
                  </View>
                </View>
              </View>
            )}

            {/* ====================================================
                SCHEDULE DETAILS CARD
            ===================================================== */}

            <View
              className="
                overflow-hidden
                rounded-xl
                border
                border-border
                bg-card
              "
            >
              <View
                className="
                  border-b
                  border-border
                  px-4
                  py-3
                "
              >
                <Text
                  className="
                    text-xs
                    font-bold
                    uppercase
                    tracking-wider
                    text-muted-foreground
                  "
                >
                  Reschedule Details
                </Text>
              </View>

              <View
                className="
                  px-4
                "
              >
                <DetailRow
                  icon={
                    <CalendarDays
                      size={
                        18
                      }
                      color={
                        MUTED
                      }
                    />
                  }
                  label="Current Date"
                  value={formatScheduleDate(
                    oldDate,
                  )}
                />

                <DetailRow
                  icon={
                    <Clock3
                      size={
                        18
                      }
                      color={
                        MUTED
                      }
                    />
                  }
                  label="Current Time"
                  value={formatScheduleTime(
                    oldTime,
                  )}
                />

                <DetailRow
                  icon={
                    <CalendarDays
                      size={
                        18
                      }
                      color={
                        accentColor
                      }
                    />
                  }
                  label={
                    isApproved
                      ? 'Rescheduled Date'
                      : 'Requested Date'
                  }
                  value={formatScheduleDate(
                    request.newAppointmentDate,
                  )}
                  accent
                />

                <DetailRow
                  icon={
                    <Clock3
                      size={
                        18
                      }
                      color={
                        accentColor
                      }
                    />
                  }
                  label={
                    isApproved
                      ? 'Rescheduled Time'
                      : 'Requested Time'
                  }
                  value={formatScheduleTime(
                    request.newAppointmentTime,
                  )}
                  accent
                />
              </View>
            </View>

            {/* ====================================================
                VISUAL SCHEDULE CHANGE
            ===================================================== */}

            <View
              className="
                mt-4
                rounded-xl
                border
                border-border
                bg-card
                p-4
              "
            >
              <Text
                className="
                  mb-3
                  text-xs
                  font-bold
                  uppercase
                  tracking-wider
                  text-muted-foreground
                "
              >
                Schedule Change
              </Text>

              <View
                className="
                  flex-row
                  items-center
                "
              >
                <View
                  className="
                    min-w-0
                    flex-1
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
                    Current
                  </Text>

                  <Text
                    className="
                      mt-1
                      text-sm
                      font-semibold
                      text-foreground
                    "
                  >
                    {formatScheduleDate(
                      oldDate,
                    )}
                  </Text>

                  <Text
                    className="
                      mt-0.5
                      text-xs
                      text-muted-foreground
                    "
                  >
                    {formatScheduleTime(
                      oldTime,
                    )}
                  </Text>
                </View>

                <View
                  className="
                    h-10
                    w-10
                    items-center
                    justify-center
                    rounded-full
                    bg-primary/10
                  "
                >
                  <ArrowRight
                    size={
                      19
                    }
                    color={
                      PRIMARY
                    }
                    strokeWidth={
                      2.3
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
                      font-bold
                      uppercase
                      tracking-wider
                      text-primary
                    "
                  >
                    {isApproved
                      ? 'New Schedule'
                      : 'Requested'}
                  </Text>

                  <Text
                    className="
                      mt-1
                      text-sm
                      font-semibold
                      text-foreground
                    "
                  >
                    {formatScheduleDate(
                      request.newAppointmentDate,
                    )}
                  </Text>

                  <Text
                    className="
                      mt-0.5
                      text-xs
                      text-muted-foreground
                    "
                  >
                    {formatScheduleTime(
                      request.newAppointmentTime,
                    )}
                  </Text>
                </View>
              </View>
            </View>

            {/* ====================================================
                REASON
            ===================================================== */}

            <View
              className="
                mt-4
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
                    strokeWidth={
                      2
                    }
                  />
                </View>

                <Text
                  className="
                    ml-2
                    text-xs
                    font-bold
                    uppercase
                    tracking-wider
                    text-foreground
                  "
                >
                  Reschedule Reason
                </Text>
              </View>

              <Text
                className="
                  mt-3
                  text-sm
                  leading-6
                  text-foreground
                "
              >
                {request.reason?.trim() ||
                  'No reason was provided.'}
              </Text>
            </View>

            {/* ====================================================
                REQUEST STATUS
            ===================================================== */}

            {!isSend && (
              <View
                className="
                  mt-4
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
                      items-center
                      justify-center
                      rounded-full
                      bg-muted/50
                    "
                  >
                    <ShieldAlert
                      size={
                        17
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
                      flex-1
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
                      Request Status
                    </Text>

                    <Text
                      className={`
                        mt-1
                        text-sm
                        font-semibold
                        ${
                          isApproved
                            ? 'text-green-600'
                            : 'text-destructive'
                        }
                      `}
                    >
                      {isApproved
                        ? 'APPROVED'
                        : 'REJECTED'}
                    </Text>
                  </View>
                </View>
              </View>
            )}

            {/* ====================================================
                FINAL SEND WARNING
            ===================================================== */}

            {isSend && (
              <View
                className="
                  mt-4
                  flex-row
                  items-start
                  rounded-xl
                  border
                  border-border
                  bg-muted/20
                  p-4
                "
              >
                <ShieldAlert
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

                <Text
                  className="
                    ml-3
                    flex-1
                    text-xs
                    leading-5
                    text-muted-foreground
                  "
                >
                  By tapping “Send Request”, you confirm that
                  the new date, time, and reason are correct.
                  This request cannot be edited after submission.
                </Text>
              </View>
            )}
          </ScrollView>

          {/* ======================================================
              FOOTER
          ======================================================= */}

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
            {isSend ? (
              <View
                className="
                  flex-row
                  gap-3
                "
              >
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
                    min-h-[56px]
                    flex-1
                    items-center
                    justify-center
                    rounded-xl
                    border
                    border-border
                    bg-secondary
                    px-4
                  "
                >
                  <Text
                    className="
                      text-sm
                      font-semibold
                      text-secondary-foreground
                    "
                  >
                    Go Back
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  disabled={
                    loading
                  }
                  onPress={
                    onConfirm
                  }
                  activeOpacity={
                    0.85
                  }
                  className="
                    min-h-[56px]
                    flex-[1.45]
                    flex-row
                    items-center
                    justify-center
                    rounded-xl
                    bg-primary
                    px-4
                  "
                >
                  {loading ? (
                    <ActivityIndicator
                      color="#FFFFFF"
                    />
                  ) : (
                    <>
                      <Text
                        className="
                          mr-2
                          text-sm
                          font-semibold
                          text-primary-foreground
                        "
                      >
                        Send Request
                      </Text>

                      <ArrowRight
                        size={
                          18
                        }
                        color="#FFFFFF"
                        strokeWidth={
                          2.5
                        }
                      />
                    </>
                  )}
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity
                onPress={
                  onConfirm
                }
                activeOpacity={
                  0.85
                }
                className="
                  min-h-[56px]
                  w-full
                  items-center
                  justify-center
                  rounded-xl
                  bg-primary
                  px-4
                "
              >
                <Text
                  className="
                    text-sm
                    font-semibold
                    text-primary-foreground
                  "
                >
                  Done
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>
    </Modal>
  );
}