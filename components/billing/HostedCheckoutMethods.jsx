import React, { useCallback, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Alert, AppState, Image, Linking, Text, TouchableOpacity, View } from 'react-native';
import { CheckCircle2, ChevronRight, CreditCard, RotateCw, ShieldCheck, XCircle } from 'lucide-react-native';
import paymentsApi from '../../services/paymentsApi';
import { useTheme } from '../../context/ThemeContext';

// Bundled artwork is available offline and matches AutoCare's payment choices.
const METHODS = [
  { id: 'gcash', label: 'GCash', logo: require('../../assets/gcash.png') },
  { id: 'paymaya', label: 'Maya', logo: require('../../assets/maya.png') },
  { id: 'card', label: 'Credit / Debit Card', logo: require('../../assets/card.png') },
];

function PaymentLogo({ method }) {
  return (
    <View className="w-20 h-12 rounded-xl items-center justify-center border border-[#e8ebf0] bg-white px-2">
      <Image
        source={method.logo}
        resizeMode="contain"
        style={{ width: 70, height: 34 }}
        accessibilityLabel={`${method.label} payment logo`}
      />
    </View>
  );
}

function checkoutErrorMessage(cause, fallback) {
  const detail = String(cause?.message || '').trim();
  if (cause?.status === 404 || /requested route does not exist/i.test(detail)) {
    return 'Online payment is temporarily unavailable. Please try again later or pay at the counter.';
  }
  return detail || fallback;
}

export default function HostedCheckoutMethods({ billId, amount, onConfirmedPayment, returnFlag }) {
  const { theme } = useTheme();
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(false);
  const [status, setStatus] = useState('NONE');
  const [method, setMethod] = useState(null);
  const [checkoutUrl, setCheckoutUrl] = useState(null);
  const [liveMode, setLiveMode] = useState(null);
  const [error, setError] = useState('');
  const checkingRef = useRef(false);
  const mountedRef = useRef(true);
  const notifiedRef = useRef(false);

  const refresh = useCallback(async () => {
    if (!billId || checkingRef.current) return;
    checkingRef.current = true;
    setChecking(true);
    try {
      const response = await paymentsApi.getHostedCheckout(billId);
      const data = response?.data || {};
      if (!mountedRef.current) return;
      setStatus(data.status || 'NONE');
      setMethod(data.paymentMethod || null);
      setCheckoutUrl(data.checkoutUrl || null);
      if (typeof data.livemode === 'boolean') setLiveMode(data.livemode);
      setError('');
      if (data.paid && !notifiedRef.current) {
        notifiedRef.current = true;
        onConfirmedPayment?.();
      }
    } catch (cause) {
      if (mountedRef.current) setError(checkoutErrorMessage(cause, 'Could not check your payment.'));
    } finally {
      checkingRef.current = false;
      if (mountedRef.current) setChecking(false);
    }
  }, [billId, onConfirmedPayment]);

  useEffect(() => {
    mountedRef.current = true;
    void refresh();
    const appState = AppState.addEventListener('change', next => {
      if (next === 'active') void refresh();
    });
    return () => { mountedRef.current = false; appState.remove(); };
  }, [refresh]);

  useEffect(() => {
    if (returnFlag) void refresh();
  }, [returnFlag, refresh]);

  useEffect(() => {
    if (status !== 'PENDING' && status !== 'ACTIVE' && status !== 'CREATING') return undefined;
    const timer = setInterval(() => void refresh(), 8000);
    return () => clearInterval(timer);
  }, [refresh, status]);

  const openCheckout = async url => {
    if (!url || !/^https:\/\/checkout\.paymongo\.com\//.test(url)) {
      throw new Error('The checkout link is not valid. Please try again.');
    }
    await Linking.openURL(url);
  };

  const choosePayment = async selected => {
    if (loading || checking) return;
    setError('');
    setLoading(true);
    try {
      const response = await paymentsApi.createHostedCheckout(billId, selected);
      const data = response?.data || {};
      setStatus('PENDING');
      setMethod(selected);
      setCheckoutUrl(data.checkoutUrl);
      if (typeof data.livemode === 'boolean') setLiveMode(data.livemode);
      await openCheckout(data.checkoutUrl);
    } catch (cause) {
      const message = checkoutErrorMessage(cause, 'We could not prepare the payment.');
      setError(message);
      Alert.alert('Unable to start payment', message);
      void refresh();
    } finally { setLoading(false); }
  };

  const cancelCheckout = () => {
    Alert.alert('Cancel current checkout?', 'This will close the current PayMongo payment session. You can choose another method after it is cancelled.', [
      { text: 'Keep checkout', style: 'cancel' },
      { text: 'Cancel checkout', style: 'destructive', onPress: async () => {
        setLoading(true);
        try { await paymentsApi.cancelHostedCheckout(billId); setCheckoutUrl(null); setMethod(null); setStatus('EXPIRED'); setError(''); }
        catch (cause) { Alert.alert('Cannot cancel payment', checkoutErrorMessage(cause, 'Please check whether the payment has already been processed.')); }
        finally { setLoading(false); void refresh(); }
      } },
    ]);
  };

  return (
    <View className="mb-4">
      <View className="flex-row items-center justify-between px-1 mb-3">
        <View className="flex-row items-center flex-1">
          <CreditCard size={18} color={theme.primary} />
          <Text className="text-sm font-bold text-foreground ml-2">Pay Online</Text>
        </View>
        <View className="flex-row items-center">
          <ShieldCheck size={13} color="#16a34a" />
          <Text className="text-xs text-muted-foreground ml-1">PayMongo checkout</Text>
        </View>
      </View>
      <View className="rounded-2xl bg-card border border-border overflow-hidden">
        <View className="px-4 pt-4 pb-3 border-b border-border">
          <Text className="text-base font-bold text-foreground">Choose a payment method</Text>
        </View>
        {METHODS.map((item, index) => {
          const otherOpen = ['PENDING','ACTIVE','CREATING','CREATE_UNKNOWN','PROCESSING'].includes(status) && method !== item.id;
          const isWorking = loading || checking;
          return (
            <TouchableOpacity
              key={item.id} activeOpacity={0.75} disabled={isWorking || otherOpen || status === 'PAID'}
              accessibilityRole="button" accessibilityLabel={`Pay ₱${Number(amount || 0).toLocaleString('en-PH', {minimumFractionDigits:2})} with ${item.label}`}
              className={`flex-row items-center px-4 min-h-[80px] ${index < METHODS.length - 1 ? 'border-b border-border' : ''}`}
              style={{ opacity: otherOpen ? 0.42 : 1 }}
              onPress={() => { void (method === item.id && checkoutUrl ? openCheckout(checkoutUrl).catch(cause => Alert.alert('Checkout unavailable', cause.message)) : choosePayment(item.id)); }}
            >
              <PaymentLogo method={item} />
              <View className="flex-1 pl-3">
                <Text className="text-base font-semibold text-foreground">{item.label}</Text>
              </View>
              {loading && method === item.id ? <ActivityIndicator size="small" color={theme.primary}/> : <ChevronRight size={20} color={theme.textSecondary} />}
            </TouchableOpacity>
          );
        })}
      </View>
      {liveMode === false && (
        <View className="mt-3 px-3 py-3 rounded-xl bg-[#eff6ff] border border-[#bfd9fa]">
          <Text className="text-sm font-semibold text-[#174a83]">Demo checkout • No charge</Text>
          <Text className="text-xs leading-5 text-[#315d88] mt-1">This payment does not settle your Final Cost.</Text>
        </View>
      )}
      {['PENDING','ACTIVE','CREATING','PROCESSING'].includes(status) && (
        <View className="rounded-xl bg-[#f8f9fb] border border-[#e3e6eb] p-4 mt-3">
          <View className="flex-row items-center"><ActivityIndicator size="small" color={theme.primary}/>
            <Text className="font-semibold text-sm text-foreground ml-2">Checkout awaiting confirmation</Text></View>
          <Text className="text-xs text-muted-foreground mt-2 leading-5">Complete the payment in PayMongo, then return to AutoCare. We'll check the status.</Text>
          <View className="flex-row mt-3 gap-2">
            {!!checkoutUrl && <TouchableOpacity onPress={() => void openCheckout(checkoutUrl).catch(cause => Alert.alert('Checkout unavailable', cause.message))} className="flex-1 min-h-[44px] bg-primary rounded-xl items-center justify-center"><Text className="text-white font-semibold text-sm">Resume payment</Text></TouchableOpacity>}
            <TouchableOpacity onPress={cancelCheckout} disabled={loading} className="flex-1 min-h-[44px] border border-border bg-card rounded-xl items-center justify-center"><Text className="text-foreground font-semibold text-sm">Cancel checkout</Text></TouchableOpacity>
          </View>
        </View>
      )}
      {status === 'SIMULATED' && <View className="mt-3 p-4 rounded-xl border border-[#b6d7c3] bg-[#f0faf3] flex-row items-start"><CheckCircle2 size={20} color="#198650"/><View className="ml-2 flex-1"><Text className="text-sm font-semibold text-[#166a3d]">Demo payment completed</Text><Text className="text-xs leading-5 text-[#166a3d] mt-1">Your transaction was completed in PayMongo's demonstration environment. Your actual Final Cost remains unpaid.</Text></View></View>}
      {status === 'PAID' && <View className="mt-3 p-4 rounded-xl bg-[#f0faf3] border border-[#b6d7c3] flex-row items-center"><CheckCircle2 size={20} color="#198650"/><Text className="font-semibold text-[#166a3d] ml-2">Payment confirmed. Your receipt is ready.</Text></View>}
      {status === 'CREATE_UNKNOWN' && <View className="mt-3 p-4 rounded-xl bg-[#fff7ed] border border-[#fed7aa] flex-row items-start"><XCircle size={20} color="#9a3412"/><Text className="ml-2 text-xs text-[#9a3412] flex-1">Checkout setup could not be confirmed. Contact AutoCare before attempting another payment.</Text></View>}
      {!!error && <View className="mt-3 p-3 rounded-xl border border-red-200 bg-red-50"><Text className="text-xs text-red-800">{error}</Text></View>}
      <TouchableOpacity onPress={() => void refresh()} disabled={checking || loading} className="min-h-[44px] flex-row items-center justify-center mt-2" accessibilityRole="button">
        {checking ? <ActivityIndicator size="small" color={theme.primary}/> : <RotateCw size={15} color={theme.primary}/>}
        <Text className="font-semibold text-sm text-primary ml-2">{checking ? 'Checking payment...' : 'Check payment status'}</Text>
      </TouchableOpacity>
    </View>
  );
}
