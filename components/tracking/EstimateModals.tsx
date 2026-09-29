import { View, Text, TouchableOpacity, TextInput, Modal, ActivityIndicator } from 'react-native';
import { AlertTriangle, Check, Circle, X } from 'lucide-react-native';

export function ApproveModal({
  visible,
  onClose,
  onConfirm,
  grandTotal,
  excludedCount,
  selectedFindings = [],
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
            Review the findings you selected before work begins.
          </Text>

          <View className="mt-5 bg-secondary rounded-xl p-5">
            <Text className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Final amount
            </Text>

            <Text className="text-3xl font-bold text-primary mt-1">
              ₱{grandTotal.toFixed(2)}
            </Text>

            <Text className="text-xs text-muted-foreground mt-2">
              {selectedFindings.length} {selectedFindings.length === 1 ? 'finding' : 'findings'} selected
              {excludedCount > 0
                ? ` · ${excludedCount} excluded`
                : ''}
            </Text>
          </View>

          <View className="mt-5">
            <Text className="text-sm font-semibold text-foreground mb-2">
              Findings to be performed
            </Text>

            {selectedFindings.length > 0 ? (
              <View className="bg-background rounded-xl border border-border overflow-hidden">
                {selectedFindings.map((finding, index) => (
                  <View
                    key={finding?.id || `finding-${index}`}
                    className={`min-h-[52px] flex-row items-center px-3 py-3 ${
                      index > 0 ? 'border-t border-border' : ''
                    }`}
                  >
                    <Check size={18} color="#C1272D" strokeWidth={2.2} />
                    <Text className="flex-1 ml-3 text-sm text-foreground">
                      {finding?.description || 'Finding'}
                    </Text>
                  </View>
                ))}
              </View>
            ) : (
              <View className="flex-row items-start rounded-xl border border-amber-200 bg-amber-50 p-3">
                <Circle size={17} color="#8E8E93" strokeWidth={1.8} />
                <Text className="flex-1 ml-2 text-xs leading-5 text-amber-800">
                  No diagnostic findings are selected. The estimate will be approved using the remaining charges.
                </Text>
              </View>
            )}
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
            <AlertTriangle size={22} color="#C1272D" strokeWidth={2} />
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
            style={{ height: 120, textAlignVertical: 'top' }}
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
                opacity: !reason.trim() || actionLoading ? 0.5 : 1,
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
