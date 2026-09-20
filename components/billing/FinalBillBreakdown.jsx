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

/* ================================================================
   HELPERS
================================================================ */

function toNumber(value) {
  const number = Number.parseFloat(String(value ?? ''));

  return Number.isFinite(number) ? number : 0;
}

function formatCurrency(value) {
  return toNumber(value).toLocaleString('en-PH', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function getPartTotal(part) {
  const storedTotal = toNumber(part?.totalPrice);

  if (storedTotal !== 0) {
    return storedTotal;
  }

  return (
    toNumber(part?.priceAtTime) *
    Math.max(1, toNumber(part?.quantity) || 1)
  );
}

function getFindingSubtotal(finding) {
  const storedSubtotal = toNumber(finding?.partsSubtotal);

  if (
    storedSubtotal !== 0 ||
    !Array.isArray(finding?.parts) ||
    finding.parts.length === 0
  ) {
    return storedSubtotal;
  }

  return finding.parts.reduce(
    (sum, part) => sum + getPartTotal(part),
    0,
  );
}

function getWorkTaskAmount(task) {
  /*
   * Final-bill work-task responses can expose the task charge using
   * different monetary field names depending on the API response.
   * Prefer an explicit final amount first, then supported fallbacks.
   */
  const candidates = [
    task?.price,
    task?.amount,
    task?.totalPrice,
    task?.laborCost,
  ];

  for (const candidate of candidates) {
    const value = toNumber(candidate);

    if (value !== 0) {
      return value;
    }
  }

  return 0;
}

function getWorkTasksSubtotal(workTasks) {
  return workTasks.reduce(
    (sum, task) => sum + getWorkTaskAmount(task),
    0,
  );
}

function getServicesSubtotal(services) {
  return services.reduce(
    (sum, service) => sum + toNumber(service?.basePrice),
    0,
  );
}

function getFindingsTotal(findings) {
  return findings.reduce(
    (sum, finding) => sum + getFindingSubtotal(finding),
    0,
  );
}

function getFeesTotal(fees) {
  return fees.reduce(
    (sum, fee) => sum + toNumber(fee?.amount),
    0,
  );
}

function getDiscountTotal(discounts) {
  return discounts.reduce(
    (sum, discount) => sum + toNumber(discount?.amount),
    0,
  );
}

/* ================================================================
   COMPONENT
================================================================ */

export default function FinalBillBreakdown({ finalBill }) {
  if (!finalBill) {
    return null;
  }

  /*
   * Keep the final-bill breakdown aligned with the estimate breakdown:
   *
   * Services
   * Findings + parts
   * Work Tasks
   * Fees
   * Discounts
   * Total
   *
   * No costing section is intentionally omitted from the final-bill
   * presentation when the corresponding information exists.
   */
  const services = Array.isArray(finalBill?.appointment?.services)
    ? finalBill.appointment.services
    : [];

  const findings = Array.isArray(finalBill?.findings)
    ? finalBill.findings
    : [];

  const workTasks = Array.isArray(finalBill?.workTasks)
    ? finalBill.workTasks
    : Array.isArray(finalBill?.tasks)
      ? finalBill.tasks
      : [];

  const fees = Array.isArray(finalBill?.fees)
    ? finalBill.fees
    : [];

  const discounts = Array.isArray(finalBill?.discounts)
    ? finalBill.discounts
    : [];

  /*
   * Stored final-bill totals remain the source of truth.
   * Calculated fallbacks only prevent a missing subtotal field from
   * leaving the presentation incomplete when item-level data exists.
   */
  const storedServiceSubtotal = toNumber(finalBill?.serviceSubtotal);
  const storedFindingsSubtotal = toNumber(finalBill?.findingsSubtotal);
  const storedWorkTasksSubtotal = toNumber(finalBill?.workTasksSubtotal);
  const storedFeesTotal = toNumber(finalBill?.feesTotal);
  const storedDiscountTotal = toNumber(finalBill?.discountTotal);

  const calculatedServiceSubtotal = getServicesSubtotal(services);
  const calculatedFindingsSubtotal = getFindingsTotal(findings);
  const calculatedWorkTasksSubtotal = getWorkTasksSubtotal(workTasks);
  const calculatedFeesTotal = getFeesTotal(fees);
  const calculatedDiscountTotal = getDiscountTotal(discounts);

  const totalService =
    storedServiceSubtotal !== 0 || calculatedServiceSubtotal === 0
      ? storedServiceSubtotal
      : calculatedServiceSubtotal;

  const totalFindings =
    storedFindingsSubtotal !== 0 || calculatedFindingsSubtotal === 0
      ? storedFindingsSubtotal
      : calculatedFindingsSubtotal;

  const totalWorkTasks =
    storedWorkTasksSubtotal !== 0 || calculatedWorkTasksSubtotal === 0
      ? storedWorkTasksSubtotal
      : calculatedWorkTasksSubtotal;

  const totalFees =
    storedFeesTotal !== 0 || calculatedFeesTotal === 0
      ? storedFeesTotal
      : calculatedFeesTotal;

  const totalDiscount =
    storedDiscountTotal !== 0 || calculatedDiscountTotal === 0
      ? storedDiscountTotal
      : calculatedDiscountTotal;

  const storedGrandTotal = toNumber(finalBill?.grandTotal);

  const calculatedGrandTotal =
    totalService +
    totalFindings +
    totalWorkTasks +
    totalFees -
    totalDiscount;

  const grandTotal =
    storedGrandTotal !== 0 || calculatedGrandTotal === 0
      ? storedGrandTotal
      : calculatedGrandTotal;

  return (
    <View className="bg-card rounded-2xl border border-border overflow-hidden">
      {/* ==========================================================
          HEADER
      =========================================================== */}

      <View className="px-4 py-4 flex-row items-center border-b border-border">
        <View className="w-10 h-10 rounded-xl bg-primary/10 items-center justify-center mr-3">
          <ReceiptText size={20} color="#C1272D" />
        </View>

        <View className="flex-1">
          <Text className="text-lg font-semibold text-foreground">
            Final Cost Breakdown
          </Text>

          <Text className="text-sm text-muted-foreground mt-0.5">
            Review every charge before payment.
          </Text>
        </View>
      </View>

      {/* ==========================================================
          SERVICES
      =========================================================== */}

      {services.length > 0 && (
        <View className="border-b border-border">
          <View className="px-4 py-3 flex-row items-center">
            <Wrench size={16} color="#8E8E93" />

            <Text className="text-sm font-semibold text-muted-foreground ml-2">
              Services
            </Text>
          </View>

          {services.map((service, index) => (
            <View
              key={service?.id ?? `service-${index}`}
              className="flex-row justify-between items-center min-h-[44px] px-4 ml-4 border-t border-border"
            >
              <Text className="flex-1 pr-4 text-sm text-foreground">
                {service?.name || 'Service'}
              </Text>

              <Text className="text-sm font-semibold text-foreground">
                ₱{formatCurrency(service?.basePrice)}
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

      {/* ==========================================================
          FINDINGS
      =========================================================== */}

      {findings.length > 0 && (
        <View className="border-b border-border">
          <View className="px-4 py-3 flex-row items-center">
            <SearchCheck size={16} color="#8E8E93" />

            <Text className="text-sm font-semibold text-muted-foreground ml-2">
              Findings
            </Text>
          </View>

          {findings.map((finding, findingIndex) => {
            const parts = Array.isArray(finding?.parts)
              ? finding.parts
              : [];

            const findingSubtotal = getFindingSubtotal(finding);

            return (
              <View
                key={finding?.id ?? `finding-${findingIndex}`}
                className="px-4 ml-4 py-3 border-t border-border"
              >
                <Text className="text-sm font-medium text-foreground">
                  {finding?.description || 'Finding'}
                </Text>

                {parts.length > 0 && (
                  <View className="mt-2 rounded-xl bg-background overflow-hidden">
                    {parts.map((part, partIndex) => (
                      <View
                        key={
                          part?.id ??
                          `${findingIndex}-part-${partIndex}`
                        }
                        className="flex-row justify-between items-center min-h-[42px] px-3 border-b border-border"
                      >
                        <View className="flex-1 pr-3">
                          <Text className="text-xs text-muted-foreground">
                            {toNumber(part?.quantity) || 1}x{' '}
                            {part?.partName || 'Part'}{' '}
                            {part?.isPms ? '(PMS)' : ''}
                          </Text>
                        </View>

                        <Text className="text-xs font-semibold text-foreground">
                          ₱{formatCurrency(getPartTotal(part))}
                        </Text>
                      </View>
                    ))}

                    <View className="flex-row justify-between items-center px-3 py-2">
                      <Text className="text-xs font-semibold text-muted-foreground">
                        Finding subtotal
                      </Text>

                      <Text className="text-xs font-bold text-primary">
                        ₱{formatCurrency(findingSubtotal)}
                      </Text>
                    </View>
                  </View>
                )}
              </View>
            );
          })}

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

      {/* ==========================================================
          WORK TASKS
      =========================================================== */}

      {workTasks.length > 0 && (
        <View className="border-b border-border">
          <View className="px-4 py-3 flex-row items-center">
            <HardHat size={16} color="#8E8E93" />

            <Text className="text-sm font-semibold text-muted-foreground ml-2">
              Work Tasks
            </Text>
          </View>

          {workTasks.map((task, index) => {
            const taskAmount = getWorkTaskAmount(task);

            return (
              <View
                key={task?.id ?? `work-task-${index}`}
                className="flex-row justify-between items-center min-h-[44px] px-4 ml-4 border-t border-border"
              >
                <View className="flex-1 pr-4">
                  <Text className="text-sm text-foreground">
                    {task?.title || 'Work Task'}
                  </Text>

                  {task?.durationMinutes != null && (
                    <Text className="text-xs text-muted-foreground mt-0.5">
                      {task.durationMinutes} min
                    </Text>
                  )}
                </View>

                <Text className="text-sm font-semibold text-foreground">
                  ₱{formatCurrency(taskAmount)}
                </Text>
              </View>
            );
          })}

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

      {/* ==========================================================
          FEES
      =========================================================== */}

      {fees.length > 0 && (
        <View className="border-b border-border">
          <View className="px-4 py-3 flex-row items-center">
            <BadgeDollarSign size={16} color="#8E8E93" />

            <Text className="text-sm font-semibold text-muted-foreground ml-2">
              Fees
            </Text>
          </View>

          {fees.map((fee, index) => (
            <View
              key={fee?.id ?? `fee-${index}`}
              className="flex-row justify-between items-center min-h-[44px] px-4 ml-4 border-t border-border"
            >
              <Text className="flex-1 pr-4 text-sm text-foreground">
                {fee?.title || 'Fee'}
              </Text>

              <Text className="text-sm font-semibold text-foreground">
                ₱{formatCurrency(fee?.amount)}
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

      {/* ==========================================================
          DISCOUNTS
      =========================================================== */}

      {discounts.length > 0 && (
        <View className="border-b border-border">
          <View className="px-4 py-3 flex-row items-center">
            <Percent size={16} color="#8E8E93" />

            <Text className="text-sm font-semibold text-muted-foreground ml-2">
              Discounts
            </Text>
          </View>

          {discounts.map((discount, index) => (
            <View
              key={discount?.id ?? `discount-${index}`}
              className="flex-row justify-between items-center min-h-[44px] px-4 ml-4 border-t border-border"
            >
              <Text className="flex-1 pr-4 text-sm text-foreground">
                {discount?.title || 'Discount'} (
                {discount?.type || 'FIXED'})
              </Text>

              <Text className="text-sm font-semibold text-[#D64545]">
                -₱{formatCurrency(Math.abs(toNumber(discount?.amount)))}
              </Text>
            </View>
          ))}

          <View className="flex-row justify-between items-center px-4 py-3 bg-background">
            <Text className="text-sm font-semibold text-foreground">
              Discount Total
            </Text>

            <Text className="text-sm font-bold text-[#D64545]">
              -₱{formatCurrency(Math.abs(totalDiscount))}
            </Text>
          </View>
        </View>
      )}

      {/* ==========================================================
          TOTAL
      =========================================================== */}

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