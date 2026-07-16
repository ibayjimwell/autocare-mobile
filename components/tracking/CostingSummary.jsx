import { View, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function CostingSummary({
  servicePrice,
  partsTotal,
  laborTotal,
  discountTotal,
  grandTotal,
  isWaitingForApproval,
  actionLoading,
  onApprove,
  onReject,
}) {
  return (
    <View className="p-8 rounded-[32px] mb-10 border border-border bg-card">
      <Text className="text-xl font-heading font-black mb-6 text-foreground">
        Estimate Cost
      </Text>

      <View className="flex-row justify-between mb-4">
        <Text className="text-sm font-medium text-foreground/60">Service</Text>
        <Text className="text-sm font-black text-foreground">₱{servicePrice.toFixed(2)}</Text>
      </View>
      <View className="flex-row justify-between mb-4">
        <Text className="text-sm font-medium text-foreground/60">Parts</Text>
        <Text className="text-sm font-black text-foreground">₱{partsTotal.toFixed(2)}</Text>
      </View>
      <View className="flex-row justify-between mb-4">
        <Text className="text-sm font-medium text-foreground/60">Labor</Text>
        <Text className="text-sm font-black text-foreground">₱{laborTotal.toFixed(2)}</Text>
      </View>
      {discountTotal > 0 && (
        <View className="flex-row justify-between mb-4 px-4 py-3 rounded-2xl bg-green-100">
          <Text className="text-sm font-black text-green-600">Discount</Text>
          <Text className="text-sm font-black text-green-600">- ₱{discountTotal.toFixed(2)}</Text>
        </View>
      )}
      <View className="mt-6 pt-6 border-t border-border flex-row justify-between items-center">
        <Text className="text-lg font-black uppercase text-foreground">Total</Text>
        <View className="items-end">
          <Text className="text-3xl font-heading font-black text-primary">₱{grandTotal.toFixed(2)}</Text>
        </View>
      </View>

      {isWaitingForApproval && (
        <View className="flex-row gap-4 mt-8">
          <TouchableOpacity
            onPress={onReject}
            disabled={actionLoading}
            className="flex-1 h-16 rounded-[24px] items-center justify-center border-2 border-destructive"
          >
            <Text className="text-sm font-black uppercase text-destructive">Reject</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={onApprove}
            disabled={actionLoading}
            className="flex-[2] h-16 rounded-[24px] items-center justify-center bg-green-500 shadow-lg shadow-green-500/30"
          >
            {actionLoading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <View className="flex-row items-center">
                <Text className="text-white font-black uppercase mr-2">Approve</Text>
                <Ionicons name="arrow-forward" size={18} color="#fff" />
              </View>
            )}
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}