import { View, Text, TouchableOpacity } from "react-native";
import Modal from "react-native-modal";
import { Ionicons } from "@expo/vector-icons";

interface LogoutModalProps {
  visible: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export default function LogoutModal({ visible, onClose, onConfirm }: LogoutModalProps) {
  return (
    <Modal
      isVisible={visible}
      onBackdropPress={onClose}
      backdropOpacity={0.4}
      animationIn="zoomIn"
      animationOut="zoomOut"
      useNativeDriver
    >
      <View className="p-8 rounded-[40px] items-center bg-card">
        <View className="w-16 h-16 rounded-full bg-destructive/10 items-center justify-center mb-6">
          <Ionicons name="power" size={32} color="#EF4444" />
        </View>
        <Text className="text-2xl font-heading font-black text-center mb-2 text-foreground">
          Sign Out
        </Text>
        <Text className="text-sm font-medium text-center mb-8 text-muted-foreground/60 leading-5">
          Are you sure you want to end your session? You'll need to sign back in to book services.
        </Text>
        <View className="flex-row gap-3 w-full">
          <TouchableOpacity
            className="flex-1 h-14 rounded-2xl items-center justify-center border border-border"
            onPress={onClose}
          >
            <Text className="font-bold uppercase tracking-widest text-xs text-muted-foreground">Stay</Text>
          </TouchableOpacity>
          <TouchableOpacity
            className="flex-1 h-14 rounded-2xl items-center justify-center bg-destructive shadow-lg shadow-destructive/20"
            onPress={onConfirm}
          >
            <Text className="text-white font-bold uppercase tracking-widest text-xs">Logout</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}