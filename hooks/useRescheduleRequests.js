import {
  useState,
  useCallback,
  useEffect,
  useRef,
} from 'react';

import {
  useRealtimeTable,
} from '../connections/useRealtimeTable';

import appointmentsApi from '../services/appointmentsApi';

/* ================================================================
   HOOK
================================================================ */

export function useRescheduleRequests(
  appointmentId,
) {
  /* ==============================================================
     STATE
  ============================================================== */

  const [
    requests,
    setRequests,
  ] = useState([]);

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    pendingRequest,
    setPendingRequest,
  ] = useState(null);

  const [
    latestDecision,
    setLatestDecision,
  ] = useState(null);

  /* ==============================================================
     REALTIME TRACKING
  ============================================================== */

  const previousStatusRef =
    useRef({});

  const initializedRef =
    useRef(false);

  const processedDecisionRef =
    useRef({});

  /* ==============================================================
     LOAD REQUESTS
  ============================================================== */

  const loadRequests =
    useCallback(
      async ({
        fromRealtime = false,
      } = {}) => {
        if (
          !appointmentId
        ) {
          setRequests(
            [],
          );

          setPendingRequest(
            null,
          );

          setLatestDecision(
            null,
          );

          setLoading(
            false,
          );

          return;
        }

        /*
         * Realtime refreshes remain silent.
         */
        if (
          !fromRealtime
        ) {
          setLoading(
            true,
          );
        }

        try {
          const response =
            await appointmentsApi.getRescheduleRequests(
              appointmentId,
            );

          if (
            response?.error
          ) {
            throw new Error(
              response.errorMessage ||
                'Failed to load reschedule requests.',
            );
          }

          const incoming =
            Array.isArray(
              response?.data,
            )
              ? response.data
              : [];

          /* ======================================================
             SORT
          ======================================================= */

          const sortedRequests =
            [
              ...incoming,
            ].sort(
              (
                left,
                right,
              ) => {
                const leftCreated =
                  left?.createdAt
                    ? new Date(
                        left.createdAt,
                      ).getTime()
                    : 0;

                const rightCreated =
                  right?.createdAt
                    ? new Date(
                        right.createdAt,
                      ).getTime()
                    : 0;

                return (
                  rightCreated -
                  leftCreated
                );
              },
            );

          setRequests(
            sortedRequests,
          );

          /* ======================================================
             PENDING
          ======================================================= */

          const pending =
            sortedRequests.find(
              (
                request,
              ) =>
                request?.status ===
                'PENDING',
            ) || null;

          setPendingRequest(
            pending,
          );

          /* ======================================================
             DECISION DETECTION
          ======================================================= */

          const nextStatusMap =
            {};

          sortedRequests.forEach(
            (
              request,
            ) => {
              if (
                !request?.id
              ) {
                return;
              }

              const currentStatus =
                String(
                  request.status ||
                    '',
                ).toUpperCase();

              nextStatusMap[
                request.id
              ] =
                currentStatus;

              const previousStatus =
                previousStatusRef
                  .current[
                  request.id
                ];

              const changedFromPending =
                initializedRef.current &&
                previousStatus ===
                  'PENDING' &&
                (
                  currentStatus ===
                    'APPROVED' ||
                  currentStatus ===
                    'REJECTED'
                );

              if (
                !changedFromPending
              ) {
                return;
              }

              const decisionKey =
                `${request.id}:${currentStatus}`;

              /*
               * Prevent duplicate realtime events from opening
               * multiple result modals.
               */
              if (
                processedDecisionRef
                  .current[
                  decisionKey
                ]
              ) {
                return;
              }

              processedDecisionRef
                .current[
                decisionKey
              ] = true;

              setLatestDecision({
                request,

                status:
                  currentStatus,
              });
            },
          );

          previousStatusRef.current =
            nextStatusMap;

          /*
           * Initial baseline is now established.
           */
          initializedRef.current =
            true;
        } catch (
          error
        ) {
          console.error(
            '[useRescheduleRequests] Failed to load:',
            error,
          );

          /*
           * During a silent realtime refresh, preserve the data
           * already visible to the user.
           */
          if (
            !fromRealtime
          ) {
            setRequests(
              [],
            );

            setPendingRequest(
              null,
            );
          }
        } finally {
          if (
            !fromRealtime
          ) {
            setLoading(
              false,
            );
          }
        }
      },
      [
        appointmentId,
      ],
    );

  /* ==============================================================
     INITIAL LOAD
  ============================================================== */

  useEffect(() => {
    previousStatusRef.current =
      {};

    processedDecisionRef.current =
      {};

    initializedRef.current =
      false;

    setRequests(
      [],
    );

    setPendingRequest(
      null,
    );

    setLatestDecision(
      null,
    );

    void loadRequests();
  }, [
    appointmentId,
    loadRequests,
  ]);

  /* ==============================================================
     REALTIME HANDLER
  ============================================================== */

  const handleRealtimeChange =
    useCallback(
      (
        payload,
      ) => {
        console.log(
          '🔄 [Reschedule Requests] Database change detected:',
          payload?.eventType,
        );

        /*
         * Fresh API read after every INSERT / UPDATE / DELETE.
         *
         * This is intentionally not based on payload.new so the
         * server remains the source of truth.
         */
        void loadRequests({
          fromRealtime:
            true,
        });
      },
      [
        loadRequests,
      ],
    );

  /* ==============================================================
     REALTIME SUBSCRIPTION
  ============================================================== */

  useRealtimeTable(
    'appointment_reschedule_requests',
    appointmentId
      ? `appointment_id=eq.${appointmentId}`
      : undefined,
    handleRealtimeChange,
  );

  /* ==============================================================
     APPROVE
  ============================================================== */

  const approveRequest =
    useCallback(
      async (
        requestId,
      ) => {
        if (
          !requestId
        ) {
          return {
            success:
              false,

            error:
              'Missing reschedule request ID.',
          };
        }

        try {
          const response =
            await appointmentsApi.approveRescheduleRequest(
              requestId,
            );

          if (
            response?.error
          ) {
            throw new Error(
              response.errorMessage ||
                'Failed to approve reschedule request.',
            );
          }

          await loadRequests();

          return {
            success:
              true,
          };
        } catch (
          error
        ) {
          console.error(
            '[useRescheduleRequests] Approve error:',
            error,
          );

          return {
            success:
              false,

            error:
              error?.message ||
              'Failed to approve reschedule request.',
          };
        }
      },
      [
        loadRequests,
      ],
    );

  /* ==============================================================
     REJECT
  ============================================================== */

  const rejectRequest =
    useCallback(
      async (
        requestId,
        rejectionReason,
      ) => {
        const normalizedReason =
          String(
            rejectionReason ||
              '',
          ).trim();

        if (
          !normalizedReason
        ) {
          return {
            success:
              false,

            error:
              'A rejection reason is required.',
          };
        }

        if (
          !requestId
        ) {
          return {
            success:
              false,

            error:
              'Missing reschedule request ID.',
          };
        }

        try {
          const response =
            await appointmentsApi.rejectRescheduleRequest(
              requestId,
              normalizedReason,
            );

          if (
            response?.error
          ) {
            throw new Error(
              response.errorMessage ||
                'Failed to reject reschedule request.',
            );
          }

          await loadRequests();

          return {
            success:
              true,
          };
        } catch (
          error
        ) {
          console.error(
            '[useRescheduleRequests] Reject error:',
            error,
          );

          return {
            success:
              false,

            error:
              error?.message ||
              'Failed to reject reschedule request.',
          };
        }
      },
      [
        loadRequests,
      ],
    );

  /* ==============================================================
     CLEAR LATEST DECISION
  ============================================================== */

  const clearLatestDecision =
    useCallback(() => {
      setLatestDecision(
        null,
      );
    }, []);

  /* ==============================================================
     RETURN
  ============================================================== */

  return {
    requests,

    loading,

    loadRequests,

    approveRequest,

    rejectRequest,

    pendingRequest,

    latestDecision,

    clearLatestDecision,
  };
}