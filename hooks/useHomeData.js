import { useState, useCallback } from 'react';
import { useFocusEffect } from 'expo-router';
import { useAuth } from '../context/AuthContext';
import appointmentsApi from '../services/appointmentsApi';
import serviceTypesApi from '../services/serviceTypesApi';
import vehiclesApi from '../services/vehiclesApi';

const ACTIVE_STATUSES = new Set([
  'PENDING',
  'CONFIRMED',
  'WAITING_FOR_APPROVAL',
  'UNDER_INSPECTION',
  'IN_PROGRESS',
]);

function normalizeDateStr(value) {
  if (!value) return '';

  if (typeof value === 'string') {
    return value.split('T')[0];
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return '';
  }

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
}

function timeToMinutes(timeValue) {
  if (!timeValue) return 0;

  const [hours = 0, minutes = 0] = String(timeValue)
    .split(':')
    .map(Number);

  return hours * 60 + minutes;
}

function appointmentSortValue(appointment) {
  const date = normalizeDateStr(appointment?.appointmentDate);

  if (!date) return Number.MAX_SAFE_INTEGER;

  return `${date} ${appointment?.appointmentTime || '23:59:59'}`;
}

export function useHomeData() {
  const { user } = useAuth();

  const [allAppointments, setAllAppointments] = useState([]);

  const [groupedAppointments, setGroupedAppointments] = useState({
    confirmed: [],
    waitingForApproval: [],
    underInspection: [],
    inProgress: [],
    pending: [],
    completed: [],
    cancelled: [],
  });

  const [upcomingConfirmed, setUpcomingConfirmed] = useState(null);
  const [activeTrackingAppointment, setActiveTrackingAppointment] =
    useState(null);

  const [vehicles, setVehicles] = useState([]);
  const [trendingServices, setTrendingServices] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadTrendingServices = useCallback(async () => {
    try {
      const res = await serviceTypesApi.getTrending();
      const data = res?.data?.data || res?.data || res || [];

      setTrendingServices(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Trending services error:', err);
      setTrendingServices([]);
    }
  }, []);

  const loadVehicles = useCallback(async () => {
    if (!user?.id) {
      setVehicles([]);
      return;
    }

    try {
      const res = await vehiclesApi.listByCustomer(user.id);

      const data = res?.data?.data || res?.data || res || [];

      setVehicles(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Vehicles load error:', err);
      setVehicles([]);
    }
  }, [user?.id]);

  const loadAppointments = useCallback(async () => {
    if (!user?.id) {
      setAllAppointments([]);
      setUpcomingConfirmed(null);
      setActiveTrackingAppointment(null);

      return;
    }

    try {
      const res = await appointmentsApi.list({
        customerId: user.id,
      });

      const all = Array.isArray(res?.data?.data)
        ? res.data.data
        : Array.isArray(res?.data)
          ? res.data
          : Array.isArray(res)
            ? res
            : [];

      const groups = {
        confirmed: [],
        waitingForApproval: [],
        underInspection: [],
        inProgress: [],
        pending: [],
        completed: [],
        cancelled: [],
      };

      for (const appointment of all) {
        switch (appointment?.status) {
          case 'CONFIRMED':
            groups.confirmed.push(appointment);
            break;

          case 'WAITING_FOR_APPROVAL':
            groups.waitingForApproval.push(appointment);
            break;

          case 'UNDER_INSPECTION':
            groups.underInspection.push(appointment);
            break;

          case 'IN_PROGRESS':
            groups.inProgress.push(appointment);
            break;

          case 'PENDING':
            groups.pending.push(appointment);
            break;

          case 'COMPLETED':
            groups.completed.push(appointment);
            break;

          case 'CANCELLED':
            groups.cancelled.push(appointment);
            break;

          default:
            break;
        }
      }

      Object.values(groups).forEach((group) => {
        group.sort((a, b) =>
          appointmentSortValue(a).localeCompare(
            appointmentSortValue(b)
          )
        );
      });

      /*
       * Find the actual nearest active schedule.
       *
       * PENDING / CONFIRMED:
       *   only show future appointments.
       *
       * WAITING / UNDER_INSPECTION / IN_PROGRESS:
       *   remain visible even when their scheduled time has passed
       *   because the appointment is still operationally active.
       */
      const now = new Date();

      const todayStr = normalizeDateStr(now);
      const currentMinutes =
        now.getHours() * 60 + now.getMinutes();

      const activeAppointments = all
        .filter((appointment) =>
          ACTIVE_STATUSES.has(appointment?.status)
        )
        .filter((appointment) => {
          const appointmentDate = normalizeDateStr(
            appointment?.appointmentDate
          );

          if (!appointmentDate) return false;

          if (
            appointment?.status === 'WAITING_FOR_APPROVAL' ||
            appointment?.status === 'UNDER_INSPECTION' ||
            appointment?.status === 'IN_PROGRESS'
          ) {
            return appointmentDate >= todayStr;
          }

          if (appointmentDate > todayStr) {
            return true;
          }

          if (appointmentDate < todayStr) {
            return false;
          }

          const appointmentMinutes = timeToMinutes(
            appointment?.appointmentTime
          );

          return appointmentMinutes >= currentMinutes;
        })
        .sort((a, b) =>
          appointmentSortValue(a).localeCompare(
            appointmentSortValue(b)
          )
        );

      const nearestActive = activeAppointments[0] || null;

      /*
       * Keep the existing variable name so the Home UI stays compatible.
       * It now represents the nearest useful schedule rather than only
       * CONFIRMED appointments.
       */
      setUpcomingConfirmed(nearestActive);

      /*
       * Tracking CTA:
       * Prefer an appointment currently in service, then confirmed,
       * then any other active appointment.
       */
      const trackingAppointment =
        all
          .filter((appointment) =>
            [
              'CONFIRMED',
              'WAITING_FOR_APPROVAL',
              'UNDER_INSPECTION',
              'IN_PROGRESS',
            ].includes(appointment?.status)
          )
          .sort((a, b) => {
            const statusPriority = {
              IN_PROGRESS: 1,
              UNDER_INSPECTION: 2,
              WAITING_FOR_APPROVAL: 3,
              CONFIRMED: 4,
            };

            const priorityA = statusPriority[a?.status] || 99;
            const priorityB = statusPriority[b?.status] || 99;

            if (priorityA !== priorityB) {
              return priorityA - priorityB;
            }

            return appointmentSortValue(a).localeCompare(
              appointmentSortValue(b)
            );
          })[0] || null;

      setActiveTrackingAppointment(trackingAppointment);

      /*
       * Limit only the sections that previously had a limit.
       * Waiting-for-approval remains unrestricted.
       */
      groups.underInspection = groups.underInspection.slice(0, 4);
      groups.inProgress = groups.inProgress.slice(0, 4);
      groups.pending = groups.pending.slice(0, 4);
      groups.completed = groups.completed.slice(0, 4);
      groups.cancelled = groups.cancelled.slice(0, 4);

      setGroupedAppointments(groups);
      setAllAppointments(all);
    } catch (err) {
      console.error('Appointments load error:', err);

      setAllAppointments([]);
      setUpcomingConfirmed(null);
      setActiveTrackingAppointment(null);
    }
  }, [user?.id]);

  const loadAll = useCallback(async () => {
    if (!user?.id) {
      setLoading(false);
      return;
    }

    setLoading(true);

    try {
      await Promise.all([
        loadAppointments(),
        loadTrendingServices(),
        loadVehicles(),
      ]);
    } finally {
      setLoading(false);
    }
  }, [
    user?.id,
    loadAppointments,
    loadTrendingServices,
    loadVehicles,
  ]);

  useFocusEffect(
    useCallback(() => {
      let active = true;

      const run = async () => {
        if (!active) return;
        await loadAll();
      };

      run();

      return () => {
        active = false;
      };
    }, [loadAll])
  );

  return {
    allAppointments,
    groupedAppointments,
    upcomingConfirmed,
    activeTrackingAppointment,
    vehicles,
    trendingServices,
    loading,
    refetch: loadAll,
  };
}