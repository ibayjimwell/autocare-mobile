import { useState, useEffect, useCallback } from 'react';
import { useRealtimeTable } from '../connections/useRealtimeTable';
import queueApi from '../services/queueApi';

export function useQueue(date, appointmentId, mode = 'CONFIRMED') {
  const [queue, setQueue] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadQueue = useCallback(async () => {
    if (mode === 'CONFIRMED' && !date) { setQueue([]); setLoading(false); return; }
    setLoading(true);
    try {
      const res = await queueApi.getQueue(date, mode);
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
  }, [date, mode]);

  // Initial load
  useEffect(() => {
    loadQueue();
  }, [loadQueue]);

  // Real‑time subscription – refresh on any change to service_queue for this date
  useRealtimeTable(
    'service_queue',
    mode === 'CONFIRMED' && date ? `queue_date=eq.${date}` : undefined,
    useCallback(() => {
      // Re-fetch when any change occurs
      loadQueue();
    }, [loadQueue])
  );

  // In-progress records may enter this phase before a service_queue row
  // exists, so also reload on appointment status changes.
  useRealtimeTable(
    mode === 'IN_PROGRESS' ? 'appointments' : null,
    undefined,
    useCallback(() => { void loadQueue(); }, [loadQueue]),
  );

  return { queue, loading, error, refresh: loadQueue };
}