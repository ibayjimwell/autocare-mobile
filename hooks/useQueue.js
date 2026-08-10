import { useState, useEffect, useCallback } from 'react';
import { useRealtimeTable } from '../connections/useRealtimeTable';
import queueApi from '../services/queueApi';

export function useQueue(date, appointmentId) {
  const [queue, setQueue] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadQueue = useCallback(async () => {
    if (!date) return;
    setLoading(true);
    try {
      const res = await queueApi.getQueue(date);
      if (res.error) {
        setError(res.errorMessage || 'Failed to load queue.');
        setQueue([]);
      } else {
        setQueue(res.data || []);
        setError(null);
      }
    } catch (err) {
      setError(err.message || 'Network error.');
      setQueue([]);
    } finally {
      setLoading(false);
    }
  }, [date]);

  // Initial load
  useEffect(() => {
    loadQueue();
  }, [loadQueue]);

  // Real‑time subscription – refresh on any change to service_queue for this date
  useRealtimeTable(
    'service_queue',
    `queue_date=eq.${date}`,
    useCallback(() => {
      // Re-fetch when any change occurs
      loadQueue();
    }, [loadQueue])
  );

  return { queue, loading, error, refresh: loadQueue };
}