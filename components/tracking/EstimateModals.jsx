import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  Modal,
  ActivityIndicator,
} from 'react-native';
import {
  AlertTriangle,
  Check,
  X,
} from 'lucide-react-native';

export function ApproveModal({
  visible,
  onClose,
  onConfirm,
  grandTotal,
  excludedCount,
  actionLoading,
}) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View className="flex-1 justify-end bg-black/50">
        <View className="bg-card rounded-t-3xl px-4 pt-3 pb-8">
          <View className="w-12 h-1.5 rounded-full bg-secondary self-center mb-5" />

          <View className="w-12 h-12 rounded-full bg-primary/10 items-center justify-center mb-4">
            <Check size={23} color="#C1272D" strokeWidth={2.3} />
          </View>

          <Text className="text-2xl font-bold tracking-tight text-foreground">
            Approve Estimate?
          </Text>

          <Text className="text-sm leading-5 text-muted-foreground mt-2">
            The work will begin immediately.
            {excludedCount > 0
              ? ` ${excludedCount} ${
                  excludedCount === 1 ? 'item' : 'items'
                } will be skipped.`
              : ''}
          </Text>

          <View className="mt-5 bg-secondary rounded-xl p-5">
            <Text className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Final amount
            </Text>

            <Text className="text-3xl font-bold text-primary mt-1">
              ₱{grandTotal.toFixed(2)}
            </Text>
          </View>

          <View className="flex-row mt-5">
            <TouchableOpacity
              onPress={onClose}
              disabled={actionLoading}
              className="flex-1 min-h-[52px] rounded-xl bg-secondary items-center justify-center mr-2"
            >
              <Text className="font-semibold text-secondary-foreground">
                Go Back
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={onConfirm}
              disabled={actionLoading}
              className="flex-[2] min-h-[52px] rounded-xl bg-primary items-center justify-center ml-2"
            >
              {actionLoading ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <View className="flex-row items-center">
                  <Check size={18} color="#FFFFFF" />
                  <Text className="text-white font-semibold ml-2">
                    Approve & Start
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

export function RejectModal({
  visible,
  onClose,
  onSubmit,
  reason,
  setReason,
  actionLoading,
}) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View className="flex-1 justify-end bg-black/50">
        <View className="bg-card rounded-t-3xl px-4 pt-3 pb-8">
          <View className="w-12 h-1.5 rounded-full bg-secondary self-center mb-5" />

          <View className="w-12 h-12 rounded-full bg-secondary items-center justify-center mb-4">
            <AlertTriangle
              size={22}
              color="#C1272D"
              strokeWidth={2}
            />
          </View>

          <Text className="text-2xl font-bold tracking-tight text-foreground">
            Reject Estimate
          </Text>

          <Text className="text-sm leading-5 text-muted-foreground mt-2">
            This will cancel your appointment. Please tell us why.
          </Text>

          <TextInput
            value={reason}
            onChangeText={setReason}
            placeholder="Reason for cancellation…"
            placeholderTextColor="#8E8E93"
            multiline
            numberOfLines={4}
            className="mt-5 rounded-lg border border-border bg-background px-4 py-4 text-base text-foreground"
            style={{
              height: 120,
              textAlignVertical: 'top',
            }}
          />

          <View className="flex-row mt-5">
            <TouchableOpacity
              onPress={onClose}
              disabled={actionLoading}
              className="flex-1 min-h-[52px] rounded-xl bg-secondary items-center justify-center mr-2"
            >
              <View className="flex-row items-center">
                <X size={18} color="#000000" />
                <Text className="font-semibold text-secondary-foreground ml-2">
                  Cancel
                </Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={onSubmit}
              disabled={!reason.trim() || actionLoading}
              className="flex-[2] min-h-[52px] rounded-xl bg-primary items-center justify-center ml-2"
              style={{
                opacity:
                  !reason.trim() || actionLoading ? 0.5 : 1,
              }}
            >
              {actionLoading ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text className="text-white font-semibold">
                  Confirm Rejection
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}