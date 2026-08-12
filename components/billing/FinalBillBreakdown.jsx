import { View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

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

  const formatCurrency = (value) => {
    const num = parseFloat(value) || 0;
    return num.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  return (
    <View className="p-4 rounded-3xl bg-card border border-border">
      <Text className="text-xl font-heading font-black mb-4 text-foreground">Final Bill Breakdown</Text>

      {/* Services */}
      {services.length > 0 && (
        <View className="mb-4">
          <Text className="text-sm font-bold text-muted-foreground mb-2">Services</Text>
          {services.map((s, i) => (
            <View key={i} className="flex-row justify-between py-1 border-b border-border/50">
              <Text className="text-sm font-medium text-foreground">{s.name}</Text>
              <Text className="text-sm font-bold text-foreground">₱{formatCurrency(s.basePrice)}</Text>
            </View>
          ))}
          <View className="flex-row justify-between mt-1 pt-1 border-t border-border">
            <Text className="text-sm font-bold text-foreground">Service Subtotal</Text>
            <Text className="text-sm font-bold text-primary">₱{formatCurrency(totalService)}</Text>
          </View>
        </View>
      )}

      {/* Findings */}
      {findings.length > 0 && (
        <View className="mb-4">
          <Text className="text-sm font-bold text-muted-foreground mb-2">Findings</Text>
          {findings.map((f, fi) => (
            <View key={fi} className="mb-2 border-b border-border/50 pb-2">
              <Text className="text-sm font-medium text-foreground">{f.description}</Text>
              {f.parts && f.parts.length > 0 && (
                <View className="ml-4 mt-1">
                  {f.parts.map((p, pi) => (
                    <View key={pi} className="flex-row justify-between">
                      <Text className="text-xs text-muted-foreground">{p.quantity}x {p.partName} {p.isPms ? '(PMS)' : ''}</Text>
                      <Text className="text-xs font-bold text-foreground">₱{formatCurrency(p.totalPrice)}</Text>
                    </View>
                  ))}
                  <View className="flex-row justify-between mt-1">
                    <Text className="text-xs font-bold text-muted-foreground">Finding subtotal</Text>
                    <Text className="text-xs font-bold text-primary">₱{formatCurrency(f.partsSubtotal)}</Text>
                  </View>
                </View>
              )}
            </View>
          ))}
          <View className="flex-row justify-between mt-1 pt-1 border-t border-border">
            <Text className="text-sm font-bold text-foreground">Findings Subtotal</Text>
            <Text className="text-sm font-bold text-primary">₱{formatCurrency(totalFindings)}</Text>
          </View>
        </View>
      )}

      {/* Work Tasks */}
      {workTasks.length > 0 && (
        <View className="mb-4">
          <Text className="text-sm font-bold text-muted-foreground mb-2">Work Tasks</Text>
          {workTasks.map((t, i) => (
            <View key={i} className="flex-row justify-between py-1 border-b border-border/50">
              <Text className="text-sm font-medium text-foreground">{t.title}</Text>
              <Text className="text-sm font-bold text-foreground">₱{formatCurrency(t.price || 0)}</Text>
            </View>
          ))}
          <View className="flex-row justify-between mt-1 pt-1 border-t border-border">
            <Text className="text-sm font-bold text-foreground">Work Tasks Subtotal</Text>
            <Text className="text-sm font-bold text-primary">₱{formatCurrency(totalWorkTasks)}</Text>
          </View>
        </View>
      )}

      {/* Fees */}
      {fees.length > 0 && (
        <View className="mb-4">
          <Text className="text-sm font-bold text-muted-foreground mb-2">Fees</Text>
          {fees.map((fee, i) => (
            <View key={i} className="flex-row justify-between py-1 border-b border-border/50">
              <Text className="text-sm font-medium text-foreground">{fee.title}</Text>
              <Text className="text-sm font-bold text-foreground">₱{formatCurrency(fee.amount)}</Text>
            </View>
          ))}
          <View className="flex-row justify-between mt-1 pt-1 border-t border-border">
            <Text className="text-sm font-bold text-foreground">Fees Subtotal</Text>
            <Text className="text-sm font-bold text-primary">₱{formatCurrency(totalFees)}</Text>
          </View>
        </View>
      )}

      {/* Discounts */}
      {discounts.length > 0 && (
        <View className="mb-4">
          <Text className="text-sm font-bold text-muted-foreground mb-2">Discounts</Text>
          {discounts.map((disc, i) => (
            <View key={i} className="flex-row justify-between py-1 border-b border-border/50">
              <Text className="text-sm font-medium text-foreground">{disc.title} ({disc.type})</Text>
              <Text className="text-sm font-bold text-red-500">-₱{formatCurrency(disc.amount)}</Text>
            </View>
          ))}
          <View className="flex-row justify-between mt-1 pt-1 border-t border-border">
            <Text className="text-sm font-bold text-foreground">Discount Total</Text>
            <Text className="text-sm font-bold text-red-500">-₱{formatCurrency(totalDiscount)}</Text>
          </View>
        </View>
      )}

      {/* Grand Total */}
      <View className="mt-4 pt-4 border-t-2 border-border flex-row justify-between items-center">
        <Text className="text-lg font-black uppercase text-foreground">Total</Text>
        <Text className="text-2xl font-heading font-black text-primary">₱{formatCurrency(grandTotal)}</Text>
      </View>
    </View>
  );
}