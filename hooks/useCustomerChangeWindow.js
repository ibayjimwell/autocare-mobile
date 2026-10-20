import { useCallback, useEffect, useState } from 'react';
import { useFocusEffect } from 'expo-router';
import api from '../services/api';

export default function useCustomerChangeWindow(appointmentId, status) {
  const [window, setWindow] = useState({ allowed: false, deadline: null, reason: null });
  const [loading, setLoading] = useState(false);
  const refresh = useCallback(async () => {
    if (!appointmentId || status !== 'CONFIRMED') {
      setWindow({ allowed: status === 'PENDING', deadline: null, reason: null });
      setLoading(false); return;
    }
    setLoading(true);
    try {
      const result = await api.request(`/appointments/${encodeURIComponent(appointmentId)}/customer-change-window`, 'GET', null, true);
      if (result?.error) throw new Error(result.errorMessage || 'Unable to check reschedule deadline.');
      setWindow(result.data || { allowed: false, reason: 'Change window unavailable.' });
    } catch (error) {
      setWindow({ allowed: false, deadline: null, reason: error?.message || 'Unable to verify change deadline.' });
    } finally { setLoading(false); }
  }, [appointmentId, status]);
  useFocusEffect(useCallback(() => { void refresh(); }, [refresh]));
  useEffect(() => {
    if (status !== 'CONFIRMED') return;
    const timer = setInterval(() => {
      setWindow(previous => previous.deadline && Date.now() >= new Date(previous.deadline).getTime()
        ? { ...previous, allowed: false, reason: 'Change deadline reached. Contact the shop.' }
        : previous);
    }, 30000);
    return () => clearInterval(timer);
  }, [status]);
  return { ...window, loading, refresh };
}
