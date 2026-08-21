import { View, Text, TouchableOpacity, ActivityIndicator, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import {
  QrCode,
  CheckCircle2,
  ArrowRight,
  X,
  Banknote,
} from 'lucide-react-native';
import QRCode from 'react-native-qrcode-svg';

import { useTheme } from '../../context/ThemeContext';
import { useCashPaymentStatus } from '../../hooks/useCashPaymentStatus';

export default function CashQRScreen() {
  const { billId } = useLocalSearchParams();
  const router = useRouter();
  const { theme } = useTheme();
  const { isPaid, loading } = useCashPaymentStatus(billId);

  if (isPaid) {
    return (
      <SafeAreaView
        className="flex-1 bg-background"
        style={{ backgroundColor: theme.background }}
      >
        <View className="flex-1 justify-center px-4">
          <View className="bg-card rounded-3xl p-6 border border-border items-center">
            <View className="w-20 h-20 rounded-full bg-primary/10 items-center justify-center mb-5">
              <CheckCircle2 size={52} color={theme.primary} strokeWidth={2.1} />
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
              Your cash payment has been confirmed and your invoice is now paid.
            </Text>

            <TouchableOpacity
              onPress={() => router.replace(`/invoice/${billId}`)}
              className="w-full min-h-[52px] rounded-xl bg-primary items-center justify-center mt-7 flex-row"
              activeOpacity={0.8}
            >
              <Text className="text-base font-semibold text-white">
                View Invoice
              </Text>

              <ArrowRight size={18} color="#FFFFFF" className="ml-2" />
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => router.replace('/billing')}
              className="min-h-[44px] items-center justify-center mt-2 px-4"
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

  return (
    <SafeAreaView
      className="flex-1 bg-background"
      style={{ backgroundColor: theme.background }}
    >
      <View className="flex-1 px-4 pt-4">
        <View className="flex-row items-center mb-5">
          <TouchableOpacity
            onPress={() => router.back()}
            className="w-11 h-11 rounded-full bg-card border border-border items-center justify-center"
            activeOpacity={0.75}
          >
            <X size={20} color={theme.text} />
          </TouchableOpacity>

          <View className="flex-1 ml-3">
            <Text
              className="text-xl font-bold"
              style={{ color: theme.text }}
            >
              Cash Payment
            </Text>

            <Text
              className="text-sm mt-0.5"
              style={{ color: theme.textSecondary }}
            >
              Present this QR code to the cashier.
            </Text>
          </View>
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 24 }}
        >
          <View className="bg-card rounded-3xl p-5 border border-border items-center">
            <View className="w-14 h-14 rounded-full bg-primary/10 items-center justify-center mb-4">
              <QrCode size={28} color={theme.primary} />
            </View>

            <Text
              className="text-xl font-bold text-center"
              style={{ color: theme.text }}
            >
              Show to Cashier
            </Text>

            <Text
              className="text-sm text-center mt-2 leading-5"
              style={{ color: theme.textSecondary }}
            >
              Let the cashier scan this QR code or manually enter the ID below.
            </Text>

            <View className="mt-6 p-5 bg-white rounded-2xl border border-border">
              <QRCode value={billId} size={200} />
            </View>

            <View className="w-full rounded-xl bg-background mt-5 px-4 py-3">
              <Text
                className="text-xs font-semibold uppercase tracking-[1.2px]"
                style={{ color: theme.textSecondary }}
              >
                Bill ID
              </Text>

              <Text
                className="text-sm font-semibold mt-1"
                style={{ color: theme.text }}
                selectable
              >
                {billId}
              </Text>
            </View>

            <Text
              className="text-xs mt-2"
              style={{ color: theme.textSecondary }}
            >
              Reference {billId?.slice(0, 8).toUpperCase()}
            </Text>
          </View>

          <View className="bg-card rounded-2xl border border-border mt-4 p-4">
            <View className="flex-row items-center">
              <View className="w-10 h-10 rounded-xl bg-primary/10 items-center justify-center mr-3">
                <Banknote size={19} color={theme.primary} />
              </View>

              <View className="flex-1">
                <Text
                  className="text-sm font-semibold"
                  style={{ color: theme.text }}
                >
                  Waiting for payment confirmation
                </Text>

                <Text
                  className="text-xs mt-1 leading-4"
                  style={{ color: theme.textSecondary }}
                >
                  This screen will update automatically once the cashier confirms the payment.
                </Text>
              </View>

              {loading ? (
                <ActivityIndicator size="small" color={theme.primary} />
              ) : null}
            </View>
          </View>

          <TouchableOpacity
            onPress={() => router.back()}
            className="min-h-[44px] items-center justify-center mt-3"
            activeOpacity={0.7}
          >
            <Text
              className="text-sm font-medium"
              style={{ color: theme.textSecondary }}
            >
              Cancel
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}