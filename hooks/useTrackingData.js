import { useState, useCallback } from 'react';
import { useFocusEffect } from 'expo-router';
import { useAuth } from '../context/AuthContext';
import appointmentsApi from '../services/appointmentsApi';
import tasksApi from '../services/tasksApi';
import estimateApi from '../services/estimateApi';
import finalBillsApi from '../services/finalBillsApi';

export function useTrackingData(appointmentId) {
  const { user } = useAuth();
  const [appointment, setAppointment] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [estimate, setEstimate] = useState(null);
  const [finalBill, setFinalBill] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchAppointment = useCallback(async () => {
    if (!appointmentId || !user?.id) return null;
    try {
      const res = await appointmentsApi.list({ customerId: user.id });
      const found = res.data?.find(apt => apt.id === appointmentId);
      if (found) {
        setAppointment(found);
        return found;
      }
      const single = await appointmentsApi.get(appointmentId);
      const apt = single.data || single;
      setAppointment(Array.isArray(apt) ? apt[0] : apt);
      return apt;
    } catch (err) {
      console.error(err);
      return null;
    }
  }, [appointmentId, user?.id]);

  const fetchTasks = useCallback(async (status) => {
    if (!appointmentId) return;
    try {
      let res;
      if (status === 'UNDER_INSPECTION' || status === 'WAITING_FOR_APPROVAL') {
        res = await tasksApi.getInspectionTasks(appointmentId);
      } else {
        res = await tasksApi.getWorkTasks(appointmentId);
      }
      setTasks(res.data || []);
    } catch (err) { console.error(err); }
  }, [appointmentId]);

  const fetchEstimate = useCallback(async () => {
    if (!appointmentId) return;
    try {
      const res = await estimateApi.getByAppointment(appointmentId);
      // The endpoint returns an array of estimates, take the first one (usually only one)
      const estimates = res.data || [];
      setEstimate(estimates.length > 0 ? estimates[0] : null);
    } catch (err) { console.error(err); }
  }, [appointmentId]);

  const fetchFinalBill = useCallback(async () => {
    if (!appointmentId) return;
    try {
      const res = await finalBillsApi.getByAppointment(appointmentId);
      const bills = res.data || [];
      setFinalBill(bills.length > 0 ? bills[0] : null);
    } catch (err) { console.error(err); }
  }, [appointmentId]);

  const refreshAll = useCallback(async () => {
    const apt = await fetchAppointment();
    if (!apt) return;
    const { status } = apt;

    if (status === 'UNDER_INSPECTION' || status === 'WAITING_FOR_APPROVAL') {
      await Promise.all([fetchTasks(status), fetchEstimate()]);
    } else if (status === 'IN_PROGRESS' || status === 'COMPLETED') {
      await Promise.all([fetchTasks(status), fetchFinalBill()]);
    }
  }, [fetchAppointment, fetchTasks, fetchEstimate, fetchFinalBill]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refreshAll();
    setRefreshing(false);
  }, [refreshAll]);

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      refreshAll().finally(() => setLoading(false));
    }, [refreshAll])
  );

  return {
    appointment,
    tasks,
    estimate,            // { id, status, serviceSubtotal, findingsSubtotal, feesTotal, discountTotal, grandTotal }
    finalBill,           // { id, status, grandTotal, ... }
    loading,
    refreshing,
    onRefresh,
    refreshAll,
  };
}