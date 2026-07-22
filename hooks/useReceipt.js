// hooks/useReceipt.js
import { useState, useEffect } from 'react';
import receiptApi from '../services/receiptApi';

export function useReceipt(finalBillId) {
  const [receipt, setReceipt] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!finalBillId) {
      setLoading(false);
      return;
    }

    let cancelled = false;
    setLoading(true);
    receiptApi.getByFinalBill(finalBillId)
      .then((res) => {
        if (!cancelled) {
          setReceipt(res.data);
          setError(null);
        }
      })
      .catch((err) => {
        if (!cancelled) setError(err.message || 'Failed to load receipt');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => { cancelled = true; };
  }, [finalBillId]);

  return { receipt, loading, error };
}