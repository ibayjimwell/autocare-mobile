// hooks/useRescheduleRequests.js
import { useState, useCallback, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import appointmentsApi from '../services/appointmentsApi';
import { useRealtimeTable } from '../connections/useRealtimeTable';

export function useRescheduleRequests(appointmentId) {
  const { user } = useAuth();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pendingRequest, setPendingRequest] = useState(null);

  const loadRequests = useCallback(async () => {
    if (!appointmentId) return;
    setLoading(true);
    try {
      const res = await appointmentsApi.getRescheduleRequests(appointmentId);
      const data = res.data || [];
      setRequests(data);
      const pending = data.find(r => r.status === 'PENDING');
      setPendingRequest(pending || null);
    } catch (err) {
      console.error('Failed to load reschedule requests:', err);
      setRequests([]);
      setPendingRequest(null);
    } finally {
      setLoading(false);
    }
  }, [appointmentId]);

  useEffect(() => {
    loadRequests();
  }, [loadRequests]);

  useRealtimeTable(
    'appointment_reschedule_requests',
    `appointment_id=eq.${appointmentId}`,
    useCallback(() => {
      console.log('🔄 Reschedule request changed, refreshing...');
      loadRequests();
    }, [loadRequests])
  );

  const approveRequest = useCallback(async (requestId) => {
    try {
      const res = await appointmentsApi.approveRescheduleRequest(requestId);
      if (res.error) {
        throw new Error(res.errorMessage || 'Failed to approve');
      }
      await loadRequests();
      return { success: true };
    } catch (err) {
      console.error('Approve reschedule error:', err);
      return { success: false, error: err.message };
    }
  }, [loadRequests]);

  const rejectRequest = useCallback(async (requestId, rejectionReason) => {
    if (!rejectionReason || !rejectionReason.trim()) {
      return { success: false, error: 'Reason is required for rejection' };
    }
    try {
      const res = await appointmentsApi.rejectRescheduleRequest(requestId, rejectionReason.trim());
      if (res.error) {
        throw new Error(res.errorMessage || 'Failed to reject');
      }
      await loadRequests();
      return { success: true };
    } catch (err) {
      console.error('Reject reschedule error:', err);
      return { success: false, error: err.message };
    }
  }, [loadRequests]);

  return {
    requests,
    loading,
    loadRequests,
    approveRequest,
    rejectRequest,
    pendingRequest,
  };
}