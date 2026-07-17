// hooks/usePaymentFlow.js
import { useState, useCallback, useEffect, useRef } from 'react';
import { Linking, Alert } from 'react-native';
import { useFocusEffect } from 'expo-router';
import { Buffer } from 'buffer';
import paymentsApi from '../services/paymentsApi';

const PAYMONGO_PUBLIC_KEY = process.env.EXPO_PUBLIC_PAYMONGO_PUBLIC_KEY;
if (!PAYMONGO_PUBLIC_KEY) {
  console.warn('[PayMongo] EXPO_PUBLIC_PAYMONGO_PUBLIC_KEY is not set!');
}

async function createPaymentLinkClient(amountInCentavos, description, remarks) {
  if (!PAYMONGO_PUBLIC_KEY) {
    throw new Error('Payment service not configured.');
  }
  const encodedKey = Buffer.from(`${PAYMONGO_PUBLIC_KEY}:`).toString('base64');

  const response = await fetch('https://api.paymongo.com/v1/links', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Basic ${encodedKey}`,
    },
    body: JSON.stringify({
      data: {
        attributes: {
          amount: amountInCentavos,
          description,
          remarks,
        },
      },
    }),
  });

  const text = await response.text();
  let json;
  try {
    json = JSON.parse(text);
  } catch {
    throw new Error('Payment gateway returned an unexpected response.');
  }

  if (!response.ok) {
    const detail = json?.errors?.[0]?.detail || 'Payment link creation failed';
    throw new Error(detail);
  }

  const link = json.data;
  return {
    checkoutUrl: link.attributes.checkout_url,
    paymongoLinkId: link.id,
    referenceNumber: link.attributes.reference_number,
  };
}

export function usePaymentFlow(billId, grandTotal) {
  const [state, setState] = useState({
    paying: false,
    paymongoLinkId: null,
    verifiedPaid: false,
    verifying: false,
  });

  const pollingInterval = useRef(null);
  const attemptsRef = useRef(0);
  const MAX_POLL_ATTEMPTS = 10;    // 10 attempts × 2 seconds = 20 seconds

  // Cleanup polling on unmount
  useEffect(() => {
    return () => {
      if (pollingInterval.current) {
        clearInterval(pollingInterval.current);
      }
    };
  }, []);

  const verifyPayment = useCallback(async (linkId) => {
    if (!billId || !linkId) return false;
    try {
      const res = await paymentsApi.verifyPayment(billId, linkId);
      return res.data?.paid === true;
    } catch (err) {
      console.error('Verification error:', err);
      return false;
    }
  }, [billId]);

  const startPolling = useCallback((linkId) => {
    // Clear any existing poll
    if (pollingInterval.current) clearInterval(pollingInterval.current);

    attemptsRef.current = 0;
    setState(prev => ({ ...prev, verifying: true }));

    pollingInterval.current = setInterval(async () => {
      attemptsRef.current += 1;
      const paid = await verifyPayment(linkId);

      if (paid) {
        clearInterval(pollingInterval.current);
        pollingInterval.current = null;
        setState(prev => ({ ...prev, verifiedPaid: true, verifying: false }));
        return;
      }

      if (attemptsRef.current >= MAX_POLL_ATTEMPTS) {
        clearInterval(pollingInterval.current);
        pollingInterval.current = null;
        setState(prev => ({ ...prev, verifying: false }));
      }
    }, 2000);
  }, [verifyPayment]);

  const startPayment = async () => {
    if (!billId || !grandTotal) return;
    setState(prev => ({ ...prev, paying: true }));
    try {
      const amountInCentavos = Math.round(parseFloat(grandTotal) * 100);
      const description = `Payment for invoice ${billId.slice(0, 8)}`;
      const remarks = `Final bill ${billId}`;

      const { checkoutUrl, paymongoLinkId } = await createPaymentLinkClient(
        amountInCentavos,
        description,
        remarks
      );

      setState(prev => ({ ...prev, paymongoLinkId }));
      await Linking.openURL(checkoutUrl);

      // Start polling after the browser is opened – it will continue
      // even if the user hasn't returned yet.
      startPolling(paymongoLinkId);
    } catch (err) {
      Alert.alert('Payment Error', err.message || 'Could not initiate payment.');
    } finally {
      setState(prev => ({ ...prev, paying: false }));
    }
  };

  // Also retry verification on every screen focus (fallback for deep link / later return)
  useFocusEffect(
    useCallback(() => {
      if (state.paymongoLinkId && !state.verifiedPaid) {
        // If polling is not already active, start it again
        if (!pollingInterval.current) {
          startPolling(state.paymongoLinkId);
        }
      }
    }, [state.paymongoLinkId, state.verifiedPaid, startPolling])
  );

  return {
    startPayment,
    paying: state.paying,
    verifiedPaid: state.verifiedPaid,
    verifying: state.verifying,
  };
}