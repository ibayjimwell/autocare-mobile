// app/cash-qr/[billId].jsx
import { View, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import QRCode from 'react-native-qrcode-svg';
import { useTheme } from '../../context/ThemeContext';
import { useCashPaymentStatus } from '../../hooks/useCashPaymentStatus';

export default function CashQRScreen() {
  const { billId } = useLocalSearchParams(); // dynamic route param
  const router = useRouter();
  const { theme } = useTheme();
  const { isPaid, loading } = useCashPaymentStatus(billId);

  // When payment is confirmed, navigate to success
  if (isPaid) {
    return (
      <View className="flex-1 justify-center items-center px-8" style={{ backgroundColor: theme.background }}>
        <View className="w-24 h-24 rounded-full items-center justify-center mb-6" style={{ backgroundColor: '#10b98120' }}>
          <Ionicons name="checkmark-circle" size={64} color="#10b981" />
        </View>
        <Text className="text-2xl font-black mb-2" style={{ color: theme.text }}>
          Payment Successful!
        </Text>
        <Text className="text-sm text-center opacity-60 mb-8 leading-5" style={{ color: theme.textSecondary }}>
          Your payment has been processed.
        </Text>
        <TouchableOpacity
          onPress={() => router.replace(`/invoice/${billId}`)}
          className="py-4 px-8 rounded-2xl mb-3"
          style={{ backgroundColor: theme.primary }}
        >
          <Text className="text-base font-bold text-white">View Invoice</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => router.replace('/billing')}
          className="py-2 px-4"
        >
          <Text className="text-sm font-medium opacity-50" style={{ color: theme.textSecondary }}>
            Go to Billing List
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Show QR and waiting state
  return (
    <View className="flex-1 justify-center items-center px-8" style={{ backgroundColor: theme.background }}>
      <View className="w-24 h-24 rounded-full items-center justify-center mb-6" style={{ backgroundColor: theme.primary + '10' }}>
        <MaterialCommunityIcons name="qrcode-scan" size={48} color={theme.primary} />
      </View>
      <Text className="text-2xl font-black mb-2 text-center" style={{ color: theme.text }}>
        Show to Cashier
      </Text>
      <Text className="text-sm text-center opacity-60 mb-8 leading-5" style={{ color: theme.textSecondary }}>
        Let the cashier scan this QR code or manually enter the ID below.
      </Text>

      {/* QR Code */}
      <View className="p-4 bg-white rounded-2xl mb-6 shadow-lg">
        <QRCode value={billId} size={200} />
      </View>

      {/* Bill ID Text */}
      <Text className="text-base font-mono font-bold mb-2" style={{ color: theme.text }}>
        Bill ID: {billId}
      </Text>
      <Text className="text-xs opacity-40 mb-8" style={{ color: theme.textSecondary }}>
        {billId?.slice(0, 8).toUpperCase()}
      </Text>

      {/* Loading spinner while polling */}
      <View className="flex-row items-center mb-4">
        <ActivityIndicator size="small" color={theme.primary} />
        <Text className="ml-2 text-sm font-medium" style={{ color: theme.textSecondary }}>
          Waiting for payment...
        </Text>
      </View>

      <TouchableOpacity
        onPress={() => router.back()}
        className="py-2 px-4"
      >
        <Text className="text-sm font-medium opacity-50" style={{ color: theme.textSecondary }}>
          Cancel
        </Text>
      </TouchableOpacity>
    </View>
  );
}