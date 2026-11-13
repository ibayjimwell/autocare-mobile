// hooks/usePayment.js
import { useState } from 'react';
import { Linking, Alert } from 'react-native';
import paymentsApi from '../services/paymentsApi';

export function usePayment(billId) {
  const [paying, setPaying] = useState(false);
  const [paymongoLinkId, setPaymongoLinkId] = useState(null);

  const startPayment = async () => {
    if (!billId) return;
    setPaying(true);
    try {
      const res = await paymentsApi.payOnline(billId);
      const { checkoutUrl, paymongoLinkId: linkId } = res.data;
      setPaymongoLinkId(linkId);          // store for later verification
      if (checkoutUrl) {
        await Linking.openURL(checkoutUrl);
      } else {
        Alert.alert('Error', 'No checkout URL returned.');
      }
    } catch (err) {
      Alert.alert(
        'Payment Error',
        err?.response?.data?.errorMessage || err.message || 'Could not initiate payment.'
      );
    } finally {
      setPaying(false);
    }
  };

  const verifyPayment = async () => {
    if (!billId || !paymongoLinkId) return false;
    try {
      const res = await paymentsApi.verifyPayment(billId, paymongoLinkId);
      return res.data?.paid === true;
    } catch (err) {
      console.error('Verification error:', err);
      return false;
    }
  };

  return { startPayment, paying, verifyPayment };
}