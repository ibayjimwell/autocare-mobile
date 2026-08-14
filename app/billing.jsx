import { View, Text, ScrollView, RefreshControl, ActivityIndicator, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
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
      <View className="flex-1 justify-center items-center" style={{ backgroundColor: theme.background }}>
        <ActivityIndicator size="large" color={theme.primary} />
      </View>
    );
  }

  return (
    <ScrollView
      className="flex-1"
      style={{ backgroundColor: theme.surface }}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[theme.primary]} />
      }
    >
      <View className="px-6 pt-12 pb-20">
        {/* Header */}
        <View className="mb-8">
          <View className="flex-row items-center mb-1">
            <Ionicons name="wallet-outline" size={18} color={theme.primary} />
            <Text className="text-[10px] font-black uppercase tracking-[2px] ml-1" style={{ color: theme.primary }}>
              Billing & Payments
            </Text>
          </View>
          <Text className="text-3xl font-black" style={{ color: theme.text }}>
            Your <Text style={{ color: theme.primary }}>Documents</Text>
          </Text>
        </View>

        {/* Estimates Section */}
        <View className="mb-8">
          <View className="flex-row justify-between items-center mb-4">
            <Text className="text-lg font-black" style={{ color: theme.text }}>
              Estimates Awaiting Approval
            </Text>
            <TouchableOpacity onPress={() => router.push('/estimates')}>
              <Text className="text-xs font-bold uppercase tracking-wider text-primary">View All</Text>
            </TouchableOpacity>
          </View>
          {waitingEstimates.length === 0 ? (
            <View className="p-6 rounded-2xl items-center border border-dashed border-border" style={{ borderColor: theme.border }}>
              <Text className="text-sm font-bold" style={{ color: theme.textSecondary }}>No estimates waiting for approval.</Text>
            </View>
          ) : (
            waitingEstimates.slice(0, 3).map(item => (
              <EstimateCard
                key={item.id}
                item={item}
                onPress={() => router.push(`/tracking?appointmentId=${item.appointmentId}`)}
              />
            ))
          )}
        </View>

        {/* Official Final Bills Section */}
        <View className="mb-8">
          <View className="flex-row justify-between items-center mb-4">
            <Text className="text-lg font-black" style={{ color: theme.text }}>
              Ready for Payment
            </Text>
            <TouchableOpacity onPress={() => router.push('/final-bills')}>
              <Text className="text-xs font-bold uppercase tracking-wider text-primary">View All</Text>
            </TouchableOpacity>
          </View>
          {officialBills.length === 0 ? (
            <View className="p-6 rounded-2xl items-center border border-dashed border-border" style={{ borderColor: theme.border }}>
              <Text className="text-sm font-bold" style={{ color: theme.textSecondary }}>No official bills ready for payment.</Text>
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

        {/* Paid Final Bills Section */}
        <View>
          <View className="flex-row justify-between items-center mb-4">
            <Text className="text-lg font-black" style={{ color: theme.text }}>
              Payment History
            </Text>
            <TouchableOpacity onPress={() => router.push('/final-bills')}>
              <Text className="text-xs font-bold uppercase tracking-wider text-primary">View All</Text>
            </TouchableOpacity>
          </View>
          {paidBills.length === 0 ? (
            <View className="p-6 rounded-2xl items-center border border-dashed border-border" style={{ borderColor: theme.border }}>
              <Text className="text-sm font-bold" style={{ color: theme.textSecondary }}>No paid bills yet.</Text>
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

        <Text className="text-[10px] text-center font-medium opacity-30 mt-12 leading-4" style={{ color: theme.text }}>
          All transactions are securely processed.{'\n'}
          Powered by AutoCare System.
        </Text>
      </View>
    </ScrollView>
  );
}