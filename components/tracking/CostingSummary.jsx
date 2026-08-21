import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import {
  ArrowRight,
  Check,
  X,
  ReceiptText,
} from 'lucide-react-native';
import EstimateBreakdown from './EstimateBreakdown';

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
  estimate,
}) {
  // If we have the full estimate, render breakdown
  if (estimate && estimate.findings) {
    return (
      <View className="mb-6">
        <EstimateBreakdown estimate={estimate} />

        {isWaitingForApproval && (
          <View className="bg-card rounded-xl border border-border p-3 flex-row">
            <TouchableOpacity
              onPress={onReject}
              disabled={actionLoading}
              activeOpacity={0.8}
              className="flex-1 min-h-[52px] rounded-xl items-center justify-center border border-primary mr-2"
            >
              <View className="flex-row items-center">
                <X size={17} color="#C1272D" />
                <Text className="text-sm font-semibold text-primary ml-2">
                  Reject
                </Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={onApprove}
              disabled={actionLoading}
              activeOpacity={0.8}
              className="flex-[2] min-h-[52px] rounded-xl items-center justify-center bg-primary ml-2"
            >
              {actionLoading ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <View className="flex-row items-center">
                  <Check size={18} color="#FFFFFF" />
                  <Text className="text-white font-semibold ml-2">
                    Approve
                  </Text>
                  <ArrowRight
                    size={17}
                    color="#FFFFFF"
                    style={{ marginLeft: 6 }}
                  />
                </View>
              )}
            </TouchableOpacity>
          </View>
        )}
      </View>
    );
  }

  // Fallback: simple summary (original)
  return (
    <View className="mb-6">
      <View className="bg-card rounded-xl border border-border overflow-hidden">
        <View className="px-4 py-4 flex-row items-center">
          <View className="w-11 h-11 rounded-full bg-primary/10 items-center justify-center mr-3">
            <ReceiptText size={21} color="#C1272D" />
          </View>

          <View className="flex-1">
            <Text className="text-lg font-semibold text-foreground">
              Estimate Cost
            </Text>

            <Text className="text-sm text-muted-foreground mt-1">
              Current estimated service total
            </Text>
          </View>
        </View>

        <View className="ml-4 border-t border-border">
          <View className="px-4">
            <View className="min-h-[52px] py-3 flex-row items-center justify-between border-b border-border">
              <Text className="text-sm text-muted-foreground">
                Service
              </Text>

              <Text className="text-sm font-semibold text-foreground">
                ₱{servicePrice.toFixed(2)}
              </Text>
            </View>

            <View className="min-h-[52px] py-3 flex-row items-center justify-between border-b border-border">
              <Text className="text-sm text-muted-foreground">
                Parts
              </Text>

              <Text className="text-sm font-semibold text-foreground">
                ₱{partsTotal.toFixed(2)}
              </Text>
            </View>

            <View className="min-h-[52px] py-3 flex-row items-center justify-between border-b border-border">
              <Text className="text-sm text-muted-foreground">
                Labor
              </Text>

              <Text className="text-sm font-semibold text-foreground">
                ₱{laborTotal.toFixed(2)}
              </Text>
            </View>

            {discountTotal > 0 && (
              <View className="min-h-[52px] py-3 flex-row items-center justify-between border-b border-border">
                <Text className="text-sm font-medium text-primary">
                  Discount
                </Text>

                <Text className="text-sm font-semibold text-primary">
                  - ₱{discountTotal.toFixed(2)}
                </Text>
              </View>
            )}
          </View>

          <View className="bg-background px-4 py-5 flex-row items-center justify-between">
            <Text className="text-base font-semibold text-foreground">
              Total
            </Text>

            <Text className="text-2xl font-bold text-primary">
              ₱{grandTotal.toFixed(2)}
            </Text>
          </View>
        </View>
      </View>

      {isWaitingForApproval && (
        <View className="bg-card rounded-xl border border-border p-3 flex-row mt-3">
          <TouchableOpacity
            onPress={onReject}
            disabled={actionLoading}
            activeOpacity={0.8}
            className="flex-1 min-h-[52px] rounded-xl items-center justify-center border border-primary mr-2"
          >
            <View className="flex-row items-center">
              <X size={17} color="#C1272D" />
              <Text className="text-sm font-semibold text-primary ml-2">
                Reject
              </Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={onApprove}
            disabled={actionLoading}
            activeOpacity={0.8}
            className="flex-[2] min-h-[52px] rounded-xl items-center justify-center bg-primary ml-2"
          >
            {actionLoading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <View className="flex-row items-center">
                <Check size={18} color="#FFFFFF" />

                <Text className="text-white font-semibold ml-2">
                  Approve
                </Text>

                <ArrowRight
                  size={17}
                  color="#FFFFFF"
                  style={{ marginLeft: 6 }}
                />
              </View>
            )}
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}