import { useState, useCallback } from 'react';
import { useFocusEffect } from 'expo-router';
import { useAuth } from '../context/AuthContext';
import appointmentsApi from '../services/appointmentsApi';
import serviceTypesApi from '../services/serviceTypesApi';

export function useHomeData() {
  const { user } = useAuth();
  const [upcomingAppointment, setUpcomingAppointment] = useState(null);
  const [underInspectionAppointments, setUnderInspectionAppointments] = useState([]);
  const [inProgressAppointments, setInProgressAppointments] = useState([]);
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
      const now = new Date();
      const todayStr = now.toISOString().split('T')[0];
      const currentMinutes = now.getHours() * 60 + now.getMinutes();

      const upcoming = all
        .filter(apt => {
          if (apt.status !== 'CONFIRMED') return false;
          const aptDate = normalizeDateStr(apt.appointmentDate);
          if (!aptDate) return false;
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

      setUpcomingAppointment(upcoming[0] || null);
      setUnderInspectionAppointments(all.filter(a => a.status === 'UNDER_INSPECTION'));
      setInProgressAppointments(all.filter(a => a.status === 'IN_PROGRESS'));
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
    upcomingAppointment,
    underInspectionAppointments,
    inProgressAppointments,
    trendingServices,
    loading,
  };
}