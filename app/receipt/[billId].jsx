// app/receipt/[billId].jsx
import { View, Text, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import { useReceipt } from '../../hooks/useReceipt';
import ReceiptContent from '../../components/receipt/ReceiptContent';

export default function ReceiptScreen() {
  const { billId } = useLocalSearchParams(); // /receipt/123-456
  const router = useRouter();
  const { theme } = useTheme();
  const { receipt, loading, error } = useReceipt(billId);

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center" style={{ backgroundColor: theme.background }}>
        <ActivityIndicator size="large" color={theme.primary} />
      </View>
    );
  }

  if (error || !receipt) {
    return (
      <View className="flex-1 justify-center items-center px-6" style={{ backgroundColor: theme.background }}>
        <Ionicons name="alert-circle-outline" size={60} color={theme.textSecondary} />
        <Text className="mt-4 text-base font-bold" style={{ color: theme.text }}>
          {error || 'Receipt not found'}
        </Text>
      </View>
    );
  }

  return (
    <View className="flex-1" style={{ backgroundColor: theme.background }}>
      <ReceiptContent receipt={receipt} />
    </View>
  );
}