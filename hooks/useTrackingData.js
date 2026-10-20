import { useState, useCallback, useMemo } from 'react';
import { useFocusEffect } from 'expo-router';
import { useAuth } from '../context/AuthContext';
import appointmentsApi from '../services/appointmentsApi';
import tasksApi from '../services/tasksApi';
import estimateApi from '../services/estimateApi';
import finalBillsApi from '../services/finalBillsApi';
import serviceTypesApi from '../services/serviceTypesApi';
import { useRealtimeTable } from '../connections/useRealtimeTable';

/* ================================================================
   SERVICE DATA HELPERS

   The estimate and final-bill API responses contain a stored
   serviceSubtotal, but they don't necessarily include the booked
   service names and prices. Those details belong to the appointment.

   Reuse the appointment's services for DISPLAY only. The saved
   estimate/final-bill subtotals remain the source of truth for totals.
================================================================ */

function getResponseData(response) {
  return response?.data ?? response;
}

function getAppointmentServices(appointment) {
  return Array.isArray(appointment?.services)
    ? appointment.services
    : [];
}

function hasNamedServices(services) {
  return (
    Array.isArray(services) &&
    services.some(
      (service) =>
        service &&
        typeof service === 'object' &&
        Boolean(service.name || service.serviceName || service.title),
    )
  );
}

function selectServices(record, appointment) {
  const candidates = [
    record?.services,
    record?.appointment?.services,
    getAppointmentServices(appointment),
  ];

  return (
    candidates.find(hasNamedServices) ||
    candidates.find((items) => Array.isArray(items) && items.length > 0) ||
    []
  );
}

async function resolveServiceIds(appointment) {
  const services = getAppointmentServices(appointment);
  if (services.length === 0 || hasNamedServices(services)) {
    return appointment;
  }

  // Legacy appointment responses can contain only service UUIDs.
  // Look up their catalog details so the customer can see real names.
  const detailed = await Promise.all(
    services.map(async (service) => {
      const id = typeof service === 'string' ? service : service?.id;
      if (!id) return service;
      if (service && typeof service === 'object' && service.name) {
        return service;
      }

      try {
        const response = await serviceTypesApi.get(id);
        const data = getResponseData(response);
        if (!response?.error && data?.name) {
          return { ...(typeof service === 'object' ? service : {}), ...data };
        }
      } catch (error) {
        console.warn('[useTrackingData] Unable to resolve service:', id, error);
      }

      return service;
    }),
  );

  return { ...appointment, services: detailed };
}

/* ================================================================
   TRACKING DATA HOOK
================================================================ */

export function useTrackingData(appointmentId) {
  const { user } = useAuth();
  const normalizedAppointmentId = Array.isArray(appointmentId)
    ? appointmentId[0]
    : appointmentId;

  const [appointment, setAppointment] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [estimate, setEstimate] = useState(null);
  const [finalBill, setFinalBill] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  /* ==============================================================
     LOAD COMPLETE APPOINTMENT AND BOOKED SERVICES
  ============================================================== */

  const fetchAppointment = useCallback(async () => {
    if (!normalizedAppointmentId || !user?.id) return null;

    try {
      // Keep the original customer-scoped appointment lookup.
      const listResponse = await appointmentsApi.list({ customerId: user.id });
      const listed = Array.isArray(listResponse?.data) ? listResponse.data : [];
      const fromList = listed.find(
        (item) => String(item?.id) === String(normalizedAppointmentId),
      );

      // Even if the list contains the appointment, fetch its detail:
      // the single-appointment API can provide a more complete service list.
      let fromDetail = null;
      try {
        const detailResponse = await appointmentsApi.get(normalizedAppointmentId);
        if (!detailResponse?.error) {
          const data = getResponseData(detailResponse);
          fromDetail = Array.isArray(data) ? data[0] : data;
        }
      } catch (error) {
        console.warn('[useTrackingData] Full appointment lookup failed:', error);
      }

      if (!fromList && !fromDetail) {
        setAppointment(null);
        return null;
      }

      const combined = {
        ...(fromList || {}),
        ...(fromDetail || {}),
        services: selectServices(fromDetail, fromList),
      };

      const hydrated = await resolveServiceIds(combined);
      setAppointment(hydrated);
      return hydrated;
    } catch (error) {
      console.error('[useTrackingData] Failed to load appointment:', error);
      return null;
    }
  }, [normalizedAppointmentId, user?.id]);

  /* ==============================================================
     TASKS
  ============================================================== */

  const fetchTasks = useCallback(async (status) => {
    if (!normalizedAppointmentId) return;

    try {
      const res =
        status === 'UNDER_INSPECTION' || status === 'WAITING_FOR_APPROVAL'
          ? await tasksApi.getInspectionTasks(normalizedAppointmentId)
          : await tasksApi.getWorkTasks(normalizedAppointmentId);

      setTasks(Array.isArray(res?.data) ? res.data : []);
    } catch (error) {
      console.error('[useTrackingData] Failed to load tasks:', error);
    }
  }, [normalizedAppointmentId]);

  /* ==============================================================
     FULL ESTIMATE
  ============================================================== */

  const fetchEstimate = useCallback(async () => {
    if (!normalizedAppointmentId) return;

    try {
      const response = await estimateApi.getByAppointment(normalizedAppointmentId);
      if (response?.error) {
        throw new Error(response.errorMessage || 'Unable to load estimate.');
      }

      const estimates = Array.isArray(response?.data) ? response.data : [];
      const selected =
        estimates.find(
          (item) => String(item?.status || '').toUpperCase() === 'WAITING_FOR_APPROVAL',
        ) ||
        estimates.find(
          (item) => String(item?.status || '').toUpperCase() === 'APPROVED',
        ) ||
        estimates[0];

      if (!selected?.id) {
        setEstimate(null);
        return;
      }

      const detailResponse = await estimateApi.get(selected.id);
      if (detailResponse?.error) {
        throw new Error(detailResponse.errorMessage || 'Unable to load estimate details.');
      }

      setEstimate(getResponseData(detailResponse) || selected);
    } catch (error) {
      console.error('[useTrackingData] Failed to load estimate:', error);
      setEstimate(null);
    }
  }, [normalizedAppointmentId]);

  /* ==============================================================
     FINAL BILL

     The list endpoint already supplies serviceSubtotal. Retrieve the
     full bill when possible without losing the existing list fallback.
  ============================================================== */

  const fetchFinalBill = useCallback(async () => {
    if (!normalizedAppointmentId) return;

    try {
      const response = await finalBillsApi.getByAppointment(normalizedAppointmentId);
      if (response?.error) {
        throw new Error(response.errorMessage || 'Unable to load final cost.');
      }

      const bills = Array.isArray(response?.data) ? response.data : [];
      const selected = bills.length > 0 ? bills[0] : null;

      if (!selected?.id) {
        setFinalBill(null);
        return;
      }

      try {
        const detailResponse = await finalBillsApi.getById(selected.id);
        if (!detailResponse?.error) {
          const detail = getResponseData(detailResponse);
          setFinalBill({ ...selected, ...(detail || {}) });
          return;
        }
      } catch (error) {
        console.warn('[useTrackingData] Full final-bill lookup failed:', error);
      }

      setFinalBill(selected);
    } catch (error) {
      console.error('[useTrackingData] Failed to load final bill:', error);
      setFinalBill(null);
    }
  }, [normalizedAppointmentId]);

  /* ==============================================================
     REFRESH
  ============================================================== */

  const refreshAll = useCallback(async () => {
    const currentAppointment = await fetchAppointment();
    if (!currentAppointment) return;

    const { status } = currentAppointment;

    if (status === 'UNDER_INSPECTION' || status === 'WAITING_FOR_APPROVAL') {
      await Promise.all([fetchTasks(status), fetchEstimate()]);
    } else if (status === 'IN_PROGRESS' || status === 'COMPLETED') {
      await Promise.all([fetchTasks(status), fetchFinalBill()]);
    }
  }, [fetchAppointment, fetchTasks, fetchEstimate, fetchFinalBill]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await refreshAll();
    } finally {
      setRefreshing(false);
    }
  }, [refreshAll]);

  /* ==============================================================
     REALTIME
  ============================================================== */

  useRealtimeTable(
    'appointments',
    `id=eq.${normalizedAppointmentId}`,
    refreshAll,
  );

  useRealtimeTable(
    'inspection_tasks',
    `appointment_id=eq.${normalizedAppointmentId}`,
    refreshAll,
  );

  useRealtimeTable(
    'work_tasks',
    `appointment_id=eq.${normalizedAppointmentId}`,
    refreshAll,
  );

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      refreshAll().finally(() => setLoading(false));
    }, [refreshAll]),
  );

  /* ==============================================================
     PROVIDE BOOKED SERVICES TO ESTIMATE AND FINAL COST

     Backend financial subtotals are deliberately left unchanged.
     No separate TrackingScreen modification is needed.
  ============================================================== */

  const displayEstimate = useMemo(() => {
    if (!estimate) return null;
    return {
      ...estimate,
      services: selectServices(estimate, appointment),
    };
  }, [estimate, appointment]);

  const displayFinalBill = useMemo(() => {
    if (!finalBill) return null;
    return {
      ...finalBill,
      services: selectServices(finalBill, appointment),
    };
  }, [finalBill, appointment]);

  return {
    appointment,
    tasks,
    estimate: displayEstimate,
    finalBill: displayFinalBill,
    loading,
    refreshing,
    onRefresh,
    refreshAll,
  };
}
