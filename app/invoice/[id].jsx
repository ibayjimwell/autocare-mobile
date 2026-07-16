// app/invoice/[id].jsx
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons, MaterialCommunityIcons, FontAwesome5 } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import { useInvoice } from '../../hooks/useInvoice';
import { usePaymentFlow } from '../../hooks/usePaymentFlow';

export default function InvoiceScreen() {
  const { id: billId } = useLocalSearchParams();
  const router = useRouter();
  const { theme } = useTheme();

  // Always call hooks in the same order
  const { invoice, loading, error } = useInvoice(billId);
  // Pass grandTotal from invoice – may be undefined during loading, but hook guards against it
  const { startPayment, paying, verifiedPaid, verifying } = usePaymentFlow(
    billId,
    invoice?.grandTotal
  );

  // Early returns after all hooks
  if (loading) {
    return (
      <View className="flex-1 justify-center items-center" style={{ backgroundColor: theme.background }}>
        <ActivityIndicator size="large" color={theme.primary} />
      </View>
    );
  }

  if (error || !invoice) {
    return (
      <View className="flex-1 justify-center items-center px-6" style={{ backgroundColor: theme.background }}>
        <Ionicons name="alert-circle-outline" size={60} color={theme.textSecondary} />
        <Text className="mt-4 text-base font-bold" style={{ color: theme.text }}>
          {error || 'Invoice not found'}
        </Text>
      </View>
    );
  }

  const {
    serviceSubtotal,
    findingsSubtotal,
    workTasksSubtotal,
    feesTotal,
    discountTotal,
    grandTotal,
    fees,
    discounts,
    workTasks,
    findings,
    status,
  } = invoice;

  const displayTotal = parseFloat(grandTotal) || 0;
  const isPaid = status === 'PAID' || verifiedPaid;

  const lineItems = [
    ...(fees?.map(f => ({ name: f.title, price: parseFloat(f.amount), description: 'Additional fee', icon: 'cash-plus' })) || []),
    ...(workTasks?.map(t => ({ name: t.title, price: 0, description: 'Work task', icon: 'wrench' })) || []),
    ...(findings?.map(f => ({ name: f.description, price: parseFloat(f.partsSubtotal || 0), description: 'Finding/Repair', icon: 'car-wrench' })) || []),
  ];

  // Success screen
  if (isPaid) {
    return (
      <View className="flex-1 justify-center items-center px-8" style={{ backgroundColor: theme.surface }}>
        <View className="w-24 h-24 rounded-full items-center justify-center mb-6" style={{ backgroundColor: '#10b98120' }}>
          <Ionicons name="checkmark-circle" size={64} color="#10b981" />
        </View>
        <Text className="text-2xl font-black mb-2" style={{ color: theme.text }}>
          Payment Successful!
        </Text>
        <Text className="text-sm text-center opacity-60 mb-8 leading-5" style={{ color: theme.textSecondary }}>
          Your payment has been processed.{'\n'}A receipt has been generated.
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

  // Normal invoice view
  return (
    <ScrollView
      className="flex-1"
      style={{ backgroundColor: theme.surface }}
      showsVerticalScrollIndicator={false}
    >
      <View className="px-6 pt-12 pb-10">
        {/* Status Banner */}
        <View className="flex-row justify-between items-center mb-8">
          <View>
            <View className="flex-row items-center mb-1">
              <View
                className="w-2 h-2 rounded-full mr-2"
                style={{ backgroundColor: theme.error }}
              />
              <Text className="text-[10px] font-black uppercase tracking-[2px]" style={{ color: theme.error }}>
                Payment Due
              </Text>
            </View>
            <Text className="text-3xl font-black" style={{ color: theme.text }}>
              Final <Text style={{ color: theme.primary }}>Invoice</Text>
            </Text>
          </View>
          <TouchableOpacity
            className="w-12 h-12 rounded-2xl items-center justify-center border"
            style={{ backgroundColor: theme.background, borderColor: theme.border }}
          >
            <Ionicons name="download-outline" size={22} color={theme.text} />
          </TouchableOpacity>
        </View>

        {/* Invoice Metadata Card */}
        <View
          className="p-6 rounded-[32px] mb-8 border"
          style={{ backgroundColor: theme.background, borderColor: theme.border }}
        >
          <View className="flex-row justify-between pb-4 border-b border-dashed" style={{ borderBottomColor: theme.border }}>
            <View>
              <Text className="text-[10px] font-black uppercase opacity-40 mb-1" style={{ color: theme.text }}>
                Invoice ID
              </Text>
              <Text className="text-base font-bold" style={{ color: theme.text }}>
                {invoice.id?.slice(0, 8).toUpperCase()}
              </Text>
            </View>
            <View className="items-end">
              <Text className="text-[10px] font-black uppercase opacity-40 mb-1" style={{ color: theme.text }}>
                Date Issued
              </Text>
              <Text className="text-base font-bold" style={{ color: theme.text }}>
                {new Date(invoice.createdAt).toLocaleDateString('en-PH', {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric',
                })}
              </Text>
            </View>
          </View>

          <View className="flex-row items-center mt-6">
            <View className="w-10 h-10 rounded-xl items-center justify-center mr-4" style={{ backgroundColor: theme.primary + '10' }}>
              <MaterialCommunityIcons name="clipboard-text-outline" size={20} color={theme.primary} />
            </View>
            <View className="flex-1">
              <Text className="text-[10px] font-black uppercase opacity-40" style={{ color: theme.text }}>
                Bill Status
              </Text>
              <Text className="text-sm font-bold" style={{ color: theme.text }}>
                {status}
              </Text>
            </View>
          </View>
        </View>

        {/* Breakdown */}
        <View className="mb-6 flex-row justify-between items-center">
          <Text className="text-xl font-black" style={{ color: theme.text }}>Breakdown</Text>
          <Text className="text-xs font-bold opacity-40" style={{ color: theme.text }}>
            {lineItems.length} ITEMS
          </Text>
        </View>

        {lineItems.map((item, index) => (
          <View key={index} className="flex-row items-start mb-6">
            <View className="w-8 h-8 rounded-lg items-center justify-center mt-1" style={{ backgroundColor: theme.background }}>
              <MaterialCommunityIcons name={item.icon} size={18} color={theme.textSecondary} />
            </View>
            <View className="flex-1 mx-4">
              <Text className="text-sm font-black mb-1" style={{ color: theme.text }}>{item.name}</Text>
              <Text className="text-xs leading-4 opacity-50" style={{ color: theme.textSecondary }}>{item.description}</Text>
            </View>
            <Text className="text-sm font-black" style={{ color: theme.text }}>
              ₱{item.price.toLocaleString()}
            </Text>
          </View>
        ))}

        {/* Subtotals */}
        <View
          className="p-8 rounded-[40px] mt-4 mb-10 overflow-hidden"
          style={{ backgroundColor: theme.background, borderWidth: 1, borderColor: theme.border }}
        >
          <View className="absolute -top-10 -right-10 w-32 h-32 rounded-full" style={{ backgroundColor: theme.primary + '05' }} />

          <View className="flex-row justify-between mb-4">
            <Text className="text-sm font-medium opacity-50" style={{ color: theme.text }}>Service Subtotal</Text>
            <Text className="text-sm font-bold" style={{ color: theme.text }}>₱{parseFloat(serviceSubtotal || 0).toLocaleString()}</Text>
          </View>
          <View className="flex-row justify-between mb-4">
            <Text className="text-sm font-medium opacity-50" style={{ color: theme.text }}>Findings Subtotal</Text>
            <Text className="text-sm font-bold" style={{ color: theme.text }}>₱{parseFloat(findingsSubtotal || 0).toLocaleString()}</Text>
          </View>
          <View className="flex-row justify-between mb-4">
            <Text className="text-sm font-medium opacity-50" style={{ color: theme.text }}>Work Tasks</Text>
            <Text className="text-sm font-bold" style={{ color: theme.text }}>₱{parseFloat(workTasksSubtotal || 0).toLocaleString()}</Text>
          </View>
          <View className="flex-row justify-between mb-4">
            <Text className="text-sm font-medium opacity-50" style={{ color: theme.text }}>Fees</Text>
            <Text className="text-sm font-bold" style={{ color: theme.text }}>₱{parseFloat(feesTotal || 0).toLocaleString()}</Text>
          </View>
          <View className="flex-row justify-between mb-6">
            <Text className="text-sm font-medium opacity-50" style={{ color: theme.text }}>Discounts</Text>
            <Text className="text-sm font-bold text-red-400">−₱{parseFloat(discountTotal || 0).toLocaleString()}</Text>
          </View>

          <View className="pt-6 border-t border-dashed" style={{ borderTopColor: theme.border }}>
            <View className="flex-row justify-between items-end">
              <View>
                <Text className="text-[10px] font-black uppercase tracking-widest" style={{ color: theme.primary }}>
                  Total Amount
                </Text>
                <Text className="text-4xl font-black mt-1" style={{ color: theme.text }}>
                  ₱{displayTotal.toLocaleString()}
                </Text>
              </View>
              <Ionicons name="shield-checkmark" size={24} color={theme.primary} />
            </View>
          </View>
        </View>

        {/* Payment Methods Section */}
        <Text className="text-xs font-black uppercase tracking-[2px] mb-4 text-center opacity-40" style={{ color: theme.text }}>
          Select Secure Payment
        </Text>

        <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => router.push(`/cash-qr/${billId}`)}
            className="p-5 rounded-3xl mb-4 flex-row items-center border"
            style={{ backgroundColor: theme.background, borderColor: theme.border }}
            >
            <View className="w-12 h-12 rounded-2xl bg-emerald-500/10 justify-center items-center mr-4">
                <FontAwesome5 name="money-bill-wave" size={20} color="#10b981" />
            </View>
            <View className="flex-1">
                <Text className="text-base font-black" style={{ color: theme.text }}>Cash Payment</Text>
                <Text className="text-xs opacity-50" style={{ color: theme.textSecondary }}>Pay at the front desk</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={theme.border} />
        </TouchableOpacity>

        <TouchableOpacity
          activeOpacity={0.8}
          onPress={startPayment}
          disabled={paying || verifying}
          className="p-5 rounded-3xl mb-8 flex-row items-center border shadow-xl shadow-primary/10"
          style={{
            backgroundColor: theme.primary,
            borderColor: theme.primary,
            opacity: paying || verifying ? 0.6 : 1,
          }}
        >
          <View className="w-12 h-12 rounded-2xl bg-white/20 justify-center items-center mr-4">
            {paying ? (
              <ActivityIndicator size="small" color="#FFF" />
            ) : (
              <FontAwesome5 name="stripe-s" size={20} color="#FFF" />
            )}
          </View>
          <View className="flex-1">
            <Text className="text-base font-black text-white">
              {paying ? 'Redirecting...' : 'Pay Online'}
            </Text>
            <Text className="text-xs text-white/70">Credit Card, GCash, Maya</Text>
          </View>
          <Ionicons name="arrow-forward" size={20} color="#FFF" />
        </TouchableOpacity>

        {verifying && (
          <View className="items-center mb-4">
            <ActivityIndicator size="small" color={theme.primary} />
            <Text className="text-sm mt-2" style={{ color: theme.textSecondary }}>
              Verifying payment...
            </Text>
          </View>
        )}

        <Text className="text-[10px] text-center font-medium opacity-30 leading-4" style={{ color: theme.text }}>
          Electronic Receipt generated by AutoCare System.{"\n"}
          Thank you for trusting us with your vehicle.
        </Text>
      </View>
    </ScrollView>
  );
}