import {
  View,
  Text,
  ScrollView,
  RefreshControl,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import {
  WalletCards,
  ChevronRight,
  FileText,
  ReceiptText,
  CircleCheck,
  Clock3,
} from 'lucide-react-native';

import { useTheme } from '../context/ThemeContext';
import { useBillingData } from '../hooks/useBillingData';
import EstimateCard from '../components/billing/EstimateCard';
import FinalBillCard from '../components/billing/FinalBillCard';

export default function BillingScreen() {
  const router = useRouter();
  const { theme } = useTheme();
  const { estimates, finalBills, loading, refreshing, onRefresh } = useBillingData();

  // Filter: WAITING_FOR_APPROVAL only, sorted oldest first
  const waitingEstimates = estimates
    .filter(e => e.status === 'WAITING_FOR_APPROVAL')
    .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));

  // Filter: OFFICIAL final bills (ready to pay)
  const officialBills = finalBills
    .filter(b => b.status === 'OFFICIAL')
    .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));

  // Filter: PAID final bills (history)
  const paidBills = finalBills
    .filter(b => b.status === 'PAID')
    .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));

  if (loading) {
    return (
      <SafeAreaView
        className="flex-1 bg-background items-center justify-center"
        style={{ backgroundColor: theme.background }}
      >
        <ActivityIndicator size="large" color={theme.primary} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      className="flex-1 bg-background"
      style={{ backgroundColor: theme.background }}
      edges={['top']}
    >
      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 32 }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={theme.primary}
            colors={[theme.primary]}
          />
        }
      >
        <View className="px-4 pt-5">
          {/* Header */}
          <View className="mb-6">
            <View className="flex-row items-center mb-2">
              <View className="w-8 h-8 rounded-full bg-primary/10 items-center justify-center mr-2">
                <WalletCards size={17} color={theme.primary} strokeWidth={2.25} />
              </View>

              <Text
                className="text-sm font-semibold tracking-[1.4px] uppercase"
                style={{ color: theme.primary }}
              >
                Billing & Payments
              </Text>
            </View>

            <Text
              className="text-3xl font-bold tracking-tight"
              style={{ color: theme.text }}
            >
              Your Documents
            </Text>

            <Text
              className="text-sm mt-1 leading-5"
              style={{ color: theme.textSecondary }}
            >
              Review estimates, invoices, and completed payments.
            </Text>
          </View>

          {/* Summary card */}
          <View className="bg-card rounded-2xl p-5 mb-7 border border-border">
            <View className="flex-row items-center justify-between mb-5">
              <View>
                <Text
                  className="text-xs font-semibold uppercase tracking-[1.4px]"
                  style={{ color: theme.textSecondary }}
                >
                  Payment overview
                </Text>

                <Text
                  className="text-xl font-bold mt-1"
                  style={{ color: theme.text }}
                >
                  Stay up to date
                </Text>
              </View>

              <View className="w-11 h-11 rounded-full bg-primary/10 items-center justify-center">
                <ReceiptText size={21} color={theme.primary} strokeWidth={2.1} />
              </View>
            </View>

            <View className="flex-row">
              <View className="flex-1 pr-2">
                <View className="rounded-xl bg-background p-3">
                  <View className="flex-row items-center mb-2">
                    <Clock3 size={15} color={theme.primary} />
                    <Text
                      className="text-xs font-medium ml-1.5"
                      style={{ color: theme.textSecondary }}
                    >
                      Awaiting
                    </Text>
                  </View>

                  <Text
                    className="text-2xl font-bold"
                    style={{ color: theme.text }}
                  >
                    {waitingEstimates.length}
                  </Text>
                </View>
              </View>

              <View className="flex-1 px-1">
                <View className="rounded-xl bg-background p-3">
                  <View className="flex-row items-center mb-2">
                    <FileText size={15} color={theme.primary} />
                    <Text
                      className="text-xs font-medium ml-1.5"
                      style={{ color: theme.textSecondary }}
                    >
                      Ready
                    </Text>
                  </View>

                  <Text
                    className="text-2xl font-bold"
                    style={{ color: theme.text }}
                  >
                    {officialBills.length}
                  </Text>
                </View>
              </View>

              <View className="flex-1 pl-2">
                <View className="rounded-xl bg-background p-3">
                  <View className="flex-row items-center mb-2">
                    <CircleCheck size={15} color="#34A853" />
                    <Text
                      className="text-xs font-medium ml-1.5"
                      style={{ color: theme.textSecondary }}
                    >
                      Paid
                    </Text>
                  </View>

                  <Text
                    className="text-2xl font-bold"
                    style={{ color: theme.text }}
                  >
                    {paidBills.length}
                  </Text>
                </View>
              </View>
            </View>
          </View>

          {/* Estimates */}
          <View className="mb-7">
            <View className="flex-row items-end justify-between mb-3">
              <View className="flex-1 pr-4">
                <Text
                  className="text-lg font-semibold"
                  style={{ color: theme.text }}
                >
                  Estimates Awaiting Approval
                </Text>

                <Text
                  className="text-sm mt-0.5"
                  style={{ color: theme.textSecondary }}
                >
                  Review the latest proposed work.
                </Text>
              </View>

              <TouchableOpacity
                onPress={() => router.push('/estimates')}
                className="min-h-[44px] justify-center pl-2"
                activeOpacity={0.7}
              >
                <Text
                  className="text-sm font-semibold"
                  style={{ color: theme.primary }}
                >
                  View All
                </Text>
              </TouchableOpacity>
            </View>

            {waitingEstimates.length === 0 ? (
              <View className="bg-card rounded-xl p-6 border border-border items-center">
                <View className="w-12 h-12 rounded-full bg-primary/10 items-center justify-center mb-3">
                  <FileText size={22} color={theme.primary} />
                </View>

                <Text
                  className="text-base font-semibold text-center"
                  style={{ color: theme.text }}
                >
                  Nothing to approve
                </Text>

                <Text
                  className="text-sm text-center mt-1 leading-5"
                  style={{ color: theme.textSecondary }}
                >
                  New estimates will appear here when your service advisor sends one.
                </Text>
              </View>
            ) : (
              waitingEstimates.slice(0, 3).map(item => (
                <EstimateCard
                  key={item.id}
                  item={item}
                  onPress={() =>
                    router.push(`/tracking?appointmentId=${item.appointmentId}`)
                  }
                />
              ))
            )}
          </View>

          {/* Official final bills */}
          <View className="mb-7">
            <View className="flex-row items-end justify-between mb-3">
              <View className="flex-1 pr-4">
                <Text
                  className="text-lg font-semibold"
                  style={{ color: theme.text }}
                >
                  Ready for Payment
                </Text>

                <Text
                  className="text-sm mt-0.5"
                  style={{ color: theme.textSecondary }}
                >
                  Official invoices that can be settled now.
                </Text>
              </View>

              <TouchableOpacity
                onPress={() => router.push('/final-bills')}
                className="min-h-[44px] justify-center pl-2"
                activeOpacity={0.7}
              >
                <Text
                  className="text-sm font-semibold"
                  style={{ color: theme.primary }}
                >
                  View All
                </Text>
              </TouchableOpacity>
            </View>

            {officialBills.length === 0 ? (
              <View className="bg-card rounded-xl p-6 border border-border items-center">
                <View className="w-12 h-12 rounded-full bg-primary/10 items-center justify-center mb-3">
                  <ReceiptText size={22} color={theme.primary} />
                </View>

                <Text
                  className="text-base font-semibold text-center"
                  style={{ color: theme.text }}
                >
                  No payment due
                </Text>

                <Text
                  className="text-sm text-center mt-1 leading-5"
                  style={{ color: theme.textSecondary }}
                >
                  Official invoices will appear here when they are ready.
                </Text>
              </View>
            ) : (
              officialBills.slice(0, 3).map(item => (
                <FinalBillCard
                  key={item.id}
                  item={item}
                  onPress={() => router.push(`/invoice/${item.id}`)}
                />
              ))
            )}
          </View>

          {/* Payment history */}
          <View>
            <View className="flex-row items-end justify-between mb-3">
              <View className="flex-1 pr-4">
                <Text
                  className="text-lg font-semibold"
                  style={{ color: theme.text }}
                >
                  Payment History
                </Text>

                <Text
                  className="text-sm mt-0.5"
                  style={{ color: theme.textSecondary }}
                >
                  Completed transactions and receipts.
                </Text>
              </View>

              <TouchableOpacity
                onPress={() => router.push('/final-bills')}
                className="min-h-[44px] justify-center pl-2"
                activeOpacity={0.7}
              >
                <Text
                  className="text-sm font-semibold"
                  style={{ color: theme.primary }}
                >
                  View All
                </Text>
              </TouchableOpacity>
            </View>

            {paidBills.length === 0 ? (
              <View className="bg-card rounded-xl p-6 border border-border items-center">
                <View className="w-12 h-12 rounded-full bg-primary/10 items-center justify-center mb-3">
                  <CircleCheck size={22} color={theme.primary} />
                </View>

                <Text
                  className="text-base font-semibold text-center"
                  style={{ color: theme.text }}
                >
                  No payments yet
                </Text>

                <Text
                  className="text-sm text-center mt-1 leading-5"
                  style={{ color: theme.textSecondary }}
                >
                  Completed payments will appear in this section.
                </Text>
              </View>
            ) : (
              paidBills.slice(0, 3).map(item => (
                <FinalBillCard
                  key={item.id}
                  item={item}
                  onPress={() => router.push(`/invoice/${item.id}`)}
                />
              ))
            )}
          </View>

          <View className="items-center mt-8 mb-2">
            <Text
              className="text-xs text-center leading-5"
              style={{ color: theme.textSecondary, opacity: 0.55 }}
            >
              All transactions are securely processed.
              {'\n'}
              Powered by AutoCare System.
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}