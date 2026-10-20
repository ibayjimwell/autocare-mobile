import {
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import { router } from 'expo-router';

import {
  ChevronRight,
  ReceiptText,
  Wrench,
} from 'lucide-react-native';

/* ================================================================
   HELPERS
================================================================ */

function toAmount(value) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? Math.max(0, parsed) : 0;
}

function formatCurrency(value) {
  return toAmount(value).toLocaleString('en-PH', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function normalizeStatus(value) {
  if (typeof value !== 'string') return '';
  return value.trim().toUpperCase();
}

function getServiceName(service) {
  if (typeof service === 'string') return 'Booked service';
  return service?.name || service?.serviceName || service?.title || 'Booked service';
}

function getServicePrice(service) {
  return toAmount(service?.basePrice ?? service?.priceAtTime ?? service?.price ?? 0);
}

/* ================================================================
   FINAL COST

   - Keep the original tap-to-invoice/receipt behavior.
   - Show each service booked for this appointment.
   - Use FinalBill.serviceSubtotal (not the live catalog sum) as the
     authoritative amount recorded when the bill was generated.
================================================================ */

export default function FinalCostCard({ finalBill }) {
  if (!finalBill?.id) return null;

  const services = Array.isArray(finalBill?.services)
    ? finalBill.services
    : Array.isArray(finalBill?.appointment?.services)
      ? finalBill.appointment.services
      : [];

  const serviceLineTotal = services.reduce(
    (sum, service) => sum + getServicePrice(service),
    0,
  );

  const serviceSubtotal =
    finalBill?.serviceSubtotal !== undefined &&
    finalBill?.serviceSubtotal !== null
      ? toAmount(finalBill.serviceSubtotal)
      : serviceLineTotal;

  const priceMismatch =
    services.length > 0 &&
    Math.abs(serviceLineTotal - serviceSubtotal) > 0.01;

  const total = toAmount(finalBill?.grandTotal);
  const status = normalizeStatus(finalBill?.status);
  const isPaid = status === 'PAID';

  const openPaymentDetail = () => {
    if (isPaid) {
      router.push(`/receipt/${finalBill.id}`);
      return;
    }
    router.push(`/invoice/${finalBill.id}`);
  };

  const subtitle = isPaid
    ? 'Tap to view your receipt'
    : 'Tap to view payment details';

  return (
    <TouchableOpacity
      onPress={openPaymentDetail}
      activeOpacity={0.8}
      className="mb-6 overflow-hidden rounded-xl border border-primary/20 bg-card"
      style={{
        shadowColor: '#000',
        shadowOpacity: 0.05,
        shadowRadius: 12,
        shadowOffset: { width: 0, height: 4 },
        elevation: 2,
      }}
      accessibilityRole="button"
      accessibilityLabel={
        isPaid
          ? 'View Final Cost receipt'
          : 'View final cost and payment details'
      }
    >
      {/* ==========================================================
          HEADER
      =========================================================== */}
      <View className="flex-row items-center px-4 py-4">
        <View className="mr-3 h-11 w-11 items-center justify-center rounded-full bg-primary/10">
          <ReceiptText size={21} color="#C1272D" strokeWidth={2} />
        </View>

        <View className="min-w-0 flex-1">
          <Text className="text-base font-semibold text-foreground">
            Final Cost
          </Text>
          <Text className="mt-1 text-sm text-muted-foreground">
            {subtitle}
          </Text>
        </View>

        <ChevronRight size={20} color="#8E8E93" />
      </View>

      {/* ==========================================================
          BOOKED SERVICES
      =========================================================== */}
      <View className="border-t border-border px-4 pt-4 pb-3">
        <View className="flex-row items-center mb-2">
          <Wrench size={16} color="#8E8E93" />
          <Text className="ml-2 text-sm font-semibold text-foreground">
            Booked Services
          </Text>
        </View>

        {services.length > 0 ? (
          services.map((service, index) => (
            <View
              key={service?.id || `final-service-${index}`}
              className={`min-h-[46px] flex-row items-center justify-between py-2 ${
                index < services.length - 1 ? 'border-b border-border' : ''
              }`}
            >
              <Text className="flex-1 pr-3 text-sm text-foreground">
                {getServiceName(service)}
              </Text>
              <Text className="text-sm font-semibold text-foreground">
                ₱{formatCurrency(getServicePrice(service))}
              </Text>
            </View>
          ))
        ) : (
          <Text className="py-3 text-xs leading-5 text-muted-foreground">
            Service item details are not available for this Final Cost.
          </Text>
        )}

        <View className="mt-2 flex-row items-center justify-between border-t border-border pt-3">
          <Text className="text-sm font-semibold text-foreground">
            Services Subtotal
          </Text>
          <Text className="text-sm font-semibold text-primary">
            ₱{formatCurrency(serviceSubtotal)}
          </Text>
        </View>

        {priceMismatch && (
          <Text className="mt-2 text-xs leading-5 text-muted-foreground">
            Individual prices reflect the current service catalog. The saved
            Final Cost subtotal is used for billing.
          </Text>
        )}
      </View>

      {/* ==========================================================
          SAVED FINAL TOTAL
      =========================================================== */}
      <View className="flex-row items-center justify-between border-t border-border bg-background px-4 py-4">
        <View className="flex-1 pr-3">
          <Text className="text-sm font-semibold text-foreground">
            Total Cost
          </Text>
          <Text className="mt-1 text-xs text-muted-foreground">
            Includes the applicable findings, fees, and discounts.
          </Text>
        </View>

        <Text className="text-lg font-bold text-primary">
          ₱{formatCurrency(total)}
        </Text>
      </View>
    </TouchableOpacity>
  );
}
