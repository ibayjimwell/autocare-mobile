import { View, Text, TouchableOpacity, TextInput, Modal, ActivityIndicator } from 'react-native';

export function ApproveModal({ visible, onClose, onConfirm, grandTotal, excludedCount, actionLoading }) {
  return (
    <Modal visible={visible} transparent animationType="slide">
      <View className="flex-1 justify-end bg-black/70">
        <View className="p-8 rounded-t-[40px] bg-card">
          <View className="w-12 h-1.5 rounded-full bg-muted self-center mb-8" />
          <Text className="text-2xl font-heading font-black mb-4 text-foreground">Approve Estimate?</Text>
          <Text className="text-sm font-medium mb-8 leading-6 text-muted-foreground">
            The work will begin immediately. {excludedCount > 0 ? `${excludedCount} items will be skipped.` : ''}
          </Text>
          <View className="p-6 rounded-3xl mb-8 bg-primary/10">
            <Text className="text-center text-[10px] font-black uppercase text-foreground/40 mb-1">Final Amount</Text>
            <Text className="text-4xl text-center font-heading font-black text-primary">₱{grandTotal.toFixed(2)}</Text>
          </View>
          <View className="flex-row gap-4">
            <TouchableOpacity onPress={onClose} className="flex-1 h-14 rounded-2xl items-center justify-center bg-muted" disabled={actionLoading}>
              <Text className="font-bold text-foreground">Go Back</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={onConfirm} disabled={actionLoading} className="flex-[2] h-14 rounded-2xl items-center justify-center bg-green-500">
              {actionLoading ? <ActivityIndicator color="#fff" /> : <Text className="text-white font-black uppercase">Approve & Start</Text>}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

export function RejectModal({ visible, onClose, onSubmit, reason, setReason, actionLoading }) {
  return (
    <Modal visible={visible} transparent animationType="slide">
      <View className="flex-1 justify-end bg-black/70">
        <View className="p-8 rounded-t-[40px] bg-card">
          <View className="w-12 h-1.5 rounded-full bg-muted self-center mb-8" />
          <Text className="text-2xl font-heading font-black mb-2 text-foreground">Reject Estimate</Text>
          <Text className="text-sm font-medium mb-6 text-muted-foreground">This will cancel your appointment. Please tell us why.</Text>
          <TextInput
            value={reason}
            onChangeText={setReason}
            placeholder="Reason for cancellation..."
            placeholderTextColor="#999"
            multiline
            numberOfLines={4}
            className="p-5 rounded-3xl mb-8 text-sm font-bold border border-border bg-background text-foreground"
            style={{ height: 120 }}
          />
          <View className="flex-row gap-4">
            <TouchableOpacity onPress={onClose} className="flex-1 h-14 rounded-2xl items-center justify-center">
              <Text className="font-bold text-foreground">Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={onSubmit}
              disabled={!reason.trim() || actionLoading}
              className="flex-[2] h-14 rounded-2xl items-center justify-center bg-destructive"
              style={{ opacity: !reason.trim() || actionLoading ? 0.5 : 1 }}
            >
              {actionLoading ? <ActivityIndicator color="#fff" /> : <Text className="text-white font-black uppercase">Confirm Rejection</Text>}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}