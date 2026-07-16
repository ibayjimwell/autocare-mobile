// hooks/useInvoice.js
import { useState, useEffect } from 'react';
import finalBillsApi from '../services/finalBillsApi';

export function useInvoice(billId) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!billId) {
      setLoading(false);
      return;
    }

    let cancelled = false;
    setLoading(true);
    finalBillsApi.getById(billId)
      .then((res) => {
        if (!cancelled) {
          setData(res.data);
          setError(null);
        }
      })
      .catch((err) => {
        if (!cancelled) setError(err.message || 'Failed to load invoice');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => { cancelled = true; };
  }, [billId]);

  return { invoice: data, loading, error };
}