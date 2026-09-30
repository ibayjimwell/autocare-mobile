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
  useMemo,
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
  XCircle,
  FileText,
} from 'lucide-react-native';

import {
  useAuth,
} from '../context/AuthContext';

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

import FindingsCard from '../components/tracking/FindingsCard';

import CostingSummary from '../components/tracking/CostingSummary';

import ProgressTimeline from '../components/tracking/ProgressTimeline';

import CancellationNote from '../components/tracking/CancellationNote';

import QueueSection from '../components/tracking/QueueSection';

import WaitingCard from '../components/tracking/WaitingCard';

import FinalCostCard from '../components/tracking/FinalCostCard';

import {
  ApproveModal,
  RejectModal,
} from '../components/tracking/EstimateModals';

import RescheduleRequestCard from '../components/tracking/RescheduleRequestCard';

import RescheduleModal from '../components/tracking/RescheduleModal';

import RescheduleConfirmationModal from '../components/tracking/RescheduleConfirmationModal';

import CancelAppointmentModal from '../components/tracking/CancelAppointmentModal';

import estimateApi from '../services/estimateApi';

import appointmentsApi from '../services/appointmentsApi';

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
     AUTHENTICATION
  ============================================================== */

  const {
    user,
  } = useAuth();

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
     IN-PROGRESS FINDINGS
  ============================================================== */

  /*
   * Findings are stored separately from work tasks on the
   * Service Tracking side.
   *
   * The customer should still be able to see those findings after
   * the appointment changes from WAITING_FOR_APPROVAL to
   * IN_PROGRESS.
   *
   * We therefore keep a dedicated customer-facing findings state.
   */
  const [
    inProgressFindings,
    setInProgressFindings,
  ] = useState(
    [],
  );

  const [
    findingsLoading,
    setFindingsLoading,
  ] = useState(
    false,
  );

  const [
    findingsError,
    setFindingsError,
  ] = useState(
    null,
  );

  /* ==============================================================
     FINDINGS HELPERS
  ============================================================== */

  /**
   * Normalize possible estimate response shapes.
   *
   * Depending on the API wrapper, the response can be:
   *
   * {
   *   data: [...]
   * }
   *
   * or:
   *
   * {
   *   data: {...}
   * }
   *
   * or directly:
   *
   * [...]
   */
  const normalizeEstimateList =
    useCallback(
      (
        response,
      ) => {
        const data =
          response?.data ??
          response;

        if (
          Array.isArray(
            data,
          )
        ) {
          return data;
        }

        if (
          data &&
          typeof data ===
            'object'
        ) {
          return [
            data,
          ];
        }

        return [];
      },
      [],
    );

  /**
   * Extract findings from a fully populated estimate response.
   *
   * The mobile estimate breakdown already uses:
   *
   * estimate.findings
   *
   * so this keeps the customer tracking display on the same
   * estimate data contract.
   */
  const extractEstimateFindings =
    useCallback(
      (
        response,
      ) => {
        const data =
          response?.data ??
          response;

        if (
          Array.isArray(
            data?.findings,
          )
        ) {
          return data.findings;
        }

        return [];
      },
      [],
    );

  /**
   * Load the findings associated with the approved estimate.
   *
   * This is intentionally restricted to IN_PROGRESS because that
   * is the customer-facing state requested for live repair work.
   *
   * Strategy:
   *
   * 1. Use the currently loaded estimate if it already contains
   *    findings.
   *
   * 2. Otherwise retrieve the estimate belonging to the
   *    appointment.
   *
   * 3. Fetch full estimate details when only a summary/list item
   *    was returned.
   */
  const loadInProgressFindings =
    useCallback(
      async () => {
        if (
          !appointmentId ||
          appointment?.status !==
            'IN_PROGRESS'
        ) {
          setInProgressFindings(
            [],
          );

          setFindingsError(
            null,
          );

          setFindingsLoading(
            false,
          );

          return;
        }

        setFindingsLoading(
          true,
        );

        setFindingsError(
          null,
        );

        try {
          /*
           * ------------------------------------------------------
           * 1. Use already-loaded estimate details when possible.
           * ------------------------------------------------------
           */

          const currentFindings =
            extractEstimateFindings(
              estimate,
            );

          if (
            currentFindings.length >
            0
          ) {
            setInProgressFindings(
              currentFindings,
            );

            return;
          }

          /*
           * ------------------------------------------------------
           * 2. Find the estimate belonging to this appointment.
           * ------------------------------------------------------
           */

          const listResponse =
            await estimateApi.getByAppointment(
              appointmentId,
            );

          if (
            listResponse?.error
          ) {
            throw new Error(
              listResponse.errorMessage ||
                'Unable to load service findings.',
            );
          }

          const estimateList =
            normalizeEstimateList(
              listResponse,
            );

          if (
            estimateList.length ===
            0
          ) {
            setInProgressFindings(
              [],
            );

            return;
          }

          /*
           * Prefer the approved estimate when the API exposes
           * multiple estimate records.
           */
          const selectedEstimate =
            estimateList.find(
              (
                item,
              ) =>
                [
                  'APPROVED',
                  'WAITING_FOR_APPROVAL',
                  'OFFICIAL',
                ].includes(
                  String(
                    item?.status ||
                      '',
                  ).toUpperCase(),
                ),
            ) ||
            estimateList[0];

          /*
           * ------------------------------------------------------
           * 3. Fetch full estimate details when possible.
           * ------------------------------------------------------
           */

          let detail =
            selectedEstimate;

          if (
            selectedEstimate?.id
          ) {
            try {
              const detailResponse =
                await estimateApi.get(
                  selectedEstimate.id,
                );

              if (
                !detailResponse?.error
              ) {
                detail =
                  detailResponse?.data ??
                  detailResponse ??
                  selectedEstimate;
              }
            } catch (
              detailError
            ) {
              /*
               * A summary estimate can still contain findings,
               * so do not fail the entire screen if the second
               * request is unavailable.
               */
              console.warn(
                '[TrackingScreen] Full estimate detail request failed:',
                detailError,
              );
            }
          }

          const findings =
            extractEstimateFindings(
              detail,
            );

          setInProgressFindings(
            findings,
          );
        } catch (
          error
        ) {
          console.error(
            '[TrackingScreen] Failed to load in-progress findings:',
            error,
          );

          setInProgressFindings(
            [],
          );

          setFindingsError(
            error?.message ||
              'Unable to load service findings.',
          );
        } finally {
          setFindingsLoading(
            false,
          );
        }
      },
      [
        appointmentId,
        appointment?.status,
        estimate,
        extractEstimateFindings,
        normalizeEstimateList,
      ],
    );

  /* ==============================================================
     LOAD FINDINGS WHEN IN PROGRESS
  ============================================================== */

  useEffect(
    () => {
      if (
        appointment?.status ===
        'IN_PROGRESS'
      ) {
        void loadInProgressFindings();

        return;
      }

      setInProgressFindings(
        [],
      );

      setFindingsError(
        null,
      );

      setFindingsLoading(
        false,
      );
    },
    [
      appointment?.status,
      loadInProgressFindings,
    ],
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

  const [
    findingToggleLoadingId,
    setFindingToggleLoadingId,
  ] = useState(null);

  const [
    findingInclusionOverrides,
    setFindingInclusionOverrides,
  ] = useState({});

  /* ==============================================================
     RESET FINDING OVERRIDES WHEN THE SERVER ESTIMATE CHANGES
  ============================================================== */

  useEffect(() => {
    setFindingInclusionOverrides({});
  }, [estimate?.id, estimate?.updatedAt]);

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

  /* ==============================================================
     CANCEL APPOINTMENT
  ============================================================== */

  const [
    cancelModalVisible,
    setCancelModalVisible,
  ] = useState(
    false,
  );

  const [
    cancelLoading,
    setCancelLoading,
  ] = useState(
    false,
  );

  /* ==============================================================
     PREVIOUS RESCHEDULE SCHEDULE
  ============================================================== */

  const previousScheduleRef =
    useRef(
      null,
    );

  const lastAppointmentIdRef =
    useRef(
      null,
    );

  const lastKnownDateRef =
    useRef(
      null,
    );

  const lastKnownTimeRef =
    useRef(
      null,
    );

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

        await refreshAll();

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

  const isUnderInspection =
    appointment?.status ===
    'UNDER_INSPECTION';

  const isWaitingForApproval =
    appointment?.status ===
    'WAITING_FOR_APPROVAL';

  const isInProgress =
    appointment?.status ===
    'IN_PROGRESS';

  const isCompleted =
    appointment?.status ===
    'COMPLETED';

  const isCancelled =
    appointment?.status ===
    'CANCELLED';

  const isPending =
    appointment?.status ===
    'PENDING';

  /* ==============================================================
     TASK COMPLETION
  ============================================================== */

  /*
   * A task list is considered complete only when:
   *
   * - At least one task exists
   * - Every task has the DONE status
   *
   * This is used only for determining when the final estimate
   * waiting card should appear during UNDER_INSPECTION.
   */
  const allTasksDone =
    tasks.length > 0 &&
    tasks.every(
      (task) =>
        task?.status === 'DONE',
    );

  /*
   * UNDER_INSPECTION WAITING STATE
   *
   * IMPORTANT:
   * We intentionally DO NOT show a waiting card while tasks are
   * still being completed.
   *
   * The card appears only after:
   *
   * UNDER_INSPECTION
   * + all tasks are DONE
   * + no estimate exists yet
   *
   * This tells the customer to wait for the estimate costing
   * after the inspection has finished.
   */
  const showWaitingForEstimate =
    isUnderInspection &&
    allTasksDone &&
    !estimate;

  /*
   * COMPLETED WAITING STATE
   *
   * The appointment is now completed. The previous version showed
   * the final-cost waiting card while IN_PROGRESS. That behavior is
   * intentionally removed.
   *
   * The final-cost waiting card now belongs to COMPLETED only:
   *
   * COMPLETED
   * + no Final Cost yet
   *
   * This gives the customer a clear waiting state while the final
   * cost is still being prepared/loaded.
   */
  const showWaitingForFinalCosting =
    isCompleted &&
    !finalBill;

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
     CAN CANCEL

     Customer cancellation is intentionally limited to:

       PENDING
       CONFIRMED

     It is NOT exposed during inspection, estimate approval,
     work in progress, completed, or already cancelled states.
  ============================================================== */

  const canCancelAppointment =
    appointment &&
    (
      appointment.status ===
        'PENDING' ||
      appointment.status ===
        'CONFIRMED'
    );

  /* ==============================================================
     OPEN CANCEL MODAL
  ============================================================== */

  const openCancelModal =
    useCallback(() => {
      if (
        !appointment ||
        !canCancelAppointment ||
        cancelLoading
      ) {
        return;
      }

      setCancelModalVisible(
        true,
      );
    }, [
      appointment,
      canCancelAppointment,
      cancelLoading,
    ]);

  /* ==============================================================
     CONFIRM CANCELLATION
  ============================================================== */

  const handleCancelAppointment =
    useCallback(
      async (
        reason,
      ) => {
        if (
          cancelLoading ||
          !appointment?.id
        ) {
          return;
        }

        const normalizedReason =
          String(
            reason ||
              '',
          ).trim();

        if (
          normalizedReason.length <
          3
        ) {
          Alert.alert(
            'Reason Required',
            'Please provide a cancellation reason.',
          );

          return;
        }

        if (
          !user?.id
        ) {
          Alert.alert(
            'Authentication Required',
            'Your customer account could not be verified. Please sign in again and try again.',
          );

          return;
        }

        setCancelLoading(
          true,
        );

        try {
          const response =
            await appointmentsApi.cancel(
              appointment.id,
              normalizedReason,
              user.id,
            );

          if (
            response?.error
          ) {
            throw new Error(
              response.errorMessage ||
                'Failed to cancel appointment.',
            );
          }

          /*
           * Close the confirmation modal.
           */
          setCancelModalVisible(
            false,
          );

          /*
           * Immediately fetch the latest appointment.
           *
           * Supabase realtime will also deliver the appointment
           * UPDATE to useTrackingData.
           */
          await refreshAll();

          /*
           * Let the customer know the operation succeeded.
           */
          Alert.alert(
            'Appointment Cancelled',
            'Your appointment has been cancelled successfully.',
          );
        } catch (
          error
        ) {
          console.error(
            '[TrackingScreen] Failed to cancel appointment:',
            error,
          );

          Alert.alert(
            'Unable to Cancel',
            error?.message ||
              'Something went wrong while cancelling your appointment.',
          );
        } finally {
          setCancelLoading(
            false,
          );
        }
      },
      [
        cancelLoading,
        appointment?.id,
        user?.id,
        refreshAll,
      ],
    );

  /* ==============================================================
     FINDING SELECTION / DISPLAY ESTIMATE
  ============================================================== */

  const rawEstimateFindings = useMemo(
    () =>
      Array.isArray(estimate?.findings)
        ? estimate.findings
        : [],
    [estimate?.findings],
  );

  const effectiveFindings = useMemo(
    () =>
      rawEstimateFindings.map((finding) => ({
        ...finding,
        included:
          Object.prototype.hasOwnProperty.call(
            findingInclusionOverrides,
            finding.id,
          )
            ? findingInclusionOverrides[finding.id]
            : finding?.included !== false,
      })),
    [rawEstimateFindings, findingInclusionOverrides],
  );

  const effectiveFindingsSubtotal = useMemo(
    () =>
      effectiveFindings
        .filter((finding) => finding.included !== false)
        .reduce((sum, finding) => {
          const explicit = Number(finding?.partsSubtotal);
          if (Number.isFinite(explicit)) {
            return sum + explicit;
          }

          const parts = Array.isArray(finding?.parts)
            ? finding.parts
            : [];

          return (
            sum +
            parts.reduce(
              (partSum, part) =>
                partSum +
                Math.max(1, Number(part?.quantity) || 1) *
                  Math.max(0, Number(part?.priceAtTime ?? part?.price) || 0),
              0,
            )
          );
        }, 0),
    [effectiveFindings],
  );

  const displayEstimate = useMemo(() => {
    if (!estimate) {
      return null;
    }

    const serviceSubtotal = Number(estimate.serviceSubtotal) || 0;
    const feesTotal = Number(estimate.feesTotal) || 0;
    const discountTotal = Number(estimate.discountTotal) || 0;
    const grandTotal =
      serviceSubtotal +
      effectiveFindingsSubtotal +
      feesTotal -
      discountTotal;

    return {
      ...estimate,
      findings: effectiveFindings,
      findingsSubtotal: grandTotal === Number(estimate.grandTotal)
        ? estimate.findingsSubtotal
        : effectiveFindingsSubtotal.toFixed(2),
      grandTotal: grandTotal.toFixed(2),
    };
  }, [
    estimate,
    effectiveFindings,
    effectiveFindingsSubtotal,
  ]);

  const excludedFindingIds = useMemo(
    () =>
      effectiveFindings
        .filter((finding) => finding.included === false)
        .map((finding) => finding.id)
        .filter(Boolean),
    [effectiveFindings],
  );

  const selectedFindingIds = useMemo(
    () =>
      effectiveFindings
        .filter((finding) => finding.included !== false)
        .map((finding) => finding.id)
        .filter(Boolean),
    [effectiveFindings],
  );

  const servicePrice = Number(estimate?.serviceSubtotal) || 0;
  const partsTotal = effectiveFindingsSubtotal;
  const laborTotal = Number(estimate?.feesTotal) || 0;
  const discountTotal = Number(estimate?.discountTotal) || 0;
  const grandTotal = Number(displayEstimate?.grandTotal) || 0;

  /* ==============================================================
     TOGGLE FINDING
  ============================================================== */

  const handleToggleEstimateFinding = useCallback(
    async (findingId, included) => {
      if (
        !estimate?.id ||
        !findingId ||
        appointment?.status !== 'WAITING_FOR_APPROVAL' ||
        findingToggleLoadingId
      ) {
        return;
      }

      setFindingInclusionOverrides((current) => ({
        ...current,
        [findingId]: Boolean(included),
      }));

      setFindingToggleLoadingId(findingId);

      try {
        const response = await estimateApi.toggleFinding(
          estimate.id,
          findingId,
          Boolean(included),
        );

        if (response?.error) {
          throw new Error(
            response.errorMessage ||
              'Unable to update finding selection.',
          );
        }

        await refreshAll();
      } catch (error) {
        console.error(
          '[TrackingScreen] Failed to toggle estimate finding:',
          error,
        );

        setFindingInclusionOverrides((current) => {
          const next = { ...current };
          delete next[findingId];
          return next;
        });

        Alert.alert(
          'Unable to Update Estimate',
          error?.message ||
            'The finding selection could not be saved.',
        );
      } finally {
        setFindingToggleLoadingId(null);
      }
    },
    [
      appointment?.status,
      estimate?.id,
      findingToggleLoadingId,
      refreshAll,
    ],
  );

  const toggleExclude = useCallback(
    (findingId) => {
      const finding = effectiveFindings.find(
        (item) => item.id === findingId,
      );

      if (!finding) {
        return;
      }

      void handleToggleEstimateFinding(
        findingId,
        finding.included === false,
      );
    },
    [effectiveFindings, handleToggleEstimateFinding],
  );

  /* ==============================================================
     APPROVE ESTIMATE
  ============================================================== */

  const confirmApprove =
    async () => {
      if (!estimate) {
        return;
      }

      setApproveModalVisible(false);
      setActionLoading(true);

      try {
        const response = await estimateApi.approve(
          estimate.id,
          selectedFindingIds,
        );

        if (response?.error) {
          throw new Error(
            response.errorMessage ||
              'Failed to approve estimate.',
          );
        }

        Alert.alert(
          'Approved!',
          'Work is now in progress.',
        );

        setFindingInclusionOverrides({});
        await refreshAll();
      } catch (error) {
        Alert.alert(
          'Error',
          error?.response?.data?.message ||
            error?.message ||
            'Failed to approve',
        );

        await refreshAll();
      } finally {
        setActionLoading(false);
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
     REFRESH ALL TRACKING DATA
  ============================================================== */

  /**
   * Keep the existing useTrackingData refresh behavior and also
   * refresh IN_PROGRESS findings.
   *
   * Pull-to-refresh therefore updates:
   *
   * - Appointment status
   * - Tasks
   * - Estimate
   * - Final Cost
   * - In-progress findings
   */
  const handleTrackingRefresh =
    useCallback(
      async () => {
        await onRefresh();

        if (
          appointment?.status ===
          'IN_PROGRESS'
        ) {
          await loadInProgressFindings();
        }
      },
      [
        onRefresh,
        appointment?.status,
        loadInProgressFindings,
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
     PREVIOUS SCHEDULE
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
            44,
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
              handleTrackingRefresh
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
              VEHICLE
          ===================================================== */}

          <VehicleInfoCard
            appointment={
              appointment
            }
          />

          {/* ====================================================
              RESCHEDULE HISTORY
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
                actionLoading ||
                cancelLoading
              }
              activeOpacity={
                0.85
              }
              className="
                mb-3
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
              PENDING RESCHEDULE REQUEST
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
                  Reason:{' '}
                  {
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
              IN-PROGRESS FINDINGS
          ===================================================== */}

          {isInProgress && (
            <>
              {findingsLoading &&
                inProgressFindings.length ===
                  0 && (
                  <View
                    className="
                      mb-6
                      overflow-hidden
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
                        gap-3
                      "
                    >
                      <View
                        className="
                          h-10
                          w-10
                          items-center
                          justify-center
                          rounded-xl
                          bg-primary/10
                        "
                      >
                        <ActivityIndicator
                          size="small"
                          color="#C1272D"
                        />
                      </View>

                      <View
                        className="
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
                          Loading Findings
                        </Text>

                        <Text
                          className="
                            mt-1
                            text-xs
                            leading-5
                            text-muted-foreground
                          "
                        >
                          Retrieving diagnostic findings for your vehicle.
                        </Text>
                      </View>
                    </View>
                  </View>
                )}

              {findingsError &&
                inProgressFindings.length ===
                  0 &&
                !findingsLoading && (
                  <View
                    className="
                      mb-6
                      overflow-hidden
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
                        items-start
                        gap-3
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
                        <FileText
                          size={
                            19
                          }
                          color="#C1272D"
                          strokeWidth={
                            2
                          }
                        />
                      </View>

                      <View
                        className="
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
                          Findings unavailable
                        </Text>

                        <Text
                          className="
                            mt-1
                            text-xs
                            leading-5
                            text-muted-foreground
                          "
                        >
                          We could not load the diagnostic findings right now. Pull down to refresh and try again.
                        </Text>
                      </View>
                    </View>
                  </View>
                )}

              <FindingsCard
                findings={
                  inProgressFindings
                }
              />
            </>
          )}

          {/* ====================================================
              WAITING FOR ESTIMATE COSTING

              UNDER_INSPECTION ONLY.

              This card is intentionally NOT displayed while
              inspection tasks are still being completed.

              It appears only when:
                - status is UNDER_INSPECTION
                - at least one task exists
                - every task is DONE
                - estimate has not arrived yet
          ===================================================== */}

          {showWaitingForEstimate && (
            <WaitingCard
              message="Wait for Estimate Costing to show"
              description="Your vehicle inspection is complete. Please wait while the estimate costing is prepared."
            />
          )}

          {/* ====================================================
              ESTIMATE
          ===================================================== */}

          {appointment.status ===
            'WAITING_FOR_APPROVAL' &&
            estimate && (
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
                  displayEstimate
                }
                onToggleFinding={
                  handleToggleEstimateFinding
                }
                togglingFindingId={
                  findingToggleLoadingId
                }
              />
            )}

          {/* ====================================================
              WAITING FOR FINAL COSTING

              COMPLETED ONLY.

              The previous implementation displayed this waiting
              state during IN_PROGRESS. It has intentionally been
              removed from IN_PROGRESS and moved to COMPLETED.

              When the appointment is completed but the Final Cost
              is not available yet, the customer sees a loading card.
          ===================================================== */}

          {showWaitingForFinalCosting && (
            <WaitingCard
              message="Wait for Final Cost to show"
              description="Your service is complete. Please wait while the final cost is being prepared."
            />
          )}

          {/* ====================================================
              FINAL COST

              COMPLETED ONLY.

              When a Final Cost is available, show the new simple
              customer-facing cost card. Tapping it opens the
              existing invoice/payment-detail screen.
          ===================================================== */}

          {isCompleted &&
            finalBill && (
              <FinalCostCard
                finalBill={
                  finalBill
                }
              />
            )}

          {/* ====================================================
              CANCELLED NOTE
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

          {/* ====================================================
              CANCEL APPOINTMENT

              IMPORTANT:
              This is intentionally placed at the END of the
              Tracking screen.

              Only PENDING and CONFIRMED can display it.
          ===================================================== */}

          {canCancelAppointment && (
            <View
              className="
                mt-6
                border-t
                border-border
                pt-5
              "
            >
              <TouchableOpacity
                type="button"
                onPress={
                  openCancelModal
                }
                disabled={
                  cancelLoading ||
                  actionLoading
                }
                activeOpacity={
                  0.85
                }
                className="
                  min-h-[48px]
                  w-full
                  flex-row
                  items-center
                  justify-center
                  rounded-xl
                  border
                  border-border
                  bg-secondary
                  px-4
                  py-3
                "
              >
                {cancelLoading ? (
                  <ActivityIndicator
                    size="small"
                    color="#8E8E93"
                  />
                ) : (
                  <>
                    <XCircle
                      size={
                        18
                      }
                      color="#8E8E93"
                      strokeWidth={
                        2
                      }
                    />

                    <Text
                      className="
                        ml-2
                        text-sm
                        font-semibold
                        text-secondary-foreground
                      "
                    >
                      Cancel Appointment
                    </Text>
                  </>
                )}
              </TouchableOpacity>

              <Text
                className="
                  mt-2
                  text-center
                  text-[10px]
                  leading-4
                  text-muted-foreground
                "
              >
                Cancellation cannot be undone.
              </Text>
            </View>
          )}
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
        selectedFindings={
          selectedFindingIds
            .map((findingId) =>
              effectiveFindings.find(
                (finding) => finding.id === findingId,
              ),
            )
            .filter(Boolean)
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
          RESCHEDULE RESULT
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

      {/* ==========================================================
          CANCEL APPOINTMENT CONFIRMATION
      =========================================================== */}

      <CancelAppointmentModal
        visible={
          cancelModalVisible
        }
        appointment={
          appointment
        }
        loading={
          cancelLoading
        }
        onCancel={() => {
          if (
            cancelLoading
          ) {
            return;
          }

          setCancelModalVisible(
            false,
          );
        }}
        onConfirm={
          handleCancelAppointment
        }
      />
    </SafeAreaView>
  );
}
