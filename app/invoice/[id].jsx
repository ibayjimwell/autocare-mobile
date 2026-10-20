import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Modal,
  Image,
  AppState,
  Linking,
} from 'react-native';

import {
  useEffect,
  useState,
} from 'react';

import {
  SafeAreaView,
} from 'react-native-safe-area-context';

import {
  useRouter,
  useLocalSearchParams,
} from 'expo-router';

import {
  ArrowLeft,
  Download,
  ClipboardList,
  FileText,
  CalendarDays,
  LockKeyhole,
  ShieldCheck,
  Banknote,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  ChevronRight,
  ScanLine,
  WalletCards,
  CreditCard,
  X,
} from 'lucide-react-native';

import {
  useTheme,
} from '../../context/ThemeContext';

import {
  useInvoice,
} from '../../hooks/useInvoice';

import {
  usePaymentFlow,
} from '../../hooks/usePaymentFlow';

import FinalBillBreakdown from '../../components/billing/FinalBillBreakdown';

function normalizeBillId(
  value,
) {
  if (Array.isArray(value)) {
    return value[0] ?? null;
  }

  return value ?? null;
}

function formatCurrency(
  value,
) {
  const num =
    Number.parseFloat(
      String(value ?? 0),
    ) || 0;

  return num.toLocaleString(
    'en-PH',
    {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    },
  );
}

function getCustomerName(
  invoice,
) {
  return (
    invoice?.appointment?.customer?.fullname ||
    ''
  );
}

export default function InvoiceScreen() {
  const params =
    useLocalSearchParams();

  const router =
    useRouter();

  const { theme } =
    useTheme();

  const billId =
    normalizeBillId(
      params?.id,
    );

  const {
    invoice,
    loading,
    error,
  } = useInvoice(
    billId,
  );

  const {
    startPayment,
    paying,
    verifiedPaid,
    verifying,
    selectedPaymentMethod,
    paymentError,
    qrImageUrl,
    qrTestUrl,
    qrExpiresAt,
    qrPaymentVisible,
    closeQrPayment,
    checkPaymentNow,
  } =
    usePaymentFlow(
      billId,
      invoice?.grandTotal,
      invoice?.appointment?.customer,
    );

  const [qrSecondsRemaining, setQrSecondsRemaining] =
    useState(null);

  /*
   * Keep the QR expiry indicator current while the QR modal is open.
   * The server-side Payment Intent remains the source of truth for
   * successful payment.
   */
  useEffect(() => {
    if (
      !qrPaymentVisible ||
      !qrExpiresAt
    ) {
      setQrSecondsRemaining(null);
      return undefined;
    }

    const updateRemaining = () => {
      const seconds =
        Math.max(
          0,
          Math.ceil(
            (qrExpiresAt -
              Date.now()) /
              1000,
          ),
        );

      setQrSecondsRemaining(
        seconds,
      );
    };

    updateRemaining();

    const intervalId =
      setInterval(
        updateRemaining,
        1000,
      );

    return () => {
      clearInterval(
        intervalId,
      );
    };
  }, [
    qrPaymentVisible,
    qrExpiresAt,
  ]);

  /*
   * When the app becomes active after the customer scans the QR code
   * from another banking/e-wallet app, ask the server for the current
   * payment status immediately.
   */
  useEffect(() => {
    const subscription =
      AppState.addEventListener(
        'change',
        nextState => {
          if (
            nextState !== 'active' ||
            !qrPaymentVisible
          ) {
            return;
          }

          void checkPaymentNow();
        },
      );

    return () => {
      subscription.remove();
    };
  }, [
    qrPaymentVisible,
    checkPaymentNow,
  ]);

  if (loading) {
    return (
      <SafeAreaView
        className="flex-1 bg-background items-center justify-center"
        style={{
          backgroundColor:
            theme.background,
        }}
      >
        <ActivityIndicator
          size="large"
          color={theme.primary}
        />
      </SafeAreaView>
    );
  }

  if (error || !invoice) {
    return (
      <SafeAreaView
        className="flex-1 bg-background"
        style={{
          backgroundColor:
            theme.background,
        }}
      >
        <View className="flex-1 justify-center items-center px-5">
          <View className="bg-card rounded-3xl border border-border p-6 items-center w-full">
            <View className="w-16 h-16 rounded-full bg-primary/10 items-center justify-center">
              <AlertCircle
                size={34}
                color={theme.primary}
              />
            </View>

            <Text
              className="text-lg font-semibold mt-4 text-center"
              style={{
                color: theme.text,
              }}
            >
              {error ||
                'Final Cost not found'}
            </Text>

            <TouchableOpacity
              onPress={() =>
                router.back()
              }
              className="w-full min-h-[52px] rounded-xl bg-primary items-center justify-center mt-6"
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

  const {
    id,
    status,
    createdAt,
    grandTotal,
    estimateId,
    estimate,
    appointment,
  } = invoice;

  const displayTotal =
    Number.parseFloat(
      String(grandTotal ?? 0),
    ) || 0;

  const isPaid =
    status === 'PAID' ||
    verifiedPaid;

  const isOfficial =
    status === 'OFFICIAL';

  const customerName =
    getCustomerName(
      invoice,
    );

  if (isPaid) {
    return (
      <SafeAreaView
        className="flex-1 bg-background"
        style={{
          backgroundColor:
            theme.background,
        }}
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
              style={{
                color: theme.text,
              }}
            >
              Payment Successful
            </Text>

            <Text
              className="text-sm text-center mt-2 leading-5"
              style={{
                color:
                  theme.textSecondary,
              }}
            >
              Your payment has been processed.
              {'\n'}
              A receipt has been generated.
            </Text>

            <TouchableOpacity
              onPress={() =>
                router.push(
                  `/receipt/${billId}`,
                )
              }
              className="w-full min-h-[52px] rounded-xl bg-primary items-center justify-center mt-7 flex-row"
              activeOpacity={0.8}
            >
              <Text className="text-base font-semibold text-white">
                View Receipt
              </Text>

              <ArrowRight
                size={18}
                color="#FFFFFF"
                className="ml-2"
              />
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() =>
                router.replace(
                  '/billing',
                )
              }
              className="min-h-[44px] px-4 items-center justify-center mt-2"
              activeOpacity={0.7}
            >
              <Text
                className="text-sm font-medium"
                style={{
                  color:
                    theme.textSecondary,
                }}
              >
                Go to Billing List
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  if (!isOfficial) {
    return (
      <SafeAreaView
        className="flex-1 bg-background"
        style={{
          backgroundColor:
            theme.background,
        }}
      >
        <View className="flex-1 justify-center px-4">
          <View className="bg-card rounded-3xl border border-border p-6 items-center">
            <View className="w-16 h-16 rounded-full bg-secondary items-center justify-center">
              <LockKeyhole
                size={30}
                color={theme.textSecondary}
              />
            </View>

            <Text
              className="text-xl font-bold mt-5 text-center"
              style={{
                color: theme.text,
              }}
            >
              Bill Not Ready
            </Text>

            <Text
              className="text-sm text-center mt-2 leading-5"
              style={{
                color:
                  theme.textSecondary,
              }}
            >
              This bill is currently{' '}
              <Text className="font-semibold">
                {status}
              </Text>
              .
              {'\n'}
              Payment will be available once the bill is marked as Official.
            </Text>

            <TouchableOpacity
              onPress={() =>
                router.back()
              }
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

  const formattedExpiry =
    qrSecondsRemaining === null
      ? 'QR code expires after a limited time.'
      : qrSecondsRemaining <= 0
        ? 'QR code expired. Start a new payment.'
        : `QR code expires in ${Math.floor(
            qrSecondsRemaining /
              60,
          )}m ${qrSecondsRemaining % 60}s.`;

  return (
    <SafeAreaView
      className="flex-1 bg-background"
      style={{
        backgroundColor:
          theme.background,
      }}
      edges={['top']}
    >
      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={
          false
        }
        contentContainerStyle={{
          paddingBottom: 32,
        }}
      >
        <View className="px-4 pt-3">
          <View className="flex-row items-center justify-between mb-5">
            <TouchableOpacity
              onPress={() =>
                router.back()
              }
              className="w-11 h-11 rounded-full bg-card border border-border items-center justify-center"
              activeOpacity={0.75}
            >
              <ArrowLeft
                size={21}
                color={theme.text}
              />
            </TouchableOpacity>

            <TouchableOpacity
              className="w-11 h-11 rounded-full bg-card border border-border items-center justify-center"
              activeOpacity={0.75}
            >
              <Download
                size={19}
                color={theme.text}
              />
            </TouchableOpacity>
          </View>

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
                ₱{formatCurrency(
                  displayTotal,
                )}
              </Text>

              <View className="flex-row items-center mt-2">
                <ShieldCheck
                  size={15}
                  color="#FFFFFF"
                />

                <Text className="text-xs text-white/70 ml-1.5">
                  Secure AutoCare payment
                </Text>
              </View>
            </View>
          </View>

          <View className="bg-card rounded-2xl border border-border overflow-hidden mb-5">
            <View className="px-4 py-4 border-b border-border">
              <Text className="text-xs font-semibold uppercase tracking-[1.2px] text-muted-foreground">
                Invoice details
              </Text>
            </View>

            <View className="flex-row px-4 py-4 border-b border-border">
              <View className="w-10 h-10 rounded-xl bg-primary/10 items-center justify-center mr-3">
                <FileText
                  size={18}
                  color={theme.primary}
                />
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
                  {createdAt
                    ? new Date(
                        createdAt,
                      ).toLocaleDateString(
                        'en-PH',
                        {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                        },
                      )
                    : '—'}
                </Text>
              </View>
            </View>

            <View className="flex-row px-4 py-4 border-b border-border">
              <View className="w-10 h-10 rounded-xl bg-background items-center justify-center mr-3">
                <ClipboardList
                  size={18}
                  color={
                    theme.textSecondary
                  }
                />
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

            {estimateId ? (
              <View className="flex-row px-4 py-4 border-b border-border">
                <View className="w-10 h-10 rounded-xl bg-background items-center justify-center mr-3">
                  <FileText
                    size={18}
                    color={
                      theme.textSecondary
                    }
                  />
                </View>

                <View className="flex-1">
                  <Text className="text-xs text-muted-foreground">
                    Estimate ID
                  </Text>

                  <Text className="text-sm font-semibold text-foreground mt-0.5">
                    {estimateId
                      .slice(0, 8)
                      .toUpperCase()}
                  </Text>

                  {estimate?.createdAt ? (
                    <Text className="text-xs text-muted-foreground mt-0.5">
                      {new Date(
                        estimate.createdAt,
                      ).toLocaleDateString(
                        'en-PH',
                        {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        },
                      )}
                    </Text>
                  ) : null}
                </View>
              </View>
            ) : null}

            {appointment?.trackingNumber ? (
              <View className="flex-row px-4 py-4">
                <View className="w-10 h-10 rounded-xl bg-background items-center justify-center mr-3">
                  <CalendarDays
                    size={18}
                    color={
                      theme.textSecondary
                    }
                  />
                </View>

                <View className="flex-1">
                  <Text className="text-xs text-muted-foreground">
                    Appointment
                  </Text>

                  <Text className="text-sm font-semibold text-foreground mt-0.5">
                    #{appointment.trackingNumber}
                  </Text>

                  {appointment.appointmentDate ? (
                    <Text className="text-xs text-muted-foreground mt-0.5">
                      {appointment.appointmentDate}{' '}
                      at{' '}
                      {appointment.appointmentTime}
                    </Text>
                  ) : null}
                </View>
              </View>
            ) : null}
          </View>

          <FinalBillBreakdown
            finalBill={invoice}
          />

          <View className="bg-primary/5 rounded-2xl border border-primary/20 p-5 mt-5 mb-5">
            <View className="flex-row items-center justify-between">
              <View>
                <Text className="text-xs font-semibold uppercase tracking-[1.2px] text-primary">
                  Total Amount Due
                </Text>

                <Text className="text-3xl font-bold text-foreground mt-1">
                  ₱{formatCurrency(
                    displayTotal,
                  )}
                </Text>
              </View>

              <View className="w-11 h-11 rounded-full bg-primary/10 items-center justify-center">
                <ShieldCheck
                  size={21}
                  color={theme.primary}
                />
              </View>
            </View>
          </View>

          <Text className="text-xs font-semibold uppercase tracking-[1.4px] text-muted-foreground px-1 mb-3">
            Payment Instructions
          </Text>

          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() =>
              router.push(
                `/cash-qr/${billId}`,
              )
            }
            className="bg-card rounded-2xl border border-border min-h-[72px] px-4 flex-row items-center mb-3"
          >
            <View className="w-11 h-11 rounded-xl bg-[#34A853]/10 items-center justify-center mr-3">
              <Banknote
                size={21}
                color="#34A853"
              />
            </View>

            <View className="flex-1">
              <Text className="text-base font-semibold text-foreground">
                Pay To Counter
              </Text>

              <Text className="text-sm text-muted-foreground mt-0.5">
                Show this invoice at the service counter and pay in cash
              </Text>
            </View>

            <ChevronRight
              size={20}
              color={
                theme.textSecondary
              }
            />
          </TouchableOpacity>

          {paymentError ? (
            <View className="bg-primary/5 border border-primary/20 rounded-2xl p-4 mb-2">
              <View className="flex-row items-start">
                <AlertCircle
                  size={18}
                  color={theme.primary}
                />

                <Text
                  className="flex-1 text-sm ml-2 leading-5"
                  style={{
                    color: theme.text,
                  }}
                >
                  {paymentError}
                </Text>
              </View>
            </View>
          ) : null}

          {paying ? (
            <View className="items-center py-3">
              <ActivityIndicator
                size="small"
                color={
                  theme.primary
                }
              />

              <Text
                className="text-sm mt-2"
                style={{
                  color:
                    theme.textSecondary,
                }}
              >
                Preparing your QR payment...
              </Text>
            </View>
          ) : null}

          {verifying ? (
            <View className="items-center py-4">
              <ActivityIndicator
                size="small"
                color={
                  theme.primary
                }
              />

              <Text
                className="text-sm mt-2"
                style={{
                  color:
                    theme.textSecondary,
                }}
              >
                Confirming your payment...
              </Text>
            </View>
          ) : null}

          <View className="flex-row items-center justify-center px-4 mt-4">
            <ShieldCheck
              size={14}
              color={
                theme.textSecondary
              }
            />

            <Text
              className="text-xs ml-1.5 text-center"
              style={{
                color:
                  theme.textSecondary,
                opacity: 0.65,
              }}
            >
              Payments are securely processed by PayMongo.
            </Text>
          </View>

          <Text
            className="text-xs text-center leading-5 mt-4 px-4"
            style={{
              color:
                theme.textSecondary,
              opacity: 0.55,
            }}
          >
            Electronic Receipt generated by AutoCare System.
            {'\n'}
            Thank you for trusting us with your vehicle.
          </Text>
        </View>
      </ScrollView>

      <Modal
        visible={qrPaymentVisible}
        transparent
        animationType="slide"
        onRequestClose={() => {
          closeQrPayment();
        }}
      >
        <View className="flex-1 justify-end bg-black/40">
          <View
            className="bg-card rounded-t-3xl px-4 pt-4 pb-8 border-t border-border"
            style={{
              maxHeight: '92%',
            }}
          >
            <View className="flex-row items-center justify-between mb-4">
              <View className="flex-row items-center flex-1">
                <View className="w-11 h-11 rounded-xl bg-primary/10 items-center justify-center mr-3">
                  <ScanLine
                    size={22}
                    color={
                      theme.primary
                    }
                  />
                </View>

                <View className="flex-1">
                  <Text className="text-xl font-bold text-foreground">
                    Scan to Pay
                  </Text>

                  <Text className="text-sm text-muted-foreground mt-0.5">
                    QRPh
                  </Text>
                </View>
              </View>

              <TouchableOpacity
                onPress={() =>
                  closeQrPayment()
                }
                className="w-11 h-11 rounded-full bg-background border border-border items-center justify-center"
                activeOpacity={0.75}
              >
                <X
                  size={20}
                  color={theme.text}
                />
              </TouchableOpacity>
            </View>

            <View className="bg-primary/5 rounded-2xl border border-primary/15 p-4 mb-4">
              <Text className="text-xs uppercase tracking-[1.2px] text-primary font-semibold">
                Amount to pay
              </Text>

              <Text className="text-2xl font-bold text-foreground mt-1">
                ₱{formatCurrency(
                  displayTotal,
                )}
              </Text>
            </View>

            <View className="items-center">
              {qrImageUrl ? (
                <View className="bg-white rounded-3xl border border-border p-4 items-center justify-center">
                  <Image
                    source={{
                      uri: qrImageUrl,
                    }}
                    style={{
                      width: 260,
                      height: 260,
                    }}
                    resizeMode="contain"
                    accessibilityLabel="QRPh payment QR code"
                  />
                </View>
              ) : (
                <View className="w-[260px] h-[260px] rounded-3xl bg-background items-center justify-center border border-border">
                  <ActivityIndicator
                    size="large"
                    color={
                      theme.primary
                    }
                  />

                  <Text
                    className="text-sm text-center mt-3 px-8"
                    style={{
                      color:
                        theme.textSecondary,
                    }}
                  >
                    Generating your payment QR code...
                  </Text>
                </View>
              )}

              <Text className="text-sm font-semibold text-foreground text-center mt-4">
                Open your bank or e-wallet app and scan this QR code.
              </Text>

              <Text
                className="text-xs text-center leading-5 mt-2 px-5"
                style={{
                  color:
                    theme.textSecondary,
                }}
              >
                {formattedExpiry}
                {'\n'}
                Keep this screen open while your payment is being confirmed.
              </Text>
            </View>

            {qrTestUrl ? (
              <View className="mt-5 rounded-2xl border border-amber-200 bg-amber-50 p-4">
                <Text className="text-sm font-semibold text-amber-900">
                  PayMongo Test Mode
                </Text>

                <Text className="text-xs leading-5 text-amber-800 mt-1">
                  Do not scan the test QR. Open PayMongo's test page and choose Authorize to simulate a successful QRPh payment.
                </Text>

                <TouchableOpacity
                  onPress={() => {
                    void Linking.openURL(qrTestUrl);
                  }}
                  className="min-h-[48px] rounded-xl bg-amber-600 items-center justify-center mt-3"
                  activeOpacity={0.8}
                >
                  <Text className="text-sm font-semibold text-white">
                    Open Test Authorization
                  </Text>
                </TouchableOpacity>
              </View>
            ) : null}

            <TouchableOpacity
              onPress={() =>
                checkPaymentNow()
              }
              disabled={
                paying ||
                verifying
              }
              className="min-h-[52px] rounded-xl bg-primary items-center justify-center flex-row mt-5"
              style={{
                opacity:
                  paying ||
                  verifying
                    ? 0.6
                    : 1,
              }}
              activeOpacity={0.8}
            >
              <ShieldCheck
                size={18}
                color="#FFFFFF"
              />

              <Text className="text-base font-semibold text-white ml-2">
                {verifying
                  ? 'Checking...'
                  : 'Check Payment Status'}
              </Text>
            </TouchableOpacity>

            <Text
              className="text-xs text-center leading-5 mt-3 px-5"
              style={{
                color:
                  theme.textSecondary,
                opacity: 0.7,
              }}
            >
              AutoCare also checks the payment status automatically. You do not need to press the button repeatedly.
            </Text>

            <TouchableOpacity
              onPress={() =>
                closeQrPayment()
              }
              className="min-h-[44px] items-center justify-center mt-2"
              activeOpacity={0.7}
            >
              <Text
                className="text-sm font-medium"
                style={{
                  color:
                    theme.textSecondary,
                }}
              >
                Close
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
