import { View, Text, TouchableOpacity } from 'react-native';
import RNModal from 'react-native-modal';
import { CheckCircle2, AlertCircle } from 'lucide-react-native';

export default function AvailabilityModal({ visible, available, message, onClose }) {
  return (
    <RNModal
      isVisible={visible}
      onBackdropPress={onClose}
      backdropOpacity={0.4}
      animationIn="zoomIn"
      animationOut="zoomOut"
    >
      <View className="rounded-3xl p-6 items-center bg-white/90 border border-white/30 shadow-lg">
        <View
          className={`w-16 h-16 rounded-full items-center justify-center mb-4 ${
            available ? 'bg-green-500/10' : 'bg-red-500/10'
          }`}
        >
          {available ? (
            <CheckCircle2 size={36} color="#34C759" />
          ) : (
            <AlertCircle size={36} color="#FF3B30" />
          )}
        </View>
        <Text className="text-lg font-semibold text-foreground mb-1">
          {available ? 'Spot Available!' : 'Wait a moment'}
        </Text>
        <Text className="text-base font-normal text-muted-foreground text-center mb-6">
          {message}
        </Text>
        <TouchableOpacity
          activeOpacity={0.8}
          className="w-full min-h-[44px] py-4 rounded-xl bg-primary items-center justify-center"
          onPress={onClose}
        >
          <Text className="text-primary-foreground text-base font-semibold">Continue</Text>
        </TouchableOpacity>
      </View>
    </RNModal>
  );
}