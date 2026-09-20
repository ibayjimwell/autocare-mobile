import {
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import { router } from 'expo-router';

import {
  ChevronRight,
  ReceiptText,
} from 'lucide-react-native';

function formatCurrency(value) {
  const amount = Number.parseFloat(
    String(value ?? 0),
  );

  const safeAmount = Number.isFinite(amount)
    ? amount
    : 0;

  return safeAmount.toLocaleString(
    'en-PH',
    {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    },
  );
}

function normalizeStatus(value) {
  if (
    typeof value !== 'string'
  ) {
    return '';
  }

  return value
    .trim()
    .toUpperCase();
}

export default function FinalCostCard({
  finalBill,
}) {
  if (!finalBill?.id) {
    return null;
  }

  const total =
    Number.parseFloat(
      String(
        finalBill?.grandTotal ?? 0,
      ),
    ) || 0;

  const status = normalizeStatus(
    finalBill?.status,
  );

  /*
   * PAID Final Costs should go directly to the receipt.
   *
   * OFFICIAL Final Costs continue to the invoice/payment page.
   *
   * Other statuses also continue to the invoice page so the existing
   * status handling in InvoiceScreen remains responsible for them.
   */
  const isPaid =
    status === 'PAID';

  const openPaymentDetail = () => {
    if (isPaid) {
      router.push(
        `/receipt/${finalBill.id}`,
      );

      return;
    }

    router.push(
      `/invoice/${finalBill.id}`,
    );
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
        shadowOffset: {
          width: 0,
          height: 4,
        },
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
          MAIN ROW
      =========================================================== */}

      <View className="flex-row items-center px-4 py-4">
        <View className="mr-3 h-11 w-11 items-center justify-center rounded-full bg-primary/10">
          <ReceiptText
            size={21}
            color="#C1272D"
            strokeWidth={2}
          />
        </View>

        <View className="min-w-0 flex-1">
          <Text className="text-base font-semibold text-foreground">
            Final Cost
          </Text>

          <Text className="mt-1 text-sm text-muted-foreground">
            {subtitle}
          </Text>
        </View>

        <ChevronRight
          size={20}
          color="#8E8E93"
        />
      </View>

      {/* ==========================================================
          TOTAL
      =========================================================== */}

      <View className="ml-4 flex-row items-center justify-between border-t border-border px-4 py-4">
        <Text className="text-sm text-muted-foreground">
          Total Cost
        </Text>

        <Text className="text-lg font-semibold text-primary">
          ₱{formatCurrency(total)}
        </Text>
      </View>
    </TouchableOpacity>
  );
}