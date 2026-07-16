// hooks/usePaymentVerification.js
import { useState, useCallback } from 'react';
import { useFocusEffect } from 'expo-router';
import paymentsApi from '../services/paymentsApi';

export function usePaymentVerification(billId, paymongoLinkId) {
  const [verificationState, setVerificationState] = useState({
    loading: false,
    paid: false,
    error: null,
  });

  const runVerification = useCallback(async () => {
    if (!billId || !paymongoLinkId) return;
    setVerificationState({ loading: true, paid: false, error: null });
    try {
      const res = await paymentsApi.verifyPayment(billId, paymongoLinkId);
      setVerificationState({
        loading: false,
        paid: res.data?.paid === true,
        error: null,
      });
    } catch (err) {
      setVerificationState({
        loading: false,
        paid: false,
        error: err.message,
      });
    }
  }, [billId, paymongoLinkId]);

  useFocusEffect(
    useCallback(() => {
      runVerification();
    }, [runVerification])
  );

  return verificationState;
}