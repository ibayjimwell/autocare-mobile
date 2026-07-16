import { View, Text, TouchableOpacity } from 'react-native';
import RNModal from 'react-native-modal';
import { Ionicons } from '@expo/vector-icons';

export default function AvailabilityModal({ visible, available, message, onClose }) {
  return (
    <RNModal
      isVisible={visible}
      onBackdropPress={onClose}
      backdropOpacity={0.6}
      animationIn="zoomIn"
      animationOut="zoomOut"
    >
      <View className="rounded-[40px] p-8 items-center bg-card">
        <View
          className={`w-16 h-16 rounded-full items-center justify-center mb-4 ${
            available ? 'bg-green-100' : 'bg-red-100'
          }`}
        >
          <Ionicons
            name={available ? 'checkmark-done-circle' : 'alert-circle'}
            size={40}
            color={available ? '#22c55e' : '#EF4444'}
          />
        </View>
        <Text className="text-lg font-black mb-2 text-foreground">
          {available ? 'Spot Available!' : 'Wait a moment'}
        </Text>
        <Text className="text-center font-medium mb-8 text-muted-foreground">
          {message}
        </Text>
        <TouchableOpacity
          activeOpacity={0.8}
          className="w-full py-4 rounded-2xl bg-primary"
          onPress={onClose}
        >
          <Text className="text-primary-foreground text-center font-black uppercase">Continue</Text>
        </TouchableOpacity>
      </View>
    </RNModal>
  );
}