import {
  useCallback,
  useState,
} from 'react';

import {
  useRealtimeTable,
} from '../connections/useRealtimeTable';

import findingsApi from '../services/findingsApi';

/* ================================================================
   STATUS HELPER
================================================================ */

const FINDING_VISIBLE_STATUSES = new Set([
  'UNDER_INSPECTION',
  'WAITING_FOR_APPROVAL',
  'IN_PROGRESS',
  'COMPLETED',
]);

/* ================================================================
   HOOK
================================================================ */

export function useTrackingFindings(
  appointmentId,
  appointmentStatus
) {
  const [
    findings,
    setFindings,
  ] = useState(
    []
  );

  const [
    loading,
    setLoading,
  ] = useState(
    false
  );

  const [
    error,
    setError,
  ] = useState(
    null
  );

  /* ==============================================================
     ENABLED
  ============================================================== */

  const enabled =
    Boolean(
      appointmentId
    ) &&
    FINDING_VISIBLE_STATUSES.has(
      appointmentStatus
    );

  /* ==============================================================
     LOAD FINDINGS
  ============================================================== */

  const refreshFindings =
    useCallback(
      async () => {
        if (
          !appointmentId
        ) {
          setFindings(
            []
          );

          return;
        }

        /*
         * Findings are only relevant to the tracking flow once
         * inspection has started.
         */
        if (
          !enabled
        ) {
          setFindings(
            []
          );

          setError(
            null
          );

          return;
        }

        setLoading(
          true
        );

        setError(
          null
        );

        try {
          const result =
            await findingsApi.getByAppointment(
              appointmentId
            );

          if (
            result?.error
          ) {
            setFindings(
              []
            );

            setError(
              result.errorMessage ||
                'Unable to load findings.'
            );

            return;
          }

          const data =
            Array.isArray(
              result?.data
            )
              ? result.data
              : [];

          setFindings(
            data
          );
        } catch (
          err
        ) {
          console.error(
            '[useTrackingFindings] Failed to refresh findings:',
            err
          );

          setFindings(
            []
          );

          setError(
            err?.message ||
              'Unable to load findings.'
          );
        } finally {
          setLoading(
            false
          );
        }
      },
      [
        appointmentId,
        enabled,
      ]
    );

  /* ==============================================================
     FINDING PARENT REALTIME
     
     InspectionFindings has appointment_id, so the appointment
     filter can be applied directly.
  ============================================================== */

  useRealtimeTable(
    'inspection_findings',
    enabled &&
      appointmentId
      ? `appointment_id=eq.${appointmentId}`
      : 'appointment_id=eq.00000000-0000-0000-0000-000000000000',
    refreshFindings
  );

  /* ==============================================================
     FINDING PART REALTIME
     
     InspectionFindingParts references:
     
       inspection_finding_id
     
     rather than appointment_id.
     
     Build the filter from the findings currently displayed for
     this appointment.
  ============================================================== */

  const findingIds =
    findings
      .map(
        (
          finding
        ) =>
          finding?.id
      )
      .filter(
        (
          id
        ) =>
          typeof id ===
          'string' &&
          id.length >
            0
      );

  const findingPartsFilter =
    enabled &&
    findingIds.length >
      0
      ? `inspection_finding_id=in.(${findingIds.join(
          ','
        )})`
      : 'inspection_finding_id=eq.00000000-0000-0000-0000-000000000000';

  useRealtimeTable(
    'inspection_finding_parts',
    findingPartsFilter,
    refreshFindings
  );

  /* ==============================================================
     RETURN
  ============================================================== */

  return {
    findings,

    loading,

    error,

    refreshFindings,
  };
}