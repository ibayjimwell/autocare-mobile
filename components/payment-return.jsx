import { useEffect, useRef, useState, } from 'react';
import { View, Text, ActivityIndicator, } from 'react-native';
import { useLocalSearchParams, useRouter, } from 'expo-router';
import { CheckCircle2, AlertCircle, } from 'lucide-react-native';
import { useTheme, } from '../context/ThemeContext';
import paymentsApi from '../services/paymentsApi';
function normalizeParam(value) {
    if (Array.isArray(value)) {
        return value[0] ?? null;
    }
    return value ?? null;
}
function extractPaid(response) {
    const data = response?.data ?? response;
    if (data?.data &&
        typeof data.data ===
            'object') {
        return data.data?.paid === true;
    }
    return data?.paid === true;
}
export default function PaymentReturnScreen() {
    const router = useRouter();
    const { theme } = useTheme();
    const params = useLocalSearchParams();
    const billId = normalizeParam(params?.billId);
    const paymentIntentId = normalizeParam(params?.paymentIntentId);
    const handledRef = useRef(false);
    const [message, setMessage] = useState('Verifying your payment…');
    const [failed, setFailed] = useState(false);
    useEffect(() => {
        if (handledRef.current) {
            return;
        }
        handledRef.current =
            true;
        const verify = async () => {
            if (!billId ||
                !paymentIntentId) {
                setFailed(true);
                setMessage('The payment return information was incomplete.');
                return;
            }
            try {
                const response = await paymentsApi.verifyPayment(billId, paymentIntentId);
                const paid = extractPaid(response);
                if (paid) {
                    setMessage('Payment verified successfully.');
                    setFailed(false);
                    setTimeout(() => {
                        router.replace(`/invoice/${billId}?payment=success`);
                    }, 650);
                    return;
                }
                setFailed(false);
                setMessage('Payment is not confirmed yet. Returning to your Final Invoice…');
                setTimeout(() => {
                    router.replace(`/invoice/${billId}?payment=pending`);
                }, 900);
            }
            catch (error) {
                console.error('[PaymentReturn] Verification failed:', error);
                setFailed(true);
                setMessage(error?.message ||
                    'We could not verify the payment yet. Returning to the invoice…');
                setTimeout(() => {
                    router.replace(`/invoice/${billId}?payment=verify-failed`);
                }, 1300);
            }
        };
        verify();
    }, [
        billId,
        paymentIntentId,
        router,
    ]);
    return (<View className="flex-1 bg-background items-center justify-center px-6" style={{
            backgroundColor: theme.background,
        }}>
      <View className="w-full bg-card rounded-3xl border border-border p-6 items-center">
        <View className="w-20 h-20 rounded-full bg-primary/10 items-center justify-center">
          {failed ? (<AlertCircle size={45} color={theme.primary}/>) : message.includes('successfully') ? (<CheckCircle2 size={45} color={theme.primary}/>) : (<ActivityIndicator size="large" color={theme.primary}/>)}
        </View>

        <Text className="text-xl font-bold text-center mt-5" style={{
            color: theme.text,
        }}>
          {failed
            ? 'Payment Verification'
            : 'Payment Processing'}
        </Text>

        <Text className="text-sm text-center leading-5 mt-2" style={{
            color: theme.textSecondary,
        }}>
          {message}
        </Text>
      </View>
    </View>);
}
