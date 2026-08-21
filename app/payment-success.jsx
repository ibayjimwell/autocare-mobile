import { View, Text, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import {
  CheckCircle2,
  ArrowRight,
  ReceiptText,
} from 'lucide-react-native';

import { useTheme } from '../context/ThemeContext';

export default function PaymentSuccessScreen() {
  const { billId } = useLocalSearchParams();
  const router = useRouter();
  const { theme } = useTheme();

  const handleBackToInvoice = () => {
    if (billId) {
      router.replace(`/invoice/${billId}`);
    } else {
      router.replace('/billing');
    }
  };

  return (
    <SafeAreaView
      className="flex-1 bg-background"
      style={{ backgroundColor: theme.background }}
    >
      <View className="flex-1 justify-center px-4">
        <View className="bg-card rounded-3xl p-6 border border-border items-center">
          <View className="w-20 h-20 rounded-full bg-primary/10 items-center justify-center mb-5">
            <CheckCircle2
              size={52}
              color={theme.primary}
              strokeWidth={2.1}
            />
          </View>

          <Text
            className="text-2xl font-bold text-center"
            style={{ color: theme.text }}
          >
            Payment Successful
          </Text>

          <Text
            className="text-sm text-center mt-2 leading-5"
            style={{ color: theme.textSecondary }}
          >
            Your payment has been processed.
            {'\n'}
            A receipt will be generated shortly.
          </Text>

          <View className="w-full rounded-2xl bg-background p-4 mt-6 flex-row items-center">
            <View className="w-10 h-10 rounded-xl bg-primary/10 items-center justify-center mr-3">
              <ReceiptText size={18} color={theme.primary} />
            </View>

            <View className="flex-1">
              <Text
                className="text-xs"
                style={{ color: theme.textSecondary }}
              >
                Payment reference
              </Text>

              <Text
                className="text-sm font-semibold mt-0.5"
                style={{ color: theme.text }}
              >
                {billId ? billId.slice(0, 8).toUpperCase() : 'AutoCare'}
              </Text>
            </View>
          </View>

          <TouchableOpacity
            onPress={handleBackToInvoice}
            className="w-full min-h-[52px] rounded-xl bg-primary items-center justify-center mt-6 flex-row"
            activeOpacity={0.8}
          >
            <Text className="text-base font-semibold text-white">
              {billId ? 'View Invoice' : 'Back to Billing'}
            </Text>

            <ArrowRight size={18} color="#FFFFFF" className="ml-2" />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => router.replace('/billing')}
            className="min-h-[44px] px-4 items-center justify-center mt-2"
            activeOpacity={0.7}
          >
            <Text
              className="text-sm font-medium"
              style={{ color: theme.textSecondary }}
            >
              Go to Billing List
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}