import { View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

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
    <View className="p-4 rounded-3xl bg-card border border-border">
      <Text className="text-xl font-heading font-black mb-4 text-foreground">Estimate Breakdown</Text>

      {/* Services */}
      {services.length > 0 && (
        <View className="mb-4">
          <Text className="text-sm font-bold text-muted-foreground mb-2">Services</Text>
          {services.map((s, i) => (
            <View key={i} className="flex-row justify-between py-1 border-b border-border/50">
              <Text className="text-sm font-medium text-foreground">{s.name}</Text>
              <Text className="text-sm font-bold text-foreground">₱{parseFloat(s.basePrice).toFixed(2)}</Text>
            </View>
          ))}
          <View className="flex-row justify-between mt-1 pt-1 border-t border-border">
            <Text className="text-sm font-bold text-foreground">Subtotal</Text>
            <Text className="text-sm font-bold text-primary">₱{totalService.toFixed(2)}</Text>
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
                      <Text className="text-xs font-bold text-foreground">₱{parseFloat(p.totalPrice).toFixed(2)}</Text>
                    </View>
                  ))}
                  <View className="flex-row justify-between mt-1">
                    <Text className="text-xs font-bold text-muted-foreground">Finding subtotal</Text>
                    <Text className="text-xs font-bold text-primary">₱{parseFloat(f.partsSubtotal).toFixed(2)}</Text>
                  </View>
                </View>
              )}
            </View>
          ))}
          <View className="flex-row justify-between mt-1 pt-1 border-t border-border">
            <Text className="text-sm font-bold text-foreground">Findings Subtotal</Text>
            <Text className="text-sm font-bold text-primary">₱{totalFindings.toFixed(2)}</Text>
          </View>
        </View>
      )}

      {/* Tasks (optional) */}
      {tasks.length > 0 && (
        <View className="mb-4">
          <Text className="text-sm font-bold text-muted-foreground mb-2">Completed Inspection Tasks</Text>
          {tasks.map((t, i) => (
            <View key={i} className="flex-row items-center py-1 border-b border-border/50">
              <Ionicons name="checkmark-circle" size={16} color="#22c55e" />
              <Text className="text-sm font-medium text-foreground ml-2">{t.title}</Text>
              {t.durationMinutes && (
                <Text className="text-xs text-muted-foreground ml-auto">{t.durationMinutes} min</Text>
              )}
            </View>
          ))}
        </View>
      )}

      {/* Fees */}
      {fees.length > 0 && (
        <View className="mb-4">
          <Text className="text-sm font-bold text-muted-foreground mb-2">Fees</Text>
          {fees.map((fee, i) => (
            <View key={i} className="flex-row justify-between py-1 border-b border-border/50">
              <Text className="text-sm font-medium text-foreground">{fee.title}</Text>
              <Text className="text-sm font-bold text-foreground">₱{parseFloat(fee.amount).toFixed(2)}</Text>
            </View>
          ))}
          <View className="flex-row justify-between mt-1 pt-1 border-t border-border">
            <Text className="text-sm font-bold text-foreground">Fees Subtotal</Text>
            <Text className="text-sm font-bold text-primary">₱{totalFees.toFixed(2)}</Text>
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
              <Text className="text-sm font-bold text-red-500">-₱{parseFloat(disc.amount).toFixed(2)}</Text>
            </View>
          ))}
          <View className="flex-row justify-between mt-1 pt-1 border-t border-border">
            <Text className="text-sm font-bold text-foreground">Discount Total</Text>
            <Text className="text-sm font-bold text-red-500">-₱{totalDiscount.toFixed(2)}</Text>
          </View>
        </View>
      )}

      {/* Grand Total */}
      <View className="mt-4 pt-4 border-t-2 border-border flex-row justify-between items-center">
        <Text className="text-lg font-black uppercase text-foreground">Total</Text>
        <Text className="text-2xl font-heading font-black text-primary">₱{grandTotal.toFixed(2)}</Text>
      </View>
    </View>
  );
}