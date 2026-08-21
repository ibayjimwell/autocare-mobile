import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import {
  ArrowLeft,
  Download,
  ClipboardList,
  FileText,
  CalendarDays,
  LockKeyhole,
  ShieldCheck,
  Banknote,
  CreditCard,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  ChevronRight
} from 'lucide-react-native';

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
      <SafeAreaView
        className="flex-1 bg-background items-center justify-center"
        style={{ backgroundColor: theme.background }}
      >
        <ActivityIndicator size="large" color={theme.primary} />
      </SafeAreaView>
    );
  }

  if (error || !invoice) {
    return (
      <SafeAreaView
        className="flex-1 bg-background"
        style={{ backgroundColor: theme.background }}
      >
        <View className="flex-1 justify-center items-center px-5">
          <View className="bg-card rounded-3xl border border-border p-6 items-center w-full">
            <View className="w-16 h-16 rounded-full bg-primary/10 items-center justify-center">
              <AlertCircle size={34} color={theme.primary} />
            </View>

            <Text
              className="text-lg font-semibold mt-4 text-center"
              style={{ color: theme.text }}
            >
              {error || 'Invoice not found'}
            </Text>
          </View>
        </View>
      </SafeAreaView>
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

  const formatCurrency = value => {
    const num = parseFloat(value) || 0;

    return num.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  // ---------- Success / Already Paid Screen ----------
  if (isPaid) {
    return (
      <SafeAreaView
        className="flex-1 bg-background"
        style={{ backgroundColor: theme.background }}
      >
        <View className="flex-1 justify-center px-4">
          <View className="bg-card rounded-3xl border border-border p-6 items-center">
            <View className="w-20 h-20 rounded-full bg-primary/10 items-center justify-center">
              <CheckCircle2
                size={52}
                color={theme.primary}
                strokeWidth={2.1}
              />
            </View>

            <Text
              className="text-2xl font-bold mt-5 text-center"
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
              A receipt has been generated.
            </Text>

            <TouchableOpacity
              onPress={() => router.push(`/receipt/${billId}`)}
              className="w-full min-h-[52px] rounded-xl bg-primary items-center justify-center mt-7 flex-row"
              activeOpacity={0.8}
            >
              <Text className="text-base font-semibold text-white">
                View Receipt
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

  // ---------- Not Official ----------
  if (!isOfficial) {
    return (
      <SafeAreaView
        className="flex-1 bg-background"
        style={{ backgroundColor: theme.background }}
      >
        <View className="flex-1 justify-center px-4">
          <View className="bg-card rounded-3xl border border-border p-6 items-center">
            <View className="w-16 h-16 rounded-full bg-secondary items-center justify-center">
              <LockKeyhole size={30} color={theme.textSecondary} />
            </View>

            <Text
              className="text-xl font-bold mt-5 text-center"
              style={{ color: theme.text }}
            >
              Bill Not Ready
            </Text>

            <Text
              className="text-sm text-center mt-2 leading-5"
              style={{ color: theme.textSecondary }}
            >
              This bill is currently{' '}
              <Text className="font-semibold">{status}</Text>.
              {'\n'}
              Payment will be available once the bill is marked as Official.
            </Text>

            <TouchableOpacity
              onPress={() => router.back()}
              className="min-h-[52px] w-full rounded-xl bg-primary items-center justify-center mt-7"
              activeOpacity={0.8}
            >
              <Text className="text-base font-semibold text-white">
                Go Back
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  // ---------- Normal (Unpaid, Official) Invoice View ----------
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
      >
        <View className="px-4 pt-3">
          {/* Navigation */}
          <View className="flex-row items-center justify-between mb-5">
            <TouchableOpacity
              onPress={() => router.back()}
              className="w-11 h-11 rounded-full bg-card border border-border items-center justify-center"
              activeOpacity={0.75}
            >
              <ArrowLeft size={21} color={theme.text} />
            </TouchableOpacity>

            <TouchableOpacity
              className="w-11 h-11 rounded-full bg-card border border-border items-center justify-center"
              activeOpacity={0.75}
            >
              <Download size={19} color={theme.text} />
            </TouchableOpacity>
          </View>

          {/* Hero */}
          <View className="bg-primary rounded-3xl overflow-hidden mb-5 p-5">
            <View className="flex-row items-center justify-between">
              <View className="flex-row items-center">
                <View className="w-2 h-2 rounded-full bg-white mr-2" />

                <Text className="text-xs font-semibold uppercase tracking-[1.4px] text-white">
                  Ready for Payment
                </Text>
              </View>

              <View className="bg-white/15 border border-white/20 rounded-full px-3 min-h-[30px] items-center justify-center">
                <Text className="text-xs font-semibold text-white">
                  {status}
                </Text>
              </View>
            </View>

            <Text className="text-3xl font-bold tracking-tight text-white mt-4">
              Final Invoice
            </Text>

            <Text className="text-sm text-white/70 mt-1">
              #{id?.slice(0, 8).toUpperCase()}
            </Text>

            <View className="bg-white/15 border border-white/20 rounded-2xl p-4 mt-5">
              <Text className="text-xs font-medium uppercase tracking-[1.2px] text-white/70">
                Amount Due
              </Text>

              <Text className="text-3xl font-bold text-white mt-1">
                ₱{formatCurrency(displayTotal)}
              </Text>

              <View className="flex-row items-center mt-2">
                <ShieldCheck size={15} color="#FFFFFF" />
                <Text className="text-xs text-white/70 ml-1.5">
                  Secure AutoCare payment
                </Text>
              </View>
            </View>
          </View>

          {/* Invoice metadata */}
          <View className="bg-card rounded-2xl border border-border overflow-hidden mb-5">
            <View className="px-4 py-4 border-b border-border">
              <Text className="text-xs font-semibold uppercase tracking-[1.2px] text-muted-foreground">
                Invoice details
              </Text>
            </View>

            <View className="flex-row px-4 py-4 border-b border-border">
              <View className="w-10 h-10 rounded-xl bg-primary/10 items-center justify-center mr-3">
                <FileText size={18} color={theme.primary} />
              </View>

              <View className="flex-1">
                <Text className="text-xs text-muted-foreground">
                  Invoice ID
                </Text>

                <Text className="text-sm font-semibold text-foreground mt-0.5">
                  {id?.slice(0, 8).toUpperCase()}
                </Text>
              </View>

              <View className="items-end">
                <Text className="text-xs text-muted-foreground">
                  Date issued
                </Text>

                <Text className="text-sm font-semibold text-foreground mt-0.5">
                  {new Date(createdAt).toLocaleDateString('en-PH', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                  })}
                </Text>
              </View>
            </View>

            <View className="flex-row px-4 py-4 border-b border-border">
              <View className="w-10 h-10 rounded-xl bg-background items-center justify-center mr-3">
                <ClipboardList size={18} color={theme.textSecondary} />
              </View>

              <View className="flex-1">
                <Text className="text-xs text-muted-foreground">
                  Bill Status
                </Text>

                <Text className="text-sm font-semibold text-foreground mt-0.5">
                  {status}
                </Text>
              </View>
            </View>

            {estimateId && (
              <View className="flex-row px-4 py-4 border-b border-border">
                <View className="w-10 h-10 rounded-xl bg-background items-center justify-center mr-3">
                  <FileText size={18} color={theme.textSecondary} />
                </View>

                <View className="flex-1">
                  <Text className="text-xs text-muted-foreground">
                    Estimate ID
                  </Text>

                  <Text className="text-sm font-semibold text-foreground mt-0.5">
                    {estimateId.slice(0, 8).toUpperCase()}
                  </Text>

                  {estimate?.createdAt && (
                    <Text className="text-xs text-muted-foreground mt-0.5">
                      {new Date(estimate.createdAt).toLocaleDateString(
                        'en-PH',
                        {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        }
                      )}
                    </Text>
                  )}
                </View>
              </View>
            )}

            {appointment?.trackingNumber && (
              <View className="flex-row px-4 py-4">
                <View className="w-10 h-10 rounded-xl bg-background items-center justify-center mr-3">
                  <CalendarDays size={18} color={theme.textSecondary} />
                </View>

                <View className="flex-1">
                  <Text className="text-xs text-muted-foreground">
                    Appointment
                  </Text>

                  <Text className="text-sm font-semibold text-foreground mt-0.5">
                    #{appointment.trackingNumber}
                  </Text>

                  {appointment.appointmentDate && (
                    <Text className="text-xs text-muted-foreground mt-0.5">
                      {appointment.appointmentDate} at{' '}
                      {appointment.appointmentTime}
                    </Text>
                  )}
                </View>
              </View>
            )}
          </View>

          {/* Full Breakdown */}
          <FinalBillBreakdown finalBill={invoice} />

          {/* Total */}
          <View className="bg-primary/5 rounded-2xl border border-primary/20 p-5 mt-5 mb-5">
            <View className="flex-row items-center justify-between">
              <View>
                <Text className="text-xs font-semibold uppercase tracking-[1.2px] text-primary">
                  Total Amount Due
                </Text>

                <Text className="text-3xl font-bold text-foreground mt-1">
                  ₱{formatCurrency(displayTotal)}
                </Text>
              </View>

              <View className="w-11 h-11 rounded-full bg-primary/10 items-center justify-center">
                <ShieldCheck size={21} color={theme.primary} />
              </View>
            </View>
          </View>

          {/* Payment methods */}
          <Text className="text-xs font-semibold uppercase tracking-[1.4px] text-muted-foreground px-1 mb-3">
            Select Secure Payment
          </Text>

          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => router.push(`/cash-qr/${billId}`)}
            className="bg-card rounded-2xl border border-border min-h-[72px] px-4 flex-row items-center mb-3"
          >
            <View className="w-11 h-11 rounded-xl bg-[#34A853]/10 items-center justify-center mr-3">
              <Banknote size={21} color="#34A853" />
            </View>

            <View className="flex-1">
              <Text className="text-base font-semibold text-foreground">
                Cash Payment
              </Text>

              <Text className="text-sm text-muted-foreground mt-0.5">
                Pay at the front desk
              </Text>
            </View>

            <ChevronRight size={20} color={theme.textSecondary} />
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.8}
            onPress={startPayment}
            disabled={paying || verifying}
            className="bg-primary rounded-2xl border border-primary min-h-[72px] px-4 flex-row items-center"
            style={{
              opacity: paying || verifying ? 0.6 : 1,
            }}
          >
            <View className="w-11 h-11 rounded-full bg-white/15 border border-white/20 items-center justify-center mr-3">
              {paying ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <CreditCard size={21} color="#FFFFFF" />
              )}
            </View>

            <View className="flex-1">
              <Text className="text-base font-semibold text-white">
                {paying ? 'Redirecting...' : 'Pay Online'}
              </Text>

              <Text className="text-sm text-white/70 mt-0.5">
                Credit Card, GCash, Maya
              </Text>
            </View>

            <ArrowRight size={20} color="#FFFFFF" />
          </TouchableOpacity>

          {verifying && (
            <View className="items-center py-4">
              <ActivityIndicator size="small" color={theme.primary} />

              <Text
                className="text-sm mt-2"
                style={{ color: theme.textSecondary }}
              >
                Verifying payment...
              </Text>
            </View>
          )}

          <Text
            className="text-xs text-center leading-5 mt-6 px-4"
            style={{ color: theme.textSecondary, opacity: 0.55 }}
          >
            Electronic Receipt generated by AutoCare System.
            {'\n'}
            Thank you for trusting us with your vehicle.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}