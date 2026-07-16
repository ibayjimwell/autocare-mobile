// app/payment-success.jsx
import { View, Text, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';

export default function PaymentSuccessScreen() {
  const { billId } = useLocalSearchParams(); // from deep link
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
    <View className="flex-1 justify-center items-center px-8" style={{ backgroundColor: theme.background }}>
      {/* Success Icon */}
      <View className="w-24 h-24 rounded-full items-center justify-center mb-6" style={{ backgroundColor: '#10b98120' }}>
        <Ionicons name="checkmark-circle" size={64} color="#10b981" />
      </View>

      <Text className="text-2xl font-black mb-2" style={{ color: theme.text }}>
        Payment Successful!
      </Text>
      <Text className="text-sm text-center opacity-60 mb-8 leading-5" style={{ color: theme.textSecondary }}>
        Your payment has been processed.{'\n'}A receipt will be generated shortly.
      </Text>

      <TouchableOpacity
        onPress={handleBackToInvoice}
        className="py-4 px-8 rounded-2xl"
        style={{ backgroundColor: theme.primary }}
      >
        <Text className="text-base font-bold text-white">
          {billId ? 'View Invoice' : 'Back to Billing'}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={() => router.replace('/billing')}
        className="mt-4"
      >
        <Text className="text-sm font-medium opacity-50" style={{ color: theme.textSecondary }}>
          Go to Billing List
        </Text>
      </TouchableOpacity>
    </View>
  );
}