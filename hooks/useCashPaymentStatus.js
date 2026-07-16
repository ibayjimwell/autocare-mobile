// hooks/useCashPaymentStatus.js
import { useState, useEffect, useRef } from 'react';
import finalBillsApi from '../services/finalBillsApi';

export function useCashPaymentStatus(billId) {
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const intervalRef = useRef(null);

  useEffect(() => {
    if (!billId) {
      setLoading(false);
      return;
    }

    const fetchStatus = async () => {
      try {
        const res = await finalBillsApi.getStatus(billId);
        const currentStatus = res.data?.status || res.status;
        setStatus(currentStatus);
        if (currentStatus === 'PAID') {
          clearInterval(intervalRef.current);
        }
      } catch (err) {
        console.error('Status check error:', err);
      } finally {
        setLoading(false);
      }
    };

    // Initial fetch
    fetchStatus();

    // Poll every 3 seconds
    intervalRef.current = setInterval(fetchStatus, 3000);

    return () => clearInterval(intervalRef.current);
  }, [billId]);

  const isPaid = status === 'PAID';

  return { status, loading, isPaid };
}