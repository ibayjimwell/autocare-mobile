import { View, Text } from 'react-native';
import {
  CheckCircle2,
  ReceiptText,
  Wrench,
  Tag,
} from 'lucide-react-native';

function BreakdownRow({
  label,
  value,
  negative = false,
  last = false,
}) {
  return (
    <View
      className={`min-h-[52px] py-3 flex-row items-center justify-between ${
        !last ? 'border-b border-border' : ''
      }`}
    >
      <Text className="flex-1 text-sm text-foreground pr-3">
        {label}
      </Text>

      <Text
        className="text-sm font-semibold"
        style={{
          color: negative ? '#C1272D' : '#000000',
        }}
      >
        {negative ? '-' : ''}₱{value}
      </Text>
    </View>
  );
}

export default function EstimateBreakdown({ estimate }) {
  if (!estimate) return null;

  const services = estimate.appointment?.services || [];
  const findings = estimate.findings || [];
  const fees = estimate.fees || [];
  const discounts = estimate.discounts || [];
  const tasks = estimate.tasks || [];

  const totalService = parseFloat(estimate.serviceSubtotal) || 0;
  const totalFindings = parseFloat(estimate.findingsSubtotal) || 0;
  const totalFees = parseFloat(estimate.feesTotal) || 0;
  const totalDiscount = parseFloat(estimate.discountTotal) || 0;
  const grandTotal = parseFloat(estimate.grandTotal) || 0;

  return (
    <View className="bg-card rounded-xl border border-border overflow-hidden mb-6">
      <View className="px-4 py-4">
        <View className="flex-row items-center">
          <View className="w-11 h-11 rounded-full bg-primary/10 items-center justify-center mr-3">
            <ReceiptText size={21} color="#C1272D" />
          </View>

          <View className="flex-1">
            <Text className="text-lg font-semibold text-foreground">
              Estimate Breakdown
            </Text>

            <Text className="text-sm text-muted-foreground mt-1">
              Review the proposed service costs
            </Text>
          </View>
        </View>
      </View>

      {services.length > 0 && (
        <View className="ml-4 border-t border-border">
          <View className="px-4 pt-4 pb-1 flex-row items-center">
            <Wrench size={16} color="#8E8E93" />
            <Text className="text-sm font-semibold text-foreground ml-2">
              Services
            </Text>
          </View>

          <View className="px-4 pb-3">
            {services.map((s, i) => (
              <BreakdownRow
                key={i}
                label={s.name}
                value={parseFloat(s.basePrice).toFixed(2)}
              />
            ))}

            <View className="flex-row justify-between pt-3">
              <Text className="text-sm font-semibold text-foreground">
                Subtotal
              </Text>

              <Text className="text-sm font-semibold text-primary">
                ₱{totalService.toFixed(2)}
              </Text>
            </View>
          </View>
        </View>
      )}

      {findings.length > 0 && (
        <View className="ml-4 border-t border-border">
          <View className="px-4 pt-4 pb-1">
            <Text className="text-sm font-semibold text-foreground">
              Findings
            </Text>
          </View>

          <View className="px-4 pb-3">
            {findings.map((f, fi) => (
              <View
                key={fi}
                className="py-3 border-b border-border"
              >
                <Text className="text-sm text-foreground">
                  {f.description}
                </Text>

                {f.parts && f.parts.length > 0 && (
                  <View className="mt-2">
                    {f.parts.map((p, pi) => (
                      <View
                        key={pi}
                        className="flex-row items-center justify-between py-1"
                      >
                        <Text className="flex-1 text-xs text-muted-foreground pr-2">
                          {p.quantity}x {p.partName}{' '}
                          {p.isPms ? '(PMS)' : ''}
                        </Text>

                        <Text className="text-xs font-semibold text-foreground">
                          ₱{parseFloat(
                            p.totalPrice
                          ).toFixed(2)}
                        </Text>
                      </View>
                    ))}

                    <View className="flex-row justify-between mt-1">
                      <Text className="text-xs font-medium text-muted-foreground">
                        Finding subtotal
                      </Text>

                      <Text className="text-xs font-semibold text-primary">
                        ₱{parseFloat(
                          f.partsSubtotal
                        ).toFixed(2)}
                      </Text>
                    </View>
                  </View>
                )}
              </View>
            ))}

            <View className="flex-row justify-between pt-3">
              <Text className="text-sm font-semibold text-foreground">
                Findings subtotal
              </Text>

              <Text className="text-sm font-semibold text-primary">
                ₱{totalFindings.toFixed(2)}
              </Text>
            </View>
          </View>
        </View>
      )}

      {tasks.length > 0 && (
        <View className="ml-4 border-t border-border">
          <View className="px-4 pt-4 pb-1">
            <Text className="text-sm font-semibold text-foreground">
              Completed inspection tasks
            </Text>
          </View>

          <View className="px-4 pb-3">
            {tasks.map((t, i) => (
              <View
                key={i}
                className="flex-row items-center py-3 border-b border-border"
              >
                <CheckCircle2
                  size={17}
                  color="#10B981"
                  strokeWidth={2}
                />

                <Text className="flex-1 text-sm text-foreground ml-2">
                  {t.title}
                </Text>

                {t.durationMinutes && (
                  <Text className="text-xs text-muted-foreground">
                    {t.durationMinutes} min
                  </Text>
                )}
              </View>
            ))}
          </View>
        </View>
      )}

      {fees.length > 0 && (
        <View className="ml-4 border-t border-border">
          <View className="px-4 pt-4 pb-1">
            <Text className="text-sm font-semibold text-foreground">
              Fees
            </Text>
          </View>

          <View className="px-4 pb-3">
            {fees.map((fee, i) => (
              <BreakdownRow
                key={i}
                label={fee.title}
                value={parseFloat(fee.amount).toFixed(2)}
              />
            ))}

            <View className="flex-row justify-between pt-3">
              <Text className="text-sm font-semibold text-foreground">
                Fees subtotal
              </Text>

              <Text className="text-sm font-semibold text-primary">
                ₱{totalFees.toFixed(2)}
              </Text>
            </View>
          </View>
        </View>
      )}

      {discounts.length > 0 && (
        <View className="ml-4 border-t border-border">
          <View className="px-4 pt-4 pb-1 flex-row items-center">
            <Tag size={16} color="#8E8E93" />
            <Text className="text-sm font-semibold text-foreground ml-2">
              Discounts
            </Text>
          </View>

          <View className="px-4 pb-3">
            {discounts.map((disc, i) => (
              <BreakdownRow
                key={i}
                label={`${disc.title} (${disc.type})`}
                value={parseFloat(disc.amount).toFixed(2)}
                negative
              />
            ))}

            <View className="flex-row justify-between pt-3">
              <Text className="text-sm font-semibold text-foreground">
                Discount total
              </Text>

              <Text className="text-sm font-semibold text-primary">
                -₱{totalDiscount.toFixed(2)}
              </Text>
            </View>
          </View>
        </View>
      )}

      <View className="ml-4 border-t border-border bg-background px-4 py-5">
        <View className="flex-row items-center justify-between">
          <View>
            <Text className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Total
            </Text>

            <Text className="text-2xl font-bold text-primary mt-1">
              ₱{grandTotal.toFixed(2)}
            </Text>
          </View>

          <ReceiptText size={28} color="#C1272D" strokeWidth={1.8} />
        </View>
      </View>
    </View>
  );
}