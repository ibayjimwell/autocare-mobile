import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import {
  ArrowRight,
  CheckCircle2,
  Clock3,
  ReceiptText,
  RefreshCw,
  ShieldCheck,
} from 'lucide-react-native';

import { useTheme } from '../context/ThemeContext';
import finalBillsApi from '../services/finalBillsApi';
import receiptApi from '../services/receiptApi';
import paymentsApi from '../services/paymentsApi';

const RETRY_DELAY_MS = 1700;
const MAX_CHECKS = 9;

function firstParam(value) {
  return Array.isArray(value) ? value[0] : value;
}

/**
 * A success_url redirect is NOT evidence that a payment settled.
 * This screen checks the Final Cost and persisted receipt from AutoCare's
 * authenticated backend. Only both together allow a success message.
 */
export default function PaymentSuccessScreen() {
  const params = useLocalSearchParams();
  const billId = firstParam(params.billId);
  const router = useRouter();
  const { theme } = useTheme();

  const [retryKey, setRetryKey] = useState(0);
  const [state, setState] = useState({ phase: 'checking', receipt: null, error: '' });

  useEffect(() => {
    let disposed = false;
    let timer = null;

    if (!billId || typeof billId !== 'string') {
      setState({ phase: 'error', receipt: null, error: 'Final Cost reference is missing.' });
      return () => { disposed = true; };
    }

    setState({ phase: 'checking', receipt: null, error: '' });

    const verify = async (attempt = 1) => {
      let lastError = '';

      try {
        // This endpoint can recover and finalize an earlier SIMULATED
        // PayMongo checkout once capstone settlement is enabled on the server.
        // A cash settlement or QR Ph payment may not have a hosted
        // checkout attempt; that is safe to ignore here.
        try {
          await paymentsApi.getHostedCheckout(billId);
        } catch (checkoutError) {
          lastError = checkoutError?.message || '';
        }

        const billResult = await finalBillsApi.getById(billId);
        const finalCost = billResult?.data ?? billResult;

        if (finalCost?.status === 'PAID') {
          const receiptResult = await receiptApi.getByFinalBill(billId);
          const receipt = receiptResult?.data ?? receiptResult;
          if (receipt?.referenceNumber && receipt?.details?.payment) {
            if (!disposed) setState({ phase: 'success', receipt, error: '' });
            return;
          }
          lastError = 'The payment was completed, but the receipt is not yet available.';
        } else {
          lastError = 'The payment has not yet been finalized in AutoCare.';
        }
      } catch (error) {
        lastError = error?.message || 'Unable to verify the payment right now.';
      }

      if (disposed) return;
      if (attempt < MAX_CHECKS) {
        timer = setTimeout(() => { void verify(attempt + 1); }, RETRY_DELAY_MS);
      } else {
        setState({
          phase: 'error',
          receipt: null,
          error: `${lastError} You can refresh your payment status or return to Final Cost.`,
        });
      }
    };

    void verify();
    return () => {
      disposed = true;
      if (timer) clearTimeout(timer);
    };
  }, [billId, retryKey]);

  const openFinalCost = () => {
    if (billId) router.replace(`/invoice/${encodeURIComponent(billId)}`);
    else router.replace('/billing');
  };

  const isSuccess = state.phase === 'success';
  const isChecking = state.phase === 'checking';
  const isDemo = state.receipt?.details?.payment?.simulated === true;
  const payment = state.receipt?.details?.payment || {};

  return (
    <SafeAreaView className="flex-1 bg-background" style={{ backgroundColor: theme.background }}>
      <View className="flex-1 justify-center px-4">
        <View className="items-center rounded-3xl border border-border bg-card p-6">
          <View className="mb-5 h-20 w-20 items-center justify-center rounded-full bg-primary/10">
            {isChecking ? (
              <ActivityIndicator size="large" color={theme.primary} />
            ) : isSuccess ? (
              <CheckCircle2 size={52} color="#16A34A" strokeWidth={2.1} />
            ) : (
              <Clock3 size={48} color={theme.primary} strokeWidth={1.9} />
            )}
          </View>

          <Text className="text-center text-2xl font-bold" style={{ color: theme.text }}>
            {isSuccess ? 'Payment Successful' : isChecking ? 'Verifying Your Payment' : 'Payment Verification Pending'}
          </Text>

          <Text className="mt-3 text-center text-sm leading-6" style={{ color: theme.textSecondary }}>
            {isSuccess
              ? 'Your Final Cost is marked PAID, and your receipt is ready.'
              : isChecking
                ? 'AutoCare is confirming the payment and preparing your receipt.'
                : state.error}
          </Text>

          {isSuccess && (
            <>
              {isDemo && (
                <View className="mt-5 w-full rounded-xl border border-amber-200 bg-amber-50 p-3">
                  <Text className="text-center text-xs font-semibold leading-5 text-amber-900">
                    CAPSTONE DEMONSTRATION — NO REAL FUNDS COLLECTED
                  </Text>
                </View>
              )}

              <View className="mt-5 w-full flex-row items-center rounded-2xl bg-background p-4">
                <View className="mr-3 h-11 w-11 items-center justify-center rounded-xl bg-primary/10">
                  <ReceiptText size={20} color={theme.primary} />
                </View>
                <View className="flex-1">
                  <Text className="text-xs" style={{ color: theme.textSecondary }}>Receipt number</Text>
                  <Text className="mt-1 text-sm font-semibold" style={{ color: theme.text }} selectable>
                    {state.receipt.referenceNumber}
                  </Text>
                  {!!payment.reference && (
                    <Text className="mt-2 text-xs" style={{ color: theme.textSecondary }} selectable>
                      Payment ref: {payment.reference}
                    </Text>
                  )}
                </View>
                <ShieldCheck size={19} color="#16A34A" />
              </View>

              <TouchableOpacity
                accessibilityRole="button"
                onPress={() => router.replace(`/receipt/${encodeURIComponent(billId)}`)}
                className="mt-6 min-h-[52px] w-full flex-row items-center justify-center rounded-xl bg-primary"
                activeOpacity={0.8}
              >
                <ReceiptText size={19} color="#FFFFFF" />
                <Text className="ml-2 text-base font-semibold text-white">View Receipt</Text>
                <ArrowRight size={18} color="#FFFFFF" style={{ marginLeft: 8 }} />
              </TouchableOpacity>
            </>
          )}

          {!isSuccess && !isChecking && (
            <TouchableOpacity
              accessibilityRole="button"
              onPress={() => setRetryKey(value => value + 1)}
              className="mt-6 min-h-[52px] w-full flex-row items-center justify-center rounded-xl bg-primary"
              activeOpacity={0.8}
            >
              <RefreshCw color="#FFFFFF" size={18} />
              <Text className="ml-2 text-base font-semibold text-white">Check Payment Again</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            accessibilityRole="button"
            onPress={openFinalCost}
            className="mt-2 min-h-[48px] w-full items-center justify-center rounded-xl"
          >
            <Text className="text-sm font-semibold" style={{ color: theme.primary }}>
              View Final Cost
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            accessibilityRole="button"
            onPress={() => router.replace('/billing')}
            className="min-h-[44px] w-full items-center justify-center"
          >
            <Text className="text-sm" style={{ color: theme.textSecondary }}>Go to Billing List</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}
