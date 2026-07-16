// app/billing.jsx
import { View, Text, ScrollView, RefreshControl, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { useBillingData } from '../hooks/useBillingData';
import { EstimateListItem, FinalBillListItem } from '../components/billing/BillingListItem';

export default function BillingScreen() {
  const router = useRouter();
  const { theme } = useTheme();
  const { estimates, finalBills, loading, refreshing, onRefresh } = useBillingData();

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center" style={{ backgroundColor: theme.background }}>
        <ActivityIndicator size="large" color={theme.primary} />
      </View>
    );
  }

  const isEmpty = estimates.length === 0 && finalBills.length === 0;

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

        {isEmpty ? (
          <View className="items-center mt-12">
            <Ionicons name="document-text-outline" size={48} color={theme.textSecondary} />
            <Text className="mt-3 text-base font-bold" style={{ color: theme.textSecondary }}>
              No estimates or bills yet.
            </Text>
          </View>
        ) : (
          <>
            {/* Estimates Section */}
            {estimates.length > 0 && (
              <View className="mb-8">
                <View className="flex-row justify-between items-center mb-4">
                  <Text className="text-lg font-black" style={{ color: theme.text }}>
                    Estimates
                  </Text>
                  <View
                    className="px-3 py-0.5 rounded-full"
                    style={{ backgroundColor: theme.primary + '15' }}
                  >
                    <Text className="text-xs font-black" style={{ color: theme.primary }}>
                      {estimates.length}
                    </Text>
                  </View>
                </View>
                {estimates.map((item) => (
                  <EstimateListItem
                    key={item.id}
                    item={item}
                    onPress={() => router.push(`/tracking?appointmentId=${item.appointmentId}`)}
                  />
                ))}
              </View>
            )}

            {/* Final Bills Section */}
            {finalBills.length > 0 && (
              <View>
                <View className="flex-row justify-between items-center mb-4">
                  <Text className="text-lg font-black" style={{ color: theme.text }}>
                    Final Bills
                  </Text>
                  <View
                    className="px-3 py-0.5 rounded-full"
                    style={{ backgroundColor: theme.primary + '15' }}
                  >
                    <Text className="text-xs font-black" style={{ color: theme.primary }}>
                      {finalBills.length}
                    </Text>
                  </View>
                </View>
                {finalBills.map((item) => (
                  <FinalBillListItem
                    key={item.id}
                    item={item}
                    onPress={() => router.push(`/invoice/${item.id}`)}
                  />
                ))}
              </View>
            )}
          </>
        )}

        {/* Footer */}
        <Text className="text-[10px] text-center font-medium opacity-30 mt-12 leading-4" style={{ color: theme.text }}>
          All transactions are securely processed.{'\n'}
          Powered by AutoCare System.
        </Text>
      </View>
    </ScrollView>
  );
}