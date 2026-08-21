import { View, Text } from 'react-native';
import {
  ReceiptText,
  Wrench,
  SearchCheck,
  HardHat,
  Percent,
  BadgeDollarSign,
  WalletCards,
} from 'lucide-react-native';

export default function FinalBillBreakdown({ finalBill }) {
  if (!finalBill) return null;

  const services = finalBill.appointment?.services || [];
  const findings = finalBill.findings || [];
  const workTasks = finalBill.workTasks || [];
  const fees = finalBill.fees || [];
  const discounts = finalBill.discounts || [];

  const totalService = parseFloat(finalBill.serviceSubtotal) || 0;
  const totalFindings = parseFloat(finalBill.findingsSubtotal) || 0;
  const totalWorkTasks = parseFloat(finalBill.workTasksSubtotal) || 0;
  const totalFees = parseFloat(finalBill.feesTotal) || 0;
  const totalDiscount = parseFloat(finalBill.discountTotal) || 0;
  const grandTotal = parseFloat(finalBill.grandTotal) || 0;

  const formatCurrency = value => {
    const num = parseFloat(value) || 0;

    return num.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  return (
    <View className="bg-card rounded-2xl border border-border overflow-hidden">
      <View className="px-4 py-4 flex-row items-center border-b border-border">
        <View className="w-10 h-10 rounded-xl bg-primary/10 items-center justify-center mr-3">
          <ReceiptText size={20} color="#C1272D" />
        </View>

        <View>
          <Text className="text-lg font-semibold text-foreground">
            Final Bill Breakdown
          </Text>

          <Text className="text-sm text-muted-foreground mt-0.5">
            Review every charge before payment.
          </Text>
        </View>
      </View>

      {/* Services */}
      {services.length > 0 && (
        <View className="border-b border-border">
          <View className="px-4 py-3 flex-row items-center">
            <Wrench size={16} color="#8E8E93" />

            <Text className="text-sm font-semibold text-muted-foreground ml-2">
              Services
            </Text>
          </View>

          {services.map((s, i) => (
            <View
              key={i}
              className="flex-row justify-between items-center min-h-[44px] px-4 ml-4 border-t border-border"
            >
              <Text className="flex-1 pr-4 text-sm text-foreground">
                {s.name}
              </Text>

              <Text className="text-sm font-semibold text-foreground">
                ₱{formatCurrency(s.basePrice)}
              </Text>
            </View>
          ))}

          <View className="flex-row justify-between items-center px-4 py-3 bg-background">
            <Text className="text-sm font-semibold text-foreground">
              Service Subtotal
            </Text>

            <Text className="text-sm font-bold text-primary">
              ₱{formatCurrency(totalService)}
            </Text>
          </View>
        </View>
      )}

      {/* Findings */}
      {findings.length > 0 && (
        <View className="border-b border-border">
          <View className="px-4 py-3 flex-row items-center">
            <SearchCheck size={16} color="#8E8E93" />

            <Text className="text-sm font-semibold text-muted-foreground ml-2">
              Findings
            </Text>
          </View>

          {findings.map((f, fi) => (
            <View
              key={fi}
              className="px-4 ml-4 py-3 border-t border-border"
            >
              <Text className="text-sm font-medium text-foreground">
                {f.description}
              </Text>

              {f.parts && f.parts.length > 0 && (
                <View className="mt-2 rounded-xl bg-background overflow-hidden">
                  {f.parts.map((p, pi) => (
                    <View
                      key={pi}
                      className="flex-row justify-between items-center min-h-[42px] px-3 border-b border-border"
                    >
                      <Text className="flex-1 pr-3 text-xs text-muted-foreground">
                        {p.quantity}x {p.partName}{' '}
                        {p.isPms ? '(PMS)' : ''}
                      </Text>

                      <Text className="text-xs font-semibold text-foreground">
                        ₱{formatCurrency(p.totalPrice)}
                      </Text>
                    </View>
                  ))}

                  <View className="flex-row justify-between items-center px-3 py-2">
                    <Text className="text-xs font-semibold text-muted-foreground">
                      Finding subtotal
                    </Text>

                    <Text className="text-xs font-bold text-primary">
                      ₱{formatCurrency(f.partsSubtotal)}
                    </Text>
                  </View>
                </View>
              )}
            </View>
          ))}

          <View className="flex-row justify-between items-center px-4 py-3 bg-background">
            <Text className="text-sm font-semibold text-foreground">
              Findings Subtotal
            </Text>

            <Text className="text-sm font-bold text-primary">
              ₱{formatCurrency(totalFindings)}
            </Text>
          </View>
        </View>
      )}

      {/* Work Tasks */}
      {workTasks.length > 0 && (
        <View className="border-b border-border">
          <View className="px-4 py-3 flex-row items-center">
            <HardHat size={16} color="#8E8E93" />

            <Text className="text-sm font-semibold text-muted-foreground ml-2">
              Work Tasks
            </Text>
          </View>

          {workTasks.map((t, i) => (
            <View
              key={i}
              className="flex-row justify-between items-center min-h-[44px] px-4 ml-4 border-t border-border"
            >
              <Text className="flex-1 pr-4 text-sm text-foreground">
                {t.title}
              </Text>

              <Text className="text-sm font-semibold text-foreground">
                ₱{formatCurrency(t.price || 0)}
              </Text>
            </View>
          ))}

          <View className="flex-row justify-between items-center px-4 py-3 bg-background">
            <Text className="text-sm font-semibold text-foreground">
              Work Tasks Subtotal
            </Text>

            <Text className="text-sm font-bold text-primary">
              ₱{formatCurrency(totalWorkTasks)}
            </Text>
          </View>
        </View>
      )}

      {/* Fees */}
      {fees.length > 0 && (
        <View className="border-b border-border">
          <View className="px-4 py-3 flex-row items-center">
            <BadgeDollarSign size={16} color="#8E8E93" />

            <Text className="text-sm font-semibold text-muted-foreground ml-2">
              Fees
            </Text>
          </View>

          {fees.map((fee, i) => (
            <View
              key={i}
              className="flex-row justify-between items-center min-h-[44px] px-4 ml-4 border-t border-border"
            >
              <Text className="flex-1 pr-4 text-sm text-foreground">
                {fee.title}
              </Text>

              <Text className="text-sm font-semibold text-foreground">
                ₱{formatCurrency(fee.amount)}
              </Text>
            </View>
          ))}

          <View className="flex-row justify-between items-center px-4 py-3 bg-background">
            <Text className="text-sm font-semibold text-foreground">
              Fees Subtotal
            </Text>

            <Text className="text-sm font-bold text-primary">
              ₱{formatCurrency(totalFees)}
            </Text>
          </View>
        </View>
      )}

      {/* Discounts */}
      {discounts.length > 0 && (
        <View className="border-b border-border">
          <View className="px-4 py-3 flex-row items-center">
            <Percent size={16} color="#8E8E93" />

            <Text className="text-sm font-semibold text-muted-foreground ml-2">
              Discounts
            </Text>
          </View>

          {discounts.map((disc, i) => (
            <View
              key={i}
              className="flex-row justify-between items-center min-h-[44px] px-4 ml-4 border-t border-border"
            >
              <Text className="flex-1 pr-4 text-sm text-foreground">
                {disc.title} ({disc.type})
              </Text>

              <Text className="text-sm font-semibold text-[#D64545]">
                -₱{formatCurrency(disc.amount)}
              </Text>
            </View>
          ))}

          <View className="flex-row justify-between items-center px-4 py-3 bg-background">
            <Text className="text-sm font-semibold text-foreground">
              Discount Total
            </Text>

            <Text className="text-sm font-bold text-[#D64545]">
              -₱{formatCurrency(totalDiscount)}
            </Text>
          </View>
        </View>
      )}

      {/* Total */}
      <View className="px-4 py-5">
        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center">
            <View className="w-10 h-10 rounded-xl bg-primary/10 items-center justify-center mr-3">
              <WalletCards size={18} color="#C1272D" />
            </View>

            <View>
              <Text className="text-xs uppercase tracking-[1.2px] font-semibold text-muted-foreground">
                Total
              </Text>

              <Text className="text-sm text-muted-foreground mt-0.5">
                Amount due
              </Text>
            </View>
          </View>

          <Text className="text-2xl font-bold text-primary">
            ₱{formatCurrency(grandTotal)}
          </Text>
        </View>
      </View>
    </View>
  );
}