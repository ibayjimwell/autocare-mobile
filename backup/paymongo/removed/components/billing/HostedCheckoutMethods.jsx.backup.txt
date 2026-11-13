import React, {
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';
import {
  ActivityIndicator,
  Alert,
  AppState,
  Image,
  Linking,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import {
  ChevronRight,
  CreditCard,
  RotateCw,
  ShieldCheck,
} from 'lucide-react-native';

import { useTheme } from '../../context/ThemeContext';
import paymentsApi from '../../services/paymentsApi';

// These are the only three hosted-checkout choices. QR Ph is already
// implemented separately in the Final Cost screen and remains unchanged.
// Payment method IDs must match the Web API / PayMongo Checkout API.
const METHODS = [
  { id: 'gcash', label: 'GCash', logo: require('../../assets/gcash.png') },
  { id: 'paymaya', label: 'Maya', logo: require('../../assets/maya.png') },
  { id: 'card', label: 'Credit / Debit Card', logo: require('../../assets/card.png') },
];

const REFRESH_INTERVAL_MS = 8000;
const OPEN_STATUSES = new Set([
  'PENDING',
  'ACTIVE',
  'CREATING',
  'CREATE_UNKNOWN',
  'PROCESSING',
]);
const SETTLED_STATUSES = new Set(['PAID', 'DEMO_PAID']);

function firstId(value) {
  if (Array.isArray(value)) return value[0] || null;
  return value || null;
}

function money(value) {
  const number = Number(value);
  return `₱${(Number.isFinite(number) ? number : 0).toLocaleString('en-PH', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

function extractError(error, fallback) {
  const message = String(
    error?.errorMessage || error?.responseData?.errorMessage || error?.message || '',
  ).trim();
  if (error?.status === 404 && /route does not exist/i.test(message)) {
    return 'PayMongo checkout is not available on the deployed Web API. Please contact AutoCare.';
  }
  return message || fallback;
}

function isTrustedCheckoutUrl(url) {
  if (typeof url !== 'string') return false;
  try {
    const parsed = new URL(url);
    return parsed.protocol === 'https:' &&
      parsed.hostname === 'checkout.paymongo.com' &&
      parsed.username === '' && parsed.password === '';
  } catch {
    return false;
  }
}

async function openPayMongoCheckout(url) {
  if (!isTrustedCheckoutUrl(url)) {
    throw new Error('PayMongo did not provide a valid secure checkout link.');
  }
  await Linking.openURL(url);
}

function PaymentLogo({ item }) {
  return (
    <View className="h-12 w-20 items-center justify-center rounded-xl border border-[#e8ebf0] bg-white px-2">
      <Image
        source={item.logo}
        resizeMode="contain"
        style={{ width: 70, height: 34 }}
        accessibilityLabel={`${item.label} logo`}
      />
    </View>
  );
}

/**
 * AutoCare Mobile only creates and resumes genuine PayMongo Hosted Checkout
 * sessions through the authenticated AutoCare Web API. The mobile app never
 * creates, authorizes, or marks a payment paid on its own.
 *
 * In capstone mode the Web API can settle a PayMongo-verified sandbox
 * payment as a labeled demo transaction; no separate Mobile simulator exists.
 */
export default function HostedCheckoutMethods({
  billId: rawBillId,
  amount,
  onConfirmedPayment,
  returnFlag,
}) {
  const billId = firstId(rawBillId);
  const router = useRouter();
  const { theme } = useTheme();

  const [busy, setBusy] = useState(false);
  const [checking, setChecking] = useState(false);
  const [selected, setSelected] = useState(null);
  const [status, setStatus] = useState('NONE');
  const [activeMethod, setActiveMethod] = useState(null);
  const [checkoutUrl, setCheckoutUrl] = useState(null);
  const [settlementReady, setSettlementReady] = useState(null);
  const [error, setError] = useState('');

  const mountedRef = useRef(false);
  const checkingRef = useRef(false);
  const successShownRef = useRef(false);
  const activeAppRef = useRef(AppState.currentState);
  const requestSequenceRef = useRef(0);

  const showVerifiedSuccess = useCallback(() => {
    if (!billId || successShownRef.current || !mountedRef.current) return;
    successShownRef.current = true;
    // Update any parent Final Cost cache before showing the receipt screen.
    onConfirmedPayment?.();
    router.replace({
      pathname: '/payment-success',
      params: { billId: String(billId) },
    });
  }, [billId, onConfirmedPayment, router]);

  const refresh = useCallback(async () => {
    if (!billId || checkingRef.current || !mountedRef.current) return;
    checkingRef.current = true;
    const sequence = requestSequenceRef.current;
    setChecking(true);
    try {
      const response = await paymentsApi.getHostedCheckout(billId);
      const data = response?.data || {};
      if (!mountedRef.current || sequence !== requestSequenceRef.current) return;

      const nextStatus = String(data.status || 'NONE').toUpperCase();
      setStatus(nextStatus);
      setActiveMethod(data.paymentMethod || null);
      setCheckoutUrl(data.checkoutUrl || null);
      if (typeof data.settlementReady === 'boolean') {
        setSettlementReady(data.settlementReady);
      }
      setError('');

      // Only the authenticated server's PAID result authorizes navigation.
      // The success screen separately checks the persisted Final Cost + receipt.
      if (data.paid === true) showVerifiedSuccess();
    } catch (cause) {
      if (mountedRef.current && sequence === requestSequenceRef.current) {
        setError(extractError(cause, 'Unable to verify the payment status.'));
      }
    } finally {
      if (sequence === requestSequenceRef.current) checkingRef.current = false;
      if (mountedRef.current && sequence === requestSequenceRef.current) {
        setChecking(false);
      }
    }
  }, [billId, showVerifiedSuccess]);

  useEffect(() => {
    mountedRef.current = true;
    successShownRef.current = false;
    requestSequenceRef.current += 1;
    checkingRef.current = false;
    setStatus('NONE');
    setActiveMethod(null);
    setCheckoutUrl(null);
    setSettlementReady(null);
    setError('');
    void refresh();

    const subscription = AppState.addEventListener('change', nextState => {
      const wasAway = activeAppRef.current !== 'active';
      activeAppRef.current = nextState;
      if (nextState === 'active' && wasAway) {
        void refresh();
      }
    });

    return () => {
      mountedRef.current = false;
      requestSequenceRef.current += 1;
      subscription.remove();
    };
  }, [billId, refresh]);

  useEffect(() => {
    if (returnFlag && mountedRef.current) void refresh();
  }, [returnFlag, refresh]);

  // Webhooks can arrive after the browser redirects back to the app. Retain
  // a light polling fallback for open checkouts and sandbox reconciliation.
  useEffect(() => {
    if (!OPEN_STATUSES.has(status) && status !== 'SIMULATED') return undefined;
    const timer = setInterval(() => {
      if (AppState.currentState === 'active') void refresh();
    }, REFRESH_INTERVAL_MS);
    return () => clearInterval(timer);
  }, [status, refresh]);

  const chooseMethod = useCallback(async paymentMethod => {
    if (!billId || busy || checking || successShownRef.current) return;
    if (!METHODS.some(item => item.id === paymentMethod)) return;

    // Resume the existing session instead of issuing an overlapping request.
    if (OPEN_STATUSES.has(status)) {
      if (paymentMethod === activeMethod && checkoutUrl) {
        try {
          await openPayMongoCheckout(checkoutUrl);
        } catch (cause) {
          const message = extractError(cause, 'Unable to reopen PayMongo checkout.');
          setError(message);
          Alert.alert('Checkout unavailable', message);
        }
      }
      return;
    }

    // PayMongo has already confirmed a sandbox transaction. Never encourage
    // the customer to make a second checkout while settlement is pending.
    if (status === 'SIMULATED' || SETTLED_STATUSES.has(status)) {
      void refresh();
      return;
    }

    setBusy(true);
    setSelected(paymentMethod);
    setError('');
    try {
      // These methods map to ['gcash','paymaya','card'] on the Web API.
      // PayMongo generates the actual hosted checkout page in test or live mode
      // based on the server-side secret key. No Mobile-simulated authorization.
      const response = await paymentsApi.createHostedCheckout(billId, paymentMethod);
      const data = response?.data || {};
      if (!data.checkoutUrl || !isTrustedCheckoutUrl(data.checkoutUrl)) {
        throw new Error('PayMongo did not return a valid checkout link.');
      }
      if (!mountedRef.current) return;
      setStatus('PENDING');
      setActiveMethod(paymentMethod);
      setCheckoutUrl(data.checkoutUrl);
      await openPayMongoCheckout(data.checkoutUrl);
    } catch (cause) {
      const message = extractError(cause, 'Unable to start your PayMongo payment.');
      if (mountedRef.current) {
        setError(message);
        Alert.alert('Unable to start checkout', message);
      }
      void refresh();
    } finally {
      if (mountedRef.current) {
        setBusy(false);
        setSelected(null);
      }
    }
  }, [billId, busy, checking, status, activeMethod, checkoutUrl, refresh]);

  const cancelCurrentCheckout = useCallback(() => {
    if (busy || checking) return;
    Alert.alert(
      'Cancel PayMongo checkout?',
      'Only cancel if you have not completed the payment. AutoCare will ask PayMongo to expire the checkout before allowing a different method.',
      [
        { text: 'Keep checkout', style: 'cancel' },
        {
          text: 'Cancel checkout',
          style: 'destructive',
          onPress: async () => {
            setBusy(true);
            try {
              await paymentsApi.cancelHostedCheckout(billId);
              if (mountedRef.current) {
                setStatus('EXPIRED');
                setActiveMethod(null);
                setCheckoutUrl(null);
                setError('');
              }
            } catch (cause) {
              const message = extractError(cause, 'Unable to cancel the checkout.');
              if (mountedRef.current) Alert.alert('Could not cancel checkout', message);
            } finally {
              if (mountedRef.current) setBusy(false);
              void refresh();
            }
          },
        },
      ],
    );
  }, [billId, busy, checking, refresh]);

  const isOpen = OPEN_STATUSES.has(status);
  const awaitingSettlement = status === 'SIMULATED';
  const hasCompletedPayment = SETTLED_STATUSES.has(status);
  const locked = isOpen || awaitingSettlement || hasCompletedPayment;

  return (
    <View className="mb-4">
      <View className="mb-3 flex-row items-center justify-between px-1">
        <View className="flex-row items-center">
          <CreditCard color={theme.primary} size={18} />
          <Text className="ml-2 text-sm font-bold text-foreground">Pay Online</Text>
        </View>
        <View className="flex-row items-center">
          <ShieldCheck size={14} color="#16a34a" />
          <Text className="ml-1 text-xs text-muted-foreground">Secure checkout</Text>
        </View>
      </View>

      <View className="overflow-hidden rounded-2xl border border-border bg-card">
        <Text className="border-b border-border px-4 py-4 text-base font-bold text-foreground">
          Choose a payment method
        </Text>
        {METHODS.map((item, index) => {
          const active = isOpen && activeMethod === item.id && Boolean(checkoutUrl);
          const disabled = busy || checking || successShownRef.current ||
            awaitingSettlement || hasCompletedPayment || (isOpen && !active);
          return (
            <TouchableOpacity
              key={item.id}
              accessibilityRole="button"
              accessibilityLabel={`Pay ${money(amount)} using ${item.label}`}
              accessibilityHint={active ? 'Resume your PayMongo checkout' : 'Open PayMongo secure checkout'}
              activeOpacity={0.78}
              disabled={disabled}
              onPress={() => void chooseMethod(item.id)}
              className={`min-h-[80px] flex-row items-center px-4 ${index < METHODS.length - 1 ? 'border-b border-border' : ''}`}
              style={{ opacity: disabled && !active ? 0.55 : 1 }}
            >
              <PaymentLogo item={item} />
              <Text className="ml-3 flex-1 text-base font-semibold text-foreground">{item.label}</Text>
              {busy && selected === item.id
                ? <ActivityIndicator color={theme.primary} />
                : <ChevronRight color={theme.textSecondary} size={20} />}
            </TouchableOpacity>
          );
        })}
      </View>

      {isOpen && (
        <View className="mt-3 rounded-xl border border-border bg-card p-4">
          <View className="flex-row items-center">
            <ActivityIndicator size="small" color={theme.primary} />
            <Text className="ml-2 flex-1 text-sm font-semibold text-foreground">
              Waiting for PayMongo confirmation
            </Text>
          </View>
          <Text className="mt-2 text-xs leading-5 text-muted-foreground">
            Complete the checkout in your browser and return to AutoCare.
          </Text>
          <View className="mt-3 flex-row gap-2">
            {checkoutUrl && (
              <TouchableOpacity
                accessibilityRole="button"
                onPress={() => void openPayMongoCheckout(checkoutUrl).catch(cause => {
                  Alert.alert('Checkout unavailable', extractError(cause, 'Unable to open checkout.'));
                })}
                className="min-h-[44px] flex-1 items-center justify-center rounded-xl bg-primary"
              >
                <Text className="text-sm font-semibold text-white">Resume checkout</Text>
              </TouchableOpacity>
            )}
            {checkoutUrl && (
              <TouchableOpacity
                accessibilityRole="button"
                onPress={cancelCurrentCheckout}
                disabled={busy || checking}
                className="min-h-[44px] flex-1 items-center justify-center rounded-xl border border-border bg-card"
              >
                <Text className="text-sm font-semibold text-foreground">Cancel checkout</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      )}

      {awaitingSettlement && (
        <View className="mt-3 rounded-xl border border-amber-200 bg-amber-50 p-4">
          <Text className="text-sm font-bold text-amber-900">PayMongo payment verified</Text>
          <Text className="mt-1 text-xs leading-5 text-amber-800">
            {settlementReady === false
              ? 'The sandbox payment is confirmed, but this Final Cost is awaiting settlement in AutoCare. Please contact the project administrator.'
              : 'The PayMongo payment is confirmed. AutoCare is finalizing the Final Cost and receipt.'}
          </Text>
        </View>
      )}

      {status === 'CREATE_UNKNOWN' && (
        <View className="mt-3 rounded-xl border border-amber-200 bg-amber-50 p-4">
          <Text className="text-sm text-amber-900">
            PayMongo is reviewing the checkout request. Check the status before trying again.
          </Text>
        </View>
      )}

      {!!error && (
        <View className="mt-3 rounded-xl border border-red-200 bg-red-50 p-4">
          <Text className="text-sm text-red-800">{error}</Text>
        </View>
      )}

      <TouchableOpacity
        accessibilityRole="button"
        onPress={() => void refresh()}
        disabled={checking || busy}
        className="mt-2 min-h-[44px] flex-row items-center justify-center"
      >
        {checking ? <ActivityIndicator size="small" color={theme.primary} /> : <RotateCw size={16} color={theme.primary} />}
        <Text className="ml-2 text-sm font-semibold text-primary">
          {checking ? 'Checking payment...' : 'Check payment status'}
        </Text>
      </TouchableOpacity>
    </View>
  );
}
