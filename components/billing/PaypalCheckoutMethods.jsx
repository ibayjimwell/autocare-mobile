import React, { useCallback, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Alert, AppState, Linking, Text, TouchableOpacity, View } from 'react-native';
import { useRouter } from 'expo-router';
import { CreditCard, ChevronRight, RefreshCw, ShieldCheck } from 'lucide-react-native';
import { useTheme } from '../../context/ThemeContext';
import paymentsApi from '../../services/paymentsApi';
import { API_BASE_URL } from '../../services/api';

const ACTIVE = new Set(['READY','CREATING','ACTIVE','APPROVED','CAPTURING','CREATE_UNKNOWN']);
const CHECK_INTERVAL_MS = 8000;
function validUrl(raw) {
  try {
    const value = new URL(raw);
    // AutoCare's verified backend creates this link; no third-party redirect is accepted.
    return value.protocol === 'https:' && value.username === '' && value.password === '' &&
      value.pathname.startsWith('/paypal/checkout/') &&
      value.origin === new URL(API_BASE_URL).origin;
  } catch { return false; }
}
function errorText(e) { return e?.errorMessage || e?.responseData?.errorMessage || e?.message || 'Unable to process payment.'; }

/** One PayPal entry point. Funding source options are rendered by PayPal itself. */
export default function PaypalCheckoutMethods({ billId, onConfirmedPayment, returnFlag }) {
  const { theme } = useTheme();
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [checking, setChecking] = useState(false);
  const [status, setStatus] = useState('NONE');
  const [checkoutUrl, setCheckoutUrl] = useState('');
  const [error, setError] = useState('');
  const mounted = useRef(false);
  const checkingRef = useRef(false);
  const navigated = useRef(false);
  const latestAppState = useRef(AppState.currentState);
  const numericBill = Array.isArray(billId) ? billId[0] : billId;

  const refresh = useCallback(async () => {
    if (!numericBill || !mounted.current || checkingRef.current || navigated.current) return;
    checkingRef.current = true;
    setChecking(true);
    try {
      const res = await paymentsApi.getPaypalCheckout(numericBill);
      if (!mounted.current) return;
      const data = res?.data || {};
      setStatus(data.status || 'NONE');
      setCheckoutUrl(data.checkoutUrl || '');
      setError('');
      if (data.paid === true && !navigated.current) {
        navigated.current = true;
        onConfirmedPayment?.();
        router.replace({pathname:'/payment-success',params:{billId:String(numericBill)}});
      }
    } catch(e) { if(mounted.current) setError(errorText(e)); }
    finally { checkingRef.current = false; if(mounted.current) setChecking(false); }
  }, [numericBill, onConfirmedPayment, router]);

  useEffect(() => {
    mounted.current = true; navigated.current = false;
    void refresh();
    const appState = AppState.addEventListener('change', next => {
      const returning = latestAppState.current !== 'active' && next === 'active';
      latestAppState.current = next;
      if (returning) void refresh();
    });
    return () => { mounted.current = false; appState.remove(); };
  }, [refresh]);

  useEffect(()=>{if(returnFlag)void refresh();},[returnFlag,refresh]);
  useEffect(()=>{
    if (!ACTIVE.has(status)) return undefined;
    const timer=setInterval(()=>{if(AppState.currentState==='active')void refresh();},CHECK_INTERVAL_MS);
    return()=>clearInterval(timer);
  },[status,refresh]);

  const open = useCallback(async () => {
    if(busy || checking || navigated.current || !numericBill)return;
    setBusy(true);setError('');
    try {
      const payload = ACTIVE.has(status) && checkoutUrl
        ? { checkoutUrl }
        : (await paymentsApi.createPaypalCheckout(numericBill))?.data;
      const url=payload?.checkoutUrl;
      if (!url || !validUrl(url)) throw new Error('The server did not return a valid AutoCare PayPal checkout link.');
      setCheckoutUrl(url);setStatus('READY');
      await Linking.openURL(url);
    } catch(e){const message=errorText(e);setError(message);Alert.alert('Unable to open PayPal',message);void refresh();}
    finally{if(mounted.current)setBusy(false);}
  },[numericBill,status,checkoutUrl,busy,checking,refresh]);

  return <View className="mb-5">
    <View className="mb-3 flex-row items-center justify-between px-1">
      <View className="flex-row items-center"><CreditCard size={19} color={theme.primary}/>
        <Text className="ml-2 text-sm font-bold text-foreground">Pay Online</Text></View>
      <ShieldCheck size={19} color="#16a34a" />
    </View>
    <View className="overflow-hidden rounded-2xl border border-border bg-card">
      <Text className="border-b border-border px-4 py-4 text-base font-bold text-foreground">Choose a payment method</Text>
      <TouchableOpacity accessibilityRole="button" onPress={() => void open()}
        disabled={busy || checking || status==='DEMO_PAID'} activeOpacity={0.8}
        className="min-h-[84px] flex-row items-center px-4" style={{opacity:busy?0.7:1}}>
        <View className="h-12 w-16 items-center justify-center rounded-xl bg-[#EAF3FF]">
          <Text className="text-base font-extrabold italic text-[#003087]">PayPal</Text>
        </View>
        <View className="ml-3 flex-1"><Text className="text-base font-bold text-foreground">Pay with PayPal</Text>
          <Text className="mt-1 text-xs leading-5 text-muted-foreground">PayPal Wallet, eligible cards and digital wallets</Text>
        </View>
        {busy ? <ActivityIndicator color={theme.primary}/> : <ChevronRight size={21} color={theme.textSecondary}/>}
      </TouchableOpacity>
    </View>
    {ACTIVE.has(status) && <View className="mt-3 rounded-xl border border-border bg-card p-4">
      <Text className="text-sm font-semibold text-foreground">PayPal checkout in progress</Text>
      <Text className="mt-1 text-xs text-muted-foreground">Complete checkout in your browser, then return to AutoCare.</Text>
      {Boolean(checkoutUrl) && <TouchableOpacity onPress={() => void open()} disabled={busy||checking}
        className="mt-3 min-h-[44px] items-center justify-center rounded-xl bg-primary">
        <Text className="font-semibold text-white">Resume PayPal Checkout</Text></TouchableOpacity>}
    </View>}
    {!!error && <View className="mt-3 rounded-xl border border-red-200 bg-red-50 p-3"><Text className="text-sm text-red-800">{error}</Text></View>}
    <TouchableOpacity onPress={() => void refresh()} disabled={checking||busy}
      className="mt-2 min-h-[44px] flex-row items-center justify-center">
      {checking?<ActivityIndicator size="small" color={theme.primary}/>:<RefreshCw size={16} color={theme.primary}/>}
      <Text className="ml-2 text-sm font-semibold text-primary">{checking?'Checking payment…':'Check payment status'}</Text>
    </TouchableOpacity>
  </View>;
}
