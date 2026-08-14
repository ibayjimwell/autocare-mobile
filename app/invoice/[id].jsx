import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons, MaterialCommunityIcons, FontAwesome5 } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import { useInvoice } from '../../hooks/useInvoice';
import { usePaymentFlow } from '../../hooks/usePaymentFlow';
import FinalBillBreakdown from '../../components/billing/FinalBillBreakdown';

export default function InvoiceScreen() {
  const { id: billId } = useLocalSearchParams();
  const router = useRouter();
  const { theme } = useTheme();

  const { invoice, loading, error } = useInvoice(billId);
  const { startPayment, paying, verifiedPaid, verifying } = usePaymentFlow(
    billId,
    invoice?.grandTotal
  );

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
    id,
    status,
    createdAt,
    grandTotal,
    estimateId,
    estimate,
    appointment,
  } = invoice;

  const displayTotal = parseFloat(grandTotal) || 0;
  const isPaid = status === 'PAID' || verifiedPaid;
  const isOfficial = status === 'OFFICIAL';

  const formatCurrency = (value) => {
    const num = parseFloat(value) || 0;
    return num.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  // ---------- Success / Already Paid Screen ----------
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
          onPress={() => router.push(`/receipt/${billId}`)}
          className="py-4 px-8 rounded-2xl mb-3"
          style={{ backgroundColor: theme.primary }}
        >
          <Text className="text-base font-bold text-white">View Receipt</Text>
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

  // ---------- Not Official: show message ----------
  if (!isOfficial) {
    return (
      <View className="flex-1 justify-center items-center px-8" style={{ backgroundColor: theme.surface }}>
        <Ionicons name="lock-closed" size={60} color={theme.textSecondary} />
        <Text className="text-xl font-black mt-6 mb-2" style={{ color: theme.text }}>
          Bill Not Ready
        </Text>
        <Text className="text-sm text-center opacity-60 mb-8 leading-5" style={{ color: theme.textSecondary }}>
          This bill is currently <Text className="font-bold">{status}</Text>.{'\n'}
          Payment will be available once the bill is marked as Official.
        </Text>
        <TouchableOpacity
          onPress={() => router.back()}
          className="py-3 px-6 rounded-xl bg-primary"
        >
          <Text className="text-white font-bold">Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // ---------- Normal (Unpaid, Official) Invoice View ----------
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
                style={{ backgroundColor: theme.primary }}
              />
              <Text className="text-[10px] font-black uppercase tracking-[2px]" style={{ color: theme.primary }}>
                Ready for Payment
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
                {id?.slice(0, 8).toUpperCase()}
              </Text>
            </View>
            <View className="items-end">
              <Text className="text-[10px] font-black uppercase opacity-40 mb-1" style={{ color: theme.text }}>
                Date Issued
              </Text>
              <Text className="text-base font-bold" style={{ color: theme.text }}>
                {new Date(createdAt).toLocaleDateString('en-PH', {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric',
                })}
              </Text>
            </View>
          </View>

          <View className="flex-row items-center mt-4">
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

          {estimateId && (
            <View className="flex-row items-center mt-3 pt-3 border-t border-dashed" style={{ borderTopColor: theme.border }}>
              <View className="w-10 h-10 rounded-xl items-center justify-center mr-4" style={{ backgroundColor: theme.background }}>
                <Ionicons name="document-text-outline" size={18} color={theme.textSecondary} />
              </View>
              <View className="flex-1">
                <Text className="text-[10px] font-black uppercase opacity-40" style={{ color: theme.text }}>
                  Estimate ID
                </Text>
                <Text className="text-sm font-bold" style={{ color: theme.text }}>
                  {estimateId.slice(0, 8).toUpperCase()}
                  {estimate?.createdAt && (
                    <Text className="text-xs font-medium opacity-50 ml-2" style={{ color: theme.textSecondary }}>
                      ({new Date(estimate.createdAt).toLocaleDateString('en-PH', { month: 'short', day: 'numeric', year: 'numeric' })})
                    </Text>
                  )}
                </Text>
              </View>
            </View>
          )}

          {appointment?.trackingNumber && (
            <View className="flex-row items-center mt-3 pt-3 border-t border-dashed" style={{ borderTopColor: theme.border }}>
              <View className="w-10 h-10 rounded-xl items-center justify-center mr-4" style={{ backgroundColor: theme.background }}>
                <MaterialCommunityIcons name="clipboard-text-clock" size={18} color={theme.textSecondary} />
              </View>
              <View className="flex-1">
                <Text className="text-[10px] font-black uppercase opacity-40" style={{ color: theme.text }}>
                  Appointment
                </Text>
                <Text className="text-sm font-bold" style={{ color: theme.text }}>
                  #{appointment.trackingNumber}
                  {appointment.appointmentDate && (
                    <Text className="text-xs font-medium opacity-50 ml-2" style={{ color: theme.textSecondary }}>
                      {appointment.appointmentDate} at {appointment.appointmentTime}
                    </Text>
                  )}
                </Text>
              </View>
            </View>
          )}
        </View>

        {/* Full Breakdown */}
        <FinalBillBreakdown finalBill={invoice} />

        {/* Grand Total */}
        <View
          className="p-6 rounded-[32px] mt-6 mb-8 bg-primary/5 border border-primary/20"
        >
          <View className="flex-row justify-between items-end">
            <View>
              <Text className="text-[10px] font-black uppercase tracking-widest" style={{ color: theme.primary }}>
                Total Amount Due
              </Text>
              <Text className="text-3xl font-black mt-1" style={{ color: theme.text }}>
                ₱{formatCurrency(displayTotal)}
              </Text>
            </View>
            <Ionicons name="shield-checkmark" size={24} color={theme.primary} />
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