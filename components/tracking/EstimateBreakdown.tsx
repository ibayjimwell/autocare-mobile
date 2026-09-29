import { View, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import {
  CheckCircle2,
  Circle,
  ReceiptText,
  Wrench,
  Tag,
  Check,
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

function findingPartsTotal(finding) {
  const explicit = Number(finding?.partsSubtotal);
  if (Number.isFinite(explicit)) {
    return explicit;
  }

  const parts = Array.isArray(finding?.parts) ? finding.parts : [];

  return parts.reduce(
    (sum, part) =>
      sum +
      Math.max(1, Number(part?.quantity) || 1) *
        Math.max(0, Number(part?.priceAtTime ?? part?.price) || 0),
    0,
  );
}

export default function EstimateBreakdown({
  estimate,
  onToggleFinding,
  togglingFindingId,
}) {
  if (!estimate) return null;

  const services = estimate.services || [];
  const findings = Array.isArray(estimate.findings)
    ? estimate.findings
    : [];
  const fees = estimate.fees || [];
  const discounts = estimate.discounts || [];
  const tasks = estimate.tasks || [];

  const totalService = Number(estimate.serviceSubtotal) || 0;
  const selectedFindings = findings.filter(
    (finding) => finding?.included !== false,
  );
  const totalFindings = selectedFindings.reduce(
    (sum, finding) => sum + findingPartsTotal(finding),
    0,
  );
  const totalFees = Number(estimate.feesTotal) || 0;
  const totalDiscount = Number(estimate.discountTotal) || 0;
  const grandTotal =
    totalService +
    totalFindings +
    totalFees -
    totalDiscount;

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
              Review the findings you want AutoCare to perform.
            </Text>
          </View>
        </View>
      </View>

      {findings.length > 0 && (
        <View className="ml-4 border-t border-border">
          <View className="px-4 pt-4 pb-1">
            <View className="flex-row items-center justify-between gap-3">
              <View className="flex-row items-center">
                <CheckCircle2 size={16} color="#8E8E93" />
                <Text className="text-sm font-semibold text-foreground ml-2">
                  Findings
                </Text>
              </View>

              <Text className="text-xs font-semibold text-primary">
                {selectedFindings.length} of {findings.length} selected
              </Text>
            </View>

            <Text className="mt-1 text-xs leading-5 text-muted-foreground">
              All findings are selected by default. Uncheck one to remove it from the estimate.
            </Text>
          </View>

          <View className="px-4 pb-3">
            {findings.map((finding, fi) => {
              const included = finding?.included !== false;
              const findingSubtotal = included ? findingPartsTotal(finding) : 0;
              const loading = togglingFindingId === finding?.id;

              return (
                <View
                  key={finding?.id || `finding-${fi}`}
                  className={`py-3 ${fi < findings.length - 1 ? 'border-b border-border' : ''}`}
                >
                  <TouchableOpacity
                    accessibilityRole="checkbox"
                    accessibilityState={{
                      checked: included,
                      disabled: !onToggleFinding || Boolean(togglingFindingId),
                    }}
                    onPress={() =>
                      onToggleFinding?.(
                        finding.id,
                        !included,
                      )
                    }
                    disabled={
                      !onToggleFinding || Boolean(togglingFindingId)
                    }
                    activeOpacity={0.75}
                    className="min-h-[44px] flex-row items-start"
                  >
                    <View
                      className={`mt-0.5 h-6 w-6 rounded-md border items-center justify-center ${
                        included
                          ? 'border-primary bg-primary'
                          : 'border-border bg-background'
                      }`}
                    >
                      {loading ? (
                        <ActivityIndicator size="small" color={included ? '#FFFFFF' : '#8E8E93'} />
                      ) : included ? (
                        <Check size={16} color="#FFFFFF" strokeWidth={2.5} />
                      ) : (
                        <Circle size={14} color="#C6C6C8" strokeWidth={1.5} />
                      )}
                    </View>

                    <View className="flex-1 ml-3 pr-2">
                      <Text
                        className={`text-sm font-medium ${
                          included
                            ? 'text-foreground'
                            : 'text-muted-foreground line-through'
                        }`}
                      >
                        {finding?.description || 'Finding'}
                      </Text>

                      <Text
                        className={`mt-1 text-xs font-medium ${
                          included ? 'text-primary' : 'text-muted-foreground'
                        }`}
                      >
                        {included
                          ? 'Included in estimate'
                          : 'Not selected — excluded from total'}
                      </Text>
                    </View>

                    <Text className="text-xs font-semibold text-foreground">
                      ₱{findingSubtotal.toFixed(2)}
                    </Text>
                  </TouchableOpacity>

                  {included && Array.isArray(finding?.parts) && finding.parts.length > 0 && (
                    <View className="ml-9 mt-2">
                      {finding.parts.map((part, pi) => (
                        <View
                          key={part?.id || `${finding?.id}-part-${pi}`}
                          className="flex-row items-center justify-between py-1"
                        >
                          <Text className="flex-1 text-xs text-muted-foreground pr-2">
                            {Math.max(1, Number(part?.quantity) || 1)}x {part?.partName || part?.name || part?.productName || 'Part'}{' '}
                            {part?.isPms ? '(PMS)' : ''}
                          </Text>

                          <Text className="text-xs font-semibold text-foreground">
                            ₱{(Number(part?.totalPrice) || Math.max(1, Number(part?.quantity) || 1) * Math.max(0, Number(part?.priceAtTime ?? part?.price) || 0)).toFixed(2)}
                          </Text>
                        </View>
                      ))}

                      <View className="flex-row justify-between mt-1">
                        <Text className="text-xs font-medium text-muted-foreground">
                          Finding subtotal
                        </Text>
                        <Text className="text-xs font-semibold text-primary">
                          ₱{findingSubtotal.toFixed(2)}
                        </Text>
                      </View>
                    </View>
                  )}
                </View>
              );
            })}

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

      {services.length > 0 && (
        <View className="ml-4 border-t border-border">
          <View className="px-4 pt-4 pb-1 flex-row items-center">
            <Wrench size={16} color="#8E8E93" />
            <Text className="text-sm font-semibold text-foreground ml-2">
              Services
            </Text>
          </View>

          <View className="px-4 pb-3">
            {services.map((service, index) => (
              <BreakdownRow
                key={service?.id || index}
                label={service?.name || 'Service'}
                value={(Number(service?.basePrice) || 0).toFixed(2)}
                last={index === services.length - 1}
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

      {tasks.length > 0 && (
        <View className="ml-4 border-t border-border">
          <View className="px-4 pt-4 pb-1">
            <Text className="text-sm font-semibold text-foreground">
              Completed inspection tasks
            </Text>
          </View>

          <View className="px-4 pb-3">
            {tasks.map((task, index) => (
              <View
                key={task?.id || index}
                className={`flex-row items-center py-3 ${index < tasks.length - 1 ? 'border-b border-border' : ''}`}
              >
                <CheckCircle2 size={17} color="#8E8E93" strokeWidth={2} />
                <Text className="flex-1 text-sm text-foreground ml-2">
                  {task?.title || 'Inspection Task'}
                </Text>
                {task?.durationMinutes ? (
                  <Text className="text-xs text-muted-foreground">
                    {task.durationMinutes} min
                  </Text>
                ) : null}
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
            {fees.map((fee, index) => (
              <BreakdownRow
                key={fee?.id || index}
                label={fee?.title || 'Fee'}
                value={(Number(fee?.amount) || 0).toFixed(2)}
                last={index === fees.length - 1}
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
            {discounts.map((discount, index) => (
              <BreakdownRow
                key={discount?.id || index}
                label={`${discount?.title || 'Discount'} (${discount?.type || 'fixed'})`}
                value={(Number(discount?.amount) || 0).toFixed(2)}
                negative
                last={index === discounts.length - 1}
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
