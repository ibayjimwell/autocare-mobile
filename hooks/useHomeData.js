import { useState, useCallback } from 'react';
import { useFocusEffect } from 'expo-router';
import { useAuth } from '../context/AuthContext';
import appointmentsApi from '../services/appointmentsApi';
import serviceTypesApi from '../services/serviceTypesApi';

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
  const [trendingServices, setTrendingServices] = useState([]);
  const [loading, setLoading] = useState(true);

  const normalizeDateStr = (dateStr) => dateStr?.split('T')[0] || '';

  const loadTrendingServices = async () => {
    try {
      const res = await serviceTypesApi.getTrending();
      const data = res.data?.data || res.data || [];
      setTrendingServices(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Trending services error:', err);
    }
  };

  const loadAppointments = async () => {
    if (!user?.id) return;
    try {
      const res = await appointmentsApi.list({ customerId: user.id, _t: Date.now() });
      const all = res.data || [];

      // Group by status
      const groups = {
        confirmed: [],
        waitingForApproval: [],
        underInspection: [],
        inProgress: [],
        pending: [],
        completed: [],
        cancelled: [],
      };

      const now = new Date();
      const todayStr = now.toISOString().split('T')[0];
      const currentMinutes = now.getHours() * 60 + now.getMinutes();

      for (const apt of all) {
        const status = apt.status;
        if (status === 'CONFIRMED') groups.confirmed.push(apt);
        else if (status === 'WAITING_FOR_APPROVAL') groups.waitingForApproval.push(apt);
        else if (status === 'UNDER_INSPECTION') groups.underInspection.push(apt);
        else if (status === 'IN_PROGRESS') groups.inProgress.push(apt);
        else if (status === 'PENDING') groups.pending.push(apt);
        else if (status === 'COMPLETED') groups.completed.push(apt);
        else if (status === 'CANCELLED') groups.cancelled.push(apt);
      }

      // Sort waitingForApproval by oldest first (ascending date)
      groups.waitingForApproval.sort((a, b) => 
        new Date(a.appointmentDate) - new Date(b.appointmentDate) ||
        (a.appointmentTime || '').localeCompare(b.appointmentTime || '')
      );

      // Find the nearest upcoming CONFIRMED appointment (today or future, not past)
      const upcoming = groups.confirmed
        .filter(apt => {
          const aptDate = normalizeDateStr(apt.appointmentDate);
          if (aptDate < todayStr) return false;
          if (aptDate === todayStr && apt.appointmentTime) {
            const [h, m] = apt.appointmentTime.split(':').map(Number);
            if (h * 60 + m <= currentMinutes) return false;
          }
          return true;
        })
        .sort((a, b) => {
          const dA = normalizeDateStr(a.appointmentDate);
          const dB = normalizeDateStr(b.appointmentDate);
          return dA.localeCompare(dB) || (a.appointmentTime || '').localeCompare(b.appointmentTime || '');
        });

      setUpcomingConfirmed(upcoming[0] || null);

      // Keep only the required limits for each group (except waitingForApproval – all)
      groups.underInspection = groups.underInspection.slice(0, 4);
      groups.inProgress = groups.inProgress.slice(0, 4);
      groups.pending = groups.pending.slice(0, 4);
      groups.completed = groups.completed.slice(0, 4);
      groups.cancelled = groups.cancelled.slice(0, 4);

      setGroupedAppointments(groups);
      setAllAppointments(all);
    } catch (err) {
      console.error('Appointments load error:', err);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      Promise.all([loadAppointments(), loadTrendingServices()]).finally(() => setLoading(false));
    }, [user?.id])
  );

  return {
    allAppointments,
    groupedAppointments,
    upcomingConfirmed,
    trendingServices,
    loading,
  };
}