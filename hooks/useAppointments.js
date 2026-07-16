import { useState, useCallback } from 'react';
import { useFocusEffect } from 'expo-router';
import { useAuth } from '../context/AuthContext';
import appointmentsApi from '../services/appointmentsApi';

export function useAppointments() {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadAppointments = useCallback(async () => {
    if (!user?.id) return;
    setLoading(true);
    try {
      const res = await appointmentsApi.list({ customerId: user.id, _t: Date.now() });
      const all = res.data || [];

      const now = new Date();
      const todayMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate());

      // Filter only upcoming, non-cancelled, non-completed appointments
      const upcoming = all.filter(apt => {
        if (apt.status === 'CANCELLED' || apt.status === 'COMPLETED') return false;
        const aptDate = new Date(apt.appointmentDate);
        if (aptDate < todayMidnight) return false;
        if (aptDate.getTime() === todayMidnight.getTime()) {
          const [hour, minute] = apt.appointmentTime.split(':').map(Number);
          const aptTime = new Date().setHours(hour, minute, 0);
          if (aptTime < now.getTime()) return false;
        }
        return true;
      });

      upcoming.sort((a, b) => new Date(a.appointmentDate) - new Date(b.appointmentDate));
      setAppointments(upcoming);
    } catch (error) {
      console.error('Failed to load appointments:', error);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useFocusEffect(
    useCallback(() => {
      loadAppointments();
    }, [loadAppointments])
  );

  return { appointments, loading, refetch: loadAppointments };
}