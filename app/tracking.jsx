import {
  View,
  ScrollView,
  RefreshControl,
  Alert,
  ActivityIndicator,
  Text,
  TouchableOpacity,
} from 'react-native';

import {
  SafeAreaView,
} from 'react-native-safe-area-context';

import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';

import {
  useLocalSearchParams,
  router,
} from 'expo-router';

import {
  AlertCircle,
  ChevronRight,
  ReceiptText,
  Calendar,
} from 'lucide-react-native';

import {
  useTrackingData,
} from '../hooks/useTrackingData';

import {
  useQueue,
} from '../hooks/useQueue';

import {
  useRescheduleRequests,
} from '../hooks/useRescheduleRequests';

import {
  statusToStage,
} from '../utils/constants';

import TrackingHeader from '../components/tracking/TrackingHeader';

import VehicleInfoCard from '../components/tracking/VehicleInfoCard';

import TaskList from '../components/tracking/TaskList';

import CostingSummary from '../components/tracking/CostingSummary';

import ProgressTimeline from '../components/tracking/ProgressTimeline';

import CancellationNote from '../components/tracking/CancellationNote';

import QueueSection from '../components/tracking/QueueSection';

import {
  ApproveModal,
  RejectModal,
} from '../components/tracking/EstimateModals';

import RescheduleRequestCard from '../components/tracking/RescheduleRequestCard';

import RescheduleModal from '../components/tracking/RescheduleModal';

import RescheduleConfirmationModal from '../components/tracking/RescheduleConfirmationModal';

import estimateApi from '../services/estimateApi';

import {
  canReschedule,
} from '../utils/appointments';

import {
  format,
} from 'date-fns';

/* ================================================================
   TRACKING SCREEN
================================================================ */

export default function TrackingScreen() {
  /* ==============================================================
     PARAMS
  ============================================================== */

  const {
    appointmentId,
  } =
    useLocalSearchParams();

  /* ==============================================================
     TRACKING DATA
  ============================================================== */

  const {
    appointment,

    tasks,

    estimate,

    finalBill,

    loading,

    refreshing,

    onRefresh,

    refreshAll,
  } =
    useTrackingData(
      appointmentId,
    );

  /* ==============================================================
     QUEUE
  ============================================================== */

  const appointmentDate =
    appointment?.appointmentDate;

  const isConfirmed =
    appointment?.status ===
    'CONFIRMED';

  const {
    queue,

    loading:
      queueLoading,

    error:
      queueError,
  } =
    useQueue(
      isConfirmed
        ? appointmentDate
        : null,
      appointmentId,
    );

  /* ==============================================================
     RESCHEDULE REQUESTS
  ============================================================== */

  const {
    requests,

    loading:
      requestsLoading,

    approveRequest,

    rejectRequest,

    pendingRequest,

    latestDecision,

    clearLatestDecision,
  } =
    useRescheduleRequests(
      appointmentId,
    );

  /* ==============================================================
     ESTIMATE STATE
  ============================================================== */

  const [
    excludedFindingIds,
    setExcludedFindingIds,
  ] = useState(
    [],
  );

  const [
    approveModalVisible,
    setApproveModalVisible,
  ] = useState(
    false,
  );

  const [
    rejectModalVisible,
    setRejectModalVisible,
  ] = useState(
    false,
  );

  const [
    rejectReason,
    setRejectReason,
  ] = useState(
    '',
  );

  const [
    actionLoading,
    setActionLoading,
  ] = useState(
    false,
  );

  /* ==============================================================
     RESCHEDULE FORM
  ============================================================== */

  const [
    rescheduleModalVisible,
    setRescheduleModalVisible,
  ] = useState(
    false,
  );

  /* ==============================================================
     RESCHEDULE RESULT MODAL
  ============================================================== */

  const [
    rescheduleDecisionVisible,
    setRescheduleDecisionVisible,
  ] = useState(
    false,
  );

  /*
   * The appointment can be updated by a separate realtime
   * `appointments` event very close to the
   * `appointment_reschedule_requests` event.
   *
   * Keep the previous schedule so that the customer can still see:
   *
   *     Old Schedule -> New Schedule
   */
  const previousScheduleRef =
    useRef(null);

  const lastAppointmentIdRef =
    useRef(null);

  const lastKnownDateRef =
    useRef(null);

  const lastKnownTimeRef =
    useRef(null);

  /* ==============================================================
     TRACK LAST KNOWN APPOINTMENT SCHEDULE
  ============================================================== */

  useEffect(() => {
    if (
      !appointment
    ) {
      return;
    }

    if (
      lastAppointmentIdRef.current !==
      appointment.id
    ) {
      lastAppointmentIdRef.current =
        appointment.id;

      lastKnownDateRef.current =
        appointment.appointmentDate;

      lastKnownTimeRef.current =
        appointment.appointmentTime;

      previousScheduleRef.current =
        null;

      return;
    }

    const oldDate =
      lastKnownDateRef.current;

    const oldTime =
      lastKnownTimeRef.current;

    const dateChanged =
      oldDate &&
      oldDate !==
        appointment.appointmentDate;

    const timeChanged =
      oldTime &&
      String(
        oldTime,
      ).slice(
        0,
        5,
      ) !==
        String(
          appointment.appointmentTime ||
            '',
        ).slice(
          0,
          5,
        );

    /*
     * Capture the previous schedule before overwriting the
     * last-known snapshot.
     */
    if (
      dateChanged ||
      timeChanged
    ) {
      previousScheduleRef.current =
        {
          date:
            oldDate,

          time:
            oldTime,
        };
    }

    lastKnownDateRef.current =
      appointment.appointmentDate;

    lastKnownTimeRef.current =
      appointment.appointmentTime;
  }, [
    appointment,
  ]);

  /* ==============================================================
     REALTIME RESCHEDULE DECISION
  ============================================================== */

  useEffect(() => {
    if (
      !latestDecision?.request
    ) {
      return;
    }

    /*
     * Do not show the decision modal for unrelated stale state.
     */
    setRescheduleModalVisible(
      false,
    );

    setRescheduleDecisionVisible(
      true,
    );
  }, [
    latestDecision,
  ]);

  /* ==============================================================
     CLOSE DECISION
  ============================================================== */

  const closeRescheduleDecision =
    useCallback(
      async () => {
        setRescheduleDecisionVisible(
          false,
        );

        clearLatestDecision();

        /*
         * The staff decision may have updated the appointment
         * immediately before the modal was displayed.
         */
        await refreshAll();

        /*
         * Once the customer has acknowledged the result, the
         * old schedule is no longer needed by the confirmation UI.
         */
        previousScheduleRef.current =
          null;
      },
      [
        clearLatestDecision,
        refreshAll,
      ],
    );

  /* ==============================================================
     STATUS
  ============================================================== */

  const currentStage =
    statusToStage[
      appointment?.status
    ] ?? 0;

  const isWaitingForApproval =
    appointment?.status ===
    'WAITING_FOR_APPROVAL';

  const isInProgress =
    appointment?.status ===
    'IN_PROGRESS';

  const isCancelled =
    appointment?.status ===
    'CANCELLED';

  /* ==============================================================
     CAN RESCHEDULE
  ============================================================== */

  const canRescheduleAppointment =
    appointment &&
    canReschedule(
      appointment.status,
    ) &&
    !pendingRequest;

  /* ==============================================================
     GRAND TOTAL
  ============================================================== */

  let grandTotal =
    0;

  if (
    estimate?.grandTotal !==
      undefined &&
    estimate?.grandTotal !==
      null
  ) {
    grandTotal =
      parseFloat(
        estimate.grandTotal,
      ) || 0;
  } else {
    const serviceSubtotal =
      parseFloat(
        estimate?.serviceSubtotal,
      ) || 0;

    const partsTotal =
      tasks
        .filter(
          (
            task,
          ) =>
            task.status ===
              'DONE' &&
            task.findings,
        )
        .reduce(
          (
            sum,
            task,
          ) =>
            sum +
            (
              task.findings ||
              []
            ).reduce(
              (
                findingSum,
                finding,
              ) =>
                findingSum +
                (
                  finding.products ||
                  []
                ).reduce(
                  (
                    productsSum,
                    product,
                  ) =>
                    productsSum +
                    (
                      product.quantity ||
                      1
                    ) *
                      (
                        parseFloat(
                          product.priceAtTime,
                        ) ||
                        0
                      ),
                  0,
                ),
              0,
            ),
          0,
        );

    const feesTotal =
      parseFloat(
        estimate?.feesTotal,
      ) || 0;

    const discountTotal =
      parseFloat(
        estimate?.discountTotal,
      ) || 0;

    grandTotal =
      serviceSubtotal +
      partsTotal +
      feesTotal -
      discountTotal;
  }

  /* ==============================================================
     ESTIMATE BREAKDOWN
  ============================================================== */

  const servicePrice =
    parseFloat(
      estimate?.serviceSubtotal,
    ) || 0;

  const partsTotal =
    tasks
      .filter(
        (
          task,
        ) =>
          task.status ===
            'DONE' &&
          task.findings,
      )
      .reduce(
        (
          sum,
          task,
        ) =>
          sum +
          (
            task.findings ||
            []
          ).reduce(
            (
              findingSum,
              finding,
            ) =>
              findingSum +
              (
                finding.products ||
                []
              ).reduce(
                (
                  productsSum,
                  product,
                ) =>
                  productsSum +
                  (
                    product.quantity ||
                    1
                  ) *
                    (
                      parseFloat(
                        product.priceAtTime,
                      ) ||
                      0
                    ),
                0,
              ),
            0,
          ),
        0,
      );

  const laborTotal =
    parseFloat(
      estimate?.feesTotal,
    ) || 0;

  const discountTotal =
    parseFloat(
      estimate?.discountTotal,
    ) || 0;

  const finalBillGrandTotal =
    finalBill
      ? parseFloat(
          finalBill.grandTotal,
        )
      : null;

  /* ==============================================================
     TOGGLE FINDING
  ============================================================== */

  const toggleExclude =
    (
      id,
    ) => {
      setExcludedFindingIds(
        (
          previous,
        ) =>
          previous.includes(
            id,
          )
            ? previous.filter(
                (
                  item,
                ) =>
                  item !==
                  id,
              )
            : [
                ...previous,
                id,
              ],
      );
    };

  /* ==============================================================
     APPROVE ESTIMATE
  ============================================================== */

  const confirmApprove =
    async () => {
      if (
        !estimate
      ) {
        return;
      }

      setApproveModalVisible(
        false,
      );

      setActionLoading(
        true,
      );

      try {
        await estimateApi.approve(
          estimate.id,
        );

        Alert.alert(
          'Approved!',
          'Work is now in progress.',
        );

        await refreshAll();
      } catch (
        error
      ) {
        Alert.alert(
          'Error',
          error?.response
            ?.data
            ?.message ||
            error?.message ||
            'Failed to approve',
        );

        await refreshAll();
      } finally {
        setActionLoading(
          false,
        );
      }
    };

  /* ==============================================================
     REJECT ESTIMATE
  ============================================================== */

  const submitRejection =
    async () => {
      if (
        !rejectReason.trim() ||
        !estimate
      ) {
        return;
      }

      setRejectModalVisible(
        false,
      );

      setActionLoading(
        true,
      );

      try {
        await estimateApi.decline(
          estimate.id,
          rejectReason.trim(),
        );

        Alert.alert(
          'Rejected',
          'Appointment cancelled.',
        );

        await refreshAll();
      } catch (
        error
      ) {
        Alert.alert(
          'Error',
          error?.response
            ?.data
            ?.message ||
            error?.message ||
            'Failed to reject',
        );
      } finally {
        setActionLoading(
          false,
        );

        setRejectReason(
          '',
        );
      }
    };

  /* ==============================================================
     RESCHEDULE SUCCESS
  ============================================================== */

  const handleRescheduleSuccess =
    useCallback(
      async () => {
        setRescheduleModalVisible(
          false,
        );

        await refreshAll();
      },
      [
        refreshAll,
      ],
    );

  /* ==============================================================
     LOADING
  ============================================================== */

  if (
    loading
  ) {
    return (
      <SafeAreaView
        className="
          flex-1
          items-center
          justify-center
          bg-background
        "
      >
        <View
          className="
            h-16
            w-16
            items-center
            justify-center
            rounded-2xl
            bg-card
            shadow-sm
          "
        >
          <ActivityIndicator
            size="small"
            color="#C1272D"
          />
        </View>

        <Text
          className="
            mt-4
            text-sm
            text-muted-foreground
          "
        >
          Loading appointment…
        </Text>
      </SafeAreaView>
    );
  }

  /* ==============================================================
     NOT FOUND
  ============================================================== */

  if (
    !appointment
  ) {
    return (
      <SafeAreaView
        className="
          flex-1
          items-center
          justify-center
          bg-background
          px-4
        "
      >
        <View
          className="
            h-20
            w-20
            items-center
            justify-center
            rounded-3xl
            bg-card
          "
        >
          <AlertCircle
            size={
              34
            }
            color="#C1272D"
            strokeWidth={
              1.8
            }
          />
        </View>

        <Text
          className="
            mt-5
            text-xl
            font-bold
            text-foreground
          "
        >
          Appointment not found
        </Text>

        <Text
          className="
            mt-2
            text-center
            text-sm
            text-muted-foreground
          "
        >
          We could not load the appointment
          details.
        </Text>
      </SafeAreaView>
    );
  }

  /* ==============================================================
     PREVIOUS SCHEDULE FOR DECISION MODAL
  ============================================================== */

  const previousDecisionDate =
    previousScheduleRef.current
      ?.date ||
    appointment.appointmentDate;

  const previousDecisionTime =
    previousScheduleRef.current
      ?.time ||
    appointment.appointmentTime;

  /* ==============================================================
     RENDER
  ============================================================== */

  return (
    <SafeAreaView
      className="
        flex-1
        bg-background
      "
      edges={[
        'top',
      ]}
    >
      <ScrollView
        className="
          flex-1
        "
        contentContainerStyle={{
          paddingBottom:
            40,
        }}
        showsVerticalScrollIndicator={
          false
        }
        refreshControl={
          <RefreshControl
            refreshing={
              refreshing
            }
            onRefresh={
              onRefresh
            }
            tintColor="#C1272D"
            colors={[
              '#C1272D',
            ]}
          />
        }
      >
        <View
          className="
            px-4
            pt-2
          "
        >
          {/* ====================================================
              TRACKING HEADER
          ===================================================== */}

          <TrackingHeader
            appointment={
              appointment
            }
          />

          {/* ====================================================
              VEHICLE INFO
          ===================================================== */}

          <VehicleInfoCard
            appointment={
              appointment
            }
          />

          {/* ====================================================
              RESCHEDULE REQUEST HISTORY
          ===================================================== */}

          {!requestsLoading &&
            requests.length >
              0 && (
              <View
                className="
                  mb-4
                "
              >
                <Text
                  className="
                    mb-2
                    text-sm
                    font-semibold
                    text-foreground
                  "
                >
                  Reschedule Requests
                </Text>

                {requests.map(
                  (
                    request,
                  ) => (
                    <RescheduleRequestCard
                      key={
                        request.id
                      }
                      request={
                        request
                      }
                      onApprove={
                        approveRequest
                      }
                      onReject={
                        rejectRequest
                      }
                    />
                  ),
                )}
              </View>
            )}

          {/* ====================================================
              QUEUE
          ===================================================== */}

          {isConfirmed && (
            <QueueSection
              queue={
                queue
              }
              loading={
                queueLoading
              }
              error={
                queueError
              }
              appointmentId={
                appointmentId
              }
            />
          )}

          {/* ====================================================
              RESCHEDULE BUTTON
          ===================================================== */}

          {canRescheduleAppointment && (
            <TouchableOpacity
              onPress={() =>
                setRescheduleModalVisible(
                  true,
                )
              }
              disabled={
                actionLoading
              }
              activeOpacity={
                0.85
              }
              className="
                mb-4
                min-h-[44px]
                flex-row
                items-center
                justify-center
                rounded-xl
                bg-primary
                px-4
                py-3
              "
            >
              <Calendar
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
                Reschedule Appointment
              </Text>
            </TouchableOpacity>
          )}

          {/* ====================================================
              PENDING REQUEST
          ===================================================== */}

          {pendingRequest && (
            <View
              className="
                mb-4
                rounded-xl
                border
                border-amber-200
                bg-amber-50
                p-4
              "
            >
              <Text
                className="
                  text-sm
                  font-semibold
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
                {pendingRequest.requestedBy ===
                'staff'
                  ? 'AutoCare requested'
                  : 'You requested'}{' '}
                a new appointment on{' '}
                {format(
                  new Date(
                    `${pendingRequest.newAppointmentDate}T00:00:00`,
                  ),
                  'MMM d, yyyy',
                )}{' '}
                at{' '}
                {pendingRequest.newAppointmentTime?.slice(
                  0,
                  5,
                )}
                .
              </Text>

              {pendingRequest.reason && (
                <Text
                  className="
                    mt-2
                    text-xs
                    leading-5
                    text-amber-700
                  "
                >
                  Reason: {
                    pendingRequest.reason
                  }
                </Text>
              )}

              <Text
                className="
                  mt-2
                  text-xs
                  font-medium
                  text-amber-700
                "
              >
                Waiting for AutoCare approval.
              </Text>
            </View>
          )}

          {/* ====================================================
              TASKS
          ===================================================== */}

          {[
            'UNDER_INSPECTION',
            'WAITING_FOR_APPROVAL',
            'IN_PROGRESS',
            'COMPLETED',
          ].includes(
            appointment.status,
          ) && (
            <TaskList
              tasks={
                tasks
              }
              excludedFindingIds={
                excludedFindingIds
              }
              onToggleExclude={
                toggleExclude
              }
              isWaitingForApproval={
                isWaitingForApproval
              }
            />
          )}

          {/* ====================================================
              ESTIMATE
          ===================================================== */}

          {appointment.status ===
            'WAITING_FOR_APPROVAL' && (
            <CostingSummary
              servicePrice={
                servicePrice
              }
              partsTotal={
                partsTotal
              }
              laborTotal={
                laborTotal
              }
              discountTotal={
                discountTotal
              }
              grandTotal={
                grandTotal
              }
              isWaitingForApproval={
                isWaitingForApproval
              }
              actionLoading={
                actionLoading
              }
              onApprove={() =>
                setApproveModalVisible(
                  true,
                )
              }
              onReject={() =>
                setRejectModalVisible(
                  true,
                )
              }
              estimate={
                estimate
              }
            />
          )}

          {/* ====================================================
              FINAL BILL
          ===================================================== */}

          {isInProgress &&
            finalBill && (
              <TouchableOpacity
                onPress={() =>
                  router.push(
                    `/invoice/${finalBill.id}`,
                  )
                }
                activeOpacity={
                  0.8
                }
                className="
                  mb-6
                  overflow-hidden
                  rounded-xl
                  border
                  border-border
                  bg-card
                "
                style={{
                  shadowColor:
                    '#000',

                  shadowOpacity:
                    0.05,

                  shadowRadius:
                    12,

                  shadowOffset: {
                    width: 0,
                    height: 4,
                  },

                  elevation:
                    2,
                }}
              >
                <View
                  className="
                    flex-row
                    items-center
                    px-4
                    py-4
                  "
                >
                  <View
                    className="
                      mr-3
                      h-11
                      w-11
                      items-center
                      justify-center
                      rounded-full
                      bg-primary/10
                    "
                  >
                    <ReceiptText
                      size={
                        21
                      }
                      color="#C1272D"
                      strokeWidth={
                        2
                      }
                    />
                  </View>

                  <View
                    className="
                      flex-1
                    "
                  >
                    <Text
                      className="
                        text-lg
                        font-semibold
                        text-foreground
                      "
                    >
                      Final Bill
                    </Text>

                    <Text
                      className="
                        mt-1
                        text-sm
                        text-muted-foreground
                      "
                    >
                      View your completed service invoice
                    </Text>
                  </View>

                  <ChevronRight
                    size={
                      20
                    }
                    color="#8E8E93"
                  />
                </View>

                <View
                  className="
                    ml-4
                    flex-row
                    items-center
                    justify-between
                    border-t
                    border-border
                    px-4
                    py-4
                  "
                >
                  <Text
                    className="
                      text-sm
                      text-muted-foreground
                    "
                  >
                    Total
                  </Text>

                  <Text
                    className="
                      text-base
                      font-semibold
                      text-primary
                    "
                  >
                    ₱
                    {finalBillGrandTotal?.toFixed(
                      2,
                    )}
                  </Text>
                </View>
              </TouchableOpacity>
            )}

          {/* ====================================================
              CANCELLED
          ===================================================== */}

          {isCancelled && (
            <CancellationNote
              notes={
                appointment.notes
              }
            />
          )}

          {/* ====================================================
              PROGRESS
          ===================================================== */}

          <ProgressTimeline
            currentStage={
              currentStage
            }
          />
        </View>
      </ScrollView>

      {/* ==========================================================
          ESTIMATE APPROVAL
      =========================================================== */}

      <ApproveModal
        visible={
          approveModalVisible
        }
        onClose={() =>
          setApproveModalVisible(
            false,
          )
        }
        onConfirm={
          confirmApprove
        }
        grandTotal={
          grandTotal
        }
        excludedCount={
          excludedFindingIds.length
        }
        actionLoading={
          actionLoading
        }
      />

      {/* ==========================================================
          ESTIMATE REJECTION
      =========================================================== */}

      <RejectModal
        visible={
          rejectModalVisible
        }
        onClose={() => {
          setRejectModalVisible(
            false,
          );

          setRejectReason(
            '',
          );
        }}
        onSubmit={
          submitRejection
        }
        reason={
          rejectReason
        }
        setReason={
          setRejectReason
        }
        actionLoading={
          actionLoading
        }
      />

      {/* ==========================================================
          RESCHEDULE FORM
      =========================================================== */}

      <RescheduleModal
        visible={
          rescheduleModalVisible
        }
        onClose={() =>
          setRescheduleModalVisible(
            false,
          )
        }
        appointment={
          appointment
        }
        onSuccess={
          handleRescheduleSuccess
        }
      />

      {/* ==========================================================
          REALTIME RESCHEDULE DECISION
      =========================================================== */}

      <RescheduleConfirmationModal
        visible={
          rescheduleDecisionVisible
        }
        mode={
          latestDecision?.status
        }
        request={
          latestDecision?.request
        }
        currentDate={
          appointment.appointmentDate
        }
        currentTime={
          appointment.appointmentTime
        }
        previousDate={
          previousDecisionDate
        }
        previousTime={
          previousDecisionTime
        }
        onCancel={
          closeRescheduleDecision
        }
        onConfirm={
          closeRescheduleDecision
        }
      />
    </SafeAreaView>
  );
}