// hooks/usePaymentFlow.js
import { useState, useCallback } from 'react';
import { Linking, Alert, Platform } from 'react-native';
import { useFocusEffect } from 'expo-router';
import { Buffer } from 'buffer';
import paymentsApi from '../services/paymentsApi';

// ===================== DEBUG LOGGING =====================
const PAYMONGO_PUBLIC_KEY = process.env.EXPO_PUBLIC_PAYMONGO_PUBLIC_KEY;
console.log('[PayMongo Init] Public key present:', !!PAYMONGO_PUBLIC_KEY);
if (PAYMONGO_PUBLIC_KEY) {
  console.log('[PayMongo Init] Key prefix:', PAYMONGO_PUBLIC_KEY.substring(0, 8) + '...');
  console.log('[PayMongo Init] Encoded prefix:',
    Buffer.from(`${PAYMONGO_PUBLIC_KEY}:`).toString('base64').substring(0, 12) + '...');
} else {
  console.warn('[PayMongo Init] WARNING: EXPO_PUBLIC_PAYMONGO_PUBLIC_KEY is empty!');
}

async function createPaymentLinkClient(amountInCentavos, description, remarks) {
  if (!PAYMONGO_PUBLIC_KEY) {
    throw new Error('Payment service not configured. Please contact support.');
  }

  const encodedKey = Buffer.from(`${PAYMONGO_PUBLIC_KEY}:`).toString('base64');
  console.log('[PayMongo] Starting request...');
  console.log('[PayMongo] URL:', 'https://api.paymongo.com/v1/links');
  console.log('[PayMongo] Authorization prefix:', encodedKey.substring(0, 12) + '...');

  const body = JSON.stringify({
    data: {
      attributes: {
        amount: amountInCentavos,
        description,
        remarks,
      },
    },
  });
  console.log('[PayMongo] Body:', body);

  let response;
  try {
    response = await fetch('https://api.paymongo.com/v1/links', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Basic ${encodedKey}`,
      },
      body,
    });
  } catch (networkError) {
    console.error('[PayMongo] Network error:', networkError);
    throw new Error('Network error: ' + (networkError.message || 'Could not connect to payment gateway.'));
  }

  console.log('[PayMongo] Response status:', response.status, response.statusText);

  const text = await response.text();
  console.log('[PayMongo] Raw response (first 300 chars):', text.substring(0, 300));

  let json;
  try {
    json = JSON.parse(text);
  } catch {
    console.error('[PayMongo] JSON parse failed. Full response:', text);
    throw new Error('Payment gateway returned an unexpected response. Please try again later.');
  }

  if (!response.ok) {
    const detail = json?.errors?.[0]?.detail || json?.error || 'Payment link creation failed';
    console.error('[PayMongo] API error:', JSON.stringify(json));
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
    } catch (err) {
      Alert.alert('Payment Error', err.message || 'Could not initiate payment.');
    } finally {
      setState(prev => ({ ...prev, paying: false }));
    }
  };

  const verify = useCallback(async () => {
    if (!billId || !state.paymongoLinkId) return;
    setState(prev => ({ ...prev, verifying: true }));
    try {
      const res = await paymentsApi.verifyPayment(billId, state.paymongoLinkId);
      setState(prev => ({
        ...prev,
        verifiedPaid: res.data?.paid === true,
      }));
    } catch (err) {
      console.error('Verification error:', err);
    } finally {
      setState(prev => ({ ...prev, verifying: false }));
    }
  }, [billId, state.paymongoLinkId]);

  useFocusEffect(
    useCallback(() => {
      verify();
    }, [verify])
  );

  return {
    startPayment,
    paying: state.paying,
    verifiedPaid: state.verifiedPaid,
    verifying: state.verifying,
  };
}